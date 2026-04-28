import type { UIMessage } from 'ai'
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { MODELS } from '#shared/utils/models'

defineRouteMeta({
  openAPI: {
    description: '与 MiniMax AI 对话',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { model, messages } = await readValidatedBody(event, z.object({
    model: z.string().refine(value => MODELS.some(m => m.value === value), {
      message: '无效的模型'
    }),
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const chat = await db.query.chats.findFirst({
    where: () => and(
      eq(schema.chats.id, id as string),
      eq(schema.chats.userId, session.user?.id || session.id)
    ),
    with: {
      messages: true
    }
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: '对话未找到' })
  }

  // 生成对话标题（取用户第一条消息的前30字作为标题）
  if (!chat.title) {
    const userMsg = messages.find(m => m.role === 'user')
    if (userMsg) {
      const text = typeof userMsg.content === 'string'
        ? userMsg.content
        : userMsg.content?.[0]?.text || ''
      const title = text.slice(0, 30).trim() + (text.length > 30 ? '...' : '')
      await db.update(schema.chats).set({ title }).where(eq(schema.chats.id, id as string))
    }
  }

  // 提取用户最后一条消息内容
  const lastMessage = messages[messages.length - 1]
  const lastUserContent = (() => {
    if (!lastMessage || lastMessage.role !== 'user') return ''
    const content = lastMessage.content
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      return content.map((part: any) => part.type === 'text' ? part.text : '').join('')
    }
    return ''
  })()

  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db.insert(schema.messages).values({
      id: lastMessage.id,
      chatId: id as string,
      role: 'user',
      parts: lastMessage.parts
    }).onConflictDoUpdate({ target: schema.messages.id, set: { parts: lastMessage.parts } })
  }

  const abortController = new AbortController()
  event.node.req.on('close', () => abortController.abort())

  // 从 runtimeConfig 读取后端地址
  const config = useRuntimeConfig()
  const backendUrl = `${config.public.apiBaseUrl}/api/chat/chat`

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const response = await fetch(backendUrl, {
        method: 'POST',
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          message: lastUserContent,
          systemPrompt: ''
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        writer.write({
          type: 'error',
          content: `[MiniMax API 错误 ${response.status}] ${errorText}`
        })
        return
      }

      if (!response.body) {
        writer.write({ type: 'error', content: '[MiniMax API 错误] 无响应体' })
        return
      }

      // 解析后端 SSE 流并转发给前端
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                writer.write({ type: 'finish' })
              } else {
                try {
                  const parsed = JSON.parse(data)
                  // MiniMax 流式返回格式：{ choices: [{ delta: { content: "..." } }] }
                  if (parsed.choices?.[0]?.delta?.content) {
                    writer.write({
                      type: 'assistant',
                      content: [{
                        type: 'text',
                        text: parsed.choices[0].delta.content
                      }]
                    })
                  }
                  if (parsed.choices?.[0]?.finish_reason === 'stop') {
                    writer.write({ type: 'finish' })
                  }
                } catch {
                  // 非 JSON 内容直接透传
                  if (data.trim()) {
                    writer.write({
                      type: 'assistant',
                      content: [{ type: 'text', text: data }]
                    })
                  }
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
    onFinish: async ({ messages }) => {
      await db.insert(schema.messages).values(messages.map(message => ({
        id: message.id,
        chatId: chat.id,
        role: message.role as 'user' | 'assistant',
        parts: message.parts
      }))).onConflictDoNothing()
    }
  })

  return createUIMessageStreamResponse({ stream })
})

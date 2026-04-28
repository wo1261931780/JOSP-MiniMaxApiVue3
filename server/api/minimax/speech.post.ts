import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backendUrl = `${config.public.apiBaseUrl}/api/minimax/speech`

  const body = await readBody(event)

  // Java 后端返回的是 hex 编码的音频数据，转换为浏览器可播放的 data URL
  const response = await $fetch<{ success: boolean, data: string }>(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  // 如果后端返回的是 hex 字符串，转换为 base64 data URL
  if (response.success && response.data && !response.data.startsWith('data:')) {
    // MiniMax TTS 返回的是 hex 编码的音频字节
    const hex = response.data
    const binary = Buffer.from(hex, 'hex')
    const base64 = binary.toString('base64')
    response.data = `data:audio/mp3;base64,${base64}`
  }

  return response
})

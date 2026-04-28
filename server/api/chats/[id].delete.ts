import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const chat = await db.query.chats.findFirst({
    where: () => and(eq(schema.chats.id, id as string), eq(schema.chats.userId, session.user?.id || session.id))
  })

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: '对话未找到'
    })
  }

  const username = session.user?.username || session.id
  const chatFolder = `${username}/${id}`

  try {
    const { blobs } = await blob.list({
      prefix: chatFolder
    })

    if (blobs.length > 0) {
      await Promise.all(
        blobs.map(b =>
          blob.del(b.pathname).catch(error =>
            console.error('[删除对话] 删除文件失败:', b.pathname, error)
          )
        )
      )
    }
  } catch (error) {
    console.error('[删除对话] 列出/删除对话文件失败:', error)
  }

  return await db.delete(schema.chats)
    .where(and(eq(schema.chats.id, id as string), eq(schema.chats.userId, session.user?.id || session.id)))
    .returning()
})

import { blob } from 'hub:blob'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { username } = user

  const { pathname } = await getValidatedRouterParams(event, z.object({
    pathname: z.string().min(1)
  }).parse)

  if (!pathname.startsWith(`${username}/`)) {
    throw createError({
      statusCode: 403,
      statusMessage: '您没有权限删除此文件'
    })
  }

  await blob.del(pathname)

  return sendNoContent(event)
})

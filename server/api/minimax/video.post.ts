import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backendUrl = `${config.public.apiBaseUrl}/api/minimax/video`

  const body = await readBody(event)

  const response = await $fetch<{ success: boolean, data: { task_id?: string, video_url?: string, status?: string } }>(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  return response
})

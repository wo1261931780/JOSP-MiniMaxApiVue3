import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backendUrl = `${config.public.apiBaseUrl}/api/minimax/image`

  const body = await readBody(event)

  const response = await $fetch<{ success: boolean, data: string }>(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  return response
})

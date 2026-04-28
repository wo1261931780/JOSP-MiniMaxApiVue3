import { LazyModalConfirm, LazyModalRename } from '#components'

interface ChatListItem {
  id: string
  label: string
  to: string
  icon?: string
  createdAt: string | Date
}

export function useChatActions() {
  const route = useRoute()
  const toast = useToast()
  const overlay = useOverlay()
  const { csrf, headerName } = useCsrf()

  const renameModal = overlay.create(LazyModalRename)
  const deleteModal = overlay.create(LazyModalConfirm, {
    props: {
      title: '删除对话',
      color: 'error'
    }
  })

  async function renameChat(id: string, currentTitle?: string | null): Promise<string | null> {
    const instance = renameModal.open({ title: currentTitle ?? '' })
    const result = await instance.result

    if (!result || result === currentTitle) return null

    try {
      await $fetch(`/api/chats/${id}/title`, {
        method: 'PATCH',
        headers: { [headerName]: csrf },
        body: { title: result }
      })

      const chatsCache = useNuxtData<ChatListItem[]>('chats')
      if (chatsCache.data.value) {
        chatsCache.data.value = chatsCache.data.value.map(c =>
          c.id === id ? { ...c, label: result } : c
        )
      }

      const chatCache = useNuxtData<{ title: string | null }>(`chat-${id}`)
      if (chatCache.data.value) {
        chatCache.data.value = { ...chatCache.data.value, title: result }
      }

      return result
    } catch {
      toast.add({
        description: '重命名失败',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })

      return null
    }
  }

  async function deleteChat(id: string): Promise<boolean> {
    const instance = deleteModal.open()
    const result = await instance.result

    if (!result) return false

    try {
      await $fetch(`/api/chats/${id}`, {
        method: 'DELETE',
        headers: { [headerName]: csrf }
      })

      toast.add({
        description: '对话已删除',
        icon: 'i-lucide-trash'
      })

      const chatsCache = useNuxtData<ChatListItem[]>('chats')
      if (chatsCache.data.value) {
        chatsCache.data.value = chatsCache.data.value.filter(c => c.id !== id)
      }

      if (route.params.id === id) {
        navigateTo('/')
      }

      return true
    } catch {
      toast.add({
        description: '删除失败',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })

      return false
    }
  }

  return {
    renameChat,
    deleteChat
  }
}

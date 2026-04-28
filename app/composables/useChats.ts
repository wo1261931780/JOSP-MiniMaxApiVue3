import { isToday, isYesterday, subMonths } from 'date-fns'

export interface UIChat {
  id: string
  label: string
  icon: string
  createdAt: string
}

export function useChats(chats: Ref<UIChat[] | undefined>) {
  const groups = computed(() => {
    // Group chats by date
    const today: UIChat[] = []
    const yesterday: UIChat[] = []
    const lastWeek: UIChat[] = []
    const lastMonth: UIChat[] = []
    const older: Record<string, UIChat[]> = {}

    const oneWeekAgo = subMonths(new Date(), 0.25) // ~7 days ago
    const oneMonthAgo = subMonths(new Date(), 1)

    chats.value?.forEach((chat) => {
      const chatDate = new Date(chat.createdAt)

      if (isToday(chatDate)) {
        today.push(chat)
      } else if (isYesterday(chatDate)) {
        yesterday.push(chat)
      } else if (chatDate >= oneWeekAgo) {
        lastWeek.push(chat)
      } else if (chatDate >= oneMonthAgo) {
        lastMonth.push(chat)
      } else {
        // Format: "2024年1月", "2023年12月", etc.
        const monthYear = chatDate.toLocaleDateString('zh-CN', {
          month: 'numeric',
          year: 'numeric'
        }).replace('/', '年') + '月'

        if (!older[monthYear]) {
          older[monthYear] = []
        }

        older[monthYear].push(chat)
      }
    })

    // Sort older chats by month-year in descending order (newest first)
    const sortedMonthYears = Object.keys(older).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateB.getTime() - dateA.getTime()
    })

    // Create formatted groups for navigation
    const formattedGroups = [] as Array<{
      id: string
      label: string
      items: Array<UIChat>
    }>

    // Add groups that have chats
    if (today.length) {
      formattedGroups.push({
        id: 'today',
        label: '今天',
        items: today
      })
    }

    if (yesterday.length) {
      formattedGroups.push({
        id: 'yesterday',
        label: '昨天',
        items: yesterday
      })
    }

    if (lastWeek.length) {
      formattedGroups.push({
        id: 'last-week',
        label: '上周',
        items: lastWeek
      })
    }

    if (lastMonth.length) {
      formattedGroups.push({
        id: 'last-month',
        label: '上月',
        items: lastMonth
      })
    }

    // Add each month-year group
    sortedMonthYears.forEach((monthYear) => {
      if (older[monthYear]?.length) {
        formattedGroups.push({
          id: monthYear,
          label: monthYear,
          items: older[monthYear]
        })
      }
    })

    return formattedGroups
  })

  return {
    groups
  }
}

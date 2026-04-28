<script setup lang="ts">
import { MODELS } from '#shared/utils/models'

const { model } = useModels()

// Group models by type
const textModels = MODELS.filter(m => m.value.startsWith('minimax/'))

const groupedItems = [
  {
    label: '文本模型',
    icon: 'i-lucide-message-circle',
    items: textModels.map(m => ({
      label: m.label,
      value: m.value,
      icon: m.icon
    }))
  },
  // Future extension points:
  // {
  //   label: '图片模型',
  //   icon: 'i-lucide-image',
  //   items: []
  // },
  // {
  //   label: '音乐模型',
  //   icon: 'i-lucide-music',
  //   items: []
  // },
  // {
  //   label: '视频模型',
  //   icon: 'i-lucide-video',
  //   items: []
  // }
]

const selectedModel = computed(() => {
  return MODELS.find(m => m.value === model.value)
})

function onSelect(value: string) {
  model.value = value
}
</script>

<template>
  <UPopover
    :items="groupedItems"
    :content="{ align: 'start', side: 'top', sideOffset: 8 }"
    class="w-64"
  >
    <template #trigger>
      <UButton
        variant="ghost"
        size="sm"
        class="w-full justify-start gap-2"
        :icon="selectedModel?.icon"
      >
        <span class="truncate">{{ selectedModel?.label || '选择模型' }}</span>
        <template #trailing>
          <UIcon
            name="i-lucide-chevron-down"
            class="w-4 h-4 transition-transform group-data-[state=open]:rotate-180"
          />
        </template>
      </UButton>
    </template>

    <template #item="{ item }">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 text-xs text-muted font-medium uppercase tracking-wide px-2 py-1.5">
          <UIcon :name="item.icon" class="w-3.5 h-3.5" />
          {{ item.label }}
        </div>
        <div class="flex flex-col gap-0.5">
          <UButton
            v-for="subItem in item.items"
            :key="subItem.value"
            variant="ghost"
            size="sm"
            :class="[
              'w-full justify-start gap-2 font-normal',
              model === subItem.value ? 'bg-accented text-highlighted' : ''
            ]"
            :icon="subItem.icon"
            @click="onSelect(subItem.value)"
          >
            <span class="truncate">{{ subItem.label }}</span>
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>

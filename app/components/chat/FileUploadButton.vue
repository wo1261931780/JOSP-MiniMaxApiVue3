<script setup lang="ts">
const { loggedIn } = useUserSession()

defineProps<{
  open: () => void
}>()
</script>

<template>
  <UTooltip
    :content="{
      side: 'top'
    }"
    :text="!loggedIn ? '请先登录后上传文件' : ''"
  >
    <UButton
      icon="i-lucide-paperclip"
      variant="ghost"
      color="neutral"
      size="sm"
      :disabled="!loggedIn"
      aria-label="上传文件"
      @click="open()"
    />
  </UTooltip>
</template>

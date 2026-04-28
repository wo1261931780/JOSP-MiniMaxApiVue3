<script setup lang="ts">
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{ close: [string | false] }>()

const value = ref(props.title ?? '')

const trimmed = computed(() => value.value.trim())

function submit() {
  if (!trimmed.value) return
  emit('close', trimmed.value)
}
</script>

<template>
  <UModal
    title="重命名对话"
    description="为此对话选择一个新标题。"
    :ui="{
      footer: 'flex-row-reverse justify-start'
    }"
    :close="false"
  >
    <template #body>
      <UInput
        v-model="value"
        autofocus
        size="lg"
        placeholder="对话标题"
        class="w-full"
        :ui="{ root: 'w-full' }"
        @keydown.enter.prevent="submit"
      />
    </template>

    <template #footer>
      <UButton label="保存" :disabled="!trimmed" @click="submit" />
      <UButton
        color="neutral"
        variant="ghost"
        label="取消"
        @click="emit('close', false)"
      />
    </template>
  </UModal>
</template>

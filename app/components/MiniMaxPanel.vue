<script setup lang="ts">
const activeTab = ref('chat')

const tabs = [
  { id: 'chat', label: '对话', icon: 'i-lucide-message-circle', emoji: '💬' },
  { id: 'image', label: '图片生成', icon: 'i-lucide-image', emoji: '🎨', model: 'image-01' },
  { id: 'music', label: '音乐生成', icon: 'i-lucide-music', emoji: '🎵', model: 'music-2.6' },
  { id: 'video', label: '视频生成', icon: 'i-lucide-video', emoji: '🎬', model: 'hailuo-2.3' },
  { id: 'tts', label: '语音合成', icon: 'i-lucide-volume-2', emoji: '🔊', model: 'tts-hd' }
]

// Chat mode
const chatInput = ref('')
const chatLoading = ref(false)

// Image mode
const imageInput = ref('')
const imageLoading = ref(false)
const imageResult = ref<string | null>(null)

// Music mode
const musicInput = ref('')
const musicLoading = ref(false)
const musicResult = ref<string | null>(null)

// Video mode
const videoInput = ref('')
const videoLoading = ref(false)
const videoResult = ref<string | null>(null)

// TTS mode
const ttsInput = ref('')
const ttsLoading = ref(false)
const ttsResult = ref<string | null>(null)

const { csrf, headerName } = useCsrf()

async function generateChat() {
  if (!chatInput.value.trim()) return
  chatLoading.value = true
  // Navigate to chat page with the prompt
  const chatId = crypto.randomUUID()
  const parts = [{ type: 'text', text: chatInput.value }]

  try {
    await $fetch('/api/chats', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        id: chatId,
        message: {
          role: 'user',
          parts
        }
      }
    })
    navigateTo(`/chat/${chatId}`)
  } catch (error) {
    console.error('Failed to create chat:', error)
  } finally {
    chatLoading.value = false
  }
}

async function generateImage() {
  if (!imageInput.value.trim()) return
  imageLoading.value = true
  imageResult.value = null

  try {
    const response = await $fetch('/api/minimax/image', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        model: 'image-01',
        prompt: imageInput.value
      }
    })
    // 后端返回 JSON 数组字符串，取第一张
    const urls = JSON.parse((response as any).data || '[]')
    imageResult.value = urls[0] || null
  } catch (error) {
    console.error('Failed to generate image:', error)
  } finally {
    imageLoading.value = false
  }
}

async function generateMusic() {
  if (!musicInput.value.trim()) return
  musicLoading.value = true
  musicResult.value = null

  try {
    const response = await $fetch('/api/minimax/music', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        model: 'music-2.6',
        prompt: musicInput.value
      }
    })
    musicResult.value = (response as any).url
  } catch (error) {
    console.error('Failed to generate music:', error)
  } finally {
    musicLoading.value = false
  }
}

async function generateVideo() {
  if (!videoInput.value.trim()) return
  videoLoading.value = true
  videoResult.value = null

  try {
    const response = await $fetch('/api/minimax/video', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        model: 'hailuo-2.3',
        prompt: videoInput.value
      }
    })
    videoResult.value = (response as any).url
  } catch (error) {
    console.error('Failed to generate video:', error)
  } finally {
    videoLoading.value = false
  }
}

async function generateTts() {
  if (!ttsInput.value.trim()) return
  ttsLoading.value = true
  ttsResult.value = null

  try {
    const response = await $fetch('/api/minimax/tts', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        model: 'tts-hd',
        prompt: ttsInput.value
      }
    })
    ttsResult.value = (response as any).url
  } catch (error) {
    console.error('Failed to generate TTS:', error)
  } finally {
    ttsLoading.value = false
  }
}

const currentInput = computed({
  get: () => {
    switch (activeTab.value) {
      case 'chat': return chatInput.value
      case 'image': return imageInput.value
      case 'music': return musicInput.value
      case 'video': return videoInput.value
      case 'tts': return ttsInput.value
      default: return ''
    }
  },
  set: (value) => {
    switch (activeTab.value) {
      case 'chat': chatInput.value = value; break
      case 'image': imageInput.value = value; break
      case 'music': musicInput.value = value; break
      case 'video': videoInput.value = value; break
      case 'tts': ttsInput.value = value; break
    }
  }
})

const currentLoading = computed(() => {
  switch (activeTab.value) {
    case 'chat': return chatLoading.value
    case 'image': return imageLoading.value
    case 'music': return musicLoading.value
    case 'video': return videoLoading.value
    case 'tts': return ttsLoading.value
    default: return false
  }
})

function handleSubmit() {
  switch (activeTab.value) {
    case 'chat': generateChat(); break
    case 'image': generateImage(); break
    case 'music': generateMusic(); break
    case 'video': generateVideo(); break
    case 'tts': generateTts(); break
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Tab Navigation -->
    <div class="flex items-center gap-1 p-1 bg-elevated rounded-lg overflow-x-auto">
      <UButton
        v-for="tab in tabs"
        :key="tab.id"
        :variant="activeTab === tab.id ? 'solid' : 'ghost'"
        :color="activeTab === tab.id ? 'primary' : 'neutral'"
        size="sm"
        class="rounded-md whitespace-nowrap"
        @click="activeTab = tab.id"
      >
        <span class="mr-1">{{ tab.emoji }}</span>
        {{ tab.label }}
      </UButton>
    </div>

    <!-- Input Area -->
    <div class="flex flex-col gap-2">
      <UTextarea
        v-model="currentInput"
        :placeholder="activeTab === 'chat' ? '输入您的问题...' : '描述您想要生成的内容...'"
        :rows="3"
        variant="subtle"
        class="w-full"
        @keydown.enter.ctrl="handleSubmit"
      />

      <UButton
        :label="activeTab === 'chat' ? '开始对话' : '生成'"
        :loading="currentLoading"
        color="primary"
        size="sm"
        class="self-end"
        @click="handleSubmit"
      />
    </div>

    <!-- Result Areas -->
    <div v-if="activeTab === 'image'" class="flex flex-col gap-2">
      <div v-if="imageLoading" class="flex items-center justify-center p-8">
        <UProgress animation="carousel" />
      </div>
      <div v-else-if="imageResult" class="flex flex-col gap-2">
        <img :src="imageResult" alt="Generated image" class="rounded-lg max-w-full" />
        <UButton
          :label="'下载图片'"
          icon="i-lucide-download"
          variant="outline"
          size="sm"
          @click="() => { const a = document.createElement('a'); a.href = imageResult; a.download = 'image.png'; a.click() }"
        />
      </div>
    </div>

    <div v-else-if="activeTab === 'music'" class="flex flex-col gap-2">
      <div v-if="musicLoading" class="flex items-center justify-center p-8">
        <UProgress animation="carousel" />
      </div>
      <div v-else-if="musicResult" class="flex flex-col gap-2">
        <audio :src="musicResult" controls class="w-full" />
        <UButton
          :label="'下载音乐'"
          icon="i-lucide-download"
          variant="outline"
          size="sm"
          @click="() => { const a = document.createElement('a'); a.href = musicResult; a.download = 'music.mp3'; a.click() }"
        />
      </div>
    </div>

    <div v-else-if="activeTab === 'video'" class="flex flex-col gap-2">
      <div v-if="videoLoading" class="flex items-center justify-center p-8">
        <UProgress animation="carousel" />
      </div>
      <div v-else-if="videoResult" class="flex flex-col gap-2">
        <video :src="videoResult" controls class="rounded-lg max-w-full" />
        <UButton
          :label="'下载视频'"
          icon="i-lucide-download"
          variant="outline"
          size="sm"
          @click="() => { const a = document.createElement('a'); a.href = videoResult; a.download = 'video.mp4'; a.click() }"
        />
      </div>
    </div>

    <div v-else-if="activeTab === 'tts'" class="flex flex-col gap-2">
      <div v-if="ttsLoading" class="flex items-center justify-center p-8">
        <UProgress animation="carousel" />
      </div>
      <div v-else-if="ttsResult" class="flex flex-col gap-2">
        <audio :src="ttsResult" controls class="w-full" />
        <UButton
          :label="'下载音频'"
          icon="i-lucide-download"
          variant="outline"
          size="sm"
          @click="() => { const a = document.createElement('a'); a.href = ttsResult; a.download = 'audio.mp3'; a.click() }"
        />
      </div>
    </div>
  </div>
</template>

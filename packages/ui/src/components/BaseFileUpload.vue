<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  Check,
  AlertCircle,
} from '@lucide/vue'

export type FileUploadVariant = 'input' | 'dropzone' | 'compact'
export type FileUploadSize = 'sm' | 'md' | 'lg'

export interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface Props {
  variant?: FileUploadVariant
  size?: FileUploadSize
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  maxFiles?: number
  disabled?: boolean
  label?: string
  hint?: string
  error?: string
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dropzone',
  size: 'md',
  accept: '',
  multiple: false,
  maxSize: 10,
  maxFiles: 5,
  disabled: false,
  showPreview: true,
})

const emit = defineEmits<{
  upload: [files: UploadFile[]]
  remove: [file: UploadFile]
  cancel: [file: UploadFile]
}>()

const files = ref<UploadFile[]>([])
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Film
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return Archive
  return File
}

function validateFile(file: File): string | null {
  if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
    return `File terlalu besar (max ${props.maxSize}MB)`
  }
  if (props.accept) {
    const accepted = props.accept.split(',').map((a) => a.trim())
    const isAccepted = accepted.some((a) => {
      if (a.startsWith('.')) return file.name.toLowerCase().endsWith(a.toLowerCase())
      if (a.endsWith('/*')) return file.type.startsWith(a.replace('/*', '/'))
      return file.type === a
    })
    if (!isAccepted) return 'Tipe file tidak didukung'
  }
  return null
}

function addFiles(fileList: FileList | null) {
  if (!fileList || props.disabled) return

  const newFiles = Array.from(fileList)

  if (!props.multiple && newFiles.length > 0) {
    files.value = []
  }

  if (props.multiple && files.value.length + newFiles.length > props.maxFiles) {
    return
  }

  for (const file of newFiles) {
    const error = validateFile(file)
    const uploadFile: UploadFile = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: error ? 'error' : 'pending',
      error: error ?? undefined,
    }
    files.value.push(uploadFile)

    if (!error) {
      simulateUpload(uploadFile)
    }
  }

  emit('upload', files.value)

  // Reset input
  if (inputRef.value) inputRef.value.value = ''
}

function simulateUpload(uploadFile: UploadFile) {
  uploadFile.status = 'uploading'
  const interval = setInterval(() => {
    if (uploadFile.status !== 'uploading') {
      clearInterval(interval)
      return
    }
    uploadFile.progress += Math.random() * 15 + 5
    if (uploadFile.progress >= 100) {
      uploadFile.progress = 100
      uploadFile.status = 'success'
      clearInterval(interval)
    }
  }, 300)
}

function removeFile(uploadFile: UploadFile) {
  files.value = files.value.filter((f) => f.id !== uploadFile.id)
  emit('remove', uploadFile)
}

function cancelFile(uploadFile: UploadFile) {
  uploadFile.status = 'error'
  uploadFile.error = 'Dibatalkan'
  uploadFile.progress = 0
  emit('cancel', uploadFile)
}

function retryFile(uploadFile: UploadFile) {
  uploadFile.status = 'pending'
  uploadFile.error = undefined
  uploadFile.progress = 0
  simulateUpload(uploadFile)
}

function openFilePicker() {
  if (!props.disabled) {
    inputRef.value?.click()
  }
}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (!props.disabled) addFiles(e.dataTransfer?.files ?? null)
}

const sizeClasses = computed(() => {
  const map: Record<FileUploadSize, { text: string; padding: string; icon: string }> = {
    sm: { text: 'text-xs', padding: 'p-4', icon: 'w-8 h-8' },
    md: { text: 'text-sm', padding: 'p-6', icon: 'w-10 h-10' },
    lg: { text: 'text-base', padding: 'p-8', icon: 'w-12 h-12' },
  }
  return map[props.size]
})

defineExpose({ files, addFiles, removeFile, cancelFile, retryFile })
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="addFiles(($event.target as HTMLInputElement).files)"
    />

    <!-- Variant: Input -->
    <div v-if="variant === 'input'" class="flex flex-col gap-2">
      <div
        class="flex items-center gap-2 border border-gray-300 rounded-md bg-white transition-all cursor-pointer hover:border-primary-400 dark:bg-gray-800 dark:border-gray-600"
        :class="[
          sizeClasses.padding,
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          error ? 'border-red-500!' : '',
        ]"
        @click="openFilePicker"
      >
        <Upload class="w-4 h-4 text-gray-400 shrink-0" />
        <span class="text-gray-500 dark:text-gray-400" :class="sizeClasses.text">
          {{ files.length > 0 ? `${files.length} file dipilih` : 'Pilih file...' }}
        </span>
      </div>
    </div>

    <!-- Variant: Dropzone -->
    <div
      v-else-if="variant === 'dropzone'"
      class="border-2 border-dashed rounded-lg transition-all cursor-pointer"
      :class="[
        sizeClasses.padding,
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-300 hover:border-primary-400 dark:border-gray-600',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        error ? 'border-red-500!' : '',
      ]"
      @click="openFilePicker"
      @dragenter="onDragEnter"
      @dragover.prevent
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <div
          class="rounded-full bg-gray-100 p-3 dark:bg-gray-700"
          :class="isDragging ? 'bg-primary-100 dark:bg-primary-900/30' : ''"
        >
          <Upload
            :class="[
              sizeClasses.icon,
              isDragging ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500',
            ]"
          />
        </div>
        <div>
          <p class="font-medium text-gray-700 dark:text-gray-300" :class="sizeClasses.text">
            <span class="text-primary-600">Klik untuk upload</span>
            atau drag & drop
          </p>
          <p class="text-xs text-gray-500 mt-1 dark:text-gray-400">
            {{ accept || 'Semua format' }} &middot; Max {{ maxSize }}MB
            <span v-if="multiple"> &middot; Max {{ maxFiles }} files</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Variant: Compact -->
    <div v-else-if="variant === 'compact'" class="flex items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
        :disabled="disabled"
        @click="openFilePicker"
      >
        <Upload class="w-4 h-4" />
        Choose File
      </button>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ files.length > 0 ? `${files.length} file dipilih` : 'Belum ada file' }}
      </span>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="space-y-2 mt-2">
      <div
        v-for="uploadFile in files"
        :key="uploadFile.id"
        class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
      >
        <!-- File icon / preview -->
        <div
          class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 dark:bg-gray-700 dark:border-gray-600"
        >
          <component
            :is="getFileIcon(uploadFile.type)"
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
          />
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-gray-700 truncate dark:text-gray-300">
              {{ uploadFile.name }}
            </p>
            <Check
              v-if="uploadFile.status === 'success'"
              class="w-4 h-4 text-emerald-500 shrink-0"
            />
            <AlertCircle
              v-if="uploadFile.status === 'error'"
              class="w-4 h-4 text-red-500 shrink-0"
            />
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{
              formatSize(uploadFile.size)
            }}</span>
            <span v-if="uploadFile.status === 'uploading'" class="text-xs text-primary-600">
              {{ Math.round(uploadFile.progress) }}%
            </span>
            <span v-if="uploadFile.status === 'error'" class="text-xs text-red-500">
              {{ uploadFile.error }}
            </span>
          </div>

          <!-- Progress bar -->
          <div
            v-if="uploadFile.status === 'uploading'"
            class="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-600"
          >
            <div
              class="h-full bg-primary-500 rounded-full transition-[width] duration-200"
              :style="{ width: `${uploadFile.progress}%` }"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            v-if="uploadFile.status === 'uploading'"
            type="button"
            class="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
            title="Cancel"
            @click.stop="cancelFile(uploadFile)"
          >
            <X class="w-4 h-4" />
          </button>
          <button
            v-if="uploadFile.status === 'error'"
            type="button"
            class="px-2 py-0.5 text-xs text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer dark:hover:bg-primary-900/30"
            @click.stop="retryFile(uploadFile)"
          >
            Retry
          </button>
          <button
            v-if="uploadFile.status !== 'uploading'"
            type="button"
            class="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
            title="Remove"
            @click.stop="removeFile(uploadFile)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Hint / Error -->
    <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-gray-500 dark:text-gray-400">{{ hint }}</span>
  </div>
</template>

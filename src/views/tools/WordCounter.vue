<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { BaseCard } from '@purdia/ui'

const input = ref('')

const stats = computed(() => {
  const text = input.value
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split('\n').length : 0
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0
  const readingTime = Math.ceil(words / 200)
  return { characters, charactersNoSpaces, words, lines, sentences, paragraphs, readingTime }
})
</script>

<template>
  <ToolLayout tool-id="word-counter" title="Word Counter" description="Count words, characters, lines, and sentences">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <BaseCard variant="bordered" class="text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.words }}</div>
        <div class="text-xs text-gray-500">Words</div>
      </BaseCard>
      <BaseCard variant="bordered" class="text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.characters }}</div>
        <div class="text-xs text-gray-500">Characters</div>
      </BaseCard>
      <BaseCard variant="bordered" class="text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.lines }}</div>
        <div class="text-xs text-gray-500">Lines</div>
      </BaseCard>
      <BaseCard variant="bordered" class="text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.readingTime }}m</div>
        <div class="text-xs text-gray-500">Read time</div>
      </BaseCard>
    </div>
    <textarea
      v-model="input"
      class="w-full h-64 p-4 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      placeholder="Start typing or paste your text here..."
    />
    <div class="mt-3 flex gap-4 text-xs text-gray-500">
      <span>Sentences: {{ stats.sentences }}</span>
      <span>Paragraphs: {{ stats.paragraphs }}</span>
      <span>Characters (no spaces): {{ stats.charactersNoSpaces }}</span>
    </div>
  </ToolLayout>
</template>

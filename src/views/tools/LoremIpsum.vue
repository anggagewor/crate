<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, RefreshCw } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const paragraphs = ref(3)
const output = ref('')

const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function generateSentence(): string {
  const len = 8 + Math.floor(Math.random() * 12)
  const words: string[] = []
  for (let i = 0; i < len; i++) {
    words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

function generateParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4)
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence())
  }
  return sentences.join(' ')
}

function generate() {
  const paras: string[] = []
  for (let i = 0; i < paragraphs.value; i++) {
    paras.push(generateParagraph())
  }
  output.value = paras.join('\n\n')
}

generate()
</script>

<template>
  <ToolLayout tool-id="lorem-ipsum" title="Lorem Ipsum" description="Generate placeholder text">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="RefreshCw" @click="generate">Generate</BaseButton>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500">Paragraphs:</label>
        <input v-model.number="paragraphs" type="number" min="1" max="20" class="w-16 text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded" />
      </div>
      <BaseButton
        v-if="output"
        variant="ghost"
        size="sm"
        :icon="copied ? Check : Copy"
        class="ml-auto"
        @click="copy(output)"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </BaseButton>
    </div>
    <BaseCard variant="bordered">
      <pre class="font-sans text-sm leading-relaxed whitespace-pre-wrap">{{ output }}</pre>
    </BaseCard>
  </ToolLayout>
</template>

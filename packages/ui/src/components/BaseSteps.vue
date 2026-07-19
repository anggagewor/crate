<script setup lang="ts">
export type StepVariant = 'default' | 'dots' | 'numbered'

export interface StepItem {
  title: string
  description?: string
}

interface Props {
  steps: StepItem[]
  current: number
  variant?: StepVariant
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  clickable: false,
})

const emit = defineEmits<{
  'step-click': [index: number]
}>()

function handleStepClick(index: number, clickable: boolean) {
  if (clickable) {
    emit('step-click', index)
  }
}
</script>

<template>
  <nav aria-label="Steps" class="w-full">
    <ol class="flex items-center w-full">
      <li
        v-for="(step, index) in steps"
        :key="index"
        class="flex items-center"
        :class="{ 'flex-1': index < steps.length - 1 }"
      >
        <!-- Step indicator -->
        <button
          type="button"
          class="flex flex-col items-center gap-1"
          :class="{ 'cursor-pointer': clickable, 'cursor-default': !clickable }"
          :disabled="!clickable"
          :aria-current="index === current ? 'step' : undefined"
          :aria-label="`Step ${index + 1}: ${step.title}`"
          @click="handleStepClick(index, clickable)"
        >
          <!-- Dot / Number indicator -->
          <span
            v-if="variant === 'dots'"
            class="w-3 h-3 rounded-full transition-colors"
            :class="{
              'bg-primary-500 dark:bg-primary-400': index <= current,
              'bg-gray-300 dark:bg-gray-600': index > current,
            }"
          />
          <span
            v-else
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors shrink-0"
            :class="{
              'bg-primary-500 text-white dark:bg-primary-400': index < current,
              'border-2 border-primary-500 text-primary-500 dark:border-primary-400 dark:text-primary-400':
                index === current,
              'border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500':
                index > current,
            }"
          >
            <!-- Completed check -->
            <svg
              v-if="index < current && variant !== 'numbered'"
              class="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </span>

          <!-- Label -->
          <span
            class="text-xs font-medium text-center whitespace-nowrap"
            :class="{
              'text-primary-600 dark:text-primary-400': index <= current,
              'text-gray-500 dark:text-gray-400': index > current,
            }"
          >
            {{ step.title }}
          </span>
          <span
            v-if="step.description && variant !== 'dots'"
            class="text-[0.625rem] text-gray-400 dark:text-gray-500 text-center"
          >
            {{ step.description }}
          </span>
        </button>

        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          class="flex-1 h-px mx-3"
          :class="{
            'bg-primary-500 dark:bg-primary-400': index < current,
            'bg-gray-200 dark:bg-gray-700': index >= current,
          }"
        />
      </li>
    </ol>
  </nav>
</template>

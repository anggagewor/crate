<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { categories, getToolsByCategory, getToolById } from '@/data/tools'
import { BaseCard } from '@purdia/ui'
import { Clock, Star, ArrowRight } from 'lucide-vue-next'

const appStore = useAppStore()
const router = useRouter()

const recentTools = computed(() => {
  return appStore.recents
    .map((id) => getToolById(id))
    .filter(Boolean)
    .slice(0, 6)
})

const favoriteTools = computed(() => {
  return appStore.favorites
    .map((id) => getToolById(id))
    .filter(Boolean)
})

function openTool(route: string, id: string) {
  appStore.addRecent(id)
  router.push(route)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to Crate</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Your personal dev toolbox. Pick a tool to get started.</p>
    </div>

    <!-- Favorites -->
    <section v-if="favoriteTools.length > 0" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <Star :size="16" class="text-amber-500" />
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Favorites</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <BaseCard
          v-for="tool in favoriteTools"
          :key="tool!.id"
          variant="bordered"
          hoverable
          class="cursor-pointer"
          @click="openTool(tool!.route, tool!.id)"
        >
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ tool!.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ tool!.description }}</div>
            </div>
            <ArrowRight :size="14" class="text-gray-400 shrink-0" />
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- Recent -->
    <section v-if="recentTools.length > 0" class="mb-8">
      <div class="flex items-center gap-2 mb-3">
        <Clock :size="16" class="text-gray-400" />
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Recent</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <BaseCard
          v-for="tool in recentTools"
          :key="tool!.id"
          variant="bordered"
          hoverable
          class="cursor-pointer"
          @click="openTool(tool!.route, tool!.id)"
        >
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ tool!.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ tool!.description }}</div>
            </div>
            <ArrowRight :size="14" class="text-gray-400 shrink-0" />
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- All tools by category -->
    <section v-for="cat in categories" :key="cat.id" class="mb-8">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">{{ cat.label }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <BaseCard
          v-for="tool in getToolsByCategory(cat.id)"
          :key="tool.id"
          variant="bordered"
          hoverable
          class="cursor-pointer"
          @click="openTool(tool.route, tool.id)"
        >
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ tool.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ tool.description }}</div>
            </div>
            <ArrowRight :size="14" class="text-gray-400 shrink-0" />
          </div>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

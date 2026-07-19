<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { getToolById } from '@/data/tools'
import { categories } from '@/data/tools'
import { BaseButton, BaseBreadcrumb } from '@purdia/ui'
import { Star, Home } from 'lucide-vue-next'

const props = defineProps<{
  toolId: string
  title: string
  description: string
}>()

const appStore = useAppStore()

const breadcrumbItems = computed(() => {
  const tool = getToolById(props.toolId)
  const category = categories.find((c) => c.id === tool?.category)
  return [
    { label: 'Home', to: '/', icon: Home },
    { label: category?.label || 'Tools', to: '/' },
    { label: props.title },
  ]
})

onMounted(() => {
  appStore.addRecent(props.toolId)
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <BaseBreadcrumb :items="breadcrumbItems" size="sm" class="mb-4" />

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ title }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ description }}</p>
      </div>
      <BaseButton
        variant="ghost"
        size="sm"
        :icon="Star"
        :class="appStore.isFavorite(toolId) ? 'text-amber-500' : 'text-gray-400'"
        :title="appStore.isFavorite(toolId) ? 'Remove from favorites' : 'Add to favorites'"
        @click="appStore.toggleFavorite(toolId)"
      >
        {{ appStore.isFavorite(toolId) ? 'Favorited' : 'Favorite' }}
      </BaseButton>
    </div>

    <!-- Content -->
    <slot />
  </div>
</template>

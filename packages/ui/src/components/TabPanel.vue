<script setup lang="ts">
import { inject, computed } from 'vue'
import { TAB_ACTIVE_KEY } from './tabs-key'

interface Props {
  name: string
}

const props = defineProps<Props>()

const activeTab = inject(TAB_ACTIVE_KEY)

const isActive = computed(() => activeTab?.value === props.name)
</script>

<template>
  <div v-show="isActive" role="tabpanel">
    <slot />
  </div>
</template>

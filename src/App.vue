<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@purdia/theme'
import { ToastContainer } from '@purdia/toast'
import AppLayout from '@/layouts/AppLayout.vue'

const appStore = useAppStore()
const themeStore = useThemeStore()

const COLLAPSE_BREAKPOINT = 1024

function handleResize() {
  if (window.innerWidth < COLLAPSE_BREAKPOINT && !appStore.sidebarCollapsed) {
    appStore.sidebarCollapsed = true
  }
}

onMounted(() => {
  appStore.init()
  void themeStore
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <AppLayout />
  <ToastContainer />
</template>

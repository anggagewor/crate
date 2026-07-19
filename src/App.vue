<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@purdia/theme'
import { ToastContainer } from '@purdia/toast'
import AppLayout from '@/layouts/AppLayout.vue'

const appStore = useAppStore()
const themeStore = useThemeStore()

onMounted(() => {
  appStore.init()
  // Theme store auto-applies on creation via its watchers
  void themeStore
})
</script>

<template>
  <AppLayout />
  <ToastContainer />
</template>

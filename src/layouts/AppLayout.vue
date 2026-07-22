<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import TabBar from '@/components/TabBar.vue'
import CommandPalette from '@/components/CommandPalette.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main content area -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Topbar -->
      <AppTopbar />

      <!-- Tab bar -->
      <div :class="appStore.sidebarCollapsed ? 'ml-16' : 'ml-64'" class="pt-14">
        <TabBar />
      </div>

      <!-- Page content -->
      <main
        class="flex-1 overflow-y-auto p-6"
        :class="appStore.sidebarCollapsed ? 'ml-16' : 'ml-64'"
      >
        <div class="py-4">
          <router-view v-slot="{ Component, route }">
            <keep-alive :max="20">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Command Palette (Cmd+K) -->
    <CommandPalette />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

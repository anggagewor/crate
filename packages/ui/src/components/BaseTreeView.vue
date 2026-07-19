<script setup lang="ts">
import { ref, watch, type Component } from 'vue'

defineOptions({ name: 'BaseTreeView' })

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  icon?: Component
  disabled?: boolean
}

interface Props {
  items: TreeNode[]
  expandAll?: boolean
  selectable?: boolean
  modelValue?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  expandAll: false,
  selectable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  'node-click': [node: TreeNode]
}>()

const expandedNodes = ref<Set<string>>(new Set())

function initExpandAll(nodes: TreeNode[]) {
  for (const node of nodes) {
    if (node.children?.length) {
      expandedNodes.value.add(node.id)
      initExpandAll(node.children)
    }
  }
}

watch(
  () => props.expandAll,
  (val) => {
    if (val) {
      initExpandAll(props.items)
      expandedNodes.value = new Set(expandedNodes.value)
    } else {
      expandedNodes.value = new Set()
    }
  },
  { immediate: true },
)

function toggleExpand(node: TreeNode) {
  if (expandedNodes.value.has(node.id)) {
    expandedNodes.value.delete(node.id)
  } else {
    expandedNodes.value.add(node.id)
  }
  expandedNodes.value = new Set(expandedNodes.value)
}

function isExpanded(node: TreeNode): boolean {
  return expandedNodes.value.has(node.id)
}

function isSelected(node: TreeNode): boolean {
  if (!props.selectable) return false
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(node.id)
  }
  return props.modelValue === node.id
}

function handleNodeClick(node: TreeNode) {
  if (node.disabled) return
  emit('node-click', node)

  if (!props.selectable) return

  if (Array.isArray(props.modelValue)) {
    const newValue = props.modelValue.includes(node.id)
      ? props.modelValue.filter((id) => id !== node.id)
      : [...props.modelValue, node.id]
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', node.id)
  }
}
</script>

<template>
  <div role="tree" class="text-sm">
    <template v-for="node in items" :key="node.id">
      <div role="treeitem" :aria-expanded="node.children?.length ? isExpanded(node) : undefined">
        <div
          class="flex items-center gap-1 rounded px-2 py-1.5 transition-colors"
          :class="{
            'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300':
              isSelected(node),
            'hover:bg-gray-50 dark:hover:bg-gray-700/50': !isSelected(node) && !node.disabled,
            'opacity-50 cursor-not-allowed': node.disabled,
            'cursor-pointer': !node.disabled,
          }"
          @click="handleNodeClick(node)"
        >
          <!-- Expand/collapse chevron -->
          <button
            v-if="node.children?.length"
            type="button"
            class="flex items-center justify-center w-5 h-5 shrink-0 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
            :aria-label="isExpanded(node) ? 'Collapse' : 'Expand'"
            @click.stop="toggleExpand(node)"
          >
            <svg
              class="w-3.5 h-3.5 text-gray-400 transition-transform duration-150 dark:text-gray-500"
              :class="{ 'rotate-90': isExpanded(node) }"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <span v-else class="w-5 shrink-0" />

          <!-- Icon -->
          <component
            v-if="node.icon"
            :is="node.icon"
            class="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500"
          />

          <!-- Label -->
          <span class="truncate text-gray-700 dark:text-gray-200">{{ node.label }}</span>
        </div>

        <!-- Children (recursive) -->
        <div v-if="node.children?.length && isExpanded(node)" class="pl-4" role="group">
          <BaseTreeView
            :items="node.children"
            :expand-all="expandAll"
            :selectable="selectable"
            :model-value="modelValue"
            @update:model-value="emit('update:modelValue', $event)"
            @node-click="emit('node-click', $event)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

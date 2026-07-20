<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseCheckbox } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

// Permission bits: owner (r=4, w=2, x=1), group (r=4, w=2, x=1), others (r=4, w=2, x=1)
const ownerRead = ref(true)
const ownerWrite = ref(true)
const ownerExec = ref(true)
const groupRead = ref(true)
const groupWrite = ref(false)
const groupExec = ref(true)
const othersRead = ref(true)
const othersWrite = ref(false)
const othersExec = ref(true)

const numericInput = ref('755')
const filename = ref('filename')

const numericValue = computed(() => {
  const owner = (ownerRead.value ? 4 : 0) + (ownerWrite.value ? 2 : 0) + (ownerExec.value ? 1 : 0)
  const group = (groupRead.value ? 4 : 0) + (groupWrite.value ? 2 : 0) + (groupExec.value ? 1 : 0)
  const others = (othersRead.value ? 4 : 0) + (othersWrite.value ? 2 : 0) + (othersExec.value ? 1 : 0)
  return `${owner}${group}${others}`
})

const symbolicValue = computed(() => {
  const r = (v: boolean) => (v ? 'r' : '-')
  const w = (v: boolean) => (v ? 'w' : '-')
  const x = (v: boolean) => (v ? 'x' : '-')
  return (
    r(ownerRead.value) + w(ownerWrite.value) + x(ownerExec.value) +
    r(groupRead.value) + w(groupWrite.value) + x(groupExec.value) +
    r(othersRead.value) + w(othersWrite.value) + x(othersExec.value)
  )
})

const chmodCommand = computed(() => `chmod ${numericValue.value} ${filename.value}`)

function applyNumericInput() {
  const val = numericInput.value.trim()
  if (!/^[0-7]{3}$/.test(val)) return
  const [o, g, t] = val.split('').map(Number)
  ownerRead.value = !!(o & 4)
  ownerWrite.value = !!(o & 2)
  ownerExec.value = !!(o & 1)
  groupRead.value = !!(g & 4)
  groupWrite.value = !!(g & 2)
  groupExec.value = !!(g & 1)
  othersRead.value = !!(t & 4)
  othersWrite.value = !!(t & 2)
  othersExec.value = !!(t & 1)
}

watch(numericValue, (val) => {
  numericInput.value = val
})

const commonPermissions = [
  { numeric: '644', symbolic: 'rw-r--r--', desc: 'Default file' },
  { numeric: '755', symbolic: 'rwxr-xr-x', desc: 'Default directory / executable' },
  { numeric: '777', symbolic: 'rwxrwxrwx', desc: 'Full access (all)' },
  { numeric: '600', symbolic: 'rw-------', desc: 'Owner read/write only' },
  { numeric: '700', symbolic: 'rwx------', desc: 'Owner full access' },
  { numeric: '444', symbolic: 'r--r--r--', desc: 'Read-only (all)' },
  { numeric: '666', symbolic: 'rw-rw-rw-', desc: 'Read/write (all)' },
  { numeric: '750', symbolic: 'rwxr-x---', desc: 'Owner full, group read/exec' },
]

function applyPreset(numeric: string) {
  numericInput.value = numeric
  applyNumericInput()
}
</script>

<template>
  <ToolLayout tool-id="chmod-calculator" title="Chmod Calculator" description="Unix file permission calculator — convert between numeric and symbolic notation">
    <div class="space-y-4">
      <!-- Numeric input -->
      <BaseCard variant="bordered">
        <div class="flex items-center gap-3">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Numeric:</label>
          <input
            v-model="numericInput"
            type="text"
            maxlength="3"
            class="w-20 px-3 py-2 font-mono text-lg text-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            @keyup.enter="applyNumericInput"
            @blur="applyNumericInput"
          />
          <span class="text-sm font-mono text-gray-600 dark:text-gray-300">{{ symbolicValue }}</span>
          <BaseButton variant="ghost" size="sm" :icon="Copy" class="ml-auto" @click="copy(numericValue)" />
        </div>
      </BaseCard>

      <!-- Checkboxes -->
      <BaseCard variant="bordered">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Owner</div>
            <div class="space-y-2">
              <BaseCheckbox v-model="ownerRead" label="Read (4)" />
              <BaseCheckbox v-model="ownerWrite" label="Write (2)" />
              <BaseCheckbox v-model="ownerExec" label="Execute (1)" />
            </div>
          </div>
          <div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Group</div>
            <div class="space-y-2">
              <BaseCheckbox v-model="groupRead" label="Read (4)" />
              <BaseCheckbox v-model="groupWrite" label="Write (2)" />
              <BaseCheckbox v-model="groupExec" label="Execute (1)" />
            </div>
          </div>
          <div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Others</div>
            <div class="space-y-2">
              <BaseCheckbox v-model="othersRead" label="Read (4)" />
              <BaseCheckbox v-model="othersWrite" label="Write (2)" />
              <BaseCheckbox v-model="othersExec" label="Execute (1)" />
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Command output -->
      <BaseCard variant="bordered">
        <div class="flex items-center gap-3">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Command:</label>
          <code class="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100">chmod {{ numericValue }}</code>
          <input
            v-model="filename"
            type="text"
            class="w-32 px-2 py-1 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none"
            placeholder="filename"
          />
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(chmodCommand)" />
        </div>
      </BaseCard>

      <!-- Reference table -->
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Common Permissions</span>
        </template>
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div
            v-for="perm in commonPermissions"
            :key="perm.numeric"
            class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            @click="applyPreset(perm.numeric)"
          >
            <code class="w-10 text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{{ perm.numeric }}</code>
            <code class="w-24 text-xs font-mono text-gray-600 dark:text-gray-400">{{ perm.symbolic }}</code>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ perm.desc }}</span>
          </div>
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>

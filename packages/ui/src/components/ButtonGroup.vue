<script setup lang="ts">
interface Props {
  attached?: boolean
}

withDefaults(defineProps<Props>(), {
  attached: true,
})
</script>

<template>
  <div class="inline-flex" :class="attached ? 'button-group-attached' : 'gap-1'" role="group">
    <slot />
  </div>
</template>

<style scoped>
.button-group-attached > :deep(:first-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.button-group-attached > :deep(:last-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.button-group-attached > :deep(:not(:first-child):not(:last-child)) {
  border-radius: 0;
}

.button-group-attached > :deep(:not(:first-child)) {
  margin-left: -1px;
}
</style>

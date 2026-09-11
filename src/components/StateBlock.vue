<script setup>
defineProps({
  loading: Boolean,
  error: { type: [Error, String, null], default: null },
  errorTitle: { type: String, default: "Couldn't load this" },
  errorText: { type: String, default: 'Check your connection and try again.' },
  empty: Boolean,
  emptyTitle: { type: String, default: 'Nothing here yet' },
  emptyText: { type: String, default: '' },
})

defineEmits(['retry'])
</script>

<template>
  <div v-if="loading" class="space-y-3 px-4 py-6" aria-busy="true">
    <div v-for="n in 4" :key="n" class="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
      <div class="h-3 w-20 rounded-full bg-line"></div>
      <div class="mt-3 h-4 w-3/4 rounded-full bg-line"></div>
      <div class="mt-2 h-3 w-1/2 rounded-full bg-line"></div>
    </div>
  </div>

  <div v-else-if="error" class="px-4 py-10 text-center">
    <p class="font-display text-base font-bold">{{ errorTitle }}</p>
    <p class="mx-auto mt-1 max-w-xs text-sm text-muted">{{ errorText }}</p>
    <button
      type="button"
      class="mt-4 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
      @click="$emit('retry')"
    >
      Retry
    </button>
  </div>

  <div v-else-if="empty" class="px-4 py-14 text-center">
    <slot name="empty-icon" />
    <p class="mt-3 font-display text-base font-bold">{{ emptyTitle }}</p>
    <p v-if="emptyText" class="mx-auto mt-1 max-w-xs text-sm text-muted">{{ emptyText }}</p>
  </div>

  <slot v-else />
</template>

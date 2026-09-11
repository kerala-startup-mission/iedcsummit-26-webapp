<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  back: { type: String, default: '/' },
})
</script>

<template>
  <header
    class="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur"
  >
    <RouterLink
      :to="back"
      aria-label="Back"
      class="-ml-2 grid size-9 place-items-center rounded-full text-ink transition hover:bg-tint"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5">
        <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </RouterLink>
    <h1 class="font-display text-lg font-bold tracking-tight">{{ title }}</h1>
  </header>
</template>

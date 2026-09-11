<script setup>
import PageHeader from '../components/PageHeader.vue'
</script>

<template>
  <PageHeader title="Venue Map" />

  <main class="px-4 py-16 text-center">
    <div class="rounded-3xl bg-white px-6 py-12 shadow-sm ring-1 ring-line/60">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mx-auto size-12 text-brand/40"
      >
        <path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
        <path d="M9 4v13M15 6.5v13" />
      </svg>
      <p class="mt-4 font-display text-lg font-bold">Coming soon</p>
      <p class="mx-auto mt-1.5 max-w-xs text-sm text-muted">The venue map will be published before the summit.</p>
    </div>
  </main>
</template>

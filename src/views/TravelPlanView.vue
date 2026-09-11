<script setup>
import PageHeader from '../components/PageHeader.vue'
</script>

<template>
  <PageHeader title="Travel Plan" />

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
        <rect x="3" y="5" width="18" height="11" rx="2.5" />
        <path d="M3 10.5h18M9 5v5.5" />
        <circle cx="7.5" cy="19" r="1.6" />
        <circle cx="16.5" cy="19" r="1.6" />
      </svg>
      <p class="mt-4 font-display text-lg font-bold">Coming soon</p>
      <p class="mx-auto mt-1.5 max-w-xs text-sm text-muted">Travel and route details are on the way.</p>
    </div>
  </main>
</template>

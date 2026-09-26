<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { config } from '../event'
import { getTicketCode } from '../ticket'

// Entry Pass only appears once a ticket code has arrived via ?code= and been remembered.
const tiles = computed(() => [
  { to: '/agenda', label: 'Agenda', icon: 'calendar' },
  { to: '/speakers', label: 'Speakers', icon: 'users' },
  { href: 'https://iedc-summit-s2cb.vercel.app/', label: 'Venue Map', icon: 'map' },
  { to: '/travel-plan', label: 'Travel Plan', icon: 'bus' },
  ...(getTicketCode() ? [{ to: '/entry-pass', label: 'Entry Pass', icon: 'ticket' }] : []),
])
</script>

<template>
  <main class="px-4 pt-6 pb-10">
    <!--
      The banner already carries the event name, date, venue and KSUM logo, so it stands in
      for the whole hero. The text card below is the fallback for an event with no banner set.
    -->
    <section class="overflow-hidden rounded-xl bg-brand shadow-lg shadow-brand/20">
      <img
        v-if="config.banner"
        :src="config.banner"
        :alt="config.name"
        width="1600"
        height="400"
        class="block aspect-[4/1] w-full object-cover"
      />
      <template v-else>
        <div class="px-5 pt-6 pb-5">
          <h1 class="font-display text-3xl leading-tight font-bold text-white">
            {{ config.name }}
          </h1>
          <p class="mt-1.5 text-base font-medium text-white/80">{{ config.date }}</p>
        </div>
        <p class="bg-black/15 px-5 py-4 text-sm leading-snug font-medium text-white">
          {{ config.venue }}
        </p>
      </template>
    </section>

    <nav class="mt-5 grid grid-cols-3 gap-3">
      <!-- A tile is an in-app route, or an <a> when it points somewhere outside the app. -->
      <component
        :is="tile.href ? 'a' : RouterLink"
        v-for="tile in tiles"
        :key="tile.label"
        v-bind="tile.href ? { href: tile.href } : { to: tile.to }"
        class="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl bg-white px-2 shadow-sm ring-1 ring-line/60 transition active:scale-95 hover:ring-brand/40"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-8 text-brand"
        >
          <template v-if="tile.icon === 'calendar'">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 3v4M16 3v4M3 10h18" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
          </template>
          <template v-else-if="tile.icon === 'users'">
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3.5 19a5.5 5.5 0 0111 0" />
            <path d="M16 5.5a3.2 3.2 0 010 5.4M17.5 19a5.5 5.5 0 00-2-4.3" />
          </template>
          <template v-else-if="tile.icon === 'map'">
            <path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
            <path d="M9 4v13M15 6.5v13" />
          </template>
          <template v-else-if="tile.icon === 'bus'">
            <rect x="3" y="5" width="18" height="11" rx="2.5" />
            <path d="M3 10.5h18M9 5v5.5" />
            <circle cx="7.5" cy="19" r="1.6" />
            <circle cx="16.5" cy="19" r="1.6" />
          </template>
          <template v-else>
            <path
              d="M3 9.5V7a2 2 0 012-2h14a2 2 0 012 2v2.5a2.5 2.5 0 000 5V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.5a2.5 2.5 0 000-5z"
            />
            <path d="M14 5v14" stroke-dasharray="2 2.5" />
          </template>
        </svg>
        <span class="text-center text-sm leading-tight font-semibold">{{ tile.label }}</span>
      </component>
    </nav>
  </main>
</template>

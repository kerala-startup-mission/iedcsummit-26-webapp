<script setup>
import { computed, ref, watch } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SessionCard from '../components/SessionCard.vue'
import StateBlock from '../components/StateBlock.vue'
import { clean, getAgenda } from '../event'

const data = ref(null)
const loading = ref(true)
const error = ref(null)

const activeDate = ref('')
const activeVenue = ref('')

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await getAgenda()
    activeDate.value = data.value.dates[0] ?? ''
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
load()

const dates = computed(() => data.value?.dates ?? [])
const venues = computed(() => data.value?.venuesByDate?.[activeDate.value] ?? [])
const sessions = computed(() => data.value?.agenda?.[activeDate.value]?.[activeVenue.value] ?? [])

// A venue only exists within a date, so switching dates has to reselect one.
watch(venues, (list) => {
  if (!list.includes(activeVenue.value)) activeVenue.value = list[0] ?? ''
}, { immediate: true })
</script>

<template>
  <PageHeader title="Agenda" />

  <main class="pb-10">
    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!dates.length"
      empty-title="Agenda coming soon"
      empty-text="Sessions will appear here closer to the summit."
      @retry="load"
    >
      <template #empty-icon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mx-auto size-12 text-brand/40"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      </template>

      <!-- One date is the common case (the summit is single-day); a lone pill is noise. -->
      <div v-if="dates.length > 1" class="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4">
        <button
          v-for="date in dates"
          :key="date"
          type="button"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="
            date === activeDate
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white text-muted ring-1 ring-line'
          "
          @click="activeDate = date"
        >
          {{ date }}
        </button>
      </div>
      <p v-else class="px-4 pt-4 font-display text-sm font-bold text-muted">{{ activeDate }}</p>

      <div class="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          v-for="venue in venues"
          :key="venue"
          type="button"
          class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
          :class="
            venue === activeVenue
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white text-muted ring-1 ring-line'
          "
          @click="activeVenue = venue"
        >
          {{ clean(venue) }}
        </button>
      </div>

      <ol class="mt-4 space-y-3 px-4">
        <li v-for="session in sessions" :key="session.id">
          <SessionCard :item="session" />
        </li>
      </ol>

      <p v-if="!sessions.length" class="px-4 py-12 text-center text-sm text-muted">
        No sessions listed for this venue.
      </p>
    </StateBlock>
  </main>
</template>

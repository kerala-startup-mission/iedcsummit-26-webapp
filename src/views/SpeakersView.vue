<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import SpeakerAvatar from '../components/SpeakerAvatar.vue'
import StateBlock from '../components/StateBlock.vue'
import { clean, config, getSpeakers, selectCategories } from '../event'

const data = ref(null)
const loading = ref(true)
const error = ref(null)
const query = ref('')
const activeCategory = ref('')

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await getSpeakers()
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
load()

// `speakers` is [[category, [speaker, ...]], ...]; category labels carry stray whitespace.
const allGroups = computed(() => data.value?.speakers ?? [])
const groups = computed(() => selectCategories(allGroups.value, config.speakerCategories))

// A category configured but not present is almost always a typo, and would otherwise
// just silently shrink the list. Say so once, naming what the event actually publishes.
watch(groups, (shown) => {
  const wanted = config.speakerCategories
  if (!wanted.length || !allGroups.value.length || shown.length === wanted.length) return
  const matched = new Set(shown.map(([category]) => clean(category).toLowerCase()))
  const missing = wanted.filter((name) => !matched.has(clean(name).toLowerCase()))
  if (missing.length) {
    console.warn(
      `[speakers] VITE_EVENT_SPEAKER_CATEGORIES lists unknown ${
        missing.length === 1 ? 'category' : 'categories'
      }: ${missing.join(', ')}. This event publishes: ${allGroups.value
        .map(([category]) => clean(category))
        .join(', ')}.`,
    )
  }
})

const list = computed(() =>
  groups.value
    .filter(([category]) => !activeCategory.value || category === activeCategory.value)
    .flatMap(([, people]) => people)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
)

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return list.value
  return list.value.filter((speaker) =>
    [speaker.name, speaker.designation, speaker.organisation]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(needle)),
  )
})
</script>

<template>
  <PageHeader title="Speakers" />

  <main class="pb-10">
    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!list.length && !query"
      empty-title="Speakers coming soon"
      empty-text="The line-up will appear here as speakers are confirmed."
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
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19a5.5 5.5 0 0111 0M16 5.5a3.2 3.2 0 010 5.4M17.5 19a5.5 5.5 0 00-2-4.3" />
        </svg>
      </template>

      <div class="px-4 pt-4">
        <input
          v-model="query"
          type="search"
          placeholder="Search speakers"
          aria-label="Search speakers"
          class="w-full rounded-full border-0 bg-white px-4 py-2.5 text-sm shadow-sm ring-1 ring-line outline-none placeholder:text-muted focus:ring-2 focus:ring-brand"
        />
      </div>

      <!-- Hidden when the event publishes a single category, which is the usual case. -->
      <div v-if="groups.length > 1" class="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
          :class="
            activeCategory ? 'bg-white text-muted ring-1 ring-line' : 'bg-brand text-white shadow-sm'
          "
          @click="activeCategory = ''"
        >
          All
        </button>
        <button
          v-for="[category, people] in groups"
          :key="category"
          type="button"
          class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
          :class="
            category === activeCategory
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white text-muted ring-1 ring-line'
          "
          @click="activeCategory = category"
        >
          {{ clean(category) }} ({{ people.length }})
        </button>
      </div>

      <ul class="mt-4 grid grid-cols-2 gap-3 px-4">
        <li v-for="speaker in filtered" :key="speaker.id">
          <RouterLink
            :to="{ name: 'speaker', params: { hid: speaker.id } }"
            class="block h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line/60 transition active:scale-95 hover:ring-brand/40"
          >
            <SpeakerAvatar
              :photo="speaker.photo"
              :name="speaker.name"
              class="aspect-square w-full text-2xl"
            />
            <div class="px-3 py-2.5">
              <p class="font-display text-sm leading-tight font-bold">{{ clean(speaker.name) }}</p>
              <p v-if="speaker.designation" class="mt-1 text-xs leading-snug text-muted">
                {{ clean(speaker.designation) }}
              </p>
              <p v-if="speaker.organisation" class="mt-0.5 text-xs leading-snug text-muted">
                {{ clean(speaker.organisation) }}
              </p>
            </div>
          </RouterLink>
        </li>
      </ul>

      <p v-if="!filtered.length" class="px-4 py-12 text-center text-sm text-muted">
        No speakers match “{{ query }}”.
      </p>
    </StateBlock>
  </main>
</template>

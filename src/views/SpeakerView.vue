<script setup>
import { computed, ref, watch } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SessionCard from '../components/SessionCard.vue'
import SpeakerAvatar from '../components/SpeakerAvatar.vue'
import StateBlock from '../components/StateBlock.vue'
import { clean, findSpeaker, getSpeaker } from '../event'

const props = defineProps({ hid: { type: String, required: true } })

const speaker = ref(null)
const loading = ref(true)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null
  speaker.value = null
  try {
    speaker.value = await getSpeaker(props.hid)
  } catch (e) {
    // Offline, most likely: this speaker's detail endpoint was never fetched, so the
    // service worker has nothing for it. The speakers list is cached as a whole, so fall
    // back to that entry — it has everything but `bio` and `agendas`, both of which the
    // template already hides when empty.
    speaker.value = await findSpeaker(props.hid).catch(() => null)
    if (!speaker.value) error.value = e
  } finally {
    loading.value = false
  }
}

// A co-speaker link on this page changes the param without remounting the component.
watch(() => props.hid, load, { immediate: true })

const sessions = computed(() => speaker.value?.agendas ?? [])
</script>

<template>
  <PageHeader :title="loading ? 'Speaker' : clean(speaker?.name) || 'Speaker'" back="/speakers" />

  <main class="pb-10">
    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!speaker"
      empty-title="Speaker not found"
      @retry="load"
    >
      <section class="px-4 pt-6 text-center">
        <SpeakerAvatar
          :photo="speaker.photo"
          :name="speaker.name"
          class="mx-auto size-28 rounded-full text-3xl ring-4 ring-white shadow-md"
        />
        <h2 class="mt-4 font-display text-xl leading-tight font-bold">{{ clean(speaker.name) }}</h2>
        <p v-if="speaker.designation" class="mt-1 text-sm font-medium text-muted">
          {{ clean(speaker.designation) }}
        </p>
        <p v-if="speaker.organisation" class="mt-0.5 text-sm text-muted">
          {{ clean(speaker.organisation) }}
        </p>

        <a
          v-if="speaker.linkedin"
          :href="speaker.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="size-4">
            <path
              d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4V9z"
            />
          </svg>
          LinkedIn
        </a>
      </section>

      <p v-if="speaker.bio" class="mt-6 px-4 text-sm leading-relaxed whitespace-pre-line text-ink/80">
        {{ speaker.bio }}
      </p>

      <!-- Hidden entirely until the agenda is published, which is the current state. -->
      <section v-if="sessions.length" class="mt-8 px-4">
        <h3 class="font-display text-base font-bold">
          Sessions
          <span class="ml-1 text-sm font-semibold text-muted">{{ sessions.length }}</span>
        </h3>
        <ol class="mt-3 space-y-3">
          <li v-for="session in sessions" :key="session.id">
            <SessionCard :item="session" show-venue />
          </li>
        </ol>
      </section>
    </StateBlock>
  </main>
</template>

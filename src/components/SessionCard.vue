<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SpeakerAvatar from './SpeakerAvatar.vue'
import { clean, sessionSpeakers, timeRange } from '../event'

const props = defineProps({
  item: { type: Object, required: true },
  /** Show the speaker strip. Off on the agenda timeline rail, on elsewhere. */
  showSpeakers: { type: Boolean, default: true },
  /** Render the venue line — redundant on the agenda, where a venue is already selected. */
  showVenue: { type: Boolean, default: false },
  /** Speaker id to drop from the strip, so a speaker page doesn't list the speaker again. */
  excludeSpeaker: { type: String, default: null },
})

const speakers = computed(() =>
  sessionSpeakers(props.item).filter((speaker) => speaker.id !== props.excludeSpeaker),
)
const time = computed(() => timeRange(props.item.start_time, props.item.end_time))
const category = computed(() => clean(props.item.category))
const venue = computed(() => clean(props.item.venue))
</script>

<template>
  <article class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line/60">
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span v-if="time" class="font-display text-sm font-bold text-brand">{{ time }}</span>
      <span
        v-if="category"
        class="rounded-full bg-tint px-2 py-0.5 text-[11px] font-semibold text-brand"
      >
        {{ category }}
      </span>
    </div>

    <h3 class="mt-1.5 font-display text-base leading-snug font-bold">{{ clean(item.name) }}</h3>

    <p v-if="showVenue && venue" class="mt-1 flex items-start gap-1.5 text-xs text-muted">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="mt-px size-3.5 shrink-0"
      >
        <path
          d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {{ venue }}
    </p>

    <p v-if="item.description" class="mt-2 text-sm leading-relaxed text-muted">
      {{ item.description }}
    </p>

    <a
      v-if="item.link"
      :href="item.link"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-2 inline-block text-sm font-semibold text-brand underline underline-offset-2"
    >
      {{ clean(item.link_text) || 'Learn more' }}
    </a>

    <ul v-if="showSpeakers && speakers.length" class="mt-3 flex flex-col gap-2 border-t border-line pt-3">
      <li v-for="speaker in speakers" :key="speaker.id">
        <RouterLink
          :to="{ name: 'speaker', params: { hid: speaker.id } }"
          class="flex items-center gap-2.5 rounded-lg transition hover:opacity-70"
        >
          <SpeakerAvatar
            :photo="speaker.photo"
            :name="speaker.name"
            class="size-9 shrink-0 rounded-full text-[11px]"
          />
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold">{{ clean(speaker.name) }}</span>
            <span v-if="speaker.designation" class="block truncate text-xs text-muted">
              {{ clean(speaker.designation) }}
            </span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </article>
</template>

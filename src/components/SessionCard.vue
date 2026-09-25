<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SpeakerAvatar from './SpeakerAvatar.vue'
import { clean, sessionSpeakers, timeRange } from '../event'
import { renderMarkdown } from '../markdown'

const props = defineProps({
  item: { type: Object, required: true },
  /** Show the speaker strip. Off on the agenda timeline rail, on elsewhere. */
  showSpeakers: { type: Boolean, default: true },
  /** Render the venue line — redundant on the agenda, where a venue is already selected. */
  showVenue: { type: Boolean, default: false },
})

const speakers = computed(() => sessionSpeakers(props.item))
const time = computed(() => timeRange(props.item.start_time, props.item.end_time))
const category = computed(() => clean(props.item.category))
const venue = computed(() => clean(props.item.venue))
// Organisers write descriptions as Markdown; markdown.js escapes any raw HTML in them.
const description = computed(() => renderMarkdown(props.item.description))
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

    <!-- eslint-disable-next-line vue/no-v-html -- sanitised in markdown.js (html: false) -->
    <div v-if="description" class="md mt-2 text-sm leading-relaxed text-muted" v-html="description"></div>

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
          class="flex items-center gap-3 rounded-lg transition hover:opacity-70"
        >
          <SpeakerAvatar
            :photo="speaker.photo"
            :name="speaker.name"
            class="size-12 shrink-0 rounded-full text-xs"
          />
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold">{{ clean(speaker.name) }}</span>
            <!--
              Designation and organisation get a line each rather than being joined: the two
              run to a median 47 characters together, which truncates the organisation away
              entirely at phone width. Both are nullable in the API.
            -->
            <span v-if="speaker.designation" class="block truncate text-xs text-muted">
              {{ clean(speaker.designation) }}
            </span>
            <span v-if="speaker.organisation" class="block truncate text-xs text-muted">
              {{ clean(speaker.organisation) }}
            </span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </article>
</template>

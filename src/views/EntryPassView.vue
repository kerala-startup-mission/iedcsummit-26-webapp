<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StateBlock from '../components/StateBlock.vue'
import { badgeUrl, getTicketCode } from '../ticket'

const code = ref(getTicketCode())
const loading = ref(false)
const error = ref(null)

const src = computed(() => badgeUrl(code.value))

/**
 * Decode the badge before rendering it.
 *
 * StateBlock only renders its default slot once loading is false, so an <img> inside it
 * could never report its own load. Fetching here also means the pass appears fully drawn
 * rather than painting in while someone holds it up at the gate — and a failed decode is
 * how an invalid code surfaces, since the ticketing API answers those with an HTML 404.
 */
function load() {
  if (!src.value) return
  loading.value = true
  error.value = null

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.onload = () => {
    loading.value = false
  }
  image.onerror = () => {
    loading.value = false
    error.value = new Error('Badge unavailable')
  }
  image.src = src.value
}

onMounted(load)
</script>

<template>
  <PageHeader title="Entry Pass" />

  <main class="px-4 pt-4 pb-10">
    <StateBlock
      :loading="loading"
      :error="error"
      :empty="!code"
      error-title="Pass not found"
      error-text="We couldn't load a pass for this code. Check the link from your confirmation, or try again."
      empty-title="No pass on this device"
      empty-text="Open the link from your registration confirmation to load your entry pass."
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
          <path
            d="M3 9.5V7a2 2 0 012-2h14a2 2 0 012 2v2.5a2.5 2.5 0 000 5V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.5a2.5 2.5 0 000-5z"
          />
          <path d="M14 5v14" stroke-dasharray="2 2.5" />
        </svg>
      </template>

      <section class="overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-line/60">
        <!--
          Plain white mount, no upscaling: the QR has to stay crisp enough to scan off a
          phone screen, and its quiet zone has to survive.
        -->
        <img
          :src="src"
          alt="Your entry pass"
          width="1000"
          height="1408"
          crossorigin="anonymous"
          class="block aspect-[1000/1408] w-full rounded-xl bg-white object-contain"
        />
      </section>

      <p class="mt-3 text-center text-xs text-muted">
        Ticket code
        <span class="ml-1 font-mono font-semibold text-ink">{{ code }}</span>
      </p>
    </StateBlock>
  </main>
</template>

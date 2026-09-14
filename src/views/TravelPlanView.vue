<script setup>
import PageHeader from '../components/PageHeader.vue'

/**
 * How to reach the venue, from the official summit site's "How to reach Sahrdaya" section.
 * This is the one place to edit when the event moves.
 */
const TRAVEL = {
  address: 'Sahrdaya College of Engineering & Technology, Kodakara, Thrissur.',
  coordinates: '10.3604945,76.2842346',
  train: {
    title: 'Reach Irinjalakuda by train.',
    intro:
      'Choose the service that fits your route. The highlighted time is the Irinjalakuda station stop.',
    groups: [
      {
        name: 'From South',
        services: [
          { name: 'M S Guruvayur Exp', number: '16127', stop: 'Irinjalakuda', time: '05:58' },
          { name: 'ERS Can Express', number: '16305', stop: 'Irinjalakuda', time: '06:53' },
          { name: 'KTYM Nil Exp', number: '16326', stop: 'Irinjalakuda', time: '07:45' },
        ],
      },
      {
        name: 'From North',
        services: [
          { name: 'KIK ERS Express', number: '16187', stop: 'Irinjalakuda', time: '04:47' },
          { name: 'Kanyakumari Exp', number: '16526', stop: 'Irinjalakuda', time: '06:10' },
          { name: 'GUV MDU Exp', number: '16328', stop: 'Irinjalakuda', time: '06:47' },
          { name: 'Alleppey SF Exp', number: '22639', stop: 'Irinjalakuda', time: '07:02' },
        ],
      },
    ],
    alternative: {
      title: 'Reach via Thrissur Railway Station',
      body: 'About 45 minutes to Sahrdaya. All major trains stop here.',
    },
    disclaimer:
      'Timings are a travel reference for Summit Day. Please check live availability and platform details before you leave.',
  },
  modes: [
    {
      icon: 'bus',
      label: 'By bus',
      title: 'Reach by bus',
      body: 'All buses up to the Super Fast category stop at Kodakara.',
    },
    {
      icon: 'plane',
      label: 'By air',
      title: 'Fly to Cochin International Airport.',
      body: 'Nedumbassery is the nearest airport. Continue to Kodakara by cab or bus.',
    },
    {
      icon: 'parking',
      label: 'Parking on campus',
      title: 'Follow the event signs.',
      body: 'Use the designated campus parking areas and follow volunteer guidance on arrival.',
    },
  ],
}

// Both opened on tap, in whatever maps app the device has. No embedded map: a React Native
// WebView hands an iframe's load to the external browser, which pops a Chrome tab showing
// Google's "must be used in an iframe" error just from visiting this page. A static image
// has none of that problem and works offline too.
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${TRAVEL.coordinates}`
// Google's own short link for the venue, so the place page opens with the right listing.
const placeUrl = 'https://maps.app.goo.gl/oweKptB1WorSqK8VA'
</script>

<template>
  <PageHeader title="Travel Plan" />

  <main class="space-y-6 px-4 pt-4 pb-10">
    <!-- Venue -->
    <section class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line/60">
      <p class="text-[11px] font-bold tracking-widest text-muted uppercase">Venue</p>
      <p class="mt-1.5 font-display text-base leading-snug font-bold">{{ TRAVEL.address }}</p>
      <a
        :href="directionsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4"
        >
          <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Get directions
      </a>

      <!--
        Static preview rather than an embed, for the WebView reason above. OpenStreetMap
        imagery, with its attribution rendered into the picture. Tapping it opens the venue
        in Google Maps.
      -->
      <a
        :href="placeUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 block overflow-hidden rounded-xl ring-1 ring-line transition active:opacity-90"
      >
        <img
          src="/summit-venue-map.jpg"
          alt="Map showing Sahrdaya College of Engineering & Technology at Kodakara. Opens in Google Maps."
          width="1200"
          height="900"
          class="block aspect-[4/3] w-full object-cover"
        />
        <span
          class="flex items-center justify-center gap-1.5 bg-white py-2 text-xs font-semibold text-brand"
        >
          Open in Google Maps
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-3.5"
          >
            <path d="M14 4h6v6M20 4l-8.5 8.5" />
            <path d="M18 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h5" />
          </svg>
        </span>
      </a>
    </section>

    <!-- Route map -->
    <section>
      <h2 class="px-1 font-display text-base font-bold">Route map</h2>
      <div class="mt-2 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-line/60">
        <img
          src="/summit-route-map.png"
          alt="Route map to Sahrdaya College of Engineering and Technology, showing Irinjalakuda, Aloor Junction, Koprakalam Junction and Kodakara"
          width="1280"
          height="1221"
          class="block w-full rounded-xl"
        />
      </div>
    </section>

    <!-- Train -->
    <section>
      <h2 class="flex items-center gap-2 px-1 font-display text-base font-bold">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-5 text-brand"
        >
          <rect x="5" y="3" width="14" height="13" rx="3" />
          <path d="M5 10h14M9 3v7M15 3v7M8 20l-1.5 1.5M16 20l1.5 1.5M7 16h.01M17 16h.01" />
        </svg>
        By train
      </h2>
      <p class="mt-1.5 px-1 font-display text-sm font-bold">{{ TRAVEL.train.title }}</p>
      <p class="mt-1 px-1 text-sm leading-relaxed text-muted">{{ TRAVEL.train.intro }}</p>

      <div v-for="group in TRAVEL.train.groups" :key="group.name" class="mt-4">
        <p class="px-1 text-[11px] font-bold tracking-widest text-muted uppercase">
          {{ group.name }}
        </p>
        <ul class="mt-2 space-y-2">
          <li
            v-for="service in group.services"
            :key="service.number"
            class="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-line/60"
          >
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold">{{ service.name }}</span>
              <span class="mt-0.5 block text-xs text-muted">Train {{ service.number }}</span>
            </span>
            <span class="shrink-0 text-right">
              <span class="block font-display text-sm font-bold text-brand">
                {{ service.time }}
              </span>
              <span class="mt-0.5 block text-xs text-muted">{{ service.stop }}</span>
            </span>
          </li>
        </ul>
      </div>

      <div class="mt-3 rounded-2xl bg-tint/60 p-3.5 ring-1 ring-brand/10">
        <p class="text-sm font-semibold">{{ TRAVEL.train.alternative.title }}</p>
        <p class="mt-0.5 text-sm leading-relaxed text-muted">{{ TRAVEL.train.alternative.body }}</p>
      </div>

      <p class="mt-3 px-1 text-xs leading-relaxed text-muted">{{ TRAVEL.train.disclaimer }}</p>
    </section>

    <!-- Bus, air, parking -->
    <section v-for="mode in TRAVEL.modes" :key="mode.label">
      <h2 class="flex items-center gap-2 px-1 font-display text-base font-bold">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-5 text-brand"
        >
          <template v-if="mode.icon === 'bus'">
            <rect x="3" y="5" width="18" height="11" rx="2.5" />
            <path d="M3 10.5h18M9 5v5.5" />
            <circle cx="7.5" cy="19" r="1.6" />
            <circle cx="16.5" cy="19" r="1.6" />
          </template>
          <template v-else-if="mode.icon === 'plane'">
            <path d="M10.5 19.5l1.5-4.5 4.5-1.5M3.5 12l17-7.5-7.5 17-2-7.5-7.5-2z" />
          </template>
          <template v-else>
            <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
            <path d="M9.5 16.5v-9h3a2.75 2.75 0 010 5.5h-3" />
          </template>
        </svg>
        {{ mode.label }}
      </h2>
      <div class="mt-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line/60">
        <p class="font-display text-sm font-bold">{{ mode.title }}</p>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ mode.body }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { initials } from '../event'

const props = defineProps({
  photo: { type: String, default: null },
  name: { type: String, default: '' },
})

const failed = ref(false)
watch(() => props.photo, () => (failed.value = false))

const fallback = computed(() => initials(props.name))
</script>

<template>
  <!--
    Initials sit underneath the photo rather than replacing it on error: the speakers
    list loads 168 images from one host, so most are still queued behind the browser's
    connection limit. Without this the grid is a wall of empty boxes for a few seconds.
  -->
  <span
    class="relative grid place-items-center overflow-hidden bg-tint font-display font-bold text-brand"
  >
    <span aria-hidden="true">{{ fallback }}</span>
    <img
      v-if="photo && !failed"
      :src="photo"
      :alt="name"
      loading="lazy"
      class="absolute inset-0 size-full object-cover"
      @error="failed = true"
    />
  </span>
</template>

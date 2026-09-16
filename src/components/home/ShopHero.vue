<script setup>
import heroMp4 from '@/assets/video/hero.mp4'
import heroSmallMp4 from '@/assets/video/hero-small.mp4'
import heroWebm from '@/assets/video/hero.webm'
import heroPoster from '@/assets/video/hero-poster.webp'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The opening: a thirty-second film on a peach ground.
 *
 * The footage was shot on one flat colour, #e9ae95, and the section is painted
 * that exact colour edge to edge, so the film has no visible frame -- the
 * stones, the flowers and the hand simply exist on the right of the page and
 * the words on the left. The video is never cropped: the spray bottle reaches
 * the top of the frame and the hand enters from above.
 *
 * Two encodes and a still. The small mp4 goes to phones (650 KB against 1.5 MB),
 * WebM to browsers that take it, and the still stands in until the film is
 * ready, for anyone who has asked their system for less motion, and for the
 * crawlers that draw share cards.
 */
const PROMISES = ['Besplatna dostava', 'Plaćanje pouzećem', 'Bez registracije']

const video = ref(null)
const reduced = ref(false)

// iOS pauses autoplaying video when the tab is hidden and does not always
// resume it; a nudge on return keeps the loop going.
function resume() {
  if (document.visibilityState === 'visible' && !reduced.value) video.value?.play?.().catch(() => {})
}

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.addEventListener('visibilitychange', resume)
})

onBeforeUnmount(() => document.removeEventListener('visibilitychange', resume))
</script>

<template>
  <section class="bg-peach text-ink">
    <div class="shell grid items-center gap-2 pb-10 pt-4 lg:grid-cols-[minmax(0,44%)_minmax(0,56%)] lg:gap-10 lg:py-6">
      <!-- The film. First on a phone, right on a desktop; whole, never cropped. -->
      <div class="order-1 -mx-5 sm:mx-0 lg:order-2">
        <video
          v-if="!reduced"
          ref="video"
          class="block aspect-[1800/1100] w-full object-contain"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
          :poster="heroPoster"
          aria-label="Ruka spušta Meva preparate na kamen"
        >
          <source :src="heroWebm" type="video/webm" media="(min-width: 768px)" />
          <source :src="heroMp4" type="video/mp4" media="(min-width: 768px)" />
          <source :src="heroSmallMp4" type="video/mp4" />
        </video>
        <img v-else :src="heroPoster" alt="Meva preparati na kamenu" class="block aspect-[1800/1100] w-full object-contain" />
      </div>

      <!-- The words. -->
      <div class="order-2 lg:order-1 lg:py-10">
        <p class="text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-ink/70">Prirodna kozmetika · Novi Pazar</p>

        <h1 class="mt-3 text-[2.25rem] leading-[1.06] sm:text-[2.875rem] lg:text-[3.5rem]" style="text-wrap: balance">
          Koža koja se konačno smirila.
        </h1>

        <p class="mt-4 max-w-[26rem] text-[1rem] leading-relaxed text-ink/80 sm:text-[1.0625rem]">
          Ručno rađeni preparati u malim serijama, sa sastavom koji možete pročitati i razumeti.
          Ispitani u Institutu za javno zdravlje Vojvodine.
        </p>

        <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <RouterLink
            :to="{ name: 'catalog' }"
            class="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.9375rem] font-bold text-paper shadow-[0_14px_30px_-14px_rgba(42,31,35,0.6)] transition-colors hover:bg-blush-600"
          >
            Pogledaj proizvode
          </RouterLink>
          <RouterLink
            :to="{ name: 'story' }"
            class="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/35 px-8 py-4 text-[0.9375rem] font-bold text-ink transition-colors hover:border-ink hover:bg-paper/40"
          >
            Pronađi svoju rutinu
            <span aria-hidden="true">→</span>
          </RouterLink>
        </div>

        <ul class="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          <li v-for="promise in PROMISES" :key="promise" class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink/75">
            <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-ink" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ promise }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

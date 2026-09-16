<script setup>
import heroMp4 from '@/assets/video/hero.mp4'
import heroSmallMp4 from '@/assets/video/hero-small.mp4'
import heroWebm from '@/assets/video/hero.webm'
import heroPoster from '@/assets/video/hero-poster.webp'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The opening: a thirty-second film on a CSS ground.
 *
 * The ground is one CSS colour, and it is the colour Eldin read off the film
 * on his own screen -- #f8c1ba -- not the colour on the brief, not the colour
 * ffmpeg decodes, and not the colour a headless browser paints; a browser
 * runs video through a different colour path from CSS, and the number that
 * matters is the one the customer's Mac or iPhone actually shows. The film's
 * left, right and bottom edges dissolve into the ground; the top edge is
 * solid and flush with the header, because the hand enters from above.
 */
const PROMISES = ['Besplatna dostava', 'Plaćanje pouzećem', 'Bez registracije']

// Only what is true. Each one is a fact the shop can stand behind.
const SEALS = [
  { big: 'Ispitano', small: 'Institut za javno zdravlje Vojvodine' },
  { big: 'Analiza sastava', small: 'Superlab laboratorija' },
  { big: '5.479', small: 'porudžbina od 2010.' },
]

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

    <div class="shell grid items-center gap-0 pb-10 pt-0 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:gap-8 lg:pb-0">
      <!-- The film. First on a phone, right on a desktop and out to the page's edge; whole, never cropped. -->
      <div class="order-1 -mx-5 self-start sm:mx-0 lg:order-2 lg:-mr-10 xl:-mr-16">
        <video
          v-if="!reduced"
          ref="video"
          class="feather block aspect-[1800/1100] w-full object-contain"
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
        <img v-else :src="heroPoster" alt="Meva preparati na kamenu" class="feather block aspect-[1800/1100] w-full object-contain" />
      </div>

      <!-- The words. -->
      <div class="order-2 pt-5 lg:order-1 lg:py-10">
        <p class="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-ink/60">Prirodna kozmetika · Novi Pazar</p>

        <h1 class="mt-3 font-display text-[2.375rem] font-semibold leading-[1.05] sm:text-[3rem] lg:text-[3.625rem]" style="text-wrap: balance">
          Koža koja se <em class="not-italic text-blush-700">konačno</em> smirila.
        </h1>

        <p class="mt-2.5 font-script text-[1.5rem] leading-none text-blush-700/85 sm:text-[1.75rem]">Priroda brine o tebi, svakog dana</p>

        <p class="mt-4 max-w-[27rem] text-[1rem] leading-relaxed text-ink/80 sm:text-[1.0625rem]">
          Ručno rađeni preparati u malim serijama, sa sastavom koji možete pročitati i razumeti.
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <RouterLink
            :to="{ name: 'catalog' }"
            class="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[0.9375rem] font-bold text-paper shadow-[0_14px_30px_-14px_rgba(42,31,35,0.55)] transition-colors hover:bg-blush-700"
          >
            Pogledaj proizvode
          </RouterLink>
          <RouterLink
            :to="{ name: 'story' }"
            class="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/30 px-8 py-4 text-[0.9375rem] font-bold text-ink transition-colors hover:border-ink hover:bg-paper/40"
          >
            Pronađi svoju rutinu
            <span aria-hidden="true">→</span>
          </RouterLink>
        </div>

        <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <li v-for="promise in PROMISES" :key="promise" class="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink/70">
            <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-ink/80" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ promise }}
          </li>
        </ul>

        <!-- Seals: the facts that earn trust before anyone reads further -->
        <ul class="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <li v-for="seal in SEALS" :key="seal.big" class="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-paper/45 px-3 py-2.5 backdrop-blur-[2px]">
            <svg viewBox="0 0 32 32" class="h-8 w-8 shrink-0 text-blush-700" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <!-- laurel -->
              <path d="M9 26c-4-3-6-8-5-13 3 1 5 4 5 7M23 26c4-3 6-8 5-13-3 1-5 4-5 7" />
              <path d="M8 21c-3-1-5-4-5-7 3 0 5 2 6 4M24 21c3-1 5-4 5-7-3 0-5 2-6 4" />
              <path d="M9 15c-2-1-3-3-3-6 2 0 4 2 4 4M23 15c2-1 3-3 3-6-2 0-4 2-4 4" />
              <path d="M16 6l1.6 3.3 3.6.5-2.6 2.5.6 3.6L16 14.2l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="currentColor" stroke="none" />
            </svg>
            <span class="min-w-0 leading-tight">
              <span class="block truncate font-display text-[0.9375rem] font-semibold text-ink">{{ seal.big }}</span>
              <span class="block text-[0.6875rem] leading-snug text-ink/60">{{ seal.small }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

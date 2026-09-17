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

// Two seals, drawn as seals: text set round a circle, a mark in the middle.
// Both are facts -- the laboratories that tested the range -- and a seal
// carrying a `href` becomes a link to the laboratory that issued it, so the
// claim can be checked rather than only read.
const SEALS = [
  {
    id: 'izjzv',
    ring: 'ISPITANO  ·  INSTITUT ZA JAVNO ZDRAVLJE VOJVODINE  ·  ',
    mark: 'check',
    href: 'https://izjzv.org.rs',
  },
  {
    id: 'superlab',
    ring: 'ANALIZA SASTAVA  ·  SUPERLAB LABORATORIJA  ·  ',
    mark: 'leaf',
    // Waiting on Eldin for the address: superlab.rs is a supplier of
    // laboratory equipment, and a link to the wrong company would be worse
    // than none. Fill this in and it becomes a link like the other.
    href: null,
  },
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
            class="inline-flex items-center justify-center rounded-full bg-blush-600 px-8 py-4 text-[0.9375rem] font-bold text-paper shadow-[0_16px_34px_-16px_rgba(150,73,100,0.7)] transition-colors hover:bg-blush-700"
          >
            Pogledaj proizvode
          </RouterLink>
          <RouterLink
            :to="{ name: 'story' }"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-paper/70 bg-paper/45 px-8 py-4 text-[0.9375rem] font-bold text-ink backdrop-blur-sm transition-colors hover:bg-paper/70"
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

        <!-- Seals. Text set round a circle, as a stamp is; and one plain figure. -->
        <div class="mt-7 flex items-center gap-5 sm:gap-7">
          <component
            :is="seal.href ? 'a' : 'div'"
            v-for="seal in SEALS"
            :key="seal.id"
            :href="seal.href ?? undefined"
            :target="seal.href ? '_blank' : undefined"
            :rel="seal.href ? 'noopener noreferrer' : undefined"
            :title="seal.href ? `${seal.ring.replaceAll('  ·  ', ', ').trim()} — otvorite sajt laboratorije` : undefined"
            class="shrink-0 rounded-full transition-transform duration-500"
            :class="seal.href ? 'hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush-700' : ''"
          >
          <svg viewBox="0 0 120 120" class="h-[6.25rem] w-[6.25rem] text-blush-700 sm:h-28 sm:w-28" role="img" :aria-label="seal.ring.replaceAll('  ·  ', ', ').trim()">
            <defs><path :id="`ring-${seal.id}`" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
            <circle cx="60" cy="60" r="55" fill="rgba(255,255,255,0.45)" stroke="currentColor" stroke-width="1" />
            <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="1.5 2.5" />
            <text font-family="DM Sans, sans-serif" font-size="7.6" font-weight="700" letter-spacing="1.1" fill="currentColor">
              <textPath :href="`#ring-${seal.id}`" startOffset="0">{{ seal.ring }}</textPath>
            </text>
            <g v-if="seal.mark === 'check'" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M46 61l9 9 19-20" /></g>
            <g v-else fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M74 44c-1 14-8 22-20 22h-4c0-14 8-22 24-22z" /><path d="M50 72c3-6 7-11 13-15" /></g>
          </svg>
          </component>

          <p class="min-w-0 leading-tight">
            <span class="block font-display text-[1.75rem] font-semibold text-ink sm:text-[2rem]">5.479</span>
            <span class="block text-[0.8125rem] text-ink/65">porudžbina od 2010.</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

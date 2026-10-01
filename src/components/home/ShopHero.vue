<script setup>
import heroMp4 from '@/assets/video/hero.mp4'
import heroSmallMp4 from '@/assets/video/hero-small.mp4'
import heroWebm from '@/assets/video/hero.webm'
import heroPosterWide from '@/assets/video/hero-poster.webp'
import heroPosterSmall from '@/assets/video/hero-poster-small.webp'
import { FOUNDED, yearsLabel } from '@/lib/heritage'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The opening: a thirty-second film with the words laid over it.
 *
 * The ground is one CSS colour, #f8c1ba, and the film is not shot on it any
 * more -- it is a stone shelf in daylight. So the film never meets the pink
 * along an edge: it is masked, and the pink shows through where the mask
 * thins. On a desktop the film fills the hero from the right and dissolves
 * leftwards under the words. Its right edge is the container's -- it ends
 * where the navigation above and the strip below end -- and dissolves too,
 * on an eased ramp: a straight one leaves a line where it starts and stops. On a
 * phone the film is its own crop (the products, not the empty wall), sits
 * above the words, and dissolves downwards into them.
 */
const PROMISES = ['Plaćanje pouzećem', 'Bez registracije', 'Kurir vas zove pre isporuke']

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
// A poster cannot carry a media query, and the phone's film is a different crop.
const heroPoster = window.matchMedia('(min-width: 768px)').matches ? heroPosterWide : heroPosterSmall

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
  <section class="relative isolate overflow-hidden bg-peach text-ink">
    <!-- The film. Above the words on a phone; behind them, from the right, on a desktop. -->
    <div class="xl:absolute xl:inset-y-0 xl:left-1/2 xl:-z-10 xl:w-full xl:max-w-[90rem] xl:-translate-x-1/2">
      <video
        v-if="!reduced"
        ref="video"
        class="film block aspect-[5/4] w-full object-cover md:aspect-[2/1] xl:absolute xl:inset-y-0 xl:right-16 xl:aspect-auto xl:h-full xl:w-[68%]"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        :poster="heroPoster"
        aria-label="Ruka spušta Meva preparate na kamenu policu"
      >
        <source :src="heroWebm" type="video/webm" media="(min-width: 768px)" />
        <source :src="heroMp4" type="video/mp4" media="(min-width: 768px)" />
        <source :src="heroSmallMp4" type="video/mp4" />
      </video>
      <img
        v-else
        :src="heroPoster"
        alt="Meva preparati na kamenoj polici"
        class="film block aspect-[5/4] w-full object-cover md:aspect-[2/1] xl:absolute xl:inset-y-0 xl:right-16 xl:aspect-auto xl:h-full xl:w-[68%]"
      />
    </div>

    <div class="shell pb-10 xl:pb-0">
      <!-- The words. -->
      <div class="-mt-3 md:-mt-8 xl:mt-0 xl:w-[44%] xl:py-14">
        <p class="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-ink/70 sm:text-[0.75rem]">
          Prirodna kozmetika <span aria-hidden="true">•</span> Novi Pazar <span aria-hidden="true">•</span> Od {{ FOUNDED }}.
        </p>

        <h1 class="mt-3 font-display lining-nums text-[2.375rem] font-semibold leading-[1.02] tracking-[-0.01em] sm:text-[3.25rem] xl:text-[4rem]">
          Više od {{ yearsLabel() }}
          <span class="block text-blush-700">poverenja.</span>
        </h1>

        <p class="mt-4 max-w-[29rem] text-[1rem] leading-relaxed text-ink/80 sm:text-[1.0625rem]">
          Prirodna kozmetika, pažljivo razvijena i proverena kroz generacije. Isti cilj od početka — zdrava i negovana koža.
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
        <div class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4 sm:gap-x-7">
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
            <span class="block text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ink/55">preko</span>
            <span class="block font-display text-[1.75rem] font-semibold leading-none text-ink sm:text-[2.125rem]">90.000</span>
            <span class="mt-1 block text-[0.8125rem] text-ink/65">porudžbina od 2010.</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The mask is the pink shadow: where it thins, the section's ground shows through. */
.film {
  -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent);
  mask-image: linear-gradient(to bottom, #000 82%, transparent);
}

@media (min-width: 1280px) {
  .film {
    --left: linear-gradient(
      to right,
      transparent,
      rgba(0, 0, 0, 0.05) 4%,
      rgba(0, 0, 0, 0.18) 9%,
      rgba(0, 0, 0, 0.42) 15%,
      rgba(0, 0, 0, 0.7) 21%,
      rgba(0, 0, 0, 0.9) 26%,
      #000 31%
    );
    --right: linear-gradient(
      to left,
      transparent,
      rgba(0, 0, 0, 0.04) 1.5%,
      rgba(0, 0, 0, 0.16) 3.5%,
      rgba(0, 0, 0, 0.4) 6%,
      rgba(0, 0, 0, 0.68) 8.5%,
      rgba(0, 0, 0, 0.9) 11%,
      #000 14%
    );
    object-position: 80% 50%;
    -webkit-mask-image: var(--left), var(--right);
    -webkit-mask-composite: source-in;
    mask-image: var(--left), var(--right);
    mask-composite: intersect;
  }
}
</style>

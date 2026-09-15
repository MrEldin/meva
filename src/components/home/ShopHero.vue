<script setup>
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * The opening.
 *
 * Clear does not have to mean plain. The headline is set large in the display
 * face and allowed to overlap the photograph; the product floats on a pink
 * cloud rather than sitting in a grey box; a vertical label runs up the left
 * edge the way it would on a magazine spread. The button is still the single
 * blackest thing on the screen, which is the only rule that matters here.
 */
const catalog = useCatalogStore()

const hero = computed(() =>
  catalog.products.find((p) => p.slug?.startsWith('set-za-seboreju-za-kosu-i-lice'))
  ?? catalog.products.find((p) => p.image)
  ?? null,
)

const CLAIMS = ['Ručno rađeno', 'Bez sulfata', 'Bez parabena', 'Ispitano u laboratoriji', 'Od 2010.', 'Novi Pazar']
</script>

<template>
  <section class="relative overflow-hidden bg-paper">
    <div class="shell relative">
      <!-- The spine: a label read bottom to top, as on a book -->
      <span class="kicker absolute left-0 top-40 hidden text-mist-400 writing-vertical lg:block">
        Meva Cosmetics — Est. 2010
      </span>

      <div class="grid items-center gap-8 pb-10 pt-8 lg:grid-cols-12 lg:gap-6 lg:pb-16 lg:pt-14">
        <!-- Type, over the picture -->
        <div class="relative z-10 order-2 lg:order-1 lg:col-span-6 lg:pr-4">
          <p class="kicker text-blush-500">01 — Prirodna nega</p>

          <h1 class="mt-5 text-[3.25rem] font-normal leading-[0.92] tracking-[-0.03em] sm:text-[4.5rem] lg:text-[5.75rem]">
            Koža koja
            <span class="block">se konačno</span>
            <span class="relative inline-block italic text-blush-500">
              smirila.
              <svg class="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none">
                <path d="M2 7c40-5 90-6 196-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </span>
          </h1>

          <p class="mt-8 max-w-sm text-[0.9375rem] leading-relaxed text-mist-600 sm:text-base">
            Ručno rađeni preparati u malim serijama, sa sastavom koji možete pročitati i razumeti.
            Ispitani u Institutu za javno zdravlje Vojvodine.
          </p>

          <div class="mt-9 flex flex-wrap items-center gap-3">
            <RouterLink
              :to="{ name: 'catalog' }"
              class="group relative overflow-hidden rounded-full bg-ink px-9 py-4 text-[0.9375rem] font-semibold text-paper"
            >
              <span class="absolute inset-0 origin-left scale-x-0 bg-blush-500 transition-transform duration-500 ease-[var(--ease-silk)] group-hover:scale-x-100" />
              <span class="relative">Pogledaj proizvode</span>
            </RouterLink>
            <RouterLink
              :to="{ name: 'story' }"
              class="group inline-flex items-center gap-2 px-2 py-4 text-[0.9375rem] font-semibold text-ink"
            >
              Naša priča
              <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </RouterLink>
          </div>
        </div>

        <!-- The photograph, floating -->
        <div class="relative order-1 lg:order-2 lg:col-span-6">
          <div class="bloom-pink absolute -inset-8 rounded-[50%] blur-3xl sm:-inset-14" />
          <div class="relative overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(18,18,18,0.35)]">
            <img
              v-if="hero?.image"
              :src="hero.image"
              :alt="hero.name"
              class="aspect-[4/5] w-full object-cover sm:aspect-square lg:aspect-[5/6]"
            />
            <div v-else class="aspect-[5/6] w-full bg-blush-50" />
          </div>

          <!-- One figure, hand-placed, the way a magazine tags a photo -->
          <div class="absolute bottom-2 right-0 hidden rounded-full bg-ink px-5 py-3 text-paper sm:block lg:bottom-6">
            <p class="font-display text-xl leading-none">5.479</p>
            <p class="kicker mt-1 text-[0.5625rem] text-paper/55">porudžbina</p>
          </div>
        </div>
      </div>
    </div>

    <!-- A strip that never stops moving, carrying what the shop stands for -->
    <div class="border-y border-ink/10 bg-blush-50 py-3.5">
      <div class="ticker" style="--ticker-duration: 46s">
        <ul v-for="copy in 2" :key="copy" class="flex shrink-0 items-center" aria-hidden="copy === 2">
          <li v-for="claim in CLAIMS" :key="claim + copy" class="flex items-center">
            <span class="kicker px-6 text-ink/70">{{ claim }}</span>
            <span class="h-1 w-1 rounded-full bg-blush-400" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

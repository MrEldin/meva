<script setup>
import heroPhone from '@/assets/hero-phone.webp'
import heroWide from '@/assets/hero-wide.webp'

/**
 * The opening, for a phone first.
 *
 * The products are cut out of their background, so they float on the pink
 * field instead of sitting inside a grey studio photograph. Two pictures: a
 * tall arrangement for a phone, where the image stacks above the words, and a
 * wide one for a desktop, where it sits beside them. The browser fetches only
 * the one it needs.
 *
 * White and pink; the type is the only dark thing; one button.
 */
const PROMISES = ['Besplatna dostava', 'Plaćanje pouzećem', 'Bez registracije']
</script>

<template>
  <section class="bg-paper">
    <div class="shell pb-6 pt-3 lg:pb-14 lg:pt-8">
      <div class="overflow-hidden rounded-[1.75rem] bg-blush-50 lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div class="px-6 pt-7 sm:px-8 lg:order-1 lg:px-14 lg:py-16">
          <p class="text-[0.8125rem] font-bold uppercase tracking-wider text-blush-500">Prirodna kozmetika · Novi Pazar</p>

          <h1 class="mt-3 text-[2.125rem] leading-[1.1] sm:text-[2.75rem] lg:text-[3.25rem]">
            Koža koja se konačno smirila.
          </h1>

          <p class="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-mist-600 sm:text-base">
            Ručno rađeni preparati sa sastavom koji možete pročitati i razumeti.
            Ispitani u Institutu za javno zdravlje Vojvodine.
          </p>

          <RouterLink
            :to="{ name: 'catalog' }"
            class="mt-6 flex w-full items-center justify-center rounded-full bg-blush-500 px-8 py-4 text-base font-bold text-paper shadow-[0_10px_30px_-10px_rgba(179,97,126,0.6)] transition-colors hover:bg-blush-600 sm:inline-flex sm:w-auto"
          >
            Pogledaj proizvode
          </RouterLink>

          <ul class="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <li v-for="promise in PROMISES" :key="promise" class="flex items-center gap-1.5 text-[0.8125rem] font-medium text-mist-600">
              <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-blush-500" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ promise }}
            </li>
          </ul>
        </div>

        <!-- The cutout, on the pink, with a soft pool of light behind it -->
        <div class="relative px-3 pb-4 pt-6 sm:px-6 lg:order-2 lg:px-6 lg:py-8">
          <div class="absolute inset-x-8 bottom-6 top-1/3 rounded-[50%] bg-blush-200/70 blur-3xl" />
          <picture>
            <source media="(min-width: 1024px)" :srcset="heroWide" />
            <img
              :src="heroPhone"
              alt="Meva preparati: šampon, losion, ulje i kreme"
              class="relative mx-auto w-full max-w-md drop-shadow-[0_24px_40px_rgba(120,56,78,0.18)] lg:max-w-none"
              fetchpriority="high"
            />
          </picture>
        </div>
      </div>
    </div>
  </section>
</template>

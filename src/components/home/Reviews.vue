<script setup>
import SectionHead from '@/components/home/SectionHead.vue'
import { reviews } from '@/data/reviews'
import { computed } from 'vue'

/**
 * What people wrote, and the figures behind them.
 *
 * On a pink field, with one enormous quotation mark behind the first column,
 * because a wall of grey testimonial boxes is the most ignored thing on any
 * shop. The numbers come from the shop's own order history, which is why they
 * are odd rather than round: a round number reads as marketing.
 */
const FIGURES = [
  { value: '5.479', label: 'porudžbina' },
  { value: '3.964', label: 'kupaca' },
  { value: '68', label: 'preparata' },
  { value: '16', label: 'godina' },
]

const shown = computed(() => reviews.slice(0, 6))
</script>

<template>
  <section class="relative overflow-hidden bg-blush-50">
    <span class="pointer-events-none absolute -left-4 top-4 select-none font-display text-[16rem] leading-none text-blush-200/70 lg:text-[22rem]">“</span>

    <div class="shell relative py-14 lg:py-20">
      <SectionHead number="05" kicker="Iskustva" title="Šta kažu kupci" />

      <ul class="mt-9 grid gap-4 md:grid-cols-3">
        <li v-for="review in shown" :key="review.name + review.text.slice(0, 12)" class="rounded-[1.25rem] bg-paper p-6 lg:p-7">
          <p class="text-sm tracking-[0.25em] text-blush-400">★★★★★</p>
          <blockquote class="mt-3.5 text-[0.9375rem] leading-relaxed text-mist-600">{{ review.text }}</blockquote>
          <footer class="mt-5 border-t border-ink/8 pt-4">
            <p class="font-display text-lg leading-none">{{ review.name }}</p>
            <p v-if="review.product" class="mt-1.5 text-xs text-mist-400">{{ review.product }}</p>
          </footer>
        </li>
      </ul>

      <ul class="mt-4 grid grid-cols-2 gap-4 rounded-[1.25rem] bg-ink px-6 py-8 text-center sm:grid-cols-4">
        <li v-for="figure in FIGURES" :key="figure.label">
          <p class="font-display text-3xl leading-none text-paper sm:text-4xl">{{ figure.value }}</p>
          <p class="kicker mt-2 text-[0.5625rem] text-paper/45">{{ figure.label }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

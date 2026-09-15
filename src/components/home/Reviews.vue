<script setup>
import { reviews } from '@/data/reviews'
import { computed } from 'vue'

/**
 * What people wrote, and the figures behind them.
 *
 * The numbers come from the shop's own order history, which is why they are
 * odd rather than round. A round number reads as marketing; 5.479 reads as a
 * count.
 */
const FIGURES = [
  { value: '5.479', label: 'porudžbina' },
  { value: '3.964', label: 'kupaca' },
  { value: '68', label: 'preparata' },
  { value: '16', label: 'godina rada' },
]

const shown = computed(() => reviews.slice(0, 6))
</script>

<template>
  <section class="border-y border-mist-200 bg-shell">
    <div class="shell py-12 lg:py-16">
      <h2 class="text-center text-2xl sm:text-3xl">Šta kažu kupci</h2>

      <ul class="mx-auto mt-7 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
        <li v-for="figure in FIGURES" :key="figure.label" class="rounded-2xl bg-paper px-4 py-5 text-center">
          <p class="text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">{{ figure.value }}</p>
          <p class="mt-1 text-xs text-mist-500">{{ figure.label }}</p>
        </li>
      </ul>

      <!-- Full width on a phone, three across on a desktop; no dragging rail,
           because a rail hides two thirds of what people said. -->
      <ul class="mt-8 grid gap-4 md:grid-cols-3">
        <li v-for="review in shown" :key="review.name + review.text.slice(0, 12)" class="rounded-2xl bg-paper p-6">
          <p class="text-sm tracking-[0.2em] text-blush-400">★★★★★</p>
          <blockquote class="mt-3 text-[0.9375rem] leading-relaxed text-mist-600">“{{ review.text }}”</blockquote>
          <p class="mt-4 text-sm font-semibold text-ink">{{ review.name }}</p>
          <p v-if="review.product" class="text-xs text-mist-500">{{ review.product }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

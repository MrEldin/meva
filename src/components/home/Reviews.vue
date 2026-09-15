<script setup>
import SectionHead from '@/components/home/SectionHead.vue'
import { reviews } from '@/data/reviews'
import { computed } from 'vue'

const shown = computed(() => reviews.slice(0, 4))
</script>

<template>
  <section class="bg-blush-50">
    <div class="shell py-10 lg:py-16">
      <SectionHead title="Šta kažu kupci" note="Iskustva iz recenzija, doslovno." />

      <ul class="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <li v-for="review in shown" :key="review.name + review.text.slice(0, 12)" class="rounded-[1.25rem] bg-paper p-5">
          <p class="text-sm tracking-[0.2em] text-blush-400">★★★★★</p>
          <blockquote class="mt-2.5 text-[0.9375rem] leading-relaxed text-mist-600">{{ review.text }}</blockquote>
          <p class="mt-3.5 text-[0.875rem] font-bold text-ink">{{ review.name }}<span v-if="review.product" class="font-normal text-mist-400"> · {{ review.product }}</span></p>
        </li>
      </ul>
    </div>
  </section>
</template>

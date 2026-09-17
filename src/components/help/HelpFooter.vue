<script setup>
import { computed } from 'vue'

/**
 * The foot of every reading page: how to reach a person, and the way on to
 * the other two pages. The three answer the same worry in different order,
 * and somebody who opened the wrong one should not have to go back to the
 * front page to find the right one.
 */
const props = defineProps({
  current: { type: String, required: true },
})

const PAGES = [
  { name: 'faq', title: 'Česta pitanja', text: 'Koliko traje pakovanje, kada se vide rezultati.' },
  { name: 'delivery', title: 'Dostava', text: 'Besplatno u celoj Srbiji, plaćate kuriru.' },
  { name: 'returns', title: 'Povrat i reklamacije', text: '14 dana za odustajanje, bez objašnjenja.' },
]

const others = computed(() => PAGES.filter((page) => page.name !== props.current))
</script>

<template>
  <div class="mt-12 lg:mt-16">
    <div class="rounded-[1.75rem] bg-gradient-to-br from-blush-100 to-peach/70 p-6 sm:p-8">
      <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="font-display text-[1.375rem] leading-tight text-ink sm:text-[1.625rem]">Niste našli odgovor?</h2>
          <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/70">Pišite nam — javljamo se isti dan, bez formulara.</p>
        </div>
        <a
          href="mailto:porudzbine@meva.life"
          class="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-blush-700 px-6 py-3.5 text-[0.9375rem] font-bold text-paper transition-colors hover:bg-blush-600"
        >
          <svg viewBox="0 0 24 24" class="h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7 8 5.5L20 7" /></svg>
          porudzbine@meva.life
        </a>
      </div>
    </div>

    <ul class="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
      <li v-for="page in others" :key="page.name">
        <RouterLink
          :to="{ name: page.name }"
          class="group flex h-full items-center justify-between gap-4 rounded-[1.25rem] bg-paper p-5 ring-1 ring-blush-100 transition-all duration-500 hover:-translate-y-0.5 hover:ring-blush-300"
        >
          <span class="min-w-0">
            <span class="block font-display text-[1.0625rem] text-ink">{{ page.title }}</span>
            <span class="mt-1 block text-[0.875rem] text-ink/55">{{ page.text }}</span>
          </span>
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blush-50 text-blush-700 transition-colors group-hover:bg-blush-600 group-hover:text-paper" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12.5 6l6 6-6 6" /></svg>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

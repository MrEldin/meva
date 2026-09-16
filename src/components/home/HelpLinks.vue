<script setup>
import SectionHead from '@/components/home/SectionHead.vue'

const LINKS = [
  { to: 'faq', title: 'Česta pitanja', text: 'Koliko traje pakovanje, kada se vide rezultati.' },
  { to: 'delivery', title: 'Dostava', text: 'Besplatno u celoj Srbiji, plaćate kuriru.' },
  { to: 'returns', title: 'Povrat i reklamacije', text: '14 dana za odustajanje.' },
]
</script>

<template>
  <section class="shell py-10 lg:py-16">
    <SectionHead title="Pre nego što poručite" />

    <ul class="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
      <li v-for="link in LINKS" :key="link.to">
        <RouterLink :to="{ name: link.to }" class="flex h-full items-center justify-between gap-3 rounded-[1.25rem] border border-blush-100 p-5 transition-colors hover:bg-blush-50">
          <span>
            <span class="block text-[0.9375rem] font-bold text-ink">{{ link.title }}</span>
            <span class="mt-1 block text-[0.875rem] text-mist-500">{{ link.text }}</span>
          </span>
          <span class="shrink-0 text-lg text-blush-500">→</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
import SectionHead from '@/components/home/SectionHead.vue'

/** The questions people ask before they order, each one a page away. */
const LINKS = [
  { to: 'faq', n: '01', title: 'Česta pitanja', text: 'Koliko traje pakovanje, kada se vide rezultati, može li uz terapiju.' },
  { to: 'delivery', n: '02', title: 'Dostava', text: 'Besplatno u celoj Srbiji, jedan do tri radna dana, plaćate kuriru.' },
  { to: 'returns', n: '03', title: 'Povrat i reklamacije', text: 'Četrnaest dana za odustajanje, i šta ako nešto nije u redu.' },
]
</script>

<template>
  <section class="shell py-14 lg:py-20">
    <SectionHead number="06" kicker="Pre nego što poručite" title="Sve što se obično pita" />

    <ul class="mt-9 divide-y divide-ink/10 border-b border-ink/10">
      <li v-for="link in LINKS" :key="link.to">
        <RouterLink
          :to="{ name: link.to }"
          class="group flex flex-wrap items-baseline gap-x-6 gap-y-2 py-6 transition-colors hover:bg-blush-50/60 sm:flex-nowrap sm:px-2"
        >
          <span class="font-display text-sm text-blush-400">{{ link.n }}</span>
          <span class="min-w-0 flex-1">
            <span class="block font-display text-2xl leading-tight transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-1.5 sm:text-3xl">{{ link.title }}</span>
            <span class="mt-1.5 block text-[0.9375rem] text-mist-500">{{ link.text }}</span>
          </span>
          <span class="shrink-0 text-xl text-ink transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-2">→</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

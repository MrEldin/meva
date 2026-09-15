<script setup>
/**
 * The questions people ask before they order, each one a page away.
 *
 * Put here rather than only in the footer because someone deciding whether to
 * buy is on this page, not at the bottom of it.
 */
const LINKS = [
  { to: 'faq', title: 'Česta pitanja', text: 'Koliko traje pakovanje, može li uz terapiju, kako se čuva.' },
  { to: 'delivery', title: 'Dostava', text: 'Besplatno u celoj Srbiji, jedan do tri radna dana, plaćate kuriru.' },
  { to: 'returns', title: 'Povrat i reklamacije', text: 'Četrnaest dana za odustajanje, i šta da radite ako nešto nije u redu.' },
]
</script>

<template>
  <section class="shell py-12 lg:py-16">
    <h2 class="text-2xl sm:text-3xl">Pre nego što poručite</h2>

    <ul class="mt-6 grid gap-3 md:grid-cols-3">
      <li v-for="link in LINKS" :key="link.to">
        <RouterLink
          :to="{ name: link.to }"
          class="group flex h-full flex-col rounded-2xl border border-mist-200 p-6 transition-colors hover:border-ink"
        >
          <h3 class="text-lg font-bold">{{ link.title }}</h3>
          <p class="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-mist-600">{{ link.text }}</p>
          <span class="mt-4 text-sm font-semibold text-blush-500">Pročitaj →</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
/** The three things people ask before they order, answered before they ask. */
const POINTS = [
  {
    title: 'Besplatna dostava',
    text: 'U celoj Srbiji, bez minimalnog iznosa. Paket stiže za jedan do tri radna dana.',
    icon: 'van',
  },
  {
    title: 'Plaćate kuriru',
    text: 'Pouzećem, kad paket stigne. Nema unapred, nema kartice ako je ne želite.',
    icon: 'cash',
  },
  {
    title: 'Sastav koji se čita',
    text: 'Svaki sastojak ispisan punim imenom. Bez sulfata i bez parabena.',
    icon: 'leaf',
  },
]
</script>

<template>
  <section class="shell py-12 lg:py-16">
    <ul class="grid gap-8 sm:grid-cols-3">
      <li v-for="point in POINTS" :key="point.title" class="text-center sm:text-left">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blush-100 text-blush-600 sm:mx-0">
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <template v-if="point.icon === 'van'"><path d="M2 7h11v10H2zM13 10h4l3 3v4h-7z" /><circle cx="6" cy="18.5" r="1.6" /><circle cx="17" cy="18.5" r="1.6" /></template>
            <template v-else-if="point.icon === 'cash'"><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></template>
            <template v-else><path d="M20 4c0 8-5 12-11 12H5c0-8 5-12 11-12z" /><path d="M5 20c1.5-4 4-6.5 8-8" /></template>
          </svg>
        </span>
        <h3 class="mt-4 text-lg font-bold">{{ point.title }}</h3>
        <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-mist-600">{{ point.text }}</p>
      </li>
    </ul>
  </section>
</template>

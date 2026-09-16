<script setup>
const POINTS = [
  { title: 'Besplatna dostava', text: 'U celoj Srbiji, bez minimalnog iznosa. Svih 5.479 porudžbina do sada.', icon: 'van' },
  { title: 'Plaćate kuriru', text: 'Pouzećem, kad paket stigne. Ništa unapred.', icon: 'cash' },
  { title: 'Sastav koji se čita', text: 'Svaki sastojak punim imenom. Bez sulfata i parabena.', icon: 'leaf' },
]
</script>

<template>
  <section class="shell py-10 lg:py-16">
    <ul class="grid gap-3 sm:grid-cols-3 sm:gap-4">
      <li v-for="point in POINTS" :key="point.title" class="flex items-start gap-4 rounded-[1.25rem] border border-blush-100 p-5">
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-600">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <template v-if="point.icon === 'van'"><path d="M2 7h11v10H2zM13 10h4l3 3v4h-7z" /><circle cx="6" cy="18.5" r="1.6" /><circle cx="17" cy="18.5" r="1.6" /></template>
            <template v-else-if="point.icon === 'cash'"><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></template>
            <template v-else><path d="M20 4c0 8-5 12-11 12H5c0-8 5-12 11-12z" /><path d="M5 20c1.5-4 4-6.5 8-8" /></template>
          </svg>
        </span>
        <span>
          <span class="block text-[0.9375rem] font-bold text-ink">{{ point.title }}</span>
          <span class="mt-1 block text-[0.875rem] leading-relaxed text-mist-500">{{ point.text }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

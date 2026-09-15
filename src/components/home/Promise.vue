<script setup>
/** The three things people ask before ordering, numbered like a recipe. */
const POINTS = [
  { n: '01', title: 'Besplatna dostava', text: 'U celoj Srbiji, bez minimalnog iznosa. Paket stiže za jedan do tri radna dana.' },
  { n: '02', title: 'Plaćate kuriru', text: 'Pouzećem, kad paket stigne na vrata. Ništa unapred, nikakva kartica ako je ne želite.' },
  { n: '03', title: 'Sastav koji se čita', text: 'Svaki sastojak ispisan punim imenom, na etiketi i na stranici. Bez sulfata i parabena.' },
]
</script>

<template>
  <section class="shell py-14 lg:py-20">
    <ul class="grid gap-px overflow-hidden rounded-[1.25rem] bg-ink/10 sm:grid-cols-3">
      <li v-for="point in POINTS" :key="point.n" class="group bg-paper p-7 transition-colors duration-500 hover:bg-blush-50 lg:p-9">
        <p class="font-display text-4xl leading-none text-blush-300 transition-colors duration-500 group-hover:text-blush-500">{{ point.n }}</p>
        <h3 class="mt-5 font-display text-xl leading-tight">{{ point.title }}</h3>
        <p class="mt-2.5 text-[0.9375rem] leading-relaxed text-mist-500">{{ point.text }}</p>
      </li>
    </ul>
  </section>
</template>

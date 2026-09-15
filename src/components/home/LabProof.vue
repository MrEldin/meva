<script setup>
/**
 * Where the preparations were tested.
 *
 * On black, in the display face, at a size that makes a claim into a
 * statement. Natural cosmetics are full of words; two named laboratories are
 * not a word, and this is the one place on the page that says so loudly.
 */
const LABS = [
  { name: 'Institut za javno zdravlje Vojvodine', note: 'Mikrobiološko ispitivanje', year: '2024' },
  { name: 'Superlab', note: 'Analiza sastava', year: '2024' },
]
</script>

<template>
  <section class="grain relative overflow-hidden bg-ink text-paper">
    <!-- One outlined word, very large, sitting behind everything -->
    <p class="outline-type pointer-events-none absolute -bottom-6 left-0 hidden w-full select-none whitespace-nowrap text-center font-display text-[11rem] leading-none text-paper/20 lg:block">
      ISPITANO
    </p>

    <div class="shell relative py-14 lg:py-20">
      <p class="kicker text-blush-300">04 — Dokaz</p>

      <h2 class="mt-5 max-w-3xl text-[2.25rem] leading-[0.98] text-paper sm:text-[3.25rem] lg:text-[4rem]">
        Ne verujte nama.
        <span class="italic text-blush-300">Verujte laboratoriji.</span>
      </h2>

      <ul class="mt-12 grid gap-px overflow-hidden rounded-2xl bg-paper/15 sm:grid-cols-2">
        <li v-for="lab in LABS" :key="lab.name" class="bg-ink p-7 lg:p-9">
          <div class="flex items-start justify-between gap-4">
            <svg viewBox="0 0 24 24" class="h-8 w-8 text-blush-300" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M9 3h6M10 3v6.2L5.6 17a2.2 2.2 0 0 0 1.9 3.3h9a2.2 2.2 0 0 0 1.9-3.3L14 9.2V3" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7.6 14.5h8.8" stroke-linecap="round" />
            </svg>
            <span class="kicker text-paper/35">{{ lab.year }}</span>
          </div>

          <p class="mt-7 font-display text-2xl leading-tight text-paper lg:text-[1.75rem]">{{ lab.name }}</p>
          <p class="mt-2 text-sm text-paper/50">{{ lab.note }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

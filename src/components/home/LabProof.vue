<script setup>
/**
 * Where the preparations were tested.
 *
 * The client asked for these two by name, and they are the strongest thing the
 * shop can say: natural cosmetics are full of claims, and a laboratory is not
 * a claim.
 */
const LABS = [
  { name: 'Institut za javno zdravlje Vojvodine', note: 'Mikrobiološko ispitivanje' },
  { name: 'Superlab', note: 'Analiza sastava' },
]
</script>

<template>
  <section class="border-y border-mist-200 bg-shell">
    <div class="shell py-10 lg:py-14">
      <p class="text-center text-sm font-semibold uppercase tracking-[0.14em] text-blush-500">Ispitano</p>

      <div class="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
        <div v-for="lab in LABS" :key="lab.name" class="rounded-2xl bg-paper px-6 py-6 text-center">
          <svg viewBox="0 0 24 24" class="mx-auto h-7 w-7 text-blush-500" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M9 3h6M10 3v6.2L5.6 17a2.2 2.2 0 0 0 1.9 3.3h9a2.2 2.2 0 0 0 1.9-3.3L14 9.2V3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7.6 14.5h8.8" stroke-linecap="round" />
          </svg>
          <p class="mt-3 text-base font-semibold leading-snug text-ink">{{ lab.name }}</p>
          <p class="mt-1 text-sm text-mist-500">{{ lab.note }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

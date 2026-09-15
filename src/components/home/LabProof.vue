<script setup>
/** Where the preparations were tested. The two names the client asked for. */
const LABS = [
  { name: 'Institut za javno zdravlje Vojvodine', note: 'Mikrobiološko ispitivanje' },
  { name: 'Superlab', note: 'Analiza sastava' },
]
</script>

<template>
  <section class="bg-blush-50">
    <div class="shell py-10 lg:py-16">
      <p class="text-center text-[0.8125rem] font-bold uppercase tracking-wider text-blush-500">Ispitano u laboratoriji</p>
      <h2 class="mt-2 text-center text-[1.625rem] sm:text-3xl">Ne verujte nama. Verujte nalazima.</h2>

      <ul class="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-2 sm:gap-4">
        <li v-for="lab in LABS" :key="lab.name" class="flex items-center gap-4 rounded-[1.25rem] bg-paper p-5">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-600">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 3h6M10 3v6.2L5.6 17a2.2 2.2 0 0 0 1.9 3.3h9a2.2 2.2 0 0 0 1.9-3.3L14 9.2V3" /><path d="M7.6 14.5h8.8" />
            </svg>
          </span>
          <span>
            <span class="block text-[0.9375rem] font-bold leading-snug text-ink">{{ lab.name }}</span>
            <span class="mt-0.5 block text-[0.8125rem] text-mist-500">{{ lab.note }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
/**
 * Three quiet facts under the hero card, in the template's bordered strip.
 */
const facts = [
  { icon: 'leaf', label: 'Biljni aktivni sastojci' },
  { icon: 'hand', label: 'Ručno rađeno u malim serijama' },
  { icon: 'pin', label: 'Nastalo u Novom Pazaru' },
]
</script>

<template>
  <div class="px-5 sm:px-10 lg:px-16">
    <div class="mx-auto grid max-w-[90rem] divide-y divide-forest/15 border-x border-b border-forest/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div v-for="f in facts" :key="f.label" class="flex items-center gap-4 p-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-clay-500">
          <template v-if="f.icon === 'leaf'"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></template>
          <template v-else-if="f.icon === 'hand'"><path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v2" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></template>
          <template v-else><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></template>
        </svg>
        <p class="eyebrow text-[0.5625rem] tracking-[0.13em]">{{ f.label }}</p>
      </div>
    </div>
  </div>
</template>

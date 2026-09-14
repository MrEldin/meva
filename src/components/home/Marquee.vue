<script setup>
const items = [
  'Ručno pravljeno',
  'Male serije',
  'Prirodni sastojci',
  'Besplatna dostava',
  'Plaćanje pouzećem',
  '5.480 porudžbina',
  'Novi Pazar',
]
</script>

<template>
  <div class="overflow-hidden border-y border-ink/10 bg-paper py-4" aria-hidden="true">
    <div class="marquee-track gap-0" style="--marquee-duration: 48s">
      <template v-for="n in 2" :key="n">
        <span v-for="item in items" :key="item + n" class="eyebrow flex items-center whitespace-nowrap text-ink/70">
          <span class="px-6 md:px-9">{{ item }}</span>
          <span class="h-1 w-1 rounded-full bg-blush-500" />
        </span>
      </template>
    </div>
  </div>
</template>

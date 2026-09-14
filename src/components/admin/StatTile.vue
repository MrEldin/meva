<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: null },
})
</script>

<template>
  <div class="border border-mist-200 bg-paper p-6">
    <p class="eyebrow text-mist-400">{{ label }}</p>
    <p class="mt-3 font-display text-3xl leading-none tabular-nums text-ink md:text-4xl">{{ value }}</p>
    <p v-if="hint" class="mt-2 text-xs font-light text-mist-400">{{ hint }}</p>
  </div>
</template>

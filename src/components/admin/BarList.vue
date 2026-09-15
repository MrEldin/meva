<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, required: true },
  format: { type: Function, required: true },
  metric: { type: String, default: 'revenue' },
  empty: { type: String, default: 'Nema podataka za ovaj period.' },
})

const max = computed(() => Math.max(1, ...props.rows.map((row) => row[props.metric])))
</script>

<template>
  <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
    <h2 class="eyebrow text-[0.5625rem] text-forest/50">{{ title }}</h2>

    <ul v-if="rows.length" class="mt-4 space-y-2">
      <li v-for="row in rows" :key="row.label" class="relative overflow-hidden rounded-xl">
        <!-- The bar sits behind the label so long names stay readable. -->
        <div class="absolute inset-y-0 left-0 bg-sage/60" :style="{ width: `${(row[metric] / max) * 100}%` }" />
        <div class="relative flex items-center justify-between gap-4 px-3 py-2">
          <span class="min-w-0 truncate text-sm">{{ row.label }}</span>
          <span class="shrink-0 text-sm tabular-nums text-forest/70">{{ format(row) }}</span>
        </div>
      </li>
    </ul>

    <p v-else class="mt-4 text-sm text-forest/50">{{ empty }}</p>
  </section>
</template>

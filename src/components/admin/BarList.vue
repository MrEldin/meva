<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, required: true },
  // How to render the number on the right.
  format: { type: Function, required: true },
  metric: { type: String, default: 'revenue' },
})

const max = computed(() => Math.max(1, ...props.rows.map((row) => row[props.metric])))
</script>

<template>
  <section class="border border-mist-200 bg-paper p-6">
    <h2 class="eyebrow text-mist-400">{{ title }}</h2>

    <ul class="mt-5 space-y-3.5">
      <li v-for="row in rows" :key="row.label" class="relative">
        <!-- The bar sits behind the label so long names stay readable. -->
        <div
          class="absolute inset-y-0 left-0 bg-blush-100/70"
          :style="{ width: `${(row[metric] / max) * 100}%` }"
        />
        <div class="relative flex items-center justify-between gap-4 px-2.5 py-2">
          <span class="min-w-0 truncate text-sm font-light text-ink">{{ row.label }}</span>
          <span class="shrink-0 text-sm tabular-nums text-mist-600">{{ format(row) }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

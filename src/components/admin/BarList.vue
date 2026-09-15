<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, required: true },
  format: { type: Function, required: true },
  metric: { type: String, default: 'revenue' },
  empty: { type: String, default: 'Nema podataka za ovaj period.' },
  tone: { type: String, default: 'overview' },
})

const max = computed(() => Math.max(1, ...props.rows.map((row) => row[props.metric])))

const BAR = {
  overview: 'bg-desk-overview/20',
  orders: 'bg-desk-orders/20',
  products: 'bg-desk-products/20',
  marketing: 'bg-desk-marketing/20',
  email: 'bg-desk-email/20',
  team: 'bg-desk-team/20',
  account: 'bg-desk-account/20',
}

const DOT = {
  overview: 'bg-desk-overview',
  orders: 'bg-desk-orders',
  products: 'bg-desk-products',
  marketing: 'bg-desk-marketing',
  email: 'bg-desk-email',
  team: 'bg-desk-team',
  account: 'bg-desk-account',
}
</script>

<template>
  <section class="panel p-5 sm:p-6">
    <h2 class="label flex items-center gap-2">
      <span class="h-2 w-2 rounded-full" :class="DOT[tone]" />
      {{ title }}
    </h2>

    <ul v-if="rows.length" class="mt-4 space-y-1.5">
      <li v-for="row in rows" :key="row.label" class="relative overflow-hidden rounded-xl">
        <!-- The bar sits behind the label so long names stay readable. -->
        <div class="absolute inset-y-0 left-0 transition-[width] duration-700 ease-[var(--ease-silk)]" :class="BAR[tone]" :style="{ width: `${(row[metric] / max) * 100}%` }" />
        <div class="relative flex items-center justify-between gap-4 px-3 py-2.5">
          <span class="min-w-0 truncate text-sm">{{ row.label }}</span>
          <span class="shrink-0 text-sm font-medium tabular-nums">{{ format(row) }}</span>
        </div>
      </li>
    </ul>

    <p v-else class="mt-4 text-sm text-forest/60">{{ empty }}</p>
  </section>
</template>

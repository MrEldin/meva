<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: null },
  // Percentage change against the previous period; null when there is nothing
  // to compare against.
  change: { type: Number, default: null },
  // Whether a rise is good news. Returns are one place where it is not.
  upIsGood: { type: Boolean, default: true },
  // Which colour this figure wears, so a row of tiles reads as several
  // measurements rather than one wall.
  tone: { type: String, default: 'overview' },
})

const good = () => (props.change > 0) === props.upIsGood

const WASH = {
  overview: 'tile-overview',
  orders: 'tile-orders',
  products: 'tile-products',
  marketing: 'tile-marketing',
  email: 'tile-email',
  team: 'tile-team',
  account: 'tile-account',
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
  <div class="panel p-5 transition-shadow duration-300 hover:shadow-[0_12px_32px_-18px_rgba(36,52,44,0.3)] sm:p-6" :class="WASH[tone]">
    <p class="label flex items-center gap-2">
      <span class="h-2 w-2 shrink-0 rounded-full" :class="DOT[tone]" />
      {{ label }}
    </p>
    <p class="mt-3 font-display text-[2rem] leading-none tabular-nums md:text-[2.5rem]">{{ value }}</p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <span
        v-if="change !== null && change !== undefined"
        class="chip tabular-nums"
        :class="good() ? 'bg-sage text-sage-deep' : 'bg-clay-100 text-clay-700'"
      >
        <svg viewBox="0 0 12 12" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="change >= 0" d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
          <path v-else d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
        </svg>
        {{ Math.abs(change).toLocaleString('sr-RS') }}%
      </span>
      <span v-if="hint" class="text-[0.8125rem] text-forest/60">{{ hint }}</span>
    </div>
  </div>
</template>

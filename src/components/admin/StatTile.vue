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
})

const good = () => (props.change > 0) === props.upIsGood
</script>

<template>
  <div class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
    <p class="eyebrow text-[0.5625rem] text-forest/50">{{ label }}</p>
    <p class="mt-3 font-display text-3xl leading-none tabular-nums md:text-4xl">{{ value }}</p>

    <div class="mt-3 flex items-center gap-2 text-xs">
      <span
        v-if="change !== null && change !== undefined"
        class="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium tabular-nums"
        :class="good() ? 'bg-sage text-sage-deep' : 'bg-clay-100 text-clay-700'"
      >
        <svg viewBox="0 0 12 12" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="change >= 0" d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
          <path v-else d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
        </svg>
        {{ Math.abs(change).toLocaleString('sr-RS') }}%
      </span>
      <span v-if="hint" class="text-forest/50">{{ hint }}</span>
    </div>
  </div>
</template>

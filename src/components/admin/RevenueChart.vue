<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, required: true },
  title: { type: String, default: 'Promet' },
  granularity: { type: String, default: 'day' },
})

const W = 1000
const H = 260

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`

const label = (bucket) => {
  if (props.granularity === 'month') {
    const [year, month] = bucket.split('-')
    return `${month}/${year.slice(2)}`
  }

  const [, month, day] = bucket.split('-')
  return `${day}.${month}.`
}

const chart = computed(() => {
  const rows = props.points

  if (rows.length < 2) return null

  const max = Math.max(1, ...rows.map((r) => r.revenue))
  const step = W / (rows.length - 1)

  const coords = rows.map((row, i) => ({
    x: i * step,
    y: H - (row.revenue / max) * (H - 24) - 12,
    row,
  }))

  // Control points at the midpoint of each gap keep the line soft without
  // letting it overshoot a peak.
  const line = coords.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`

    const previous = coords[i - 1]
    const cx = (previous.x + point.x) / 2

    return `${path} C ${cx} ${previous.y}, ${cx} ${point.y}, ${point.x} ${point.y}`
  }, '')

  return { coords, line, area: `${line} L ${W} ${H} L 0 ${H} Z`, max }
})

const peak = computed(() => props.points.reduce((best, row) => (row.revenue > (best?.revenue ?? -1) ? row : best), null))
</script>

<template>
  <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <h2 class="eyebrow text-[0.5625rem] text-forest/50">{{ title }}</h2>
      <p v-if="peak && peak.revenue > 0" class="text-xs text-forest/55">
        najbolji: <span class="font-medium text-forest">{{ label(peak.bucket) }}</span> · {{ money(peak.revenue) }}
      </p>
    </div>

    <div v-if="chart" class="mt-5">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-48 w-full md:h-60" preserveAspectRatio="none" role="img" :aria-label="title">
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c56d59" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#c56d59" stop-opacity="0" />
          </linearGradient>
        </defs>

        <path :d="chart.area" fill="url(#revenue-fill)" />
        <path :d="chart.line" fill="none" stroke="#c56d59" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" />
      </svg>

      <div class="mt-3 flex justify-between text-[0.625rem] tracking-wide text-forest/45">
        <span>{{ label(points[0].bucket) }}</span>
        <span>{{ label(points[points.length - 1].bucket) }}</span>
      </div>
    </div>

    <p v-else class="mt-4 text-sm text-forest/50">Nema dovoljno podataka za grafikon.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, required: true },
})

const W = 1000
const H = 260

const chart = computed(() => {
  const rows = props.points

  if (rows.length < 2) return null

  const max = Math.max(...rows.map((r) => r.revenue))
  const step = W / (rows.length - 1)

  const coords = rows.map((row, i) => ({
    x: i * step,
    y: H - (row.revenue / max) * (H - 24) - 12,
    row,
  }))

  // A Catmull-Rom-ish smoothing: control points at a third of each gap keeps
  // the line soft without letting it overshoot a peak.
  const line = coords.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`

    const previous = coords[i - 1]
    const cx = (previous.x + point.x) / 2

    return `${path} C ${cx} ${previous.y}, ${cx} ${point.y}, ${point.x} ${point.y}`
  }, '')

  return { coords, line, area: `${line} L ${W} ${H} L 0 ${H} Z`, max }
})
</script>

<template>
  <section class="border border-mist-200 bg-paper p-6">
    <h2 class="eyebrow text-mist-400">Promet po mesecima</h2>

    <div v-if="chart" class="mt-6">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-52 w-full md:h-64" preserveAspectRatio="none" role="img" aria-label="Promet po mesecima">
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#b3617e" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#b3617e" stop-opacity="0" />
          </linearGradient>
        </defs>

        <path :d="chart.area" fill="url(#revenue-fill)" />
        <path :d="chart.line" fill="none" stroke="#b3617e" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" />
      </svg>

      <div class="mt-3 flex justify-between text-[0.625rem] font-light tracking-wide text-mist-400">
        <span>{{ points[0].month }}</span>
        <span>{{ points[points.length - 1].month }}</span>
      </div>
    </div>

    <p v-else class="mt-6 text-sm font-light text-mist-400">Nema dovoljno podataka.</p>
  </section>
</template>

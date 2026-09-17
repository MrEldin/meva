<script setup>
import { computed, ref } from 'vue'

/**
 * The trend, drawn so it can be read.
 *
 * What was here before was a line and nothing else: no scale, no dates, no
 * way to find out what a point was worth. A chart you cannot read a number
 * off is decoration. This one has a scale down the side, dates along the
 * bottom, and follows the pointer -- a rule, a dot and a card naming the day
 * and what it took.
 *
 * It draws in pixel space rather than stretching a square viewBox, because a
 * stretched one gives ovals for dots and a different line weight at every
 * width.
 */
const props = defineProps({
  points: { type: Array, required: true },
  granularity: { type: String, default: 'day' },
  /** Which number is drawn: 'revenue' or 'orders'. */
  metric: { type: String, default: 'revenue' },
  colour: { type: String, default: 'var(--color-plot-1)' },
})

const W = 960
const H = 300
const PAD = { top: 18, right: 16, bottom: 30, left: 62 }

const hovered = ref(null)

const nf = new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 })
const isMoney = computed(() => props.metric === 'revenue')

const value = (row) => row[props.metric] ?? 0

/** Money arrives in minor units; orders are counted. */
const format = (v) => (isMoney.value ? `${nf.format(v / 100)} RSD` : nf.format(v))

/** Short on the axis: 120k rather than 120.000. */
function short(v) {
  const n = isMoney.value ? v / 100 : v

  if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`

  return nf.format(n)
}

function label(bucket) {
  if (props.granularity === 'month') {
    const [year, month] = bucket.split('-')

    return `${month}/${year.slice(2)}`
  }

  const [, month, day] = bucket.split('-')

  return `${Number(day)}.${Number(month)}.`
}

/** A round number above the highest point, so the scale reads cleanly. */
function ceiling(max) {
  if (max <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(max))
  const steps = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]

  return magnitude * (steps.find((s) => s * magnitude >= max) ?? 10)
}

const chart = computed(() => {
  const rows = props.points ?? []

  if (rows.length < 2) return null

  const top = ceiling(Math.max(...rows.map(value)))
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const step = plotW / (rows.length - 1)

  const coords = rows.map((row, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + plotH - (value(row) / top) * plotH,
    row,
    i,
  }))

  const line = coords.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`

    const previous = coords[i - 1]
    const cx = (previous.x + point.x) / 2

    return `${path} C ${cx.toFixed(1)} ${previous.y.toFixed(1)}, ${cx.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  }, '')

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    v: top * f,
    y: PAD.top + plotH - f * plotH,
  }))

  // Enough dates to place the line in time, never so many that they collide.
  const every = Math.max(1, Math.ceil(rows.length / 7))
  const dates = coords.filter((c) => c.i % every === 0 || c.i === rows.length - 1)

  return {
    coords,
    line,
    area: `${line} L ${coords.at(-1).x.toFixed(1)} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`,
    ticks,
    dates,
    step,
  }
})

const active = computed(() => (hovered.value === null ? null : chart.value?.coords[hovered.value] ?? null))

/** The nearest point to the pointer, in the chart's own coordinates. */
function onMove(event) {
  if (!chart.value) return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * W
  const i = Math.round((x - PAD.left) / chart.value.step)

  hovered.value = Math.min(chart.value.coords.length - 1, Math.max(0, i))
}
</script>

<template>
  <div v-if="chart" class="relative">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full touch-none"
      style="aspect-ratio: 960 / 300"
      role="img"
      @pointermove="onMove"
      @pointerleave="hovered = null"
    >
      <defs>
        <linearGradient :id="`fill-${metric}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="colour" stop-opacity="0.22" />
          <stop offset="100%" :stop-color="colour" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- The scale -->
      <g>
        <line
          v-for="tick in chart.ticks"
          :key="`g${tick.y}`"
          :x1="PAD.left"
          :x2="W - PAD.right"
          :y1="tick.y"
          :y2="tick.y"
          stroke="currentColor"
          class="text-forest/10"
          stroke-width="1"
        />
        <text
          v-for="tick in chart.ticks"
          :key="`t${tick.y}`"
          :x="PAD.left - 10"
          :y="tick.y + 4"
          text-anchor="end"
          class="fill-forest/45 text-[11px] font-semibold"
          style="font-variant-numeric: tabular-nums"
        >{{ short(tick.v) }}</text>
      </g>

      <path :d="chart.area" :fill="`url(#fill-${metric})`" />
      <path :d="chart.line" fill="none" :stroke="colour" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Dates -->
      <text
        v-for="date in chart.dates"
        :key="`d${date.i}`"
        :x="date.x"
        :y="H - 9"
        text-anchor="middle"
        class="fill-forest/45 text-[11px] font-semibold"
      >{{ label(date.row.bucket) }}</text>

      <!-- Where the pointer is -->
      <g v-if="active">
        <line :x1="active.x" :x2="active.x" :y1="PAD.top" :y2="H - PAD.bottom" :stroke="colour" stroke-width="1" stroke-dasharray="3 3" opacity="0.6" />
        <circle :cx="active.x" :cy="active.y" r="5.5" fill="var(--color-paper)" :stroke="colour" stroke-width="2.5" />
      </g>
    </svg>

    <!-- The card, placed beside the point and never off the edge -->
    <div
      v-if="active"
      class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-forest px-3 py-2 text-center shadow-lg"
      :style="{
        left: `clamp(4rem, ${(active.x / W) * 100}%, calc(100% - 4rem))`,
        top: `calc(${(active.y / H) * 100}% - 0.75rem)`,
      }"
    >
      <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white/55">{{ label(active.row.bucket) }}</p>
      <p class="mt-0.5 whitespace-nowrap text-[0.9375rem] font-bold text-white tabular-nums">{{ format(value(active.row)) }}</p>
      <p v-if="metric === 'revenue' && active.row.orders" class="text-[0.75rem] text-white/60">{{ nf.format(active.row.orders) }} porudžbina</p>
    </div>
  </div>

  <p v-else class="py-14 text-center text-sm text-forest/50">Nema dovoljno podataka za grafikon.</p>
</template>

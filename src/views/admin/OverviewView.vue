<script setup>
import Breakdown from '@/components/admin/Breakdown.vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import TrendChart from '@/components/admin/TrendChart.vue'
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref, watch } from 'vue'

/**
 * How the shop is doing, and what to do about it.
 *
 * The page used to be a line with no scale and eight identical panels down
 * the page. Now it answers four questions in order: what the period took and
 * whether that is up or down, how it moved day by day, whether the money is
 * coming from new customers or the same ones coming back, and which of
 * everything -- preparations, shelves, channels, towns, days, hours -- is
 * carrying it. The last of those is one panel with tabs, because they are
 * eight versions of a single question.
 */
const data = ref(null)
const loading = ref(true)
const failed = ref(false)
const range = ref('30')
const metric = ref('revenue')

const RANGES = [
  { value: '7', label: '7 dana' },
  { value: '30', label: '30 dana' },
  { value: '90', label: '90 dana' },
  { value: '365', label: 'Godina' },
  { value: 'all', label: 'Sve' },
]

const nf = new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 })
const money = (minor) => `${nf.format(minor / 100)} RSD`
const count = (value) => nf.format(value)

const totals = computed(() => data.value?.totals)
const change = computed(() => data.value?.change ?? {})

/** What the period took, and what it did against the one before it. */
const tiles = computed(() => {
  if (!totals.value) return []

  return [
    { key: 'revenue', label: 'Promet', value: money(totals.value.revenue), delta: change.value.revenue, hint: `${money(totals.value.revenue_per_day)} dnevno` },
    { key: 'orders', label: 'Porudžbine', value: count(totals.value.orders), delta: change.value.orders, hint: `${nf.format(totals.value.orders_per_customer)} po kupcu` },
    { key: 'average', label: 'Prosečna korpa', value: money(totals.value.average_order), delta: change.value.average_order, hint: 'koliko ostave po porudžbini' },
    { key: 'customers', label: 'Kupci', value: count(totals.value.customers), delta: change.value.customers, hint: `${count(totals.value.new_customers)} novih · ${count(totals.value.returning_customers)} vraćenih` },
  ]
})

/** New against returning: the one number that says whether the shop keeps people. */
const loyalty = computed(() => {
  const t = totals.value

  if (!t?.customers) return null

  const returning = t.returning_customers
  const fresh = t.new_customers

  return {
    returning,
    fresh,
    rate: Math.round((returning / t.customers) * 100),
    freshShare: Math.round((fresh / t.customers) * 100),
  }
})

const breakdown = computed(() => {
  const d = data.value

  if (!d) return []

  return [
    { key: 'products', label: 'Preparati', rows: d.products, metric: 'revenue', unit: 'money' },
    { key: 'categories', label: 'Kategorije', rows: d.categories, metric: 'revenue', unit: 'money', empty: 'Kategorije se računaju iz istorije prodaje.' },
    { key: 'channels', label: 'Odakle dolaze', rows: d.channels, metric: 'revenue', unit: 'money' },
    { key: 'cities', label: 'Gradovi', rows: d.cities, metric: 'orders', unit: 'count' },
    { key: 'devices', label: 'Uređaji', rows: d.devices, metric: 'orders', unit: 'count' },
    { key: 'weekday', label: 'Dani', rows: d.busiest?.weekday, metric: 'orders', unit: 'count' },
    { key: 'hour', label: 'Sati', rows: d.busiest?.hour, metric: 'orders', unit: 'count' },
    { key: 'customers', label: 'Najbolji kupci', rows: d.customers, metric: 'revenue', unit: 'money', empty: 'Još nema ponovljenih kupovina.' },
  ]
})

function deltaClass(value) {
  if (value === null || value === undefined || Math.abs(value) < 0.5) return 'delta delta-flat'

  return value > 0 ? 'delta delta-up' : 'delta delta-down'
}

function deltaText(value) {
  if (value === null || value === undefined) return '—'

  const rounded = Math.round(value)

  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

async function load() {
  loading.value = true
  failed.value = false

  const params = {}
  const to = new Date()

  if (range.value === 'all') {
    params.od = '2024-01-01'
  } else {
    const from = new Date()
    from.setDate(to.getDate() - (Number(range.value) - 1))
    params.od = from.toISOString().slice(0, 10)
  }

  params.do = to.toISOString().slice(0, 10)

  try {
    const { data: body } = await client.get('/admin/analytics', { params })
    data.value = body.data
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setMeta({ title: 'Pregled' })
  load()
})

watch(range, load)
</script>

<template>
  <div>
    <PageHeader tone="overview" eyebrow="Pregled" title="Kako ide prodaja" note="Promet, porudžbine i kupci za izabrani period, upoređeni sa prethodnim.">
      <template #actions>
        <div class="segment">
          <button
            v-for="option in RANGES"
            :key="option.value"
            type="button"
            :class="range === option.value ? 'is-on' : ''"
            @click="range = option.value"
          >{{ option.label }}</button>
        </div>
      </template>
    </PageHeader>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>
    <p v-else-if="failed" class="py-16 text-center text-sm text-clay-600">Analitika trenutno nije dostupna.</p>

    <div v-else-if="totals" class="space-y-4">
      <!-- What the period took -->
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="tile in tiles" :key="tile.key" class="stat-tile">
          <div class="flex items-start justify-between gap-3">
            <p class="label text-forest/50">{{ tile.label }}</p>
            <span :class="deltaClass(tile.delta)">
              <svg v-if="tile.delta > 0.5" viewBox="0 0 12 12" class="h-2.5 w-2.5" fill="currentColor" aria-hidden="true"><path d="M6 2l4 6H2z" /></svg>
              <svg v-else-if="tile.delta < -0.5" viewBox="0 0 12 12" class="h-2.5 w-2.5" fill="currentColor" aria-hidden="true"><path d="M6 10 2 4h8z" /></svg>
              {{ deltaText(tile.delta) }}
            </span>
          </div>
          <p class="mt-2 font-display text-[1.75rem] leading-none tabular-nums">{{ tile.value }}</p>
          <p class="mt-2 text-[0.8125rem] text-forest/50">{{ tile.hint }}</p>
        </div>
      </div>

      <!-- How it moved -->
      <section class="panel p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-display text-[1.25rem] leading-tight">Kroz vreme</h2>
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">
              {{ data.period.from }} — {{ data.period.to }} · prethodni period {{ data.period.previous_from }} — {{ data.period.previous_to }}
            </p>
          </div>
          <div class="segment">
            <button type="button" :class="metric === 'revenue' ? 'is-on' : ''" @click="metric = 'revenue'">Promet</button>
            <button type="button" :class="metric === 'orders' ? 'is-on' : ''" @click="metric = 'orders'">Porudžbine</button>
          </div>
        </div>

        <div class="mt-4">
          <TrendChart
            :points="data.series.points"
            :granularity="data.series.granularity"
            :metric="metric"
            :colour="metric === 'revenue' ? 'var(--color-plot-1)' : 'var(--color-plot-3)'"
          />
        </div>
      </section>

      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <!-- Whether the shop keeps people -->
        <section v-if="loyalty" class="panel p-4 sm:p-5">
          <h2 class="font-display text-[1.25rem] leading-tight">Vraćaju li se</h2>
          <p class="mt-0.5 text-[0.8125rem] text-forest/50">Od {{ count(totals.customers) }} kupaca u periodu.</p>

          <p class="mt-5 font-display text-[2.5rem] leading-none tabular-nums text-clay-700">{{ loyalty.rate }}%</p>
          <p class="mt-1 text-[0.875rem] text-forest/60">već je kupovalo ranije</p>

          <div class="mt-5 flex h-2.5 overflow-hidden rounded-full bg-sand">
            <span class="bg-clay-600" :style="{ width: `${loyalty.rate}%` }" />
            <span class="bg-clay-200" :style="{ width: `${loyalty.freshShare}%` }" />
          </div>

          <dl class="mt-3 space-y-1.5 text-[0.875rem]">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-clay-600" />
              <dt class="flex-1 text-forest/60">Vraćeni</dt>
              <dd class="font-bold tabular-nums">{{ count(loyalty.returning) }}</dd>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-clay-200" />
              <dt class="flex-1 text-forest/60">Novi</dt>
              <dd class="font-bold tabular-nums">{{ count(loyalty.fresh) }}</dd>
            </div>
          </dl>
        </section>

        <!-- Which of everything is carrying it -->
        <Breakdown :tabs="breakdown" />
      </div>

      <!-- Where the orders are sitting right now -->
      <section v-if="data.statuses.length" class="panel p-4 sm:p-5">
        <h2 class="font-display text-[1.25rem] leading-tight">Porudžbine po statusu</h2>
        <p class="mt-0.5 text-[0.8125rem] text-forest/50">Kliknite da vidite koje su to.</p>

        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <RouterLink
            v-for="row in data.statuses"
            :key="row.label"
            :to="{ name: 'admin.orders', query: { status: row.label } }"
            class="flex items-baseline justify-between gap-3 rounded-xl bg-sand px-4 py-3 transition-colors hover:bg-clay-100"
          >
            <span class="min-w-0">
              <span class="block truncate text-[0.875rem] font-semibold">{{ row.label }}</span>
              <span class="block text-[0.75rem] text-forest/45">{{ money(row.revenue) }}</span>
            </span>
            <span class="shrink-0 font-display text-[1.5rem] leading-none tabular-nums">{{ count(row.orders) }}</span>
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

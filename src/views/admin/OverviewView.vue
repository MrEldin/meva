<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
import client from '@/api/client'
import BarList from '@/components/admin/BarList.vue'
import RevenueChart from '@/components/admin/RevenueChart.vue'
import StatTile from '@/components/admin/StatTile.vue'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref, watch } from 'vue'

const data = ref(null)
const loading = ref(true)
const failed = ref(false)
const range = ref('30')

const RANGES = [
  { value: '7', label: '7 dana' },
  { value: '30', label: '30 dana' },
  { value: '90', label: '90 dana' },
  { value: '365', label: 'Godina' },
  { value: 'all', label: 'Sve' },
]

const dinars = (minor) => new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)
const money = (minor) => `${dinars(minor)} RSD`
const count = (value) => new Intl.NumberFormat('sr-RS').format(value)

const totals = computed(() => data.value?.totals)
const change = computed(() => data.value?.change ?? {})

async function load() {
  loading.value = true
  failed.value = false

  const params = {}

  if (range.value !== 'all') {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (Number(range.value) - 1))
    params.od = from.toISOString().slice(0, 10)
    params.do = to.toISOString().slice(0, 10)
  } else {
    params.od = '2024-01-01'
    params.do = new Date().toISOString().slice(0, 10)
  }

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

const revenueOf = (row) => money(row.revenue)
const ordersOf = (row) => `${count(row.orders)}`
</script>

<template>
  <div>
    <PageHeader tone="overview" eyebrow="Pregled" title="Kako ide prodaja" note="Promet, porudžbine i kupci za izabrani period.">
      <template #actions>

      <div class="segment">
        <button
          v-for="option in RANGES"
          :key="option.value"
          type="button"
          :class="range === option.value ? 'is-on' : ''"
          @click="range = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      </template>
    </PageHeader>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>
    <p v-else-if="failed" class="py-16 text-center text-sm text-clay-600">Analitika trenutno nije dostupna.</p>

    <div v-else-if="totals" class="space-y-5 pt-6">
      <p class="text-xs text-forest/65">
        {{ data.period.from }} — {{ data.period.to }} · poređenje sa {{ data.period.previous_from }} — {{ data.period.previous_to }}
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Promet" tone="orders" :value="money(totals.revenue)" :change="change.revenue" :hint="`${money(totals.revenue_per_day)} dnevno`" />
        <StatTile label="Porudžbine" tone="overview" :value="count(totals.orders)" :change="change.orders" :hint="`${count(totals.orders_per_customer)} po kupcu`" />
        <StatTile label="Prosečna korpa" tone="products" :value="money(totals.average_order)" :change="change.average_order" />
        <StatTile label="Kupci" tone="marketing" :value="count(totals.customers)" :change="change.customers" :hint="`${count(totals.new_customers)} novih, ${count(totals.returning_customers)} vraćenih`" />
      </div>

      <RevenueChart :points="data.series.points" :granularity="data.series.granularity" title="Promet kroz vreme" />

      <div class="grid gap-4 lg:grid-cols-2">
        <BarList title="Najprodavaniji preparati" tone="products" :rows="data.products" :format="revenueOf" />
        <BarList title="Kategorije" tone="email" :rows="data.categories" :format="revenueOf" empty="Kategorije se računaju iz istorije prodaje." />
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <BarList title="Odakle dolaze" tone="marketing" :rows="data.channels" :format="revenueOf" />
        <BarList title="Uređaji" tone="team" :rows="data.devices" :format="ordersOf" metric="orders" />
        <BarList title="Gradovi" tone="overview" :rows="data.cities" :format="ordersOf" metric="orders" />
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <BarList title="Kada poručuju (dan)" tone="orders" :rows="data.busiest.weekday" :format="ordersOf" metric="orders" />
        <BarList title="Kada poručuju (sat)" tone="email" :rows="data.busiest.hour" :format="ordersOf" metric="orders" />
        <BarList title="Najbolji kupci" tone="products" :rows="data.customers" :format="revenueOf" empty="Još nema ponovljenih kupovina." />
      </div>

      <section v-if="data.statuses.length" class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
        <h2 class="label text-forest/65">Porudžbine po statusu</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <RouterLink
            v-for="row in data.statuses"
            :key="row.label"
            :to="{ name: 'admin.orders', query: { status: row.label } }"
            class="rounded-2xl bg-cream px-4 py-3 transition-colors hover:bg-sage"
          >
            <span class="block font-display text-2xl tabular-nums">{{ count(row.orders) }}</span>
            <span class="label mt-1 block text-forest/65">{{ row.label }}</span>
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

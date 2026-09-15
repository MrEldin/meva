<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const orders = ref([])
const summary = ref([])
const choices = ref({ cities: [], sources: [], devices: [], statuses: [] })
const meta = ref(null)
const loading = ref(false)
const loadingMore = ref(false)
const sentinel = ref(null)
const showFilters = ref(false)

// Everything the list can be narrowed by.
const blank = () => ({ q: '', status: route.query.status ?? '', origin: '', od: '', do: '', grad: '', izvor: '', uredjaj: '', min: '', max: '' })
const filters = ref(blank())

const page = ref(1)
const done = computed(() => meta.value && page.value >= meta.value.total_pages)

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`
const number = (value) => new Intl.NumberFormat('sr-RS').format(value)
const when = (iso) => (iso ? new Date(iso).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')

const TONE = {
  'awaiting-dispatch': 'bg-wheat text-forest',
  dispatched: 'bg-sky text-forest',
  delivered: 'bg-sage text-sage-deep',
  processing: 'bg-sage text-sage-deep',
  completed: 'bg-sage text-sage-deep',
  returned: 'bg-clay-100 text-clay-700',
  refunded: 'bg-clay-100 text-clay-700',
  cancelled: 'bg-forest/10 text-forest/60',
}

const LABELS = {
  q: 'pretraga', status: 'status', origin: 'poreklo', od: 'od', do: 'do',
  grad: 'grad', izvor: 'izvor', uredjaj: 'uređaj', min: 'od RSD', max: 'do RSD',
}

/** The filters that are actually set, for the row of chips. */
const active = computed(() =>
  Object.entries(filters.value)
    .filter(([, value]) => value !== '' && value !== null)
    .map(([key, value]) => ({ key, label: LABELS[key], value })),
)

function params(extra = {}) {
  const query = { per_page: 25, ...extra }

  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== '' && value !== null) query[key] = value
  })

  return query
}

/** Load the first page, replacing whatever is on screen. */
async function load() {
  loading.value = true
  page.value = 1

  try {
    const { data } = await client.get('/admin/orders', { params: params({ page: 1 }) })
    orders.value = data.data
    meta.value = data.meta?.pagination ?? null
  } finally {
    loading.value = false
  }
}

/** Append the next page as the list is scrolled. */
async function loadMore() {
  if (loading.value || loadingMore.value || done.value) return

  loadingMore.value = true

  try {
    const { data } = await client.get('/admin/orders', { params: params({ page: page.value + 1 }) })
    orders.value = orders.value.concat(data.data)
    meta.value = data.meta?.pagination ?? meta.value
    page.value += 1
  } finally {
    loadingMore.value = false
  }
}

function clear(key) {
  filters.value[key] = ''
}

function clearAll() {
  filters.value = { ...blank(), status: '' }
}

function filterStatus(value) {
  filters.value.status = filters.value.status === value ? '' : value
  router.replace({ query: filters.value.status ? { status: filters.value.status } : {} })
}

/** The export carries whatever filters are on screen. */
async function exportCsv() {
  const query = new URLSearchParams(params())
  query.delete('per_page')

  const { data } = await client.get(`/admin/orders/export?${query}`, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = `meva-porudzbine-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

let debounce
watch(() => [filters.value.q, filters.value.grad, filters.value.min, filters.value.max], () => {
  clearTimeout(debounce)
  debounce = setTimeout(load, 350)
})
watch(() => [filters.value.status, filters.value.origin, filters.value.od, filters.value.do, filters.value.izvor, filters.value.uredjaj], load)

let observer

onMounted(async () => {
  setMeta({ title: 'Porudžbine' })

  await load()

  const [summaryData, filterData] = await Promise.all([
    client.get('/admin/orders/summary'),
    client.get('/admin/orders/filters'),
  ])

  summary.value = summaryData.data.data
  choices.value = filterData.data.data

  // The next page loads as the end of the list comes into view.
  observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), { rootMargin: '600px' })
  if (sentinel.value) observer.observe(sentinel.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
      <div>
        <p class="eyebrow text-clay-500">Porudžbine</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Ko je šta poručio</h1>
        <p v-if="meta" class="mt-2 text-sm text-forest/55">
          {{ number(meta.total) }} {{ meta.total === 1 ? 'porudžbina' : 'porudžbina' }}
          <span v-if="active.length" class="text-forest/40">· filtrirano</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="showFilters = !showFilters">
          {{ showFilters ? 'Sakrij filtere' : 'Filteri' }}
        </button>
        <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="exportCsv">Preuzmi CSV</button>
      </div>
    </header>

    <!-- Status counts -->
    <div class="flex flex-wrap gap-2 pt-5">
      <button
        v-for="row in summary"
        :key="row.status"
        type="button"
        class="rounded-2xl px-4 py-3 text-left transition-all"
        :class="[TONE[row.status] ?? 'bg-sand', filters.status === row.status ? 'ring-2 ring-forest' : '']"
        @click="filterStatus(row.status)"
      >
        <span class="block font-display text-xl tabular-nums">{{ number(row.orders) }}</span>
        <span class="eyebrow mt-0.5 block text-[0.5rem]">{{ row.label }}</span>
      </button>
    </div>

    <!-- Search and origin -->
    <div class="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
      <input
        v-model="filters.q"
        type="search"
        placeholder="Broj porudžbine, ime, e-mail, telefon, grad…"
        class="w-full rounded-full border border-forest/15 bg-sand px-5 py-3 text-sm outline-none placeholder:text-forest/40 focus:border-forest/40"
      />
      <div class="flex flex-wrap gap-1 rounded-full border border-forest/15 bg-sand p-1">
        <button v-for="option in [{ v: '', l: 'Sve' }, { v: 'live', l: 'Nove' }, { v: 'archive', l: 'Arhiva' }]" :key="option.v"
          type="button" class="eyebrow rounded-full px-4 py-2 text-[0.5625rem] transition-colors"
          :class="filters.origin === option.v ? 'bg-forest text-cream' : 'hover:bg-sage'"
          @click="filters.origin = option.v">
          {{ option.l }}
        </button>
      </div>
    </div>

    <!-- The rest of the filters -->
    <div v-if="showFilters" class="mt-3 grid gap-3 rounded-[1.5rem] bg-sand p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label class="block">
        <span class="text-xs text-forest/55">Od datuma</span>
        <input v-model="filters.od" type="date" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
      </label>
      <label class="block">
        <span class="text-xs text-forest/55">Do datuma</span>
        <input v-model="filters.do" type="date" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
      </label>
      <label class="block">
        <span class="text-xs text-forest/55">Grad</span>
        <input v-model="filters.grad" list="order-cities" placeholder="npr. Beograd" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
        <datalist id="order-cities"><option v-for="city in choices.cities" :key="city.value" :value="city.value">{{ city.orders }}</option></datalist>
      </label>
      <label class="block">
        <span class="text-xs text-forest/55">Izvor</span>
        <select v-model="filters.izvor" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40">
          <option value="">svi</option>
          <option v-for="source in choices.sources" :key="source.value" :value="source.value">{{ source.value }} ({{ number(source.orders) }})</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-forest/55">Uređaj</span>
        <select v-model="filters.uredjaj" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40">
          <option value="">svi</option>
          <option v-for="device in choices.devices" :key="device.value" :value="device.value">{{ device.value }} ({{ number(device.orders) }})</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-forest/55">Iznos od (RSD)</span>
        <input v-model="filters.min" type="number" min="0" step="100" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm tabular-nums outline-none focus:border-forest/40" />
      </label>
      <label class="block">
        <span class="text-xs text-forest/55">Iznos do (RSD)</span>
        <input v-model="filters.max" type="number" min="0" step="100" class="mt-1 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm tabular-nums outline-none focus:border-forest/40" />
      </label>
      <div class="flex items-end">
        <button type="button" class="pill w-full justify-center border border-forest/20 hover:bg-forest hover:text-cream" @click="clearAll">Poništi sve</button>
      </div>
    </div>

    <!-- Active filters -->
    <div v-if="active.length" class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="chip in active"
        :key="chip.key"
        type="button"
        class="flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-xs text-sage-deep transition-colors hover:bg-clay-100 hover:text-clay-700"
        @click="clear(chip.key)"
      >
        {{ chip.label }}: {{ chip.value }} <span aria-hidden="true">×</span>
      </button>
    </div>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>
    <p v-else-if="!orders.length" class="py-16 text-center text-sm text-forest/50">Nema porudžbina za ove uslove.</p>

    <div v-else class="mt-5 overflow-x-auto">
      <table class="w-full min-w-[52rem] border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr class="text-left">
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Broj</th>
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Datum</th>
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Kupac</th>
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Status</th>
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Artikli</th>
            <th class="eyebrow px-4 pb-1 text-right text-[0.5rem] font-medium text-forest/45">Iznos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="cursor-pointer bg-sand transition-colors hover:bg-sage/60"
            @click="router.push({ name: 'admin.order', params: { id: order.id } })"
          >
            <td class="rounded-l-2xl px-4 py-3">
              <span class="font-mono text-xs">{{ order.reference }}</span>
              <span v-if="order.origin === 'archive'" class="eyebrow ml-2 text-[0.4375rem] text-forest/35">arhiva</span>
            </td>
            <td class="px-4 py-3 text-forest/70">{{ when(order.placed_at) }}</td>
            <td class="px-4 py-3">
              <span class="block max-w-44 truncate">{{ order.customer_name ?? '—' }}</span>
              <span v-if="order.city" class="block text-xs text-forest/45">{{ order.city }}</span>
            </td>
            <td class="px-4 py-3">
              <span class="eyebrow rounded-full px-2.5 py-1 text-[0.5rem]" :class="TONE[order.status] ?? 'bg-forest/10'">{{ order.status_label }}</span>
            </td>
            <td class="px-4 py-3">
              <span class="tabular-nums text-forest/70">{{ order.items }}</span>
              <span v-if="order.articles?.length" class="mt-0.5 block max-w-64 truncate text-xs text-forest/45">
                {{ order.articles.map((a) => `${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ''}`).join(', ') }}
              </span>
            </td>
            <td class="rounded-r-2xl px-4 py-3 text-right tabular-nums">{{ money(order.total) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- The next page loads when this comes into view. -->
      <div ref="sentinel" class="py-8 text-center text-sm text-forest/45">
        <span v-if="loadingMore">Učitavam još…</span>
        <span v-else-if="done">{{ number(orders.length) }} od {{ number(meta?.total ?? 0) }} — to je sve.</span>
        <button v-else type="button" class="eyebrow text-forest/60 hover:text-forest" @click="loadMore">Učitaj još</button>
      </div>
    </div>
  </div>
</template>

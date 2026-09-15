<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
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
    <PageHeader
      tone="orders"
      eyebrow="Porudžbine"
      title="Ko je šta poručio"
      :note="meta ? `${number(meta.total)} porudžbina${active.length ? ' — filtrirano' : ''}` : null"
    >
      <template #actions>
        <button type="button" class="btn btn-ghost" @click="showFilters = !showFilters">
          {{ showFilters ? 'Sakrij filtere' : 'Filteri' }}
          <span v-if="active.length" class="chip bg-desk-orders px-2 py-0.5 text-[0.6875rem] text-white">{{ active.length }}</span>
        </button>
        <button type="button" class="btn btn-ghost" @click="exportCsv">Preuzmi CSV</button>
      </template>
    </PageHeader>

    <!-- Status counts -->
    <div class="flex flex-wrap gap-2 pt-5">
      <button
        v-for="row in summary"
        :key="row.status"
        type="button"
        class="rounded-2xl px-4 py-3 text-left transition-all hover:shadow-[0_10px_26px_-18px_rgba(36,52,44,0.5)]"
        :class="[TONE[row.status] ?? 'bg-sand text-forest', filters.status === row.status ? 'ring-2 ring-forest ring-offset-2 ring-offset-cream' : '']"
        @click="filterStatus(row.status)"
      >
        <span class="block font-display text-2xl leading-none tabular-nums">{{ number(row.orders) }}</span>
        <span class="mt-1.5 block text-xs font-semibold opacity-75">{{ row.label }}</span>
      </button>
    </div>

    <!-- Search and origin -->
    <div class="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
      <input
        v-model="filters.q"
        type="search"
        placeholder="Broj porudžbine, ime, e-mail, telefon, grad…"
        class="field field-pill w-full"
      />
      <div class="segment">
        <button v-for="option in [{ v: '', l: 'Sve' }, { v: 'live', l: 'Nove' }, { v: 'archive', l: 'Arhiva' }]" :key="option.v"
          type="button"
          :class="filters.origin === option.v ? 'is-on' : ''"
          @click="filters.origin = option.v">
          {{ option.l }}
        </button>
      </div>
    </div>

    <!-- The rest of the filters -->
    <div v-if="showFilters" class="mt-3 grid gap-3 rounded-[1.5rem] bg-sand p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label class="block">
        <span class="text-xs text-forest/65">Od datuma</span>
        <input v-model="filters.od" type="date" class="field field-pill mt-1 w-full" />
      </label>
      <label class="block">
        <span class="text-xs text-forest/65">Do datuma</span>
        <input v-model="filters.do" type="date" class="field field-pill mt-1 w-full" />
      </label>
      <label class="block">
        <span class="text-xs text-forest/65">Grad</span>
        <input v-model="filters.grad" list="order-cities" placeholder="npr. Beograd" class="field field-pill mt-1 w-full" />
        <datalist id="order-cities"><option v-for="city in choices.cities" :key="city.value" :value="city.value">{{ city.orders }}</option></datalist>
      </label>
      <label class="block">
        <span class="text-xs text-forest/65">Izvor</span>
        <select v-model="filters.izvor" class="field field-select field-pill mt-1 w-full">
          <option value="">svi</option>
          <option v-for="source in choices.sources" :key="source.value" :value="source.value">{{ source.value }} ({{ number(source.orders) }})</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-forest/65">Uređaj</span>
        <select v-model="filters.uredjaj" class="field field-select field-pill mt-1 w-full">
          <option value="">svi</option>
          <option v-for="device in choices.devices" :key="device.value" :value="device.value">{{ device.value }} ({{ number(device.orders) }})</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-forest/65">Iznos od (RSD)</span>
        <input v-model="filters.min" type="number" min="0" step="100" class="field field-pill mt-1 w-full tabular-nums" />
      </label>
      <label class="block">
        <span class="text-xs text-forest/65">Iznos do (RSD)</span>
        <input v-model="filters.max" type="number" min="0" step="100" class="field field-pill mt-1 w-full tabular-nums" />
      </label>
      <div class="flex items-end">
        <button type="button" class="btn btn-ghost w-full" @click="clearAll">Poništi sve</button>
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

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>
    <p v-else-if="!orders.length" class="py-16 text-center text-sm text-forest/65">Nema porudžbina za ove uslove.</p>

    <div v-else class="mt-5 panel overflow-x-auto p-2 sm:p-3">
      <table class="desk-table min-w-[52rem]">
        <thead>
          <tr class="text-left">
            <th class="th">Broj</th>
            <th class="th">Datum</th>
            <th class="th">Kupac</th>
            <th class="th">Status</th>
            <th class="th">Artikli</th>
            <th class="th text-right">Iznos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="cursor-pointer"
            @click="router.push({ name: 'admin.order', params: { id: order.id } })"
          >
            <td>
              <span class="font-mono text-xs">{{ order.reference }}</span>
              <span v-if="order.origin === 'archive'" class="label ml-2 text-forest/52">arhiva</span>
            </td>
            <td class="text-forest/70">{{ when(order.placed_at) }}</td>
            <td>
              <span class="block max-w-44 truncate">{{ order.customer_name ?? '—' }}</span>
              <span v-if="order.city" class="block text-xs text-forest/60">{{ order.city }}</span>
            </td>
            <td>
              <span class="chip" :class="TONE[order.status] ?? 'bg-forest/10 text-forest/70'">
                <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {{ order.status_label }}
              </span>
            </td>
            <td>
              <span class="tabular-nums text-forest/70">{{ order.items }}</span>
              <span v-if="order.articles?.length" class="mt-0.5 block max-w-64 truncate text-xs text-forest/60">
                {{ order.articles.map((a) => `${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ''}`).join(', ') }}
              </span>
            </td>
            <td class="text-right tabular-nums">{{ money(order.total) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- The next page loads when this comes into view. -->
      <div ref="sentinel" class="py-8 text-center text-sm text-forest/60">
        <span v-if="loadingMore">Učitavam još…</span>
        <span v-else-if="done">{{ number(orders.length) }} od {{ number(meta?.total ?? 0) }} — to je sve.</span>
        <button v-else type="button" class="label text-forest/60 hover:text-forest" @click="loadMore">Učitaj još</button>
      </div>
    </div>
  </div>
</template>

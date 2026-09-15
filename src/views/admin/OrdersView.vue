<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const orders = ref([])
const summary = ref([])
const meta = ref(null)
const loading = ref(true)
const page = ref(1)
const term = ref('')
const status = ref(route.query.status ?? '')
const from = ref('')
const to = ref('')

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`
const when = (iso) => (iso ? new Date(iso).toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')

const TONE = {
  'awaiting-dispatch': 'bg-wheat text-forest',
  dispatched: 'bg-sky text-forest',
  delivered: 'bg-sage text-sage-deep',
  returned: 'bg-clay-100 text-clay-700',
  cancelled: 'bg-forest/10 text-forest/60',
}

async function load() {
  loading.value = true

  const params = { page: page.value, per_page: 25 }
  if (term.value) params.q = term.value
  if (status.value) params.status = status.value
  if (from.value) params.od = from.value
  if (to.value) params.do = to.value

  try {
    const { data } = await client.get('/admin/orders', { params })
    orders.value = data.data
    meta.value = data.meta?.pagination ?? null
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  const { data } = await client.get('/admin/orders/summary')
  summary.value = data.data
}

function filterBy(value) {
  status.value = status.value === value ? '' : value
  page.value = 1
  router.replace({ query: status.value ? { status: status.value } : {} })
}

/** The export carries whatever filters are on screen. */
async function exportCsv() {
  const params = new URLSearchParams()
  if (term.value) params.set('q', term.value)
  if (status.value) params.set('status', status.value)
  if (from.value) params.set('od', from.value)
  if (to.value) params.set('do', to.value)

  const { data } = await client.get(`/admin/orders/export?${params}`, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = `meva-porudzbine-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

let debounce
watch(term, () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => { page.value = 1; load() }, 350)
})
watch([status, from, to, page], load)

onMounted(() => {
  setMeta({ title: 'Porudžbine' })
  load()
  loadSummary()
})
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
      <div>
        <p class="eyebrow text-clay-500">Porudžbine</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Ko je šta poručio</h1>
      </div>
      <button v-if="auth.can('orders.view')" type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="exportCsv">
        Preuzmi CSV
      </button>
    </header>

    <div class="flex flex-wrap gap-2 pt-5">
      <button
        v-for="row in summary"
        :key="row.status"
        type="button"
        class="rounded-2xl px-4 py-3 text-left transition-all"
        :class="[TONE[row.status] ?? 'bg-sand', status === row.status ? 'ring-2 ring-forest' : '']"
        @click="filterBy(row.status)"
      >
        <span class="block font-display text-xl tabular-nums">{{ row.orders }}</span>
        <span class="eyebrow mt-0.5 block text-[0.5rem]">{{ row.label }}</span>
      </button>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <label class="relative">
        <span class="sr-only">Pretraga</span>
        <input
          v-model="term"
          type="search"
          placeholder="Broj porudžbine, ime, e-mail, telefon, grad…"
          class="w-full rounded-full border border-forest/15 bg-sand px-5 py-3 text-sm outline-none placeholder:text-forest/40 focus:border-forest/40"
        />
      </label>
      <input v-model="from" type="date" aria-label="Od" class="rounded-full border border-forest/15 bg-sand px-4 py-3 text-sm outline-none focus:border-forest/40" />
      <input v-model="to" type="date" aria-label="Do" class="rounded-full border border-forest/15 bg-sand px-4 py-3 text-sm outline-none focus:border-forest/40" />
    </div>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>
    <p v-else-if="!orders.length" class="py-16 text-center text-sm text-forest/50">Nema porudžbina za ove uslove.</p>

    <div v-else class="mt-5 overflow-x-auto">
      <table class="w-full min-w-[46rem] border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr class="text-left">
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Broj</th>
            <th class="eyebrow px-4 pb-1 text-[0.5rem] font-medium text-forest/45">Datum</th>
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
            <td class="rounded-l-2xl px-4 py-3 font-mono text-xs">{{ order.reference }}</td>
            <td class="px-4 py-3 text-forest/70">{{ when(order.placed_at) }}</td>
            <td class="px-4 py-3">
              <span class="eyebrow rounded-full px-2.5 py-1 text-[0.5rem]" :class="TONE[order.status] ?? 'bg-forest/10'">{{ order.status_label }}</span>
            </td>
            <td class="px-4 py-3 text-forest/70">{{ order.items }}</td>
            <td class="rounded-r-2xl px-4 py-3 text-right tabular-nums">{{ money(order.total) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="meta && meta.total_pages > 1" class="mt-6 flex items-center justify-between">
        <button type="button" class="eyebrow disabled:opacity-30" :disabled="page <= 1" @click="page--">← Prethodna</button>
        <span class="text-xs text-forest/50">Strana {{ meta.current_page }} od {{ meta.total_pages }} · {{ meta.total }} porudžbina</span>
        <button type="button" class="eyebrow disabled:opacity-30" :disabled="page >= meta.total_pages" @click="page++">Sledeća →</button>
      </div>
    </div>
  </div>
</template>

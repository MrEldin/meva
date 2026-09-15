<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, watch } from 'vue'

const auth = useAuthStore()

const products = ref([])
const meta = ref(null)
const loading = ref(true)
const page = ref(1)
const term = ref('')
const status = ref('')

const money = (dinars) => (dinars === null ? 'bez cene' : `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(dinars)} RSD`)

async function load() {
  loading.value = true

  const params = { page: page.value, per_page: 24 }
  if (term.value) params.q = term.value
  if (status.value) params.status = status.value

  try {
    const { data } = await client.get('/admin/products', { params })
    products.value = data.data
    meta.value = data.meta?.pagination ?? null
  } finally {
    loading.value = false
  }
}

async function toggle(product) {
  if (!auth.can('products.manage')) return

  const next = product.status === 'published' ? 'draft' : 'published'
  const { data } = await client.put(`/admin/products/${product.id}`, { status: next })
  Object.assign(product, data.data)
}

let debounce
watch(term, () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => { page.value = 1; load() }, 350)
})
watch([status, page], load)

onMounted(() => {
  setMeta({ title: 'Proizvodi' })
  load()
})
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
      <div>
        <p class="eyebrow text-clay-500">Katalog</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Proizvodi</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink v-if="auth.can('products.manage')" :to="{ name: 'admin.product', params: { id: 'novi' } }" class="pill bg-forest text-cream hover:bg-forest-soft">
          Novi proizvod
        </RouterLink>
      <div class="flex flex-wrap gap-1 rounded-full border border-forest/15 bg-sand p-1">
        <button v-for="option in [{ v: '', l: 'Svi' }, { v: 'published', l: 'Objavljeni' }, { v: 'draft', l: 'Skice' }]" :key="option.v"
          type="button" class="eyebrow rounded-full px-4 py-2 text-[0.5625rem] transition-colors"
          :class="status === option.v ? 'bg-forest text-cream' : 'hover:bg-sage'" @click="status = option.v; page = 1">
          {{ option.l }}
        </button>
      </div>
      </div>
    </header>

    <input
      v-model="term"
      type="search"
      placeholder="Pretraži po imenu…"
      class="mt-5 w-full rounded-full border border-forest/15 bg-sand px-5 py-3 text-sm outline-none placeholder:text-forest/40 focus:border-forest/40 sm:max-w-md"
    />

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>
    <p v-else-if="!products.length" class="py-16 text-center text-sm text-forest/50">Nema proizvoda.</p>

    <div v-else class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="product in products" :key="product.id" class="flex gap-4 rounded-[1.5rem] bg-sand p-4">
        <div class="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="h-full w-full object-cover" loading="lazy" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h2 class="min-w-0 text-sm font-semibold leading-snug">{{ product.name }}</h2>
            <button
              type="button"
              class="eyebrow shrink-0 rounded-full px-2.5 py-1 text-[0.5rem] transition-colors"
              :class="product.status === 'published' ? 'bg-sage text-sage-deep' : 'bg-forest/10 text-forest/60'"
              :disabled="!auth.can('products.manage')"
              @click="toggle(product)"
            >
              {{ product.status === 'published' ? 'objavljen' : 'skica' }}
            </button>
          </div>
          <p class="mt-1 font-mono text-[0.625rem] text-forest/45">{{ product.sku }}</p>
          <p class="mt-2 tabular-nums">{{ money(product.price) }}</p>
          <RouterLink
            v-if="auth.can('products.manage')"
            :to="{ name: 'admin.product', params: { id: product.id } }"
            class="eyebrow mt-3 inline-block text-clay-600 hover:text-clay-700"
          >
            Izmeni →
          </RouterLink>
        </div>
      </article>
    </div>

    <div v-if="meta && meta.total_pages > 1" class="mt-8 flex items-center justify-between">
      <button type="button" class="eyebrow disabled:opacity-30" :disabled="page <= 1" @click="page--">← Prethodna</button>
      <span class="text-xs text-forest/50">Strana {{ meta.current_page }} od {{ meta.total_pages }} · {{ meta.total }} proizvoda</span>
      <button type="button" class="eyebrow disabled:opacity-30" :disabled="page >= meta.total_pages" @click="page++">Sledeća →</button>
    </div>
  </div>
</template>

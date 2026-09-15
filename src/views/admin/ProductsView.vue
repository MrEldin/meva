<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
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
    <PageHeader tone="products" eyebrow="Katalog" title="Proizvodi" note="Cene, slike i status objave.">
      <template #actions>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink v-if="auth.can('products.manage')" :to="{ name: 'admin.product', params: { id: 'novi' } }" class="btn btn-primary">
          Novi proizvod
        </RouterLink>
      <div class="segment">
        <button v-for="option in [{ v: '', l: 'Svi' }, { v: 'published', l: 'Objavljeni' }, { v: 'draft', l: 'Skice' }]" :key="option.v"
          type="button"
          :class="status === option.v ? 'is-on' : ''" @click="status = option.v; page = 1">
          {{ option.l }}
        </button>
      </div>
      </div>
      </template>
    </PageHeader>

    <input
      v-model="term"
      type="search"
      placeholder="Pretraži po imenu…"
      class="field field-pill mt-5 w-full sm:max-w-md"
    />

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>
    <p v-else-if="!products.length" class="py-16 text-center text-sm text-forest/65">Nema proizvoda.</p>

    <div v-else class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="product in products" :key="product.id" class="panel flex gap-4 p-4 transition-shadow duration-300 hover:shadow-[0_12px_32px_-20px_rgba(36,52,44,0.4)]">
        <div class="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="h-full w-full object-cover" loading="lazy" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h2 class="min-w-0 text-[0.9375rem] font-semibold leading-snug">{{ product.name }}</h2>
            <button
              type="button"
              class="chip shrink-0 transition-opacity hover:opacity-80 disabled:hover:opacity-100"
              :class="product.status === 'published' ? 'bg-sage text-sage-deep' : 'bg-wheat/70 text-forest/75'"
              :disabled="!auth.can('products.manage')"
              :title="auth.can('products.manage') ? 'Klikni da promeniš status' : null"
              @click="toggle(product)"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {{ product.status === 'published' ? 'Objavljen' : 'Skica' }}
            </button>
          </div>
          <p class="mt-1 font-mono text-xs text-forest/60">{{ product.sku }}</p>
          <p class="mt-2 font-display text-xl leading-none tabular-nums text-desk-products">{{ money(product.price) }}</p>
          <RouterLink
            v-if="auth.can('products.manage')"
            :to="{ name: 'admin.product', params: { id: product.id } }"
            class="mt-3 inline-block text-[0.8125rem] font-semibold text-clay-600 transition-colors hover:text-clay-700"
          >
            Izmeni →
          </RouterLink>
        </div>
      </article>
    </div>

    <div v-if="meta && meta.total_pages > 1" class="mt-8 flex items-center justify-between">
      <button type="button" class="label disabled:opacity-30" :disabled="page <= 1" @click="page--">← Prethodna</button>
      <span class="text-xs text-forest/65">Strana {{ meta.current_page }} od {{ meta.total_pages }} · {{ meta.total }} proizvoda</span>
      <button type="button" class="label disabled:opacity-30" :disabled="page >= meta.total_pages" @click="page++">Sledeća →</button>
    </div>
  </div>
</template>

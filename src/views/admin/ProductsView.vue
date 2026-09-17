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
    <PageHeader tone="products" eyebrow="Katalog" title="Proizvodi" note="Cena, slika i da li se vidi u prodavnici.">
      <template #actions>
        <RouterLink v-if="auth.can('products.manage')" :to="{ name: 'admin.product', params: { id: 'new' } }" class="btn btn-primary">
          Novi proizvod
        </RouterLink>
      </template>
    </PageHeader>

    <!-- Finding one -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <label class="relative min-w-0 flex-1 sm:max-w-sm">
        <span class="sr-only">Pretraga</span>
        <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/35" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
        <input v-model="term" type="search" placeholder="Pretraži po nazivu" class="field field-pill w-full pl-11" />
      </label>

      <div class="segment">
        <button type="button" :class="status === '' ? 'is-on' : ''" @click="status = ''">Svi</button>
        <button type="button" :class="status === 'published' ? 'is-on' : ''" @click="status = 'published'">Objavljeni</button>
        <button type="button" :class="status === 'draft' ? 'is-on' : ''" @click="status = 'draft'">Skice</button>
      </div>
    </div>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <p v-else-if="!products.length" class="panel px-6 py-16 text-center text-sm text-forest/60">
      Nema proizvoda po ovom filteru.
    </p>

    <!-- The catalogue, as a list you can work down -->
    <ul v-else class="panel divide-y divide-forest/8 overflow-hidden">
      <li
        v-for="product in products"
        :key="product.id"
        class="flex items-center gap-3 p-3 transition-colors hover:bg-cream sm:gap-4 sm:p-4"
      >
        <RouterLink
          :to="{ name: 'admin.product', params: { id: product.id } }"
          class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream sm:h-[4.5rem] sm:w-[4.5rem]"
        >
          <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" class="h-full w-full object-contain p-1" />
          <span v-else class="text-[0.625rem] font-bold uppercase tracking-wide text-forest/25">nema slike</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin.product', params: { id: product.id } }" class="min-w-0 flex-1">
          <span class="block truncate text-[0.9375rem] font-bold leading-snug sm:text-base">{{ product.name }}</span>
          <span class="mt-0.5 block truncate font-mono text-[0.75rem] text-forest/40">{{ product.slug }}</span>
        </RouterLink>

        <span class="hidden w-28 shrink-0 text-right text-[0.9375rem] font-bold tabular-nums sm:block">{{ money(product.price) }}</span>

        <button
          type="button"
          class="shrink-0 rounded-full px-3 py-1.5 text-[0.75rem] font-bold transition-colors"
          :class="product.status === 'published'
            ? 'bg-sage text-sage-deep hover:bg-sage-deep hover:text-white'
            : 'bg-sand text-forest/55 hover:bg-forest hover:text-white'"
          :disabled="!auth.can('products.manage')"
          :title="product.status === 'published' ? 'Kliknite da sklonite iz prodavnice' : 'Kliknite da objavite'"
          @click="toggle(product)"
        >{{ product.status === 'published' ? 'Objavljen' : 'Skica' }}</button>

        <RouterLink
          :to="{ name: 'admin.product', params: { id: product.id } }"
          class="hidden shrink-0 rounded-full border border-forest/12 px-4 py-1.5 text-[0.8125rem] font-bold transition-colors hover:bg-forest hover:text-white sm:block"
        >Izmeni</RouterLink>

        <RouterLink
          :to="{ name: 'admin.product', params: { id: product.id } }"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-forest/40 sm:hidden"
          aria-label="Izmeni"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </RouterLink>
      </li>
    </ul>

    <!-- Paging -->
    <div v-if="meta && meta.total_pages > 1" class="mt-4 flex items-center justify-between gap-3">
      <button type="button" class="btn" :disabled="page <= 1" @click="page -= 1">Prethodna</button>
      <span class="text-[0.8125rem] text-forest/55">Strana {{ meta.current_page }} od {{ meta.total_pages }} · {{ meta.total }} proizvoda</span>
      <button type="button" class="btn" :disabled="page >= meta.total_pages" @click="page += 1">Sledeća</button>
    </div>
  </div>
</template>

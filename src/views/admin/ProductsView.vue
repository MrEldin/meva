<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'

const auth = useAuthStore()
const router = useRouter()

const products = ref([])
const meta = ref(null)
const loading = ref(true)
const page = ref(1)
const term = ref('')
const status = ref('')

/**
 * The rest of the filters: one shelf, sets or single products, what the
 * photographs are like, and the order. Every one is a query parameter the
 * API answers, so the desk never pages through the catalogue by hand.
 */
const type = ref('')
const category = ref('')
const image = ref('')
const sort = ref('newest')
const categories = ref([])

const SORTS = [
  ['newest', 'Najnovije'],
  ['oldest', 'Najstarije'],
  ['name', 'Naziv A–Z'],
  ['price_asc', 'Cena: niža prvo'],
  ['price_desc', 'Cena: viša prvo'],
]

const IMAGES = [
  ['', 'Sve slike'],
  ['none', 'Bez slike'],
  ['no-cutout', 'Bez isečka (ima pozadinu)'],
  ['cutout', 'Sa isečkom (bez pozadine)'],
]

const filtered = computed(() => Boolean(term.value || status.value || type.value || category.value || image.value || sort.value !== 'newest'))

function clearFilters() {
  term.value = ''
  status.value = ''
  type.value = ''
  category.value = ''
  image.value = ''
  sort.value = 'newest'
}

/**
 * Products ticked to go into a set. Sets themselves cannot be ticked: a set
 * inside a set is a box inside a box.
 */
const selected = ref([])
const canManage = computed(() => auth.can('products.manage'))

function tick(product) {
  const i = selected.value.findIndex((p) => p.id === product.id)
  if (i === -1) selected.value.push(product)
  else selected.value.splice(i, 1)
}

const ticked = (product) => selected.value.some((p) => p.id === product.id)

function createSet() {
  router.push({ name: 'admin.product', params: { id: 'new' }, query: { set: selected.value.map((p) => p.id).join(',') } })
}

const money = (dinars) => (dinars === null ? 'bez cene' : `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(dinars)} RSD`)

async function load() {
  loading.value = true

  const params = { page: page.value, per_page: 24, sort: sort.value }
  if (term.value) params.q = term.value
  if (status.value) params.status = status.value
  if (type.value) params.type = type.value
  if (category.value) params.category = category.value
  if (image.value) params.image = image.value

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
watch([status, type, category, image, sort], () => { page.value = 1; load() })
watch(page, load)

onMounted(async () => {
  setMeta({ title: 'Proizvodi' })
  load()
  const { data } = await client.get('/shop/collections')
  categories.value = data.data.filter((c) => c.slug !== 'uncategorized')
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
        <button type="button" :class="type === '' ? 'is-on' : ''" @click="type = ''">Sve</button>
        <button type="button" :class="type === 'product' ? 'is-on' : ''" @click="type = 'product'">Proizvodi</button>
        <button type="button" :class="type === 'set' ? 'is-on' : ''" @click="type = 'set'">Setovi</button>
      </div>

      <div class="segment">
        <button type="button" :class="status === '' ? 'is-on' : ''" @click="status = ''">Svi</button>
        <button type="button" :class="status === 'published' ? 'is-on' : ''" @click="status = 'published'">Objavljeni</button>
        <button type="button" :class="status === 'draft' ? 'is-on' : ''" @click="status = 'draft'">Skice</button>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <label class="block">
        <span class="sr-only">Kategorija</span>
        <select v-model="category" class="field field-select field-pill">
          <option value="">Sve kategorije</option>
          <option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.name }} ({{ c.products_count }})</option>
        </select>
      </label>

      <label class="block">
        <span class="sr-only">Slike</span>
        <select v-model="image" class="field field-select field-pill">
          <option v-for="[value, label] in IMAGES" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>

      <label class="block">
        <span class="sr-only">Redosled</span>
        <select v-model="sort" class="field field-select field-pill">
          <option v-for="[value, label] in SORTS" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>

      <span v-if="meta" class="text-[0.8125rem] text-forest/55">{{ meta.total }} {{ meta.total === 1 ? 'proizvod' : 'proizvoda' }}</span>

      <button v-if="filtered" type="button" class="btn btn-ghost text-[0.8125rem]" @click="clearFilters">Poništi filtere</button>
    </div>

    <!-- What is ticked, and the one thing to do with it -->
    <div
      v-if="selected.length"
      class="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-forest px-4 py-3 text-cream"
    >
      <p class="min-w-0 flex-1 text-[0.875rem]">
        <span class="font-bold">Izabrano {{ selected.length }}</span>
        <span class="text-cream/70"> · {{ selected.map((p) => p.name).join(', ') }}</span>
      </p>
      <button type="button" class="btn btn-ghost text-cream/80 hover:text-cream" @click="selected = []">Poništi</button>
      <button type="button" class="btn btn-accent" @click="createSet">Kreiraj set</button>
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
        :class="ticked(product) ? 'bg-clay-50' : ''"
      >
        <!-- Tick it for a set. A set cannot go into a set. -->
        <label
          v-if="canManage"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          :class="product.is_set ? 'opacity-0' : 'cursor-pointer hover:bg-sand'"
          :title="product.is_set ? '' : 'Izaberi za set'"
        >
          <input type="checkbox" class="h-4 w-4 accent-clay-600" :checked="ticked(product)" :disabled="product.is_set" @change="tick(product)" />
        </label>

        <RouterLink
          :to="{ name: 'admin.product', params: { id: product.id } }"
          class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream sm:h-[4.5rem] sm:w-[4.5rem]"
        >
          <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" class="h-full w-full object-contain p-1" />
          <span v-else class="text-[0.625rem] font-bold uppercase tracking-wide text-forest/25">nema slike</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin.product', params: { id: product.id } }" class="min-w-0 flex-1">
          <span class="flex items-center gap-2">
            <span class="truncate text-[0.9375rem] font-bold leading-snug sm:text-base">{{ product.name }}</span>
            <span v-if="product.is_set" class="shrink-0 rounded-full bg-forest px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-cream">Set</span>
          </span>
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

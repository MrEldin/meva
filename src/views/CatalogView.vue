<script setup>
import { setMeta } from '@/lib/meta'
import ProductCard from '@/components/shop/ProductCard.vue'
import { byPopularity } from '@/data/bestsellers'
import { useCatalogStore } from '@/stores/catalog'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()

const search = ref('')

onMounted(() => catalog.load())

const activeCategory = computed(() => route.query.kategorija ?? null)
const onlySets = computed(() => route.query.tip === 'set')

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()

  return catalog.products.filter((product) => {
    if (onlySets.value && !product.is_set) return false

    if (activeCategory.value && !product.categories.some((c) => c.slug === activeCategory.value)) {
      return false
    }

    if (term && !product.name.toLowerCase().includes(term)) return false

    return true
  }).sort(byPopularity)
})

const heading = computed(() => {
  if (onlySets.value) return 'Setovi'

  const match = catalog.collections.find((c) => c.slug === activeCategory.value)

  return match?.name ?? 'Svi proizvodi'
})

function filterBy(query) {
  router.push({ name: 'catalog', query })
}

watch(() => route.query, () => (search.value = ''))

setMeta({
  title: 'Svi preparati',
  description: 'Prirodna kozmetika Meva: preparati za seboreju, psorijazu, ekcem, akne, negu lica i kose. Besplatna dostava, plaćanje pouzećem.',
})
</script>

<template>
  <div class="shell py-14 md:py-20">
    <header class="max-w-2xl">
      <p class="text-[0.8125rem] font-bold uppercase tracking-wider text-blush-500">Prodavnica</p>
      <h1 class="mt-4 font-display text-4xl leading-tight text-ink md:text-6xl">{{ heading }}</h1>
      <p class="mt-4 text-sm font-light text-mist-500">
        {{ visible.length }} {{ visible.length === 1 ? 'proizvod' : 'proizvoda' }}
      </p>
    </header>

    <!-- Filters -->
    <div class="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="-mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
        <button
          type="button"
          class="shrink-0 rounded-full border px-4 py-2 text-[0.875rem] font-semibold transition-colors"
          :class="!activeCategory && !onlySets
            ? 'border-blush-500 bg-blush-500 text-paper'
            : 'border-blush-100 bg-paper text-mist-600 hover:border-blush-300'"
          @click="filterBy({})"
        >
          Sve
        </button>

        <button
          v-for="category in catalog.collections"
          :key="category.slug"
          type="button"
          class="shrink-0 rounded-full border px-4 py-2 text-[0.875rem] font-semibold transition-colors"
          :class="activeCategory === category.slug
            ? 'border-blush-500 bg-blush-500 text-paper'
            : 'border-blush-100 bg-paper text-mist-600 hover:border-blush-300'"
          @click="filterBy({ kategorija: category.slug })"
        >
          {{ category.name }}
        </button>

        <button
          type="button"
          class="shrink-0 rounded-full border px-4 py-2 text-[0.875rem] font-semibold transition-colors"
          :class="onlySets
            ? 'border-blush-500 bg-blush-500 text-paper'
            : 'border-blush-100 bg-paper text-mist-600 hover:border-blush-300'"
          @click="filterBy({ tip: 'set' })"
        >
          Setovi
        </button>
      </div>

      <label class="relative shrink-0 lg:w-72">
        <span class="sr-only">Pretraga</span>
        <input
          v-model="search"
          type="search"
          placeholder="Pretraži proizvode"
          class="w-full border border-mist-200 bg-paper py-3 pl-10 pr-4 text-sm font-light text-ink placeholder:text-mist-400 focus:border-ink focus:outline-none"
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" stroke-linecap="round" />
        </svg>
      </label>
    </div>

    <!-- Grid -->
    <div v-if="catalog.loading" class="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-8">
      <div v-for="n in 8" :key="n" class="animate-pulse">
        <div class="aspect-4/5 bg-mist-100" />
        <div class="mt-4 h-4 w-3/4 bg-mist-100" />
      </div>
    </div>

    <div v-else-if="visible.length" class="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-8">
      <ProductCard v-for="(product, i) in visible" :key="product.id" :product="product" :tint="i" :eager="i < 4" />
    </div>

    <div v-else class="py-24 text-center">
      <p class="font-display text-2xl text-ink">Nema proizvoda po tom filteru</p>
      <button type="button" class="mt-6 rounded-full bg-blush-500 px-6 py-3 text-[0.875rem] font-bold text-paper" @click="filterBy({}); search = ''">
        Prikaži sve
      </button>
    </div>
  </div>
</template>

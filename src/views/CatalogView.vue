<script setup>
import { setMeta } from '@/lib/meta'
import ProductCard from '@/components/product/ProductCard.vue'
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
  })
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
      <p class="eyebrow text-clay-500">Prodavnica</p>
      <h1 class="mt-4 font-display text-4xl leading-tight text-ink md:text-6xl">{{ heading }}</h1>
      <p class="mt-4 text-sm font-light text-mist-500">
        {{ visible.length }} {{ visible.length === 1 ? 'proizvod' : 'proizvoda' }}
      </p>
    </header>

    <!-- Filters -->
    <div class="mt-10 flex flex-col gap-5 border-y border-mist-200 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="-mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
        <button
          type="button"
          class="eyebrow shrink-0 border px-4 py-2.5 transition-colors duration-300"
          :class="!activeCategory && !onlySets
            ? 'border-ink bg-ink text-paper'
            : 'border-mist-200 text-mist-500 hover:border-ink hover:text-ink'"
          @click="filterBy({})"
        >
          Sve
        </button>

        <button
          v-for="category in catalog.collections"
          :key="category.slug"
          type="button"
          class="eyebrow shrink-0 border px-4 py-2.5 transition-colors duration-300"
          :class="activeCategory === category.slug
            ? 'border-ink bg-ink text-paper'
            : 'border-mist-200 text-mist-500 hover:border-ink hover:text-ink'"
          @click="filterBy({ kategorija: category.slug })"
        >
          {{ category.name }}
        </button>

        <button
          type="button"
          class="eyebrow shrink-0 border px-4 py-2.5 transition-colors duration-300"
          :class="onlySets
            ? 'border-ink bg-ink text-paper'
            : 'border-mist-200 text-mist-500 hover:border-ink hover:text-ink'"
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
      <ProductCard v-for="product in visible" :key="product.id" :product="product" />
    </div>

    <div v-else class="py-24 text-center">
      <p class="font-display text-2xl text-ink">Nema proizvoda po tom filteru</p>
      <button type="button" class="eyebrow mt-6 border-b border-ink pb-1 text-ink" @click="filterBy({}); search = ''">
        Prikaži sve
      </button>
    </div>
  </div>
</template>

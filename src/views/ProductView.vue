<script setup>
import ProductCard from '@/components/product/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cart = useCartStore()
const catalog = useCatalogStore()

const product = ref(null)
const loading = ref(true)
const failed = ref(false)
const activeImage = ref(0)
const quantity = ref(1)
const added = ref(false)

async function load(slug) {
  loading.value = true
  failed.value = false
  activeImage.value = 0
  quantity.value = 1

  try {
    product.value = await catalog.find(slug)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }

  catalog.load()
}

watch(() => route.params.slug, (slug) => slug && load(slug), { immediate: true })

const images = computed(() => product.value?.images?.data ?? product.value?.images ?? [])
const setItems = computed(() => product.value?.set?.data ?? product.value?.set ?? [])

const related = computed(() => {
  if (!product.value) return []

  const slugs = product.value.categories.map((c) => c.slug)

  return catalog.products
    .filter((p) => p.id !== product.value.id && p.image && p.categories.some((c) => slugs.includes(c.slug)))
    .slice(0, 4)
})

function addToCart() {
  cart.add(product.value, quantity.value)
  added.value = true
  setTimeout(() => (added.value = false), 1800)
}
</script>

<template>
  <div class="shell py-10 md:py-16">
    <div v-if="loading" class="grid gap-10 md:grid-cols-2">
      <div class="aspect-square animate-pulse bg-mist-100" />
      <div class="space-y-4">
        <div class="h-10 w-3/4 animate-pulse bg-mist-100" />
        <div class="h-4 w-1/3 animate-pulse bg-mist-100" />
      </div>
    </div>

    <div v-else-if="failed" class="py-28 text-center">
      <h1 class="font-display text-3xl text-ink">Proizvod nije pronađen</h1>
      <RouterLink :to="{ name: 'catalog' }" class="eyebrow mt-6 inline-block border-b border-ink pb-1">
        Nazad na proizvode
      </RouterLink>
    </div>

    <template v-else-if="product">
      <nav class="eyebrow mb-8 flex items-center gap-2 text-mist-400">
        <RouterLink :to="{ name: 'catalog' }" class="transition-colors hover:text-ink">Proizvodi</RouterLink>
        <span>/</span>
        <span class="text-ink">{{ product.name }}</span>
      </nav>

      <div class="grid gap-10 md:grid-cols-2 md:gap-16">
        <!-- Gallery -->
        <div>
          <div class="aspect-square overflow-hidden bg-mist-50">
            <img
              v-if="images[activeImage]"
              :src="images[activeImage].url"
              :alt="product.name"
              class="h-full w-full object-cover"
            />
          </div>

          <div v-if="images.length > 1" class="mt-3 grid grid-cols-5 gap-3">
            <button
              v-for="(image, i) in images.slice(0, 5)"
              :key="image.url"
              type="button"
              class="aspect-square overflow-hidden border transition-colors duration-300"
              :class="i === activeImage ? 'border-ink' : 'border-transparent hover:border-mist-300'"
              @click="activeImage = i"
            >
              <img :src="image.url" alt="" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Detail -->
        <div class="md:pt-6">
          <p v-if="product.categories.length" class="eyebrow text-clay-500">
            {{ product.categories[0].name }}
          </p>

          <h1 class="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            {{ product.name }}
          </h1>

          <p class="mt-5 font-display text-2xl text-ink md:text-3xl">
            {{ product.price ? product.price.formatted : 'Cena na upit' }}
            <span v-if="product.price_eur" class="ml-2 text-base font-light text-mist-400">
              / {{ product.price_eur.formatted }}
            </span>
          </p>

          <p v-if="product.excerpt" class="mt-6 text-base font-light leading-relaxed text-mist-600">
            {{ product.excerpt }}
          </p>

          <!-- Set contents -->
          <div v-if="setItems.length" class="mt-8 border border-mist-200 p-5">
            <p class="eyebrow text-clay-500">Set sadrži</p>
            <ul class="mt-4 space-y-2.5">
              <li v-for="item in setItems" :key="item.id" class="flex justify-between gap-4 text-sm font-light text-mist-600">
                <span>{{ item.name }}</span>
                <span class="tabular-nums text-mist-400">×{{ item.quantity }}</span>
              </li>
            </ul>
          </div>

          <!-- Buy -->
          <div v-if="product.price" class="mt-9 flex flex-col gap-3 sm:flex-row">
            <div class="flex items-center border border-mist-200">
              <button type="button" class="h-14 w-14 text-lg text-mist-500 transition-colors hover:text-ink" aria-label="Manje" @click="quantity = Math.max(1, quantity - 1)">−</button>
              <span class="w-10 text-center text-sm tabular-nums">{{ quantity }}</span>
              <button type="button" class="h-14 w-14 text-lg text-mist-500 transition-colors hover:text-ink" aria-label="Više" @click="quantity++">+</button>
            </div>

            <button
              type="button"
              class="eyebrow flex-1 bg-ink px-8 py-4.5 text-paper transition-colors duration-400 hover:bg-clay-500"
              :class="added && 'bg-clay-500!'"
              @click="addToCart"
            >
              {{ added ? 'Dodato u korpu ✓' : 'Dodaj u korpu' }}
            </button>
          </div>

          <ul class="mt-8 space-y-2.5 border-t border-mist-200 pt-6 text-sm font-light text-mist-500">
            <li>Besplatna dostava na teritoriji Srbije</li>
            <li>Plaćanje pouzećem, kuriru pri preuzimanju</li>
            <li>Isporuka 2–3 radna dana</li>
          </ul>
        </div>
      </div>

      <!-- Description -->
      <section v-if="product.description?.html || product.description?.data?.html" class="mt-16 max-w-3xl md:mt-24">
        <h2 class="font-display text-2xl text-ink md:text-3xl">Opis</h2>
        <div
          class="prose-meva mt-6 text-base font-light leading-relaxed text-mist-600"
          v-html="product.description.html ?? product.description.data?.html"
        />
      </section>

      <!-- Related -->
      <section v-if="related.length" class="mt-20 md:mt-28">
        <h2 class="font-display text-2xl text-ink md:text-3xl">Moglo bi vam se svideti</h2>
        <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-8">
          <ProductCard v-for="item in related" :key="item.id" :product="item" />
        </div>
      </section>
    </template>
  </div>
</template>

<style>
/* The descriptions come from the old shop as free HTML, so they are tamed here
   rather than trusted to arrive with sane markup. */
.prose-meva p { margin-bottom: 1rem; }
.prose-meva ul { list-style: disc; padding-left: 1.25rem; margin-bottom: 1rem; }
.prose-meva li { margin-bottom: 0.375rem; }
.prose-meva strong { font-weight: 500; color: var(--color-ink); }
.prose-meva img { display: none; }
</style>

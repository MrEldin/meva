<script setup>
import ProductCard from '@/components/shop/ProductCard.vue'
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * What the shop actually sells, straight away.
 *
 * In the order the archive says people buy them, so the first thing a visitor
 * sees is the thing most likely to be what they came for.
 */
const catalog = useCatalogStore()

// The ten the fifteen-year order history puts at the top.
const ORDER = [
  'sampon-za-kosu-200ml',
  'losion-za-seboreicni-dermatitis',
  'set-za-seboreju-za-kosu-i-lice',
  'set-za-psorijazu-za-kozu-glave-i-tela',
  'keratin-regenerator',
  'krema-protiv-gljivica-dan-50ml',
  'ulje-za-kosu-i-obrve-50ml',
  'mleko-za-telo',
]

const items = computed(() => {
  const picked = ORDER
    .map((slug) => catalog.products.find((p) => p.slug?.startsWith(slug)))
    .filter(Boolean)

  // Top up from the catalogue if a name has changed, so the row is never short.
  const rest = catalog.products.filter((p) => p.image && !picked.includes(p))

  return [...picked, ...rest].slice(0, 8)
})
</script>

<template>
  <section class="shell py-12 lg:py-16">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl">Najtraženije</h2>
        <p class="mt-1.5 text-sm text-mist-500">Preparati koje kupci najčešće poručuju.</p>
      </div>
      <RouterLink :to="{ name: 'catalog' }" class="text-sm font-semibold text-blush-500 underline-offset-4 hover:underline">
        Svi proizvodi →
      </RouterLink>
    </div>

    <div v-if="!items.length" class="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 lg:grid-cols-4">
      <div v-for="n in 4" :key="n" class="animate-pulse">
        <div class="aspect-square rounded-2xl bg-mist-100" />
        <div class="mt-3.5 h-4 w-3/4 rounded bg-mist-100" />
        <div class="mt-2 h-4 w-1/3 rounded bg-mist-100" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 sm:gap-x-6 lg:grid-cols-4">
      <ProductCard
        v-for="(product, i) in items"
        :key="product.slug"
        :product="product"
        :badge="i === 0 ? 'Najprodavanije' : null"
      />
    </div>
  </section>
</template>

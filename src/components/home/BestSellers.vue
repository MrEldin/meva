<script setup>
import ProductCard from '@/components/shop/ProductCard.vue'
import SectionHead from '@/components/home/SectionHead.vue'
import { BESTSELLERS } from '@/data/bestsellers'
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * What the shop actually sells, straight away.
 *
 * In the order the archive says people buy them, so the first thing a visitor
 * sees is the thing most likely to be what they came for.
 */
const catalog = useCatalogStore()


const items = computed(() => {
  const picked = BESTSELLERS
    .map((slug) => catalog.products.find((p) => p.slug?.startsWith(slug)))
    .filter(Boolean)

  // Top up from the catalogue if a name has changed, so the row is never short.
  const rest = catalog.products.filter((p) => p.image && !picked.includes(p))

  return [...picked, ...rest].slice(0, 8)
})
</script>

<template>
  <section class="shell py-10 lg:py-16">
    <SectionHead title="Najtraženije" note="Preparati koje kupci najčešće poručuju." :to="{ name: 'catalog' }" link="Svi proizvodi" />

    <div v-if="!items.length" class="grid grid-cols-2 gap-3 pt-5 lg:grid-cols-4 lg:gap-4">
      <div v-for="n in 4" :key="n" class="animate-pulse">
        <div class="aspect-square rounded-[1.25rem] bg-blush-50" />
        <div class="mt-3.5 h-4 w-3/4 rounded bg-blush-50" />
        <div class="mt-2 h-4 w-1/3 rounded bg-blush-50" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-3 pt-5 lg:grid-cols-4 lg:gap-4">
      <ProductCard
        v-for="(product, i) in items"
        :key="product.slug"
        :product="product"
        :tint="i"
        :eager="i < 4"
        :badge="i === 0 ? 'Najprodavanije' : null"
      />
    </div>
  </section>
</template>

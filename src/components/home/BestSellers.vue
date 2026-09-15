<script setup>
import ProductCard from '@/components/shop/ProductCard.vue'
import SectionHead from '@/components/home/SectionHead.vue'
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
  <section class="shell py-14 lg:py-20">
    <SectionHead
      number="03"
      kicker="Po redosledu porudžbina"
      title="Najtraženije"
      note="Osam preparata koji čine većinu svega što je kuća ikad prodala."
      :to="{ name: 'catalog' }"
      link="Svih 68"
    />

    <div v-if="!items.length" class="grid grid-cols-2 gap-x-3 gap-y-9 pt-9 lg:grid-cols-4 lg:gap-x-4">
      <div v-for="n in 4" :key="n" class="animate-pulse">
        <div class="aspect-[4/5] rounded-[1.25rem] bg-blush-50" />
        <div class="mt-3.5 h-4 w-3/4 rounded bg-blush-50" />
        <div class="mt-2 h-4 w-1/3 rounded bg-blush-50" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-x-3 gap-y-9 pt-9 lg:grid-cols-4 lg:gap-x-4">
      <ProductCard
        v-for="(product, i) in items"
        :key="product.slug"
        :product="product"
        :index="i"
        :badge="i === 0 ? 'Najprodavanije' : null"
      />
    </div>
  </section>
</template>

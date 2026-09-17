<script setup>
import ProductFigure from '@/components/shop/ProductFigure.vue'
import SectionHead from '@/components/home/SectionHead.vue'
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/** People arrive with a problem, not a category. Each one goes straight to the shelf. */
const catalog = useCatalogStore()

const CONCERNS = [
  { slug: 'seboreja', label: 'Seboreja', face: 'set-za-seboreju-za-kosu-i-lice' },
  { slug: 'psorijaza', label: 'Psorijaza', face: 'set-za-psorijazu-za-kozu-glave-i-tela' },
  { slug: 'ekcem', label: 'Ekcem', face: 'set-za-ekcem-po-telu' },
  { slug: 'kosa', label: 'Kosa', face: 'sampon-za-kosu-200ml' },
  { slug: 'preparati-za-lice', label: 'Nega kože', face: 'mleko-za-telo' },
  { slug: 'setovi', label: 'Setovi', face: 'set-za-seboreju-sa-manjim-uljem' },
]

const concerns = computed(() =>
  CONCERNS.map((concern) => ({
    ...concern,
    count: catalog.collections.find((c) => c.slug === concern.slug)?.products_count ?? null,
    product: catalog.products.find((p) => p.slug?.startsWith(concern.face) && p.image)
      ?? catalog.products.find((p) => p.categories?.some((c) => c.slug === concern.slug) && p.image)
      ?? null,
  })),
)
</script>

<template>
  <section class="shell py-10 lg:py-16">
    <SectionHead title="Šta vam treba?" :to="{ name: 'catalog' }" link="Svi proizvodi" />

    <ul class="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-6 lg:gap-4">
      <li v-for="(concern, i) in concerns" :key="concern.slug">
        <RouterLink :to="{ name: 'catalog', query: { kategorija: concern.slug } }" class="group block text-center">
          <div class="relative mx-auto aspect-square w-full rounded-full ring-1 ring-inset ring-blush-100 transition-all duration-500 group-hover:ring-blush-300 group-hover:ring-2">
            <ProductFigure v-if="concern.product" :product="concern.product" :tint="i" sizes="(min-width: 1024px) 14vw, 30vw" />
          </div>
          <span class="mt-3 block text-[0.875rem] font-bold text-ink">{{ concern.label }}</span>
          <span v-if="concern.count" class="block text-xs text-ink/45">{{ concern.count }} proizvoda</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

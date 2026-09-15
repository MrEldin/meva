<script setup>
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
    image: catalog.products.find((p) => p.slug?.startsWith(concern.face) && p.image)?.image
      ?? catalog.products.find((p) => p.categories?.some((c) => c.slug === concern.slug) && p.image)?.image
      ?? null,
  })),
)
</script>

<template>
  <section class="shell py-10 lg:py-16">
    <SectionHead title="Šta vam treba?" :to="{ name: 'catalog' }" link="Svi proizvodi" />

    <ul class="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-6 lg:gap-4">
      <li v-for="concern in concerns" :key="concern.slug">
        <RouterLink :to="{ name: 'catalog', query: { kategorija: concern.slug } }" class="group block text-center">
          <div class="mx-auto aspect-square w-full overflow-hidden rounded-full border-4 border-blush-100 bg-blush-50 transition-colors group-hover:border-blush-300">
            <img v-if="concern.image" :src="concern.image" alt="" loading="lazy" class="h-full w-full object-cover" />
          </div>
          <span class="mt-2.5 block text-[0.875rem] font-bold text-ink">{{ concern.label }}</span>
          <span v-if="concern.count" class="block text-xs text-mist-500">{{ concern.count }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

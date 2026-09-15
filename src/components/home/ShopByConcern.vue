<script setup>
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * People arrive with a problem, not a category.
 *
 * Nobody types "skincare" into a shop; they come because their scalp itches or
 * their eczema is back. These are named the way a customer would say them, and
 * each one goes straight to a filtered catalogue.
 */
const catalog = useCatalogStore()

// Each one names the product whose photograph represents it. Left to pick the
// first image in the category, the tile for hair showed a black derma roller,
// which is the one thing in it that does not look like the rest.
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
      // If a name has changed, fall back to anything in the category.
      ?? catalog.products.find((p) => p.categories?.some((c) => c.slug === concern.slug) && p.image)?.image
      ?? null,
  })),
)
</script>

<template>
  <section class="shell py-12 lg:py-16">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h2 class="text-2xl sm:text-3xl">Šta vam treba?</h2>
      <RouterLink :to="{ name: 'catalog' }" class="text-sm font-semibold text-blush-500 underline-offset-4 hover:underline">
        Svi proizvodi →
      </RouterLink>
    </div>

    <ul class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <li v-for="concern in concerns" :key="concern.slug">
        <RouterLink
          :to="{ name: 'catalog', query: { kategorija: concern.slug } }"
          class="group block overflow-hidden rounded-2xl bg-shell transition-colors hover:bg-blush-50"
        >
          <div class="aspect-square overflow-hidden">
            <img
              v-if="concern.image"
              :src="concern.image"
              alt=""
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-105"
            />
          </div>
          <span class="block px-3 py-3 text-center">
            <span class="block text-sm font-semibold text-ink">{{ concern.label }}</span>
            <span v-if="concern.count" class="mt-0.5 block text-xs text-mist-500">{{ concern.count }} preparata</span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

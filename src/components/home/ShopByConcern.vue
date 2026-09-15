<script setup>
import SectionHead from '@/components/home/SectionHead.vue'
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * People arrive with a problem, not a category.
 *
 * Laid out as a magazine contents page rather than six equal squares: the
 * first two run taller, the names are set in the display face over the
 * photograph, and the whole tile darkens towards pink as the pointer crosses
 * it. Nobody has to hunt for the label.
 */
const catalog = useCatalogStore()

const CONCERNS = [
  { slug: 'seboreja', label: 'Seboreja', note: 'Perut, svrab, masna koža glave', face: 'set-za-seboreju-za-kosu-i-lice', wide: true },
  { slug: 'psorijaza', label: 'Psorijaza', note: 'Plakovi na koži glave i telu', face: 'set-za-psorijazu-za-kozu-glave-i-tela', wide: true },
  { slug: 'ekcem', label: 'Ekcem', note: 'Suva i napukla koža', face: 'set-za-ekcem-po-telu' },
  { slug: 'kosa', label: 'Kosa', note: 'Rast, opadanje, nega', face: 'sampon-za-kosu-200ml' },
  { slug: 'preparati-za-lice', label: 'Nega kože', note: 'Lice i telo, svaki dan', face: 'mleko-za-telo' },
  { slug: 'setovi', label: 'Setovi', note: 'Sve što ide zajedno', face: 'set-za-seboreju-sa-manjim-uljem' },
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
  <section class="shell py-14 lg:py-20">
    <SectionHead number="02" kicker="Po problemu" title="Šta vam treba?" :to="{ name: 'catalog' }" link="Svi proizvodi" />

    <ul class="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <li
        v-for="concern in concerns"
        :key="concern.slug"
        :class="concern.wide && 'lg:col-span-2 lg:row-span-2'"
      >
        <RouterLink
          :to="{ name: 'catalog', query: { kategorija: concern.slug } }"
          class="group relative block h-full overflow-hidden rounded-[1.25rem] bg-blush-50"
        >
          <div :class="concern.wide ? 'aspect-square lg:aspect-auto lg:h-full lg:min-h-[22rem]' : 'aspect-square'">
            <img
              v-if="concern.image"
              :src="concern.image"
              alt=""
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-silk)] group-hover:scale-[1.05]"
            />
          </div>

          <!-- The name sits on the picture, on a wash that deepens on hover -->
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/85 to-transparent px-4 pb-4 pt-10">
            <h3 class="font-display leading-none" :class="concern.wide ? 'text-2xl lg:text-4xl' : 'text-xl'">{{ concern.label }}</h3>
            <p class="mt-1.5 text-xs text-mist-500">{{ concern.note }}</p>
            <p class="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blush-500">
              {{ concern.count }} preparata
              <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

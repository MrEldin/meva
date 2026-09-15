<script setup>
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * One screen, one sentence, one button.
 *
 * The old opening was seven screens of a scrolling 3D scene. It was the best
 * thing on the site and the worst possible front door: a visitor who wants a
 * shampoo had to scroll past a film to find one. The scene still exists, one
 * click away under "Naša priča"; this is what someone arriving at a shop sees.
 */
const catalog = useCatalogStore()

const hero = computed(() =>
  catalog.products.find((p) => p.slug?.startsWith('set-za-seboreju-za-kosu-i-lice'))
  ?? catalog.products.find((p) => p.image)
  ?? null,
)
</script>

<template>
  <section class="border-b border-mist-200">
    <div class="shell grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
      <div class="order-2 lg:order-1">
        <p class="text-sm font-semibold uppercase tracking-[0.14em] text-blush-500">Novi Pazar · od 2010.</p>

        <h1 class="mt-4 text-[2.25rem] leading-[1.06] sm:text-5xl lg:text-[3.5rem]">
          Prirodna nega<br />kože i <span class="text-blush-500">kose</span>.
        </h1>

        <p class="mt-5 max-w-md text-base leading-relaxed text-mist-600 sm:text-lg">
          Ručno rađeni preparati u malim serijama, sa sastavom koji možete pročitati i razumeti.
          Ispitani u Institutu za javno zdravlje Vojvodine.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink
            :to="{ name: 'catalog' }"
            class="rounded-full bg-ink px-8 py-4 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-blush-500"
          >
            Pogledaj proizvode
          </RouterLink>
          <RouterLink
            :to="{ name: 'story' }"
            class="rounded-full border border-mist-300 px-8 py-4 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink"
          >
            Naša priča
          </RouterLink>
        </div>

        <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist-500">
          <li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-blush-400" /> Besplatna dostava</li>
          <li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-blush-400" /> Plaćanje pouzećem</li>
          <li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-blush-400" /> Bez registracije</li>
        </ul>
      </div>

      <div class="order-1 lg:order-2">
        <div class="relative overflow-hidden rounded-3xl bg-shell">
          <img
            v-if="hero?.image"
            :src="hero.image"
            :alt="hero.name"
            class="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
          />
          <div v-else class="aspect-[4/3] w-full lg:aspect-[5/4]" />
        </div>
      </div>
    </div>
  </section>
</template>

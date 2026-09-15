<script setup>
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * The opening, for a phone.
 *
 * White and pink, and the type is the only dark thing. One photograph, one
 * sentence, one pink button, and the three facts that decide a purchase.
 */
const catalog = useCatalogStore()

const hero = computed(() =>
  catalog.products.find((p) => p.slug?.startsWith('set-za-seboreju-za-kosu-i-lice'))
  ?? catalog.products.find((p) => p.image)
  ?? null,
)

const PROMISES = ['Besplatna dostava', 'Plaćanje pouzećem', 'Bez registracije']
</script>

<template>
  <section class="bg-paper">
    <div class="shell pb-6 pt-4 lg:pb-14 lg:pt-10">
      <div class="overflow-hidden rounded-[1.75rem] bg-blush-50 lg:grid lg:grid-cols-2 lg:items-center">
        <div class="p-6 pb-2 sm:p-8 lg:order-1 lg:p-14">
          <p class="text-[0.8125rem] font-bold uppercase tracking-wider text-blush-500">Prirodna kozmetika · Novi Pazar</p>

          <h1 class="mt-3 text-[2.125rem] leading-[1.1] sm:text-[2.75rem] lg:text-[3.25rem]">
            Koža koja se konačno smirila.
          </h1>

          <p class="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-mist-600 sm:text-base">
            Ručno rađeni preparati sa sastavom koji možete pročitati i razumeti.
            Ispitani u Institutu za javno zdravlje Vojvodine.
          </p>

          <RouterLink
            :to="{ name: 'catalog' }"
            class="mt-6 flex w-full items-center justify-center rounded-full bg-blush-500 px-8 py-4 text-base font-bold text-paper shadow-[0_10px_30px_-10px_rgba(179,97,126,0.6)] transition-colors hover:bg-blush-600 sm:inline-flex sm:w-auto"
          >
            Pogledaj proizvode
          </RouterLink>

          <ul class="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <li v-for="promise in PROMISES" :key="promise" class="flex items-center gap-1.5 text-[0.8125rem] font-medium text-mist-600">
              <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-blush-500" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ promise }}
            </li>
          </ul>
        </div>

        <div class="p-4 pt-2 sm:p-6 lg:order-2 lg:p-8">
          <div class="overflow-hidden rounded-[1.25rem]">
            <img
              v-if="hero?.image"
              :src="hero.image"
              :alt="hero.name"
              class="aspect-[4/3] w-full object-cover lg:aspect-square"
            />
            <div v-else class="aspect-[4/3] w-full bg-blush-100 lg:aspect-square" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

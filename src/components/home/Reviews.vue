<script setup>
import SectionHead from '@/components/home/SectionHead.vue'
import ProductFigure from '@/components/shop/ProductFigure.vue'
import { reviews } from '@/data/reviews'
import { useCatalogStore } from '@/stores/catalog'
import { computed } from 'vue'

/**
 * What customers wrote, against what they wrote it about.
 *
 * A review means more beside the jar it was left on, so each one that names a
 * product in this catalogue carries that product's cutout and links to it.
 * Three of the six name something the shop does not sell under that name --
 * "Hidratantna krema", "Serum za lice", "Nega tela" -- and those keep their
 * wording and take a quotation mark instead of a picture, rather than being
 * shown against a jar nobody said that about. The ones with a product lead,
 * so the first cards a visitor reads are the ones they can act on.
 */
const catalog = useCatalogStore()

const shown = computed(() => {
  const resolved = reviews.map((review) => ({
    ...review,
    item: review.slug ? (catalog.products.find((p) => p.slug === review.slug) ?? null) : null,
  }))

  return [...resolved].sort((a, b) => Number(Boolean(b.item)) - Number(Boolean(a.item))).slice(0, 4)
})
</script>

<template>
  <section class="bg-blush-50">
    <div class="shell py-10 lg:py-16">
      <SectionHead title="Šta kažu kupci" note="Iskustva iz recenzija, doslovno." />

      <ul class="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <li
          v-for="review in shown"
          :key="review.name + review.text.slice(0, 12)"
          class="flex flex-col rounded-[1.5rem] bg-paper p-5 ring-1 ring-blush-100 sm:p-6"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex gap-0.5" :aria-label="`${review.rating} od 5`">
              <svg v-for="n in review.rating" :key="n" viewBox="0 0 20 20" class="h-[1.0625rem] w-[1.0625rem] text-blush-400" fill="currentColor" aria-hidden="true">
                <path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />
              </svg>
            </div>
            <span class="-mt-3 font-display text-[2.5rem] leading-none text-blush-200" aria-hidden="true">&rdquo;</span>
          </div>

          <blockquote class="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink/75">{{ review.text }}</blockquote>

          <!-- Whom, and about what -->
          <component
            :is="review.item ? 'RouterLink' : 'div'"
            :to="review.item ? { name: 'product', params: { slug: review.item.slug } } : undefined"
            class="group mt-5 flex items-center gap-3 border-t border-blush-100 pt-4"
          >
            <span v-if="review.item" class="w-12 shrink-0 rounded-full ring-1 ring-blush-100">
              <ProductFigure :product="review.item" tint="rose" sizes="56px" />
            </span>
            <span v-else class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush-50 font-display text-[1.375rem] text-blush-400" aria-hidden="true">&ldquo;</span>

            <span class="min-w-0 flex-1">
              <span class="block text-[0.875rem] font-bold text-ink">{{ review.name }}</span>
              <span v-if="review.item" class="block truncate text-[0.8125rem] font-semibold text-blush-700 transition-colors group-hover:text-blush-600">
                {{ review.item.name }} →
              </span>
              <span v-else-if="review.product" class="block truncate text-[0.8125rem] text-ink/45">{{ review.product }}</span>
            </span>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>

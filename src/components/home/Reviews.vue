<script setup>
import SectionHead from '@/components/home/SectionHead.vue'
import { useReviewStore } from '@/stores/reviews'
import { computed, onMounted, ref } from 'vue'

/**
 * What customers wrote, against what they wrote it about.
 *
 * A review means more beside the jar it was left on, so each one attached to
 * a product carries that product's cutout and links to it; the API puts those
 * first. The rest keep the wording they arrived with and take a quotation
 * mark where the picture would be -- shown, but not against the wrong jar.
 *
 * Six fit before the fold on a desktop; a phone opens on three and the rest
 * are one press away, so the section does not become a page of its own.
 */
const reviews = useReviewStore()

const FIRST = 6
const FIRST_PHONE = 3

const expanded = ref(false)

const shown = computed(() => (expanded.value ? reviews.items : reviews.items.slice(0, FIRST)))
const more = computed(() => Math.max(reviews.items.length - FIRST, 0))

onMounted(reviews.load)
</script>

<template>
  <section v-if="reviews.items.length || reviews.loading" class="bg-blush-50">
    <div class="shell py-10 lg:py-16">
      <SectionHead title="Šta kažu kupci" note="Iskustva iz recenzija, doslovno." />

      <ul v-if="reviews.items.length" class="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <li
          v-for="(review, i) in shown"
          :key="review.id"
          class="flex flex-col rounded-[1.5rem] bg-paper p-5 ring-1 ring-blush-100 sm:p-6"
          :class="i >= FIRST_PHONE && !expanded ? 'hidden sm:flex' : ''"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex gap-0.5" :aria-label="`${review.rating} od 5`">
              <svg v-for="n in review.rating" :key="n" viewBox="0 0 20 20" class="h-[1.0625rem] w-[1.0625rem] text-blush-400" fill="currentColor" aria-hidden="true">
                <path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />
              </svg>
            </div>
            <span class="-mt-3 font-display text-[2.5rem] leading-none text-blush-200" aria-hidden="true">&rdquo;</span>
          </div>

          <blockquote class="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink/75">{{ review.body }}</blockquote>

          <!-- Whom, and about what -->
          <component
            :is="review.product ? 'RouterLink' : 'div'"
            :to="review.product ? { name: 'product', params: { slug: review.product.slug } } : undefined"
            class="group mt-5 flex items-center gap-3 border-t border-blush-100 pt-4"
          >
            <span v-if="review.product?.image" class="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-blush-50 ring-1 ring-blush-100">
              <img :src="review.product.image" :alt="review.product.name" loading="lazy" decoding="async" class="h-full w-full object-contain p-1" />
            </span>
            <span v-else class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush-50 font-display text-[1.375rem] text-blush-400" aria-hidden="true">&ldquo;</span>

            <span class="min-w-0 flex-1">
              <span class="block text-[0.875rem] font-bold text-ink">{{ review.name }}</span>
              <span v-if="review.product" class="block truncate text-[0.8125rem] font-semibold text-blush-700 transition-colors group-hover:text-blush-600">
                {{ review.product.name }} →
              </span>
              <span v-else-if="review.product_label" class="block truncate text-[0.8125rem] text-ink/45">{{ review.product_label }}</span>
            </span>
          </component>
        </li>
      </ul>

      <div v-else class="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <div v-for="n in 3" :key="n" class="h-44 animate-pulse rounded-[1.5rem] bg-paper/70" />
      </div>

      <!-- More: on a phone once there are more than three, anywhere once more than six -->
      <div v-if="reviews.items.length > FIRST_PHONE && !expanded" class="mt-6 text-center" :class="more ? '' : 'sm:hidden'">
        <button
          type="button"
          class="rounded-full bg-paper px-7 py-3 text-[0.875rem] font-bold text-blush-700 ring-1 ring-blush-200 transition-colors hover:bg-blush-100"
          @click="expanded = true"
        >
          Još recenzija
          <span class="sm:hidden">({{ reviews.items.length - FIRST_PHONE }})</span>
          <span v-if="more" class="hidden sm:inline">({{ more }})</span>
        </button>
      </div>
    </div>
  </section>
</template>

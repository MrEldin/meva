<script setup>
import { useCartStore } from '@/stores/cart'
import { ref } from 'vue'

/**
 * One product.
 *
 * The picture sits on a pink field that deepens when the pointer arrives, the
 * basket button rises out of the bottom of the image rather than taking up
 * room under it, and the price is set in the display face — the same face as
 * the headlines, so a grid of these reads as one designed thing rather than a
 * spreadsheet with photographs.
 *
 * On a phone, where there is no pointer to arrive, the button is simply there.
 */
defineProps({
  product: { type: Object, required: true },
  badge: { type: String, default: null },
  index: { type: Number, default: null },
})

const cart = useCartStore()
const added = ref(false)

function add(product) {
  cart.add(product)
  added.value = true
  setTimeout(() => (added.value = false), 1600)
}
</script>

<template>
  <article class="group relative">
    <div class="relative overflow-hidden rounded-[1.25rem] bg-blush-50 transition-colors duration-500 group-hover:bg-blush-100">
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block">
        <div class="aspect-[4/5] overflow-hidden">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-silk)] group-hover:scale-[1.06]"
          />
        </div>
      </RouterLink>

      <span
        v-if="index !== null"
        class="pointer-events-none absolute left-4 top-3 font-display text-sm text-ink/25"
      >{{ String(index + 1).padStart(2, '0') }}</span>

      <span
        v-if="badge"
        class="pointer-events-none absolute right-3 top-3 rounded-full bg-ink px-3 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-paper"
      >{{ badge }}</span>

      <!-- Rises out of the image on hover; always present on touch. -->
      <div class="absolute inset-x-2.5 bottom-2.5 translate-y-0 opacity-100 transition-all duration-400 ease-[var(--ease-silk)] lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
        <button
          type="button"
          class="w-full rounded-full py-3 text-[0.8125rem] font-semibold transition-colors duration-200"
          :class="added ? 'bg-blush-500 text-paper' : 'bg-ink text-paper hover:bg-blush-500'"
          @click="add(product)"
        >
          {{ added ? 'Dodato ✓' : 'Dodaj u korpu' }}
        </button>
      </div>
    </div>

    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="mt-3.5 flex items-baseline justify-between gap-3">
      <h3 class="text-[0.9375rem] font-medium leading-snug text-ink">{{ product.name }}</h3>
      <p class="shrink-0 font-display text-lg leading-none text-ink">{{ product.price?.amount ?? '' }}</p>
    </RouterLink>
    <p class="mt-0.5 text-xs text-mist-400">{{ product.price ? 'RSD' : 'Cena na upit' }}</p>
  </article>
</template>

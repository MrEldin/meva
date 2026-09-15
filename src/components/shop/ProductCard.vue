<script setup>
import { useCartStore } from '@/stores/cart'
import { ref } from 'vue'

/**
 * One product. A photograph, a name, a price, and one pink button.
 * The button is the only coloured thing on the card, so there is no question
 * of where to press.
 */
defineProps({
  product: { type: Object, required: true },
  badge: { type: String, default: null },
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
  <article class="flex flex-col rounded-[1.25rem] border border-blush-100 bg-paper p-2.5 transition-shadow hover:shadow-[0_16px_40px_-24px_rgba(179,97,126,0.35)]">
    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block flex-1">
      <div class="relative aspect-square overflow-hidden rounded-[0.875rem] bg-blush-50">
        <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" class="h-full w-full object-cover" />
        <span v-if="badge" class="absolute left-2.5 top-2.5 rounded-full bg-blush-500 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide text-paper">{{ badge }}</span>
      </div>
      <h3 class="mt-3 px-1 text-[0.9375rem] font-semibold leading-snug text-ink">{{ product.name }}</h3>
    </RouterLink>

    <p class="mt-1 px-1 text-[0.9375rem] font-bold text-blush-600">{{ product.price?.formatted ?? 'Cena na upit' }}</p>

    <button
      type="button"
      class="mt-3 w-full rounded-full py-3 text-[0.875rem] font-bold text-paper transition-colors"
      :class="added ? 'bg-blush-700' : 'bg-blush-500 hover:bg-blush-600'"
      @click="add(product)"
    >
      {{ added ? 'Dodato ✓' : 'Dodaj u korpu' }}
    </button>
  </article>
</template>

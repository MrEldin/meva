<script setup>
import { useCartStore } from '@/stores/cart'
import { ref } from 'vue'

/**
 * One product, the same everywhere it appears.
 *
 * The whole card is a link to the product, and the button on it adds to the
 * basket without leaving the page -- so the shortest route from seeing
 * something to owning it is one tap, and the longer route is still there for
 * anyone who wants to read the ingredients first.
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
  <article class="group relative flex flex-col">
    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block">
      <div class="relative aspect-square overflow-hidden rounded-2xl bg-shell">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-[1.04]"
        />
        <span
          v-if="badge"
          class="absolute left-3 top-3 rounded-full bg-blush-500 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-paper"
        >{{ badge }}</span>
      </div>

      <h3 class="mt-3.5 text-[0.9375rem] font-semibold leading-snug text-ink">{{ product.name }}</h3>
    </RouterLink>

    <p class="mt-1 text-[0.9375rem] font-bold text-ink">{{ product.price?.formatted ?? 'Cena na upit' }}</p>

    <button
      type="button"
      class="mt-3 w-full rounded-full py-3 text-sm font-semibold transition-colors duration-200"
      :class="added ? 'bg-blush-500 text-paper' : 'bg-ink text-paper hover:bg-blush-500'"
      @click="add(product)"
    >
      {{ added ? 'Dodato u korpu ✓' : 'Dodaj u korpu' }}
    </button>
  </article>
</template>

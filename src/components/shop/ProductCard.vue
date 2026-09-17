<script setup>
import ProductFigure from '@/components/shop/ProductFigure.vue'
import { useCartStore } from '@/stores/cart'
import { ref } from 'vue'

/**
 * One product, standing on its own light.
 *
 * The photograph has no background any more, so the card does not need a grey
 * box to put it in: the bottle floats on a tinted disc, casts its own shadow,
 * and lifts when the pointer is over it. The name, the price, and one pink
 * button -- still the only coloured surface, so there is no question of where
 * to press.
 */
defineProps({
  product: { type: Object, required: true },
  badge: { type: String, default: null },
  tint: { type: [Number, String], default: 0 },
  eager: { type: Boolean, default: false },
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
  <article class="group flex flex-col rounded-[1.5rem] border border-blush-100/80 bg-paper p-3 transition-all duration-500 hover:-translate-y-1 hover:border-blush-200 hover:shadow-[0_28px_60px_-34px_rgba(142,59,69,0.45)]">
    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block flex-1">
      <div class="relative">
        <ProductFigure :product="product" :tint="tint" :eager="eager" sizes="(min-width: 1024px) 22vw, 45vw" />
        <span
          v-if="badge"
          class="absolute left-0 top-0 rounded-full bg-blush-600 px-3 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-paper shadow-[0_6px_16px_-6px_rgba(142,59,69,0.6)]"
        >{{ badge }}</span>
      </div>
      <h3 class="mt-3 px-1 text-[0.9375rem] font-semibold leading-snug text-ink">{{ product.name }}</h3>
    </RouterLink>

    <p class="mt-1.5 px-1 text-[1.0625rem] font-bold text-blush-700">{{ product.price?.formatted ?? 'Cena na upit' }}</p>

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

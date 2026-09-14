<script setup>
import { money } from '@/lib/money'
import { useCartStore } from '@/stores/cart'
import { ref } from 'vue'

defineProps({
  product: { type: Object, required: true },
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
    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block">
      <div class="relative aspect-4/5 overflow-hidden bg-mist-50">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-silk)] group-hover:scale-[1.04]"
        />
        <div v-else class="flex h-full items-center justify-center">
          <span class="font-display text-3xl text-mist-300">Meva</span>
        </div>

        <span
          v-if="product.is_set"
          class="eyebrow absolute left-3 top-3 bg-paper/90 px-2.5 py-1.5 text-[0.5625rem] text-ink backdrop-blur-sm"
        >
          Set
        </span>
      </div>

      <div class="pt-4">
        <h3 class="font-display text-lg leading-snug text-ink transition-colors duration-300 group-hover:text-blush-600">
          {{ product.name }}
        </h3>
        <p class="mt-1.5 text-sm font-light tabular-nums text-mist-500">
          {{ product.price ? product.price.formatted : 'Cena na upit' }}
        </p>
      </div>
    </RouterLink>

    <button
      v-if="product.price"
      type="button"
      class="eyebrow mt-3 w-full border border-ink/12 py-3 text-ink transition-all duration-400 hover:border-ink hover:bg-ink hover:text-paper"
      :class="added && 'border-blush-500! bg-blush-500! text-paper!'"
      @click="add(product)"
    >
      {{ added ? 'Dodato ✓' : 'Dodaj u korpu' }}
    </button>
  </article>
</template>

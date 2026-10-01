<script setup>
import { computed } from 'vue'

/**
 * A product, standing rather than sitting.
 *
 * Sixty-seven of the seventy-three have a cutout -- the studio photograph with
 * the background removed -- and the API hands those out in place of the
 * photograph. A cutout stands in front of a low pink wall and rises above it
 * into the white of the page (see .stage in app.css); nothing boxes it in,
 * which is the point of a cutout. The six without a
 * cutout keep the square photograph, framed rather than floated so it does
 * not look like a mistake next to the others.
 */
const props = defineProps({
  product: { type: Object, required: true },
  sizes: { type: String, default: null },
  eager: { type: Boolean, default: false },
})

// Only when the API says so: six products have no cutout, and an older
// API answering without the flag should keep the framed photograph rather
// than float an opaque square on the stage.
const isCutout = computed(() => props.product?.has_cutout === true)
</script>

<template>
  <div class="relative aspect-square w-full" :class="isCutout ? 'stage' : ''">
    <img
      v-if="product.image"
      :src="product.image"
      :alt="product.name"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      :sizes="sizes ?? undefined"
      decoding="async"
      class="h-full w-full"
      :class="isCutout ? 'cutout object-contain p-[4%]' : 'rounded-[0.75rem] object-cover'"
    />
    <div v-else class="h-full w-full rounded-full bg-blush-50" />
  </div>
</template>

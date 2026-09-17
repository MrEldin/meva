<script setup>
import { computed } from 'vue'

/**
 * A product, standing rather than sitting.
 *
 * Sixty-seven of the seventy-three have a cutout -- the studio photograph with
 * the background removed -- and the API hands those out in place of the
 * photograph. A cutout gets a tinted disc that fades before its edge and a
 * shadow cast by the bottle's own silhouette. The six without one keep the
 * square photograph, which is framed rather than floated so it does not look
 * like a mistake next to the others.
 */
const props = defineProps({
  product: { type: Object, required: true },
  /** Picks the disc colour; pass the index in a grid so a row is not one hue. */
  tint: { type: [Number, String], default: 0 },
  sizes: { type: String, default: null },
  eager: { type: Boolean, default: false },
})

const TINTS = ['tint-rose', 'tint-peach', 'tint-sand', 'tint-pearl']

const tone = computed(() =>
  typeof props.tint === 'number' ? TINTS[props.tint % TINTS.length] : `tint-${props.tint}`,
)

// Only when the API says so: six products have no cutout, and an older
// API answering without the flag should keep the framed photograph rather
// than float an opaque square on a disc.
const isCutout = computed(() => props.product?.has_cutout === true)
</script>

<template>
  <div class="relative aspect-square w-full" :class="isCutout ? ['disc', tone] : ''">
    <img
      v-if="product.image"
      :src="product.image"
      :alt="product.name"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      :sizes="sizes ?? undefined"
      decoding="async"
      class="h-full w-full"
      :class="isCutout ? 'cutout object-contain p-[9%]' : 'rounded-[0.75rem] object-cover'"
    />
    <div v-else class="h-full w-full rounded-full bg-blush-50" />
  </div>
</template>

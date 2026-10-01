<script setup>
import logo from '@/assets/meva-logo.png'

/**
 * The wordmark, in whatever colour the place needs.
 *
 * The file is white on nothing, so it is used as a mask and filled with the
 * current text colour: ink on the pages, paper over a photograph. Size it
 * with a height class; the width follows the artwork's own proportions.
 */
defineProps({ label: { type: String, default: 'Meva Cosmetics' } })

const mask = `url(${logo})`
</script>

<template>
  <span
    role="img"
    :aria-label="label"
    class="brand-logo inline-block aspect-[801/336] w-auto bg-current"
    :style="{ maskImage: mask, WebkitMaskImage: mask }"
  />
</template>

<style scoped>
.brand-logo {
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
}
</style>

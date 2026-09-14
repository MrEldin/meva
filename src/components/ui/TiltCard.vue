<script setup>
import { gsap } from '@/lib/motion'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * A card that tilts in 3D towards the pointer, with a sheen that travels
 * across its face — the product photography reads as an object you could
 * pick up.
 */
const props = defineProps({
  max: { type: Number, default: 9 },
})

const root = ref(null)
const inner = ref(null)
let off = () => {}

onMounted(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return

  const el = root.value
  const card = inner.value
  const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' })
  const ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' })

  const move = (e) => {
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    ry((px - 0.5) * props.max * 2)
    rx((0.5 - py) * props.max * 2)
    card.style.setProperty('--mx', `${px * 100}%`)
    card.style.setProperty('--my', `${py * 100}%`)
  }
  const leave = () => {
    rx(0)
    ry(0)
  }

  el.addEventListener('pointermove', move)
  el.addEventListener('pointerleave', leave)
  off = () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerleave', leave)
  }
})

onBeforeUnmount(() => off())
</script>

<template>
  <div ref="root" class="tilt">
    <div ref="inner" class="tilt-card">
      <slot />
      <span class="tilt-sheen" aria-hidden="true" />
    </div>
  </div>
</template>

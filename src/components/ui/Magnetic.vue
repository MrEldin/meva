<script setup>
import { gsap } from '@/lib/motion'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Wraps a button or link so it leans towards the pointer while hovered and
 * springs back when it leaves — the small physicality that makes a control
 * feel like an object rather than a rectangle.
 */
const props = defineProps({
  strength: { type: Number, default: 0.35 },
})

const root = ref(null)
let off = () => {}

onMounted(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return

  const el = root.value
  const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
  const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })

  const move = (e) => {
    const rect = el.getBoundingClientRect()
    x((e.clientX - rect.left - rect.width / 2) * props.strength)
    y((e.clientY - rect.top - rect.height / 2) * props.strength)
  }
  const leave = () => {
    x(0)
    y(0)
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
  <div ref="root" class="inline-block will-change-transform">
    <slot />
  </div>
</template>

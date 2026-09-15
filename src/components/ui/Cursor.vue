<script setup>
import { gsap } from '@/lib/motion'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * A custom pointer for mouse users: a dot that follows the cursor and a ring
 * that lags behind it, grows over anything clickable, and turns into a label
 * ("Prevuci", "Pogledaj") over elements that declare `data-cursor`.
 */
const dot = ref(null)
const ring = ref(null)
const label = ref('')
const mode = ref('')
const enabled = ref(false)

let cleanup = () => {}

onMounted(async () => {
  if (!window.matchMedia('(pointer: fine)').matches) return

  enabled.value = true
  await nextTick() // the dot and ring render only once enabled
  document.documentElement.classList.add('has-cursor')

  // The dot is written straight to the transform on every move: a tween, however
  // short, puts the pointer behind the hand, and a pointer that trails feels
  // broken rather than smooth. Only the ring is allowed to lag, and less than
  // it used to.
  const setDot = gsap.quickSetter(dot.value, 'css')
  const ringX = gsap.quickTo(ring.value, 'x', { duration: 0.18, ease: 'power2' })
  const ringY = gsap.quickTo(ring.value, 'y', { duration: 0.18, ease: 'power2' })

  const labels = { drag: 'Prevuci', view: 'Pogledaj', play: 'Pusti' }

  const move = (e) => {
    setDot({ x: e.clientX, y: e.clientY })
    ringX(e.clientX)
    ringY(e.clientY)

    const target = e.target.closest?.('[data-cursor], a, button, [role=button], input, textarea, select')
    const kind = target?.dataset?.cursor

    if (kind && labels[kind]) {
      mode.value = 'label'
      label.value = labels[kind]
    } else if (target) {
      mode.value = 'hover'
      label.value = ''
    } else {
      mode.value = ''
      label.value = ''
    }
  }

  const down = () => (mode.value = mode.value === 'label' ? 'label-down' : 'down')
  const up = () => (mode.value = mode.value === 'label-down' ? 'label' : '')
  const leave = () => gsap.to([dot.value, ring.value], { opacity: 0, duration: 0.3 })
  const enter = () => gsap.to([dot.value, ring.value], { opacity: 1, duration: 0.3 })

  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', down)
  window.addEventListener('pointerup', up)
  document.documentElement.addEventListener('mouseleave', leave)
  document.documentElement.addEventListener('mouseenter', enter)

  cleanup = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointerup', up)
    document.documentElement.removeEventListener('mouseleave', leave)
    document.documentElement.removeEventListener('mouseenter', enter)
    document.documentElement.classList.remove('has-cursor')
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <div v-if="enabled" class="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference" aria-hidden="true">
    <div ref="dot" class="cursor-dot" :class="mode" />
    <div ref="ring" class="cursor-ring" :class="mode">
      <span class="cursor-label">{{ label }}</span>
    </div>
  </div>
</template>

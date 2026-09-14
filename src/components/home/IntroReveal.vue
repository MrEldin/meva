<script setup>
import { gsap, prefersReducedMotion } from '@/lib/motion'
import { onMounted, ref } from 'vue'

const emit = defineEmits(['done'])

const KEY = 'meva.intro-seen'
const letters = ['M', 'E', 'V', 'A']

const root = ref(null)
const show = ref(false)

onMounted(() => {
  // Once per session. A curtain that plays on every navigation stops being a
  // welcome and becomes an obstacle.
  if (sessionStorage.getItem(KEY) || prefersReducedMotion()) {
    emit('done')

    return
  }

  show.value = true
  sessionStorage.setItem(KEY, '1')

  requestAnimationFrame(() => {
    const tl = gsap.timeline({ onComplete: () => { show.value = false; emit('done') } })

    tl.from('.intro-letter', { yPercent: 110, duration: 0.9, stagger: 0.07, ease: 'power4.out' }, 0.1)
      .from('.intro-sub', { opacity: 0, letterSpacing: '0.6em', duration: 0.8 }, 0.6)
      .to('.intro-rule', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 0.7)
      .to(root.value, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 1.7)
  })
})
</script>

<template>
  <Teleport to="body">
  <div
    v-if="show"
    ref="root"
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-paper"
    aria-hidden="true"
  >
    <div class="flex overflow-hidden font-display text-[22vw] leading-none tracking-tight sm:text-[13vw]">
      <span v-for="letter in letters" :key="letter" class="intro-letter inline-block">{{ letter }}</span>
    </div>
    <span class="intro-sub eyebrow mt-3 text-paper/60">cosmetics</span>
    <span class="intro-rule mt-8 block h-px w-24 origin-left scale-x-0 bg-blush-400" />
  </div>
  </Teleport>
</template>

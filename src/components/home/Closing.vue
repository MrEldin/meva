<script setup>
import { splitLines, useMotion } from '@/lib/motion'
import { ref } from 'vue'

const root = ref(null)

useMotion(root, (gsap, el) => {
  const split = splitLines(el.querySelector('.closing-title'))
  gsap.from(split.lines, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 70%' } })
  gsap.from('.closing-cta', { opacity: 0, y: 20, duration: 1, delay: 0.4, scrollTrigger: { trigger: el, start: 'top 70%' } })
})
</script>

<template>
  <section ref="root" class="relative overflow-hidden bg-ink py-28 text-paper md:py-44">
    <div class="pointer-events-none absolute left-1/2 top-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush-500/10 blur-3xl md:h-[50vw] md:w-[50vw]" />
    <div class="shell relative text-center">
      <h2 class="closing-title mx-auto max-w-4xl font-display text-[2.75rem] leading-[1.02] sm:text-6xl md:text-8xl">
        Vaša koža zna<br />
        <span class="italic text-blush-300">šta joj treba.</span>
      </h2>
      <div class="closing-cta mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <RouterLink :to="{ name: 'catalog' }" class="eyebrow group relative inline-flex items-center gap-3 overflow-hidden bg-paper px-10 py-5 text-ink">
          <span class="absolute inset-0 -translate-x-full bg-blush-500 transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-0" />
          <span class="relative group-hover:text-paper">Pogledaj sve preparate</span>
          <span class="relative transition-transform duration-500 group-hover:translate-x-1.5 group-hover:text-paper">→</span>
        </RouterLink>
        <a href="https://www.instagram.com/meva.cosmetics/" target="_blank" rel="noopener" class="eyebrow text-paper/60 hover:text-blush-300">
          @meva.cosmetics
        </a>
      </div>
    </div>
  </section>
</template>

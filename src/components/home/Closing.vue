<script setup>
import Magnetic from '@/components/ui/Magnetic.vue'
import { gsap, prefersReducedMotion, splitLines } from '@/lib/motion'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const root = ref(null)
let ctx

onMounted(() => {
  if (prefersReducedMotion()) return

  ctx = gsap.context(() => {
    const split = splitLines(root.value.querySelector('.closing-title'))
    gsap.from(split.lines, { yPercent: 110, stagger: 0.1, duration: 1.2, scrollTrigger: { trigger: root.value, start: 'top 70%' } })
    gsap.from(root.value.querySelectorAll('.closing-item'), { y: 30, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: root.value, start: 'top 60%' } })
  }, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="relative overflow-hidden bg-ink text-paper" data-surface="dark">
    <div class="pointer-events-none absolute inset-x-0 -bottom-1/2 h-[80vh] bg-[radial-gradient(50%_60%_at_50%_100%,rgba(179,97,126,0.35),transparent_70%)]" />
    <div class="shell relative py-28 text-center lg:py-44">
      <h2 class="closing-title mx-auto max-w-4xl font-display text-5xl leading-[0.98] lg:text-8xl">
        Vaša koža zna<br />šta joj <em class="italic text-blush-300">treba</em>.
      </h2>
      <div class="mt-12 flex flex-wrap items-center justify-center gap-6">
        <Magnetic>
          <RouterLink :to="{ name: 'catalog' }" class="closing-item btn-fill group relative inline-block overflow-hidden bg-paper px-10 py-5 text-ink">
            <span class="relative z-10 eyebrow transition-colors duration-500 group-hover:text-paper">Pogledaj sve preparate</span>
          </RouterLink>
        </Magnetic>
        <Magnetic :strength="0.25">
          <a href="#pronadji" class="closing-item eyebrow border-b border-paper/40 pb-1 transition-colors hover:border-blush-300 hover:text-blush-300">Pronađi svoj</a>
        </Magnetic>
      </div>
      <p class="closing-item mt-16 text-sm font-light text-paper/45">
        Besplatna dostava u celoj Srbiji · plaćanje pouzećem ·
        <a href="https://instagram.com/mevakozmetika" target="_blank" rel="noopener" class="text-paper/70 underline-offset-4 hover:text-blush-300 hover:underline">@mevakozmetika</a>
      </p>
    </div>
  </section>
</template>

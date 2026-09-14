<script setup>
import Magnetic from '@/components/ui/Magnetic.vue'
import { gsap, prefersReducedMotion } from '@/lib/motion'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const root = ref(null)
let ctx

onMounted(() => {
  if (prefersReducedMotion()) return

  ctx = gsap.context(() => {
    gsap.from(root.value.querySelectorAll('.closing-title .rise'), { yPercent: 110, stagger: 0.1, duration: 1.2, scrollTrigger: { trigger: root.value, start: 'top 70%' } })
    gsap.from(root.value.querySelectorAll('.closing-item'), { y: 30, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: root.value, start: 'top 60%' } })
  }, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="bg-cream px-5 pb-5 text-forest sm:px-10 lg:px-16">
    <div class="mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-clay-500 px-8 py-14 sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16 lg:py-20">
      <div>
        <p class="closing-item eyebrow">Pismo iz Meve</p>
        <h2 class="closing-title mt-4 max-w-2xl font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl">
          <span class="block line-mask"><span class="rise block">Vaša koža zna</span></span>
          <span class="block line-mask"><span class="rise block">šta joj <em class="italic text-blush-100">treba</em>.</span></span>
        </h2>
      </div>
      <div class="mt-10 flex flex-wrap items-center gap-4 lg:mt-0">
        <Magnetic>
          <RouterLink :to="{ name: 'catalog' }" class="closing-item pill bg-forest text-cream hover:bg-forest-soft">
            Pogledaj sve preparate
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4"><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </RouterLink>
        </Magnetic>
        <Magnetic :strength="0.25">
          <a href="#pronadji" class="closing-item pill border border-forest/30 hover:bg-forest hover:text-cream">Pronađi svoj</a>
        </Magnetic>
      </div>
    </div>
  </section>
</template>

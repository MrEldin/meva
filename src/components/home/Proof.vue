<script setup>
import TiltCard from '@/components/ui/TiltCard.vue'
import { reviews } from '@/data/reviews'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Evidence: the sales figures counting up, and customers in their own words
 * on a rail the visitor can drag.
 */
const root = ref(null)
const rail = ref(null)

const figures = [
  { value: 5480, label: 'porudžbina', note: 'od januara 2024.' },
  { value: 3964, label: 'kupaca', note: 'koji se vraćaju 1,4 puta' },
  { value: 73, label: 'preparata', note: 'svaki rađen ručno' },
  { value: 16, label: 'godina', note: 'od 2010. u Novom Pazaru' },
]

let ctx
let drag

onMounted(() => {
  if (prefersReducedMotion()) return

  ctx = gsap.context(() => {
    // Numbers count up once, when they arrive.
    root.value.querySelectorAll('.figure').forEach((el) => {
      const target = Number(el.dataset.value)
      const state = { v: 0 }
      gsap.to(state, {
        v: target,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onUpdate: () => (el.textContent = new Intl.NumberFormat('sr-RS').format(Math.round(state.v))),
      })
    })

    gsap.from(root.value.querySelectorAll('.review'), {
      y: 50,
      opacity: 0,
      stagger: 0.08,
      duration: 1,
      scrollTrigger: { trigger: rail.value, start: 'top 80%' },
    })
  }, root.value)

  // Grab-to-scroll on the review rail.
  const el = rail.value
  let startX = 0
  let startScroll = 0
  const down = (e) => {
    drag = true
    startX = e.clientX
    startScroll = el.scrollLeft
    el.classList.add('is-dragging')
  }
  const move = (e) => {
    if (!drag) return
    el.scrollLeft = startScroll - (e.clientX - startX)
  }
  const up = () => {
    drag = false
    el.classList.remove('is-dragging')
  }
  el.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  ctx.add(() => () => {
    el.removeEventListener('pointerdown', down)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  })

  requestAnimationFrame(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="bg-cream text-forest">
    <div class="shell pt-20 lg:pt-28">
      <div class="grid gap-10 border-b border-forest pb-12 lg:grid-cols-12 lg:gap-6">
        <div class="lg:col-span-4">
          <p class="eyebrow text-clay-500">03 / Dokazano</p>
          <h2 class="mt-4 font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">Brojke,<br />ne obećanja.</h2>
        </div>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-8 lg:grid-cols-4">
          <div v-for="f in figures" :key="f.label">
            <dt class="eyebrow text-[0.5625rem] text-forest/55">{{ f.label }}</dt>
            <dd class="figure mt-3 font-display text-5xl tabular-nums leading-none lg:text-6xl" :data-value="f.value">0</dd>
            <dd class="mt-3 text-xs text-forest/55">{{ f.note }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="pt-14 lg:pt-20">
      <div class="shell flex items-end justify-between">
        <h3 class="font-display text-3xl tracking-tight lg:text-4xl">Rečeno o preparatima</h3>
        <span class="eyebrow hidden text-forest/50 lg:inline">Prevuci →</span>
      </div>
      <div
        ref="rail"
        class="review-rail mt-8 flex cursor-grab gap-5 overflow-x-auto px-5 pb-20 scrollbar-none select-none sm:px-10 lg:px-16"
        data-cursor="drag"
      >
        <TiltCard v-for="(r, i) in reviews" :key="i" :max="5" class="review w-[80vw] shrink-0 sm:w-[24rem]">
          <blockquote class="flex h-full min-h-[18rem] flex-col justify-between rounded-[1.5rem] bg-sand p-8">
            <div>
              <div class="flex gap-1 text-blush-500" aria-label="5 od 5">
                <svg v-for="n in r.rating" :key="n" viewBox="0 0 20 20" class="h-3.5 w-3.5 fill-current"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z" /></svg>
              </div>
              <p class="mt-6 font-display text-xl leading-snug">“{{ r.text }}”</p>
            </div>
            <footer class="mt-8 flex items-center justify-between">
              <span class="text-sm font-semibold">{{ r.name }}</span>
              <span class="eyebrow text-[0.5625rem] text-forest/50">{{ r.product }}</span>
            </footer>
          </blockquote>
        </TiltCard>
      </div>
    </div>
  </section>
</template>

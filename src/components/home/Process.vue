<script setup>
import { useMotion } from '@/lib/motion'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

const catalog = useCatalogStore()
const root = ref(null)

// What the brand has always said about itself, not invented for the page.
const steps = [
  { n: '01', title: 'Sastojci koji imaju razlog', body: 'Biljna ulja, ekstrakti i maslaci — svaki zato što nešto radi, nijedan da bi lista bila duža.' },
  { n: '02', title: 'Male serije, ručno', body: 'Preparati se prave u malim količinama, pa je ono što dobijete sveže, a ne sa police od pre godinu dana.' },
  { n: '03', title: 'Za stanja koja druge zaobilaze', body: 'Seboreja, ekcem, psorijaza, rozacea. Kuća je nastala jer je gotova kozmetika ovim ljudima retko pomagala.' },
]

const pictures = computed(() =>
  ['keratin-regenerator', 'krema-protiv-bora', 'ulje-za-vene-200ml']
    .map((slug) => catalog.products.find((p) => p.slug === slug && p.image)?.image)
    .filter(Boolean),
)

useMotion(root, (gsap, el) => {
  gsap.utils.toArray('.process-step', el).forEach((step, i) => {
    gsap.from(step, { x: -30, opacity: 0, duration: 1, scrollTrigger: { trigger: step, start: 'top 80%' } })
    gsap.from(step.querySelector('.process-n'), { yPercent: 40, duration: 1.2, scrollTrigger: { trigger: step, start: 'top 80%' } })
  })

  gsap.utils.toArray('.process-picture', el).forEach((pic, i) => {
    gsap.to(pic, { yPercent: -12 - i * 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
})
</script>

<template>
  <section ref="root" class="bg-blush-50 py-24 md:py-36">
    <div class="shell grid gap-16 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <p class="eyebrow text-blush-500">Kako nastaje</p>
        <h2 class="mt-5 font-display text-4xl leading-[1.02] text-ink md:text-6xl">
          Tri stvari koje ne menjamo
        </h2>

        <ol class="mt-14 space-y-12">
          <li v-for="step in steps" :key="step.n" class="process-step flex gap-6">
            <span class="process-n font-display text-5xl leading-none text-blush-300 md:text-6xl">{{ step.n }}</span>
            <div class="pt-2">
              <h3 class="font-display text-2xl text-ink">{{ step.title }}</h3>
              <p class="mt-3 max-w-sm text-sm font-light leading-relaxed text-mist-600">{{ step.body }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Overlapping pictures, each on its own parallax speed -->
      <div class="relative hidden h-[44rem] lg:col-span-7 lg:block">
        <div class="process-picture absolute left-[8%] top-0 w-[46%] overflow-hidden"><img v-if="pictures[0]" :src="pictures[0]" alt="" class="aspect-[3/4] w-full object-cover" /></div>
        <div class="process-picture absolute right-0 top-[18%] w-[40%] overflow-hidden"><img v-if="pictures[1]" :src="pictures[1]" alt="" class="aspect-square w-full object-cover" /></div>
        <div class="process-picture absolute bottom-0 left-[30%] w-[38%] overflow-hidden shadow-[0_30px_80px_-30px_rgba(10,10,10,0.35)]"><img v-if="pictures[2]" :src="pictures[2]" alt="" class="aspect-[4/5] w-full object-cover" /></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useMotion } from '@/lib/motion'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

const catalog = useCatalogStore()
const root = ref(null)

// The two products that carry 41% of everything the house has ever sold. They
// earn the page's one pinned, scroll-driven section.
const stories = [
  {
    slug: 'sampon-za-kosu-200ml',
    eyebrow: 'N°10 · Kosa',
    title: 'Šampon koji je promenio kako ljudi peru kosu.',
    body: 'Najprodavaniji preparat kuće. Bez sulfata i silikona, za kožu glave koja reaguje na sve ostalo.',
  },
  {
    slug: 'losion-za-seboreicni-dermatitis',
    eyebrow: 'Seboreja',
    title: 'Losion za koji se kupci vraćaju, u proseku, svakih šest nedelja.',
    body: 'Razvijen za seboreični dermatitis. Umiruje perutanje i svrab, a koža glave ostaje čista između pranja.',
  },
]

const items = computed(() =>
  stories
    .map((story) => ({ ...story, product: catalog.products.find((p) => p.slug === story.slug) }))
    .filter((s) => s.product?.image),
)

useMotion(root, (gsap, el) => {
  const mm = gsap.matchMedia()

  // Desktop: pin the section; scrolling scrubs from story one to story two.
  mm.add('(min-width: 1024px)', () => {
    const panels = gsap.utils.toArray('.showcase-copy', el)
    const images = gsap.utils.toArray('.showcase-image', el)

    if (panels.length < 2) return

    gsap.set(panels[1], { yPercent: 40, opacity: 0 })
    gsap.set(images[1], { clipPath: 'inset(100% 0 0 0)' })

    gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top top', end: '+=140%', pin: true, scrub: 0.6 },
    })
      .to(panels[0], { yPercent: -30, opacity: 0, duration: 0.8 }, 0)
      .to(panels[1], { yPercent: 0, opacity: 1, duration: 0.8 }, 1.0)
      .to(images[1], { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power2.inOut' }, 0.3)
      .to(images[0], { scale: 1.1, duration: 1.4 }, 0)
  })

  // Mobile: each story reveals on its own.
  mm.add('(max-width: 1023px)', () => {
    gsap.utils.toArray('.showcase-story', el).forEach((story) => {
      gsap.from(story.querySelector('img'), { scale: 1.2, duration: 1.6, scrollTrigger: { trigger: story, start: 'top 80%', end: 'bottom top', scrub: true } })
      gsap.from(story.querySelector('.showcase-copy'), { y: 40, opacity: 0, duration: 1, scrollTrigger: { trigger: story, start: 'top 70%' } })
    })
  })
})
</script>

<template>
  <section ref="root" class="relative bg-ink text-paper">
    <!-- Desktop, pinned -->
    <div class="hidden min-h-screen lg:grid lg:grid-cols-2">
      <div class="relative flex items-center">
        <div class="shell py-24">
          <p class="eyebrow text-blush-300">Dokazano prodajom</p>
          <div class="relative mt-8 h-[22rem]">
            <div v-for="item in items" :key="item.slug" class="showcase-copy absolute inset-0">
              <p class="eyebrow text-paper/45">{{ item.eyebrow }}</p>
              <h2 class="mt-5 max-w-xl font-display text-5xl leading-[1.02] xl:text-6xl">{{ item.title }}</h2>
              <p class="mt-6 max-w-md text-base font-light leading-relaxed text-paper/65">{{ item.body }}</p>
              <RouterLink :to="{ name: 'product', params: { slug: item.slug } }" class="eyebrow mt-9 inline-flex items-center gap-3 border-b border-paper/30 pb-2 hover:border-blush-300 hover:text-blush-300">
                {{ item.product.price?.formatted }} — Pogledaj
                <span>→</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
      <div class="relative overflow-hidden">
        <div v-for="item in items" :key="item.slug" class="showcase-image absolute inset-0">
          <img :src="item.product.image" :alt="item.product.name" class="h-full w-full object-cover" />
        </div>
      </div>
    </div>

    <!-- Mobile, stacked -->
    <div class="lg:hidden">
      <div v-for="item in items" :key="item.slug" class="showcase-story">
        <div class="aspect-[4/5] overflow-hidden">
          <img :src="item.product.image" :alt="item.product.name" class="h-full w-full object-cover" />
        </div>
        <div class="showcase-copy shell py-12">
          <p class="eyebrow text-blush-300">{{ item.eyebrow }}</p>
          <h2 class="mt-4 font-display text-3xl leading-[1.05]">{{ item.title }}</h2>
          <p class="mt-5 text-sm font-light leading-relaxed text-paper/65">{{ item.body }}</p>
          <RouterLink :to="{ name: 'product', params: { slug: item.slug } }" class="eyebrow mt-7 inline-flex items-center gap-3 border-b border-paper/30 pb-2">
            {{ item.product.price?.formatted }} — Pogledaj <span>→</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

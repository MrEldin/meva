<script setup>
import { gsap, splitLines, useMotion } from '@/lib/motion'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  // The intro curtain hands off here; the headline waits for it.
  ready: { type: Boolean, default: false },
})

const catalog = useCatalogStore()
const root = ref(null)

// What the house actually treats. Leading with the condition, not the product,
// is the brand's own angle and the thing a template cannot say.
const problems = ['seboreju.', 'ekcem.', 'psorijazu.', 'akne.', 'suvu kožu.']

const hero = computed(
  () =>
    catalog.products.find((p) => p.slug === 'losion-za-seboreicni-dermatitis' && p.image)
    ?? catalog.products.find((p) => p.image),
)

let played = false

function play() {
  if (played) return
  played = true

  const q = gsap.utils.selector(root.value)
  const split = splitLines(q('.hero-title')[0])

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

  gsap.set(q('.hero-word').slice(1), { yPercent: 110 })

  tl.from(split.lines, { yPercent: 110, duration: 1.2, stagger: 0.09 }, 0)
    .from(q('.hero-rotator > span'), { yPercent: 110, duration: 1.2 }, 0.18)
    .from(q('.hero-eyebrow'), { opacity: 0, y: 12, duration: 0.8 }, 0.35)
    .from(q('.hero-copy'), { opacity: 0, y: 24, duration: 1 }, 0.55)
    .from(q('.hero-cta'), { opacity: 0, y: 24, duration: 1, stagger: 0.1 }, 0.7)
    .from(q('.hero-image'), { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.inOut' }, 0.15)
    .from(q('.hero-image img'), { scale: 1.25, duration: 2.2, ease: 'power3.out' }, 0.15)
    .from(q('.hero-cue'), { scaleY: 0, duration: 0.8 }, 1.2)

  // The condition rotates in the pink italic: one word masks out as the next
  // masks in, forever.
  const words = q('.hero-word')
  const rotate = gsap.timeline({ repeat: -1, delay: 1.6 })

  words.forEach((word, i) => {
    const next = words[(i + 1) % words.length]

    rotate
      .to(word, { yPercent: -110, duration: 0.7, ease: 'power3.inOut' }, `+=2.1`)
      .fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'power3.inOut' }, '<')
  })

}

useMotion(
  root,
  (gsap, el) => {
    // Parallax: the product drifts slower than the page; the blush fields
    // slower still, so the hero has depth without a single fake 3D trick.
    gsap.to('.hero-image-m img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero-image', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero-blob-a', { yPercent: 40, x: 60, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero-blob-b', { yPercent: -30, x: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero-text', { yPercent: -10, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: el, start: '40% top', end: 'bottom top', scrub: true } })

    // Blobs breathe on their own, independent of scroll.
    gsap.to('.hero-blob-a', { scale: 1.12, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    gsap.to('.hero-blob-b', { scale: 0.9, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    if (props.ready) play()
  },
  // Reduced motion: everything simply visible.
  (el) => gsap.set(el.querySelectorAll('.hero-word:not(:first-child)'), { display: 'none' }),
)

watch(() => props.ready, (ready) => ready && play())
</script>

<template>
  <section ref="root" class="relative min-h-svh overflow-hidden bg-paper">
    <!-- Colour fields -->
    <div class="hero-blob-a pointer-events-none absolute -right-[20%] top-[8%] h-[70vw] w-[70vw] rounded-full bg-blush-100 blur-3xl md:h-[42vw] md:w-[42vw]" />
    <div class="hero-blob-b pointer-events-none absolute -left-[25%] bottom-[-10%] h-[60vw] w-[60vw] rounded-full bg-mist-100 blur-3xl md:h-[36vw] md:w-[36vw]" />

    <!-- Vertical eyebrow, desktop -->
    <p class="hero-eyebrow eyebrow writing-vertical absolute left-6 top-1/2 hidden -translate-y-1/2 text-mist-400 lg:block xl:left-10">
      Prirodna kozmetika — Novi Pazar
    </p>

    <!-- Mobile: product first, bleeding into the headline -->
    <div class="relative h-[58svh] lg:hidden">
      <div class="hero-image-m absolute inset-0 overflow-hidden bg-mist-100">
        <img v-if="hero" :src="hero.image" :alt="hero.name" class="h-full w-full object-cover object-top" />
      </div>
      <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper via-paper/70 to-transparent" />
    </div>

    <div class="shell relative grid grid-cols-1 items-end pb-16 lg:min-h-svh lg:grid-cols-12 lg:items-center lg:pb-0">
      <!-- Copy -->
      <div class="hero-text relative z-10 -mt-24 lg:mt-0 lg:col-span-7 lg:pr-6">
        <p class="hero-eyebrow eyebrow text-blush-500 lg:hidden">Prirodna kozmetika</p>

        <h1 class="mt-5 font-display text-[3.2rem] leading-[0.98] tracking-[-0.02em] text-ink sm:text-7xl lg:mt-0 lg:text-[6.2rem] xl:text-[7rem]">
          <span class="hero-title block">Nega koja<br />rešava</span>
          <span class="hero-rotator block overflow-hidden italic text-blush-500">
            <span class="relative grid">
              <span
                v-for="word in problems"
                :key="word"
                class="hero-word col-start-1 row-start-1 whitespace-nowrap will-change-transform"
              >{{ word }}</span>
            </span>
          </span>
        </h1>

        <p class="hero-copy mt-8 max-w-md text-base font-light leading-relaxed text-mist-600 md:text-lg">
          Preparati rađeni ručno, u malim serijama, za kožu i kosu koje su drugi
          proizvodi zaobišli. Bez čuda — sa sastojcima koji rade.
        </p>

        <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <RouterLink
            :to="{ name: 'catalog' }"
            class="hero-cta eyebrow group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-ink px-9 py-5 text-paper"
          >
            <span class="absolute inset-0 -translate-x-full bg-blush-500 transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-0" />
            <span class="relative">Pronađi svoj preparat</span>
            <span class="relative transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </RouterLink>
          <a href="#problemi" class="hero-cta group eyebrow inline-flex items-center gap-3 py-5 text-ink hover:text-blush-600">
            Počni od problema
            <span class="h-px w-8 bg-current transition-all duration-500 group-hover:w-12" />
          </a>
        </div>
      </div>

      <!-- Product, desktop -->
      <div class="relative hidden lg:col-span-5 lg:block">
        <div class="hero-image relative aspect-[3/4] overflow-hidden bg-mist-100" style="clip-path: inset(0 0 0 0)">
          <img v-if="hero" :src="hero.image" :alt="hero.name" class="h-full w-full object-cover" />
        </div>
        <RouterLink
          v-if="hero"
          :to="{ name: 'product', params: { slug: hero.slug } }"
          class="group absolute -left-10 bottom-10 flex items-center gap-4 bg-paper px-5 py-4 shadow-[0_20px_60px_-20px_rgba(10,10,10,0.25)]"
        >
          <span class="eyebrow text-[0.5625rem] text-blush-500">Najprodavanije</span>
          <span class="font-display text-base text-ink">{{ hero.name }}</span>
          <span class="text-ink transition-transform duration-500 group-hover:translate-x-1">→</span>
        </RouterLink>
      </div>
    </div>

    <div class="hero-cue absolute bottom-6 left-1/2 hidden h-16 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-ink/50 to-transparent lg:block" />
  </section>
</template>

<script setup>
import Magnetic from '@/components/ui/Magnetic.vue'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { BACK_ROTATION } from '@/three/bottles'
import { defaultState, Stage } from '@/three/Stage'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const clamp = (v) => Math.max(0, Math.min(1, v))

/**
 * The opening scene. The section is five screens tall; a sticky viewport
 * holds the WebGL stage while the scroll position drives one timeline that
 * spins and re-frames the bottle and hands the copy from chapter to chapter.
 */
const catalog = useCatalogStore()
const cart = useCartStore()

const root = ref(null)
const canvas = ref(null)
const calloutEls = ref([])

const hero = computed(() => catalog.products.find((p) => p.slug === 'losion-za-seboreicni-dermatitis'))
const set = computed(() => catalog.products.find((p) => p.slug === 'set-za-seboreju-sa-manjim-uljem'))

// Ingredient callouts hang off leaders fixed to the label in 3D, so they turn
// with the bottle and fade as their point on the label turns away.
const callouts = [
  { key: 'lavanda', name: 'Hidrolat lavande', role: 'smiruje i dezinfikuje' },
  { key: 'salicilna', name: 'Salicilna kiselina', role: 'skida perut, otvara folikule' },
  { key: 'niacinamid', name: 'Niacinamid (B3)', role: 'obnavlja barijeru kože' },
  { key: 'cajevac', name: 'Ulje čajevca', role: 'protiv gljivica i bakterija' },
]

const added = ref('')
// Without WebGL (old GPU, privacy settings, some in-app browsers) the scene
// gives way to the photograph, and the scroll story still runs on the copy.
const webgl = ref(true)

function add(product) {
  if (!product) return
  cart.add(product)
  added.value = product.slug
  setTimeout(() => (added.value = ''), 1800)
}

let stage
let ctx
let observer

onMounted(() => {
  try {
    stage = new Stage(canvas.value)
  } catch (error) {
    console.warn('Meva: 3D scene unavailable, using the photograph instead.', error)
    webgl.value = false
    stage = {
      state: { ...defaultState, lift: 1 },
      size: { width: 1, height: 1 },
      project: () => ({ x: -999, y: -999, facing: 0 }),
      dispose: () => {},
    }
  }

  // Render only while on screen.
  observer = new IntersectionObserver(([entry]) => (stage.visible = entry.isIntersecting), { threshold: 0 })
  observer.observe(root.value)

  const reduced = prefersReducedMotion()
  const desktop = window.matchMedia('(min-width: 1024px)').matches

  ctx = gsap.context(() => {
    const q = gsap.utils.selector(root.value)
    const s = stage.state

    // Entrance: the bottle rises on the right, the word-mark and first chapter fade in.
    gsap.set(s, { lift: 0, offsetX: desktop ? 1.35 : 0 })
    gsap.timeline({ delay: 0.15 })
      .to(s, { lift: 1, rotation: -0.3, duration: reduced ? 0 : 1.8, ease: 'power3.out' }, 0)
      .to(s, { particles: 1, duration: 2.4, ease: 'power2.out' }, 0.4)
      .from(q('.wordmark-in'), { opacity: 0, scale: 1.12, duration: 1.6, ease: 'power3.out' }, 0.1)
      .from(q('.ch-0 .rise'), { yPercent: 110, opacity: 0, stagger: 0.09, duration: 1.1, ease: 'power3.out' }, 0.45)
      .from(q('.hint-in'), { opacity: 0, duration: 1 }, 1.2)

    if (reduced) return

    // The scroll story. Time units are progress through the section.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom bottom', scrub: 0.65 },
    })

    // 0 → 1: word-mark recedes, chapter one leaves, the bottle centres and the camera moves in.
    tl.to(q('.wordmark'), { scale: 1.6, opacity: 0, duration: 1 }, 0)
      .to(q('.ch-0'), { opacity: 0, y: -60, duration: 0.6 }, 0.1)
      .to(q('.hint'), { opacity: 0, duration: 0.3 }, 0)
      .to(s, { rotation: 0.2, offsetX: 0, cameraZ: 6.2, cameraY: 0.1, lookY: 0.05, duration: 1.2 }, 0.2)

    // 1 → 2: ingredients.
    tl.fromTo(q('.ch-1 .rise'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, 1.0)
      .to(s, { scanAlpha: 1, duration: 0.15 }, 1.0)
      .fromTo(s, { scan: 0 }, { scan: 1, duration: 0.9, ease: 'power1.inOut' }, 1.05)
      .to(s, { leaders: 1, duration: 0.4 }, 1.3)
      .to(q('.callout'), { opacity: 1, stagger: 0.1, duration: 0.3 }, 1.35)
      .to(s, { rotation: -0.15, duration: 1.0 }, 1.2)
      .to(s, { scan: 0.35, duration: 0.5, ease: 'power1.inOut' }, 1.95)
      .to(s, { scanAlpha: 0, duration: 0.25 }, 2.2)
      .to(q('.ch-1'), { opacity: 0, y: -40, duration: 0.5 }, 2.3)
      .to(q('.callout'), { opacity: 0, duration: 0.3 }, 2.25)
      .to(s, { leaders: 0, duration: 0.3 }, 2.25)

    // 2 → 3: how it is used; the bottle moves left, leans and turns, the light warms.
    tl.to(s, { rotation: BACK_ROTATION, tilt: -0.12, offsetX: desktop ? -1.1 : 0, cameraZ: 5.2, cameraY: 0.05, lookY: 0.05, glow: 1.1, duration: 1.2 }, 2.4)
      .fromTo(q('.ch-2 .rise'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, 2.8)
      .to(q('.ch-2'), { opacity: 0, y: -40, duration: 0.5 }, 3.7)

    // 3 → 4: the set arrives around the hero, framed from further back.
    tl.to(s, { rotation: 0, tilt: 0, offsetX: desktop ? -0.65 : 0, cameraZ: 10.4, cameraY: 0.45, lookY: 0.1, spread: 1, glow: 0.8, duration: 1.2 }, 3.75)
      .fromTo(q('.ch-3 .rise'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, 4.15)
      .to({}, { duration: 0.6 })

    // Callouts sit at the tips of their 3D leaders every frame.
    const follow = () => {
      const centre = stage.size.width / 2
      callouts.forEach((c, i) => {
        const el = calloutEls.value[i]
        if (!el) return
        const { x, y, facing } = stage.project(c.key)
        el.style.transform = `translate(${x}px, ${y}px)`
        el.style.setProperty('--facing', clamp(facing * 1.6))
        el.classList.toggle('is-left', x < centre)
      })
    }
    gsap.ticker.add(follow)

    return () => gsap.ticker.remove(follow)
  }, root.value)

  requestAnimationFrame(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  ctx?.revert()
  observer?.disconnect()
  stage?.dispose()
})
</script>

<template>
  <section ref="root" class="relative h-[520vh] px-5 pt-2 text-cream sm:px-10 lg:px-16">
    <div class="sticky top-4 mx-auto h-[calc(100vh-2rem)] max-w-[90rem] overflow-hidden rounded-[2rem] bg-forest">
      <!-- Ground glow -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(197,109,89,0.22),transparent_70%)]" />

      <!-- Vignette and a whisper of grain, so the black reads as a room, not a void -->
      <div class="stage-vignette pointer-events-none absolute inset-0 z-10" />

      <!-- Word-mark, behind the bottle -->
      <div class="wordmark pointer-events-none absolute inset-0 flex items-center justify-center">
        <span class="wordmark-in font-display text-[34vw] font-semibold leading-none tracking-[-0.04em] text-cream/[0.05] select-none lg:text-[26vw]">MEVA</span>
      </div>

      <canvas ref="canvas" class="absolute inset-0 h-full w-full touch-pan-y" :class="!webgl && 'hidden'" data-cursor="drag" />
      <div v-if="!webgl && hero?.image" class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img :src="hero.image" :alt="hero.name" class="h-[70vh] w-auto object-contain mix-blend-lighten opacity-90" />
      </div>

      <!-- Chapter 0: the bottle stands right; the copy takes the left half -->
      <div class="ch ch-0">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-28 lg:justify-center lg:pb-0">
          <div class="max-w-[30rem]">
            <p class="eyebrow overflow-hidden text-sage"><span class="rise block">Prirodna kozmetika · Novi Pazar</span></p>
            <h1 class="mt-5 font-display text-[2.75rem] font-medium leading-[1] tracking-tight sm:text-6xl lg:text-[4.5rem]">
              <span class="block overflow-hidden"><span class="rise block">Koža glave</span></span>
              <span class="block overflow-hidden"><span class="rise block">koja se, konačno,</span></span>
              <span class="block overflow-hidden"><span class="rise block italic font-normal text-sage">smirila.</span></span>
            </h1>
            <p class="mt-7 max-w-sm overflow-hidden text-base leading-relaxed text-cream/75 lg:text-lg">
              <span class="rise block">Poručen 2.763 puta. Ručno rađen u Novom Pazaru, u malim serijama, od 2010.</span>
            </p>
          </div>
        </div>
        <div class="hint pointer-events-none absolute inset-x-0 bottom-6 lg:bottom-10">
          <div class="hint-in flex items-center justify-center gap-6 text-cream/60">
            <span class="eyebrow hidden lg:inline">Prevuci da okreneš</span>
            <span class="h-9 w-px overflow-hidden bg-cream/20"><span class="scroll-line block h-full w-full bg-paper/90" /></span>
            <span class="eyebrow">Skroluj</span>
          </div>
        </div>
      </div>

      <!-- Chapter 1: ingredients, bottle centred, callouts either side -->
      <div class="ch ch-1">
        <div class="ch-scrim lg:hidden" />
        <div class="shell absolute inset-x-0 bottom-0 hidden pb-16 lg:block">
          <div class="lg:max-w-sm">
            <p class="eyebrow overflow-hidden text-sage"><span class="rise block">Sastav</span></p>
            <h2 class="mt-3 font-display text-3xl font-medium leading-[1.05] lg:text-4xl">
              <span class="block overflow-hidden"><span class="rise block">Sedam sastojaka.</span></span>
              <span class="block overflow-hidden"><span class="rise block">Nijedan slučajan.</span></span>
            </h2>
            <p class="rise mt-4 hidden text-[0.95rem] leading-relaxed text-cream/60 lg:block">
              Uz hidrolat ruže, proteine pšenice i ekstrakt zelenog čaja. Bez sulfata, parabena i silikona.
            </p>
          </div>
        </div>

        <!-- Mobile: a plain list under the bottle -->
        <div class="shell absolute inset-x-0 bottom-0 pb-14 lg:hidden">
          <p class="eyebrow overflow-hidden text-sage"><span class="rise block">Sastav</span></p>
          <h2 class="mb-6 mt-3 font-display text-3xl font-medium leading-[1.05]">
            <span class="block overflow-hidden"><span class="rise block">Sedam sastojaka. Nijedan slučajan.</span></span>
          </h2>
          <ul class="grid grid-cols-2 gap-x-6 gap-y-4">
            <li v-for="c in callouts" :key="c.key" class="rise border-l border-clay-300/60 pl-3">
              <p class="text-[0.95rem]">{{ c.name }}</p>
              <p class="text-sm text-cream/60">{{ c.role }}</p>
            </li>
          </ul>
        </div>

        <!-- Desktop: labels at the tips of the 3D leaders -->
        <div
          v-for="(c, i) in callouts"
          :key="c.key"
          :ref="(el) => (calloutEls[i] = el)"
          class="callout hidden lg:block"
        >
          <div class="callout-text">
            <p class="text-lg leading-tight">{{ c.name }}</p>
            <p class="mt-1 text-sm text-cream/60">{{ c.role }}</p>
          </div>
        </div>
      </div>

      <!-- Chapter 2: ritual, bottle left, copy right -->
      <div class="ch ch-2">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-24 lg:items-end lg:justify-center lg:pb-0">
          <div class="lg:max-w-md">
            <p class="eyebrow overflow-hidden text-sage"><span class="rise block">Način upotrebe</span></p>
            <h2 class="mt-4 font-display text-4xl font-medium leading-[1.02] lg:text-5xl">
              <span class="block overflow-hidden"><span class="rise block">Uveče.</span></span>
              <span class="block overflow-hidden"><span class="rise block">Direktno na kožu glave.</span></span>
              <span class="block overflow-hidden"><span class="rise block italic font-normal text-sage">Ne ispira se.</span></span>
            </h2>
            <p class="rise mt-5 max-w-sm text-[0.95rem] leading-relaxed text-cream/70 lg:ml-auto">
              Sedam sastojaka, bez sulfata, parabena i silikona — sve piše na poleđini. 100 ml traje oko dva meseca redovne upotrebe.
            </p>
            <div class="mt-8 flex gap-12">
              <div class="rise">
                <p class="font-display text-4xl font-medium">1,4</p>
                <p class="mt-1 text-sm text-cream/60">porudžbine po kupcu</p>
              </div>
              <div class="rise">
                <p class="font-display text-4xl font-medium">3.964</p>
                <p class="mt-1 text-sm text-cream/60">kupaca od 2024.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chapter 3: the set -->
      <div class="ch ch-3">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-14 lg:pb-16">
          <div class="pointer-events-auto flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-lg">
              <p class="eyebrow overflow-hidden text-sage"><span class="rise block">Sam, ili u setu</span></p>
              <h2 class="mt-4 font-display text-4xl font-medium leading-[1.02] lg:text-5xl">
                <span class="block overflow-hidden"><span class="rise block">Set za seboreju.</span></span>
              </h2>
              <p class="rise mt-4 text-[0.95rem] leading-relaxed text-cream/75 lg:text-base">
                Šampon N°10, losion N°15+, ulje za seboreju, ulje za kosu i detox čaj — kompletna rutina za kožu glave, po ceni nižoj od zbira.
              </p>
            </div>
            <div class="rise flex flex-wrap items-center gap-4">
              <Magnetic>
                <button type="button" class="pill bg-sage text-forest hover:bg-cream" :disabled="!set" @click="add(set)">
                  {{ added === set?.slug ? 'Dodato u korpu ✓' : `Dodaj set — ${set?.price?.formatted ?? '4.000 RSD'}` }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4"><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
              </Magnetic>
              <Magnetic :strength="0.25">
                <button type="button" class="pill border border-cream/30 text-cream hover:border-cream hover:bg-cream hover:text-forest" :disabled="!hero" @click="add(hero)">
                  {{ added === hero?.slug ? 'Dodato ✓' : `Samo losion — ${hero?.price?.formatted ?? '1.400 RSD'}` }}
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

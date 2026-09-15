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
 * The opening scene. The section is several screens tall; a sticky card
 * holds the WebGL stage while the scroll position drives one timeline that
 * spins and re-frames the bottle and hands the copy from chapter to chapter:
 * the bottle, its ingredients, what it does to the scalp, how it is used,
 * and the set it belongs to.
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

// What happens on the scalp, in the order the demonstration shows it.
const steps = [
  { n: '01', title: 'Salicilna kiselina omekšava perut', text: 'i odvaja je od kože glave, pa se ispira umesto da se češe.' },
  { n: '02', title: 'Niacinamid i lavanda smiruju', text: 'crvenilo i svrab, i vraćaju barijeru kože.' },
  { n: '03', title: 'Čajevac drži gljivice pod kontrolom,', text: 'pa se perut ne vraća posle prvog pranja.' },
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

  if (import.meta.env.DEV) window.__motion.stage = stage

  // Render only while on screen.
  observer = new IntersectionObserver(([entry]) => (stage.visible = entry.isIntersecting), { threshold: 0 })
  observer.observe(root.value)

  const reduced = prefersReducedMotion()
  const desktop = window.matchMedia('(min-width: 1024px)').matches

  ctx = gsap.context(() => {
    const q = gsap.utils.selector(root.value)
    const s = stage.state

    // Entrance: camera dollies in, the bottle rises on the right, the cap drops onto it.
    gsap.set(s, { lift: 0, offsetX: desktop ? 1.35 : 0, cameraZ: 9.4 })
    const cap = stage.hero?.userData?.cap
    if (cap && !reduced) {
      cap.userData.restY = cap.position.y
      cap.position.y += 1.8
      cap.rotation.y = -1.2
    }
    const intro = gsap.timeline({ delay: 0.15 })
      .to(s, { lift: 1, rotation: -0.3, duration: reduced ? 0 : 1.8, ease: 'power3.out' }, 0)
      .to(s, { cameraZ: 7.2, duration: reduced ? 0 : 2.6, ease: 'power2.inOut' }, 0)
      .to(s, { particles: 1, duration: 2.4, ease: 'power2.out' }, 0.4)
      .to(cap ? cap.position : {}, { y: '-=1.8', duration: 1.1, ease: 'power3.in' }, 0.9)
      .to(cap ? cap.rotation : {}, { y: 0, duration: 1.1, ease: 'power2.inOut' }, 0.9)
      .to(cap ? cap.position : {}, { y: '-=0.03', duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 2.0)
      .from(q('.wordmark-in'), { opacity: 0, scale: 1.12, duration: 1.6, ease: 'power3.out' }, 0.1)
      .from(q('.ch-0 .rise'), { yPercent: 110, opacity: 0, stagger: 0.09, duration: 1.1, ease: 'power3.out' }, 0.45)
      .from(q('.hint-in'), { opacity: 0, duration: 1 }, 1.2)
    if (import.meta.env.DEV) window.__motion.intro = intro

    if (reduced) return

    // The scroll story. Time units are progress through the section. Its
    // opening tweens state explicit start values, and scrolling cuts the
    // entrance short, so a visitor who scrolls at once — and later returns to
    // the top — finds the scene exactly as a fresh load shows it.
    const rest = { rotation: -0.3, offsetX: desktop ? 1.35 : 0, cameraZ: 7.2, cameraY: 0.1, lookY: 0, sweep: 0 }
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: 'bottom bottom',
        // Progress maps straight to scroll; the stage smooths the state itself.
        scrub: true,
        onUpdate: (self) => {
          if (self.progress > 0.02 && intro.progress() < 1) {
            intro.progress(1)
            if (cap) {
              cap.position.y = cap.userData.restY
              cap.rotation.y = 0
            }
          }
        },
      },
    })

    const rise = (sel, at, stagger = 0.08) =>
      tl.fromTo(q(sel), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger, duration: 0.5, immediateRender: false }, at)
    // A chapter is invisible until its turn, so its mobile scrim never covers another's copy.
    const enter = (sel, at) => tl.fromTo(q(sel), { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 0.2, immediateRender: false }, at)
    const leave = (sel, at) => tl.to(q(sel), { opacity: 0, y: -40, duration: 0.5 }, at)

    // 0 → 1: word-mark recedes, chapter one leaves, the bottle centres and the camera moves in.
    tl.fromTo(q('.wordmark'), { scale: 1, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 1, immediateRender: false }, 0)
      .fromTo(q('.ch-0'), { opacity: 1, y: 0 }, { opacity: 0, y: -60, duration: 0.6, immediateRender: false }, 0.1)
      .fromTo(q('.hint'), { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, 0)
      .fromTo(s, rest, { rotation: 0.2, offsetX: 0, cameraZ: 6.2, cameraY: 0.1, lookY: 0.05, duration: 1.2, immediateRender: false }, 0.2)
      .fromTo(s, { sweep: -1 }, { sweep: 1, duration: 1.0, ease: 'power1.inOut', immediateRender: false }, 0.3)
      .to(s, { sweep: 0, duration: 0.4 }, 1.3)

    // 1 → 2.3: ingredients — the scan ring reads the label, leaders point at it.
    enter('.ch-1', 0.9)
    rise('.ch-1 .rise', 1.0)
    tl.to(s, { scanAlpha: 1, duration: 0.15 }, 1.0)
      .fromTo(s, { scan: 0 }, { scan: 1, duration: 0.9, ease: 'power1.inOut', immediateRender: false }, 1.05)
      .to(s, { leaders: 1, duration: 0.4 }, 1.3)
      .to(q('.callout'), { opacity: 1, stagger: 0.1, duration: 0.3 }, 1.35)
      .to(s, { rotation: -0.15, duration: 1.0 }, 1.2)
      .to(s, { scan: 0.35, duration: 0.5, ease: 'power1.inOut' }, 1.95)
      .to(s, { scanAlpha: 0, duration: 0.25 }, 2.2)
    leave('.ch-1', 2.3)
    tl.to(q('.callout'), { opacity: 0, duration: 0.3 }, 2.25)
      .to(s, { leaders: 0, duration: 0.3 }, 2.25)

    // 2.4 → 4.9: what it does — the scalp rises, the bottle leans and a drop falls;
    // the film spreads, the flakes lift away, the redness calms.
    tl.to(s, { skinLift: 1, duration: 0.6, ease: 'power2.out' }, 2.4)
      .to(s, { cameraZ: desktop ? 7.2 : 6.8, cameraY: 0.55, lookY: -0.35, lookX: desktop ? 0.9 : 1.35, offsetX: 0, sway: 0, duration: 0.8, ease: 'power1.inOut' }, 2.4)
      .to(s, { rotation: 0.35, tilt: -2.0, pour: 1, duration: 0.8, ease: 'power2.inOut' }, 2.9)
      .fromTo(s, { drop: 0 }, { drop: 1, duration: 0.3, ease: 'none', immediateRender: false }, 3.55)
      .to(s, { film: 1, duration: 0.7, ease: 'power1.out' }, 3.85)
      .to(s, { flakes: 0, duration: 0.7, ease: 'power1.inOut' }, 3.95)
      .to(s, { redness: 0, duration: 0.8, ease: 'power1.inOut' }, 4.15)
    enter('.ch-2', 2.7)
    rise('.ch-2 .rise', 2.8)
    rise('.ch-2 .step-1', 3.7, 0)
    rise('.ch-2 .step-2', 4.1, 0)
    rise('.ch-2 .step-3', 4.45, 0)
    leave('.ch-2', 4.95)

    // 5.0 → 6.3: how it is used — the bottle rights itself and turns round to its back panel.
    tl.to(s, { pour: 0, tilt: -0.12, lookX: 0, duration: 0.7, ease: 'power2.inOut' }, 4.95)
      .to(s, { skinLift: 0, duration: 0.5, ease: 'power2.in' }, 5.45)
      .to(s, { flakes: 1, redness: 1, film: 0, drop: 0, duration: 0.01 }, 6.3)
      .fromTo(s, { sweep: 1 }, { sweep: -1, duration: 1.0, ease: 'power1.inOut', immediateRender: false }, 5.1)
      .to(s, { sweep: 0, duration: 0.4 }, 6.1)
      .to(s, { rotation: BACK_ROTATION, offsetX: desktop ? -1.1 : 0, cameraZ: 5.2, cameraY: 0.05, lookY: 0.05, glow: 1.1, duration: 1.2 }, 5.0)
    enter('.ch-3', 5.4)
    rise('.ch-3 .rise', 5.5)
    leave('.ch-3', 6.35)

    // 6.4 → 7.7: the set arrives around the hero, framed from further back.
    tl.fromTo(s, { sweep: -1 }, { sweep: 1, duration: 1.2, ease: 'power1.inOut', immediateRender: false }, 6.55)
      .to(s, { rotation: 0, tilt: 0, offsetX: desktop ? -0.65 : 0, cameraZ: 10.4, cameraY: 0.45, lookY: 0.1, spread: 1, glow: 0.8, duration: 1.2 }, 6.4)
    enter('.ch-4', 6.75)
    rise('.ch-4 .rise', 6.85)
    tl.to({}, { duration: 0.6 })

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
  <section ref="root" class="relative h-[760vh] px-5 pt-2 text-cream sm:px-10 lg:px-16">
    <div class="sticky top-4 mx-auto h-[calc(100vh-2rem)] max-w-[90rem] overflow-hidden rounded-[2rem] bg-forest">
      <!-- Vignette and a whisper of grain, so the black reads as a room, not a void -->
      <div class="stage-vignette pointer-events-none absolute inset-0 z-10" />

      <canvas ref="canvas" class="absolute inset-0 h-full w-full touch-pan-y" :class="!webgl && 'hidden'" data-cursor="drag" />

      <div class="wordmark pointer-events-none absolute inset-0 z-[1] flex items-center justify-center mix-blend-screen">
        <span class="wordmark-in font-display text-[34vw] font-semibold leading-none tracking-[-0.04em] text-cream/[0.07] select-none lg:text-[26vw]">MEVA</span>
      </div>
      <div v-if="!webgl && hero?.image" class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img :src="hero.image" :alt="hero.name" class="h-[70vh] w-auto object-contain mix-blend-lighten opacity-90" />
      </div>

      <!-- Chapter 0: the bottle stands right; the copy takes the left half -->
      <div class="ch ch-0">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-28 lg:justify-center lg:pb-0">
          <div class="max-w-[30rem]">
            <p class="eyebrow line-mask text-sage"><span class="rise block">Prirodna kozmetika · Novi Pazar</span></p>
            <h1 class="mt-5 font-display text-[2.75rem] font-medium leading-[1] tracking-tight sm:text-6xl lg:text-[4.5rem]">
              <span class="line-mask block"><span class="rise block">Koža glave</span></span>
              <span class="line-mask block"><span class="rise block">koja se, konačno,</span></span>
              <span class="line-mask block"><span class="rise block italic font-normal text-blush-300">smirila.</span></span>
            </h1>
            <p class="mt-7 max-w-sm line-mask text-base leading-relaxed text-cream/75 lg:text-lg">
              <span class="rise block">Poručen 2.763 puta. Ručno rađen u Novom Pazaru, u malim serijama, od 2010.</span>
            </p>
          </div>
        </div>
        <div class="hint pointer-events-none absolute inset-x-0 bottom-6 lg:bottom-10">
          <div class="hint-in flex items-center justify-center gap-6 text-cream/60">
            <span class="eyebrow hidden lg:inline">Prevuci da okreneš</span>
            <span class="h-9 w-px overflow-hidden bg-cream/20"><span class="scroll-line block h-full w-full bg-cream/90" /></span>
            <span class="eyebrow">Skroluj</span>
          </div>
        </div>
      </div>

      <!-- Chapter 1: ingredients, bottle centred, callouts on 3D leaders -->
      <div class="ch ch-1">
        <div class="ch-scrim lg:hidden" />
        <div class="shell absolute inset-x-0 bottom-0 hidden pb-16 lg:block">
          <div class="lg:max-w-sm">
            <p class="eyebrow line-mask text-sage"><span class="rise block">Sastav</span></p>
            <h2 class="mt-3 font-display text-3xl font-medium leading-[1.05] lg:text-4xl">
              <span class="line-mask block"><span class="rise block">Sedam sastojaka.</span></span>
              <span class="line-mask block"><span class="rise block">Nijedan slučajan.</span></span>
            </h2>
            <p class="rise mt-4 hidden text-[0.95rem] leading-relaxed text-cream/60 lg:block">
              Uz hidrolat ruže, proteine pšenice i ekstrakt zelenog čaja. Bez sulfata, parabena i silikona.
            </p>
          </div>
        </div>

        <div class="shell absolute inset-x-0 bottom-0 pb-14 lg:hidden">
          <p class="eyebrow line-mask text-sage"><span class="rise block">Sastav</span></p>
          <h2 class="mb-6 mt-3 font-display text-3xl font-medium leading-[1.05]">
            <span class="line-mask block"><span class="rise block">Sedam sastojaka. Nijedan slučajan.</span></span>
          </h2>
          <ul class="grid grid-cols-2 gap-x-6 gap-y-4">
            <li v-for="c in callouts" :key="c.key" class="rise border-l border-blush-300/60 pl-3">
              <p class="text-[0.95rem]">{{ c.name }}</p>
              <p class="text-sm text-cream/60">{{ c.role }}</p>
            </li>
          </ul>
        </div>

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

      <!-- Chapter 2: what it does — the demonstration on the scalp -->
      <div class="ch ch-2">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-14 lg:justify-center lg:pb-0">
          <div class="lg:max-w-md">
            <p class="eyebrow line-mask text-sage"><span class="rise block">Kako deluje</span></p>
            <h2 class="mt-4 font-display text-3xl font-medium leading-[1.05] sm:text-4xl lg:text-5xl">
              <span class="line-mask block"><span class="rise block">Perut ne treba sakriti.</span></span>
              <span class="line-mask block"><span class="rise block italic font-normal text-blush-300">Treba je skinuti.</span></span>
            </h2>
            <ol class="mt-8 space-y-4 lg:mt-10 lg:space-y-5">
              <li v-for="(st, i) in steps" :key="st.n" class="flex gap-4" :class="`step-${i + 1}`">
                <span class="eyebrow mt-1 shrink-0 text-blush-300">{{ st.n }}</span>
                <p class="text-[0.95rem] leading-relaxed text-cream/85 lg:text-base">
                  <span class="font-semibold text-cream">{{ st.title }}</span> {{ st.text }}
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Chapter 3: how it is used — bottle left, its back panel readable, copy right -->
      <div class="ch ch-3">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-24 lg:items-end lg:justify-center lg:pb-0">
          <div class="lg:max-w-md">
            <p class="eyebrow line-mask text-sage"><span class="rise block">Način upotrebe</span></p>
            <h2 class="mt-4 font-display text-4xl font-medium leading-[1.02] lg:text-5xl">
              <span class="line-mask block"><span class="rise block">Uveče.</span></span>
              <span class="line-mask block"><span class="rise block">Direktno na kožu glave.</span></span>
              <span class="line-mask block"><span class="rise block italic font-normal text-blush-300">Ne ispira se.</span></span>
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

      <!-- Chapter 4: the set -->
      <div class="ch ch-4">
        <div class="ch-scrim lg:hidden" />
        <div class="shell flex h-full flex-col justify-end pb-14 lg:pb-16">
          <div class="pointer-events-auto flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-lg">
              <p class="eyebrow line-mask text-sage"><span class="rise block">Sam, ili u setu</span></p>
              <h2 class="mt-4 font-display text-4xl font-medium leading-[1.02] lg:text-5xl">
                <span class="line-mask block"><span class="rise block">Set za seboreju.</span></span>
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

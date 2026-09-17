<script setup>
import off from '@/assets/img/seboreja-off.webp'
import on from '@/assets/img/seboreja-on.webp'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The same scalp, twice, with a line you drag between them.
 *
 * Seborrhoea is the thing most of this shop is bought for, and until now the
 * page only ever named it. Here it is: flaking on one side of the line, clear
 * on the other, and the visitor moves the line themselves -- which is a good
 * deal more convincing than a sentence, and takes no reading at all.
 *
 * The line is a range input with an invisible one-pixel thumb rather than
 * hand-rolled pointer maths: the whole picture becomes the track, so a press
 * anywhere moves the line, a drag follows the finger, and the arrow keys work
 * without a line of code. The handle and the dashed rule are drawn on top and
 * take no pointer events of their own.
 *
 * Nobody drags something they have not been told is draggable, so the first
 * time the picture comes into view it sweeps itself a few times -- not to the
 * edges, just far enough that both scalps show and the line is plainly the
 * thing that did it. It runs once, stops the moment a finger lands on it, and
 * does not run at all for anyone who has asked for less motion.
 */
defineProps({
  /** Labels are left off in tight places, where the section already says it. */
  labels: { type: Boolean, default: true },
})

const pos = ref(50)
const touched = ref(false)
const demoing = ref(false)
const box = ref(null)

let frame = 0
let observer = null

/** Where the sweep goes, and back: wide first, then settling. */
const SWEEP = [66, 34, 63, 37, 58, 44, 50]
const LEG = 520

function ease(t) {
  return 0.5 - Math.cos(Math.PI * t) / 2
}

function sweep() {
  if (touched.value) return

  demoing.value = true

  const legs = SWEEP.map((to, i) => ({ from: i === 0 ? 50 : SWEEP[i - 1], to }))
  const started = performance.now()
  const total = legs.length * LEG

  const step = (now) => {
    if (touched.value) return stop()

    const elapsed = now - started

    if (elapsed >= total) {
      pos.value = 50
      return stop()
    }

    const leg = legs[Math.floor(elapsed / LEG)]
    const t = ease((elapsed % LEG) / LEG)
    pos.value = leg.from + (leg.to - leg.from) * t
    frame = requestAnimationFrame(step)
  }

  frame = requestAnimationFrame(step)
}

function stop() {
  cancelAnimationFrame(frame)
  demoing.value = false
}

function grab() {
  touched.value = true
  stop()
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      observer = null
      setTimeout(sweep, 260)
    },
    { threshold: 0.55 },
  )

  if (box.value) observer.observe(box.value)
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
})
</script>

<template>
  <div ref="box" class="relative h-full w-full select-none" @pointerdown="grab" @keydown="grab">
    <!-- Flaking, underneath -->
    <img :src="on" alt="Koža glave sa seborejom i peruti" class="absolute inset-0 h-full w-full object-contain" draggable="false" />

    <!-- Clear, revealed from the line rightwards -->
    <img
      :src="off"
      alt="Smireno teme, bez peruti"
      class="absolute inset-0 h-full w-full object-contain"
      :style="{ clipPath: `inset(0 0 0 ${pos}%)` }"
      draggable="false"
    />

    <div v-if="labels" class="pointer-events-none absolute inset-x-0 bottom-[6%] flex items-center justify-between px-[4%] text-[0.625rem] font-bold uppercase tracking-[0.14em] xl:text-[0.6875rem]">
      <span class="rounded-full bg-paper/85 px-2.5 py-1 text-ink/70 backdrop-blur-sm transition-opacity duration-300" :style="{ opacity: pos < 18 ? 0 : 1 }">Seboreja</span>
      <span class="rounded-full bg-blush-700 px-2.5 py-1 text-paper transition-opacity duration-300" :style="{ opacity: pos > 82 ? 0 : 1 }">Smireno teme</span>
    </div>

    <!-- The rule, and the handle on it -->
    <div class="pointer-events-none absolute inset-y-0 z-10 w-0" :style="{ left: `${pos}%` }">
      <span class="absolute inset-y-[4%] -left-px w-0.5 border-l-2 border-dashed border-paper/95 [filter:drop-shadow(0_0_3px_rgba(142,59,69,0.55))]" />
      <span
        class="absolute left-0 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-blush-700 shadow-[0_6px_20px_-4px_rgba(142,59,69,0.55)] ring-1 ring-blush-200"
        :class="touched || demoing ? '' : 'nudge'"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.5 8 6 12l3.5 4M14.5 8l3.5 4-3.5 4" />
        </svg>
      </span>
    </div>

    <input
      v-model.number="pos"
      class="compare-range absolute inset-0 z-20 h-full w-full"
      type="range"
      min="0"
      max="100"
      step="0.5"
      aria-label="Prevucite da uporedite kožu glave sa seborejom i bez nje"
    />
  </div>
</template>

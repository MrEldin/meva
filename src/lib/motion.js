import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { onBeforeUnmount, onMounted } from 'vue'

gsap.registerPlugin(ScrollTrigger, SplitText)

// One custom ease for the whole site. Everything that moves shares it, which is
// most of what makes motion read as one hand rather than a pile of effects.
gsap.defaults({ ease: 'power3.out', duration: 1 })

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Run GSAP setup scoped to a component's root element.
 *
 * Everything created inside `setup` is reverted when the component unmounts,
 * so ScrollTriggers never outlive the DOM they watch. With reduced motion the
 * setup is skipped entirely and `fallback` (if given) applies the final state,
 * so nothing is left hidden waiting for an animation that will not run.
 */
export function useMotion(scope, setup, fallback) {
  let context

  onMounted(() => {
    if (prefersReducedMotion()) {
      fallback?.(scope.value)

      return
    }

    context = gsap.context(() => setup(gsap, scope.value), scope.value)

    // Images and fonts settle after mount; ScrollTrigger must re-measure.
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => context?.revert())
}

/**
 * Split an element into lines wrapped in overflow-hidden masks, so the text can
 * rise into view line by line — the reveal used for every headline here.
 */
export function splitLines(el) {
  return SplitText.create(el, {
    type: 'lines',
    linesClass: 'split-line',
    mask: 'lines',
    autoSplit: true,
  })
}

if (import.meta.env.DEV) {
  window.__motion = { gsap, ScrollTrigger }
}

export { gsap, ScrollTrigger }

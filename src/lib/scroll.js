import Lenis from 'lenis'

import { gsap, prefersReducedMotion, ScrollTrigger } from './motion'

let lenis = null
let tick = null

/**
 * Smooth, inertial scrolling for the whole site, driven by GSAP's ticker so
 * ScrollTrigger and the scroll position never disagree by a frame.
 *
 * Touch devices keep native scrolling; Lenis only smooths the wheel.
 */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis

  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    // Anything that scrolls on its own -- a dialog's body, a long table --
    // keeps the wheel. Without this the page scrolls instead and the panel
    // the pointer is over never moves.
    prevent: (node) => node.hasAttribute?.('data-lenis-prevent') || node.closest?.('[data-lenis-prevent]') !== null,
  })
  lenis.on('scroll', ScrollTrigger.update)

  // Held so it can be taken off again: a ticker callback left running after
  // Lenis is destroyed throws on every frame.
  tick = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  if (import.meta.env.DEV) window.__motion.lenis = lenis

  return lenis
}

/**
 * Hand scrolling back to the browser.
 *
 * Called when the admin panel opens: its dialogs and tables scroll inside
 * themselves, and the desk should feel immediate rather than weighted.
 */
export function stopSmoothScroll() {
  if (!lenis) return

  if (tick) {
    gsap.ticker.remove(tick)
    tick = null
  }

  lenis.destroy()
  lenis = null
  gsap.ticker.lagSmoothing(500, 33)
}

export function scrollTo(target, options = {}) {
  if (lenis) return lenis.scrollTo(target, { offset: -80, duration: 1.4, ...options })

  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView({ behavior: 'smooth' })
}

export const getLenis = () => lenis

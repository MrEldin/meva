import Lenis from 'lenis'

import { gsap, prefersReducedMotion, ScrollTrigger } from './motion'

let lenis = null

/**
 * Smooth, inertial scrolling for the whole site, driven by GSAP's ticker so
 * ScrollTrigger and the scroll position never disagree by a frame.
 *
 * Touch devices keep native scrolling; Lenis only smooths the wheel.
 */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis

  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  if (import.meta.env.DEV) window.__motion.lenis = lenis

  return lenis
}

export function scrollTo(target, options = {}) {
  if (lenis) return lenis.scrollTo(target, { offset: -80, duration: 1.4, ...options })

  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView({ behavior: 'smooth' })
}

export const getLenis = () => lenis

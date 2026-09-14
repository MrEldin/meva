/**
 * v-reveal — fades an element up the first time it enters the viewport.
 *
 * Kept as a directive rather than a library: it is a few lines of
 * IntersectionObserver, it respects reduced-motion through the stylesheet, and
 * it never blocks content from rendering if the observer never fires.
 */
export const reveal = {
  mounted(el, binding) {
    el.classList.add('reveal')

    if (binding.value?.delay) {
      el.style.transitionDelay = `${binding.value.delay}ms`
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        el.classList.add('reveal-in')
        observer.disconnect()
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    el._revealObserver = observer
  },

  unmounted(el) {
    el._revealObserver?.disconnect()
  },
}

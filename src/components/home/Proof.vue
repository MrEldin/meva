<script setup>
import { useMotion } from '@/lib/motion'
import { ref } from 'vue'

const root = ref(null)

// Real figures from the shop's own history, nothing rounded up for effect.
const facts = [
  { value: 5480, suffix: '', label: 'porudžbina', note: 'od januara 2024.' },
  { value: 3964, suffix: '', label: 'kupaca', note: 'koji su se vratili u proseku 1,4 puta' },
  { value: 73, suffix: '', label: 'preparata', note: 'svaki rađen ručno' },
  { value: 0, suffix: ' din', label: 'dostava', note: 'na celoj teritoriji Srbije' },
]

const format = (n) => new Intl.NumberFormat('sr-RS').format(Math.round(n))

useMotion(
  root,
  (gsap, el) => {
    gsap.utils.toArray('.proof-number', el).forEach((node) => {
      const target = Number(node.dataset.value)
      const suffix = node.dataset.suffix ?? ''
      const state = { n: 0 }

      gsap.to(state, {
        n: target, duration: 2.2, ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 85%', once: true },
        onUpdate: () => { node.textContent = format(state.n) + suffix },
      })
    })

    gsap.from('.proof-item', { y: 40, opacity: 0, stagger: 0.12, duration: 1.1, scrollTrigger: { trigger: el, start: 'top 75%' } })
  },
  (el) => el.querySelectorAll('.proof-number').forEach((n) => (n.textContent = format(n.dataset.value) + (n.dataset.suffix ?? ''))),
)
</script>

<template>
  <section ref="root" class="border-b border-ink/10 bg-paper">
    <div class="shell grid grid-cols-2 divide-x divide-ink/10 lg:grid-cols-4">
      <div v-for="(fact, i) in facts" :key="fact.label" class="proof-item px-5 py-12 md:px-8 md:py-16" :class="i % 2 === 0 ? 'pl-0' : ''">
        <p class="font-display text-5xl leading-none tabular-nums text-ink md:text-7xl">
          <span class="proof-number" :data-value="fact.value" :data-suffix="fact.suffix">0{{ fact.suffix }}</span>
        </p>
        <p class="eyebrow mt-4 text-blush-500">{{ fact.label }}</p>
        <p class="mt-2 text-xs font-light text-mist-400">{{ fact.note }}</p>
      </div>
    </div>
  </section>
</template>

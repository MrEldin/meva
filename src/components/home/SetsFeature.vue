<script setup>
import { useMotion } from '@/lib/motion'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

const catalog = useCatalogStore()
const root = ref(null)

const sets = computed(() => catalog.products.filter((p) => p.is_set && p.image).slice(0, 4))

useMotion(root, (gsap, el) => {
  gsap.from('.set-card', { y: 60, opacity: 0, stagger: 0.1, duration: 1.1, scrollTrigger: { trigger: el, start: 'top 75%' } })
})
</script>

<template>
  <section ref="root" class="bg-paper py-24 md:py-36">
    <div class="shell">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="eyebrow text-blush-500">Setovi</p>
          <h2 class="mt-5 max-w-xl font-display text-4xl leading-[1.02] text-ink md:text-6xl">
            Kad jedan preparat nije dovoljan
          </h2>
        </div>
        <RouterLink :to="{ name: 'catalog', query: { tip: 'set' } }" class="eyebrow group inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-ink hover:border-blush-500 hover:text-blush-600">
          Svi setovi <span class="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
        </RouterLink>
      </div>

      <div class="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 scrollbar-none md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
        <RouterLink
          v-for="(set, i) in sets"
          :key="set.id"
          :to="{ name: 'product', params: { slug: set.slug } }"
          class="set-card group w-[78vw] shrink-0 snap-start md:w-auto"
          :class="i % 2 === 1 && 'md:mt-16'"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-mist-50">
            <img :src="set.image" :alt="set.name" class="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-silk)] group-hover:scale-105" />
            <span class="eyebrow absolute left-4 top-4 bg-ink px-2.5 py-1.5 text-[0.5625rem] text-paper">Set</span>
          </div>
          <h3 class="mt-5 font-display text-xl leading-snug text-ink group-hover:text-blush-600">{{ set.name }}</h3>
          <p class="mt-1.5 text-sm font-light text-mist-500">{{ set.price?.formatted }}</p>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

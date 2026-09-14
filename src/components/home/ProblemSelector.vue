<script setup>
import { gsap, useMotion } from '@/lib/motion'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

const catalog = useCatalogStore()
const root = ref(null)
const active = ref(0)

// Each problem points at the products that best represent it. The first that
// exists with a photograph wins; the count comes from the live catalogue.
const problems = [
  { label: 'Seboreja', slug: 'seboreja', prefer: ['losion-za-seboreicni-dermatitis', 'sampon-za-kosu-200ml'] },
  { label: 'Ekcem', slug: 'ekcem', prefer: ['dnevna-krema-za-ekcem-50ml', 'set-za-ekcem-po-telu'] },
  { label: 'Psorijaza', slug: 'psorijaza', prefer: ['set-za-psorijazu-za-kozu-glave-i-tela'] },
  { label: 'Rozacea', slug: 'set-za-rozaceu', prefer: ['nocna-krema-za-rozaceu-50ml', 'set-za-rozaceu'] },
  { label: 'Kosa', slug: 'kosa', prefer: ['sampon-za-kosu-200ml', 'keratin-regenerator'] },
  { label: 'Nega kože', slug: 'preparati-za-lice', prefer: ['hijaluronska-krema-sa-vitaminom-e', 'krema-protiv-bora', 'retinol-b3-serum'] },
]

const rows = computed(() =>
  problems.map((problem) => {
    const inCategory = catalog.products.filter((p) => p.categories.some((c) => c.slug === problem.slug))
    const image =
      problem.prefer.map((slug) => catalog.products.find((p) => p.slug === slug && p.image)).find(Boolean)
      ?? inCategory.find((p) => p.image)

    return { ...problem, count: inCategory.length, image: image?.image ?? null }
  }),
)

let follow

useMotion(root, (gsap, el) => {
  gsap.from('.problem-row', {
    yPercent: 30, opacity: 0, stagger: 0.08, duration: 1,
    scrollTrigger: { trigger: el, start: 'top 70%' },
  })

  // The preview drifts toward the cursor. quickTo keeps it silky without a
  // tween per mousemove.
  const card = el.querySelector('.problem-preview')
  const x = gsap.quickTo(card, 'x', { duration: 0.6, ease: 'power3' })
  const y = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3' })

  follow = (e) => {
    const r = el.getBoundingClientRect()
    x((e.clientX - r.left - r.width * 0.72) * 0.08)
    y((e.clientY - r.top - r.height * 0.5) * 0.08)
  }
  el.addEventListener('pointermove', follow)
})

function swap(i) {
  if (i === active.value) return

  active.value = i
  gsap.fromTo('.problem-preview img', { scale: 1.08, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' })
}
</script>

<template>
  <section id="problemi" ref="root" class="relative bg-paper py-24 md:py-36">
    <div class="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div class="lg:col-span-7">
        <p class="eyebrow text-blush-500">Počnite od problema</p>
        <h2 class="mt-5 font-display text-4xl leading-[1.02] text-ink md:text-6xl">
          Šta vas <span class="italic">muči?</span>
        </h2>

        <ol class="mt-12 border-t border-ink/10">
          <li v-for="(row, i) in rows" :key="row.slug" class="problem-row border-b border-ink/10">
            <RouterLink
              :to="{ name: 'catalog', query: { kategorija: row.slug } }"
              class="group flex items-center gap-5 py-6 md:gap-8 md:py-7"
              @pointerenter="swap(i)"
              @focus="swap(i)"
            >
              <span class="eyebrow w-8 shrink-0 text-mist-400 tabular-nums">{{ String(i + 1).padStart(2, '0') }}</span>

              <span
                class="flex-1 font-display text-3xl leading-none text-ink transition-all duration-500 ease-[var(--ease-silk)] md:text-5xl group-hover:translate-x-3 group-hover:text-blush-600"
                :class="active === i && 'text-blush-600'"
              >
                {{ row.label }}
              </span>

              <span class="eyebrow hidden shrink-0 text-mist-400 sm:inline">{{ row.count }} preparata</span>

              <span class="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/15">
                <span class="absolute inset-0 scale-0 rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-silk)] group-hover:scale-100" />
                <span class="relative text-ink transition-all duration-500 group-hover:-rotate-45 group-hover:text-paper">→</span>
              </span>
            </RouterLink>

            <!-- Mobile preview, under the active row -->
            <div v-if="active === i && row.image" class="pb-6 lg:hidden">
              <img :src="row.image" :alt="row.label" class="aspect-[16/10] w-full object-cover" />
            </div>
          </li>
        </ol>
      </div>

      <!-- Desktop preview -->
      <div class="relative hidden lg:col-span-5 lg:block">
        <div class="problem-preview sticky top-32 aspect-[4/5] overflow-hidden bg-mist-100">
          <img
            v-if="rows[active]?.image"
            :key="rows[active].image"
            :src="rows[active].image"
            :alt="rows[active].label"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
            <span class="eyebrow bg-paper/90 px-3 py-2 text-ink backdrop-blur">{{ rows[active]?.label }}</span>
            <span class="eyebrow bg-ink px-3 py-2 text-paper">{{ rows[active]?.count }} preparata</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

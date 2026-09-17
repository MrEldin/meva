<script setup>
import ProductFigure from '@/components/shop/ProductFigure.vue'
import { ROUTINE, ROUTINE_SET } from '@/data/routine'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

/**
 * The best-selling set, taken apart.
 *
 * A hundred people have bought the seborrhoea set -- more than any other
 * single thing in the shop -- and until now nothing on the site said what the
 * eight bottles inside it are for. So it is drawn rather than listed: the set
 * in the middle, its contents around it in the order they are used, each one
 * connected by a hairline and labelled with where it goes and what it does.
 *
 * On a phone the circle would be unreadable, so the same eight become a
 * numbered routine down the page, which is how it is actually followed.
 */
const catalog = useCatalogStore()
const cart = useCartStore()
const added = ref(false)

const set = computed(() => catalog.products.find((p) => p.slug === ROUTINE_SET) ?? null)

const steps = computed(() =>
  ROUTINE.map((step, i) => ({
    ...step,
    index: i + 1,
    product: catalog.products.find((p) => p.slug === step.slug) ?? null,
  })).filter((step) => step.product),
)

const left = computed(() => steps.value.slice(0, 4))
const right = computed(() => steps.value.slice(4))

/** Where each hairline meets the middle column, as a share of its height. */
const anchors = [12.5, 37.5, 62.5, 87.5]

function addSet() {
  if (!set.value) return
  cart.add(set.value)
  added.value = true
  setTimeout(() => (added.value = false), 1800)
}
</script>

<template>
  <section v-if="set && steps.length === 8" class="relative overflow-hidden bg-blush-50/60 py-12 lg:py-20">
    <div class="shell">
      <div class="mx-auto max-w-2xl text-center">
        <p class="kicker text-blush-700">Korak po korak</p>
        <h2 class="mt-2 font-display text-[1.75rem] leading-[1.15] text-ink lg:text-[2.5rem]">
          Set za seboreju, <em class="not-italic text-blush-700">rasklopljen</em>
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink/65 lg:text-base">
          Osam preparata za kosu, kožu glave i lice — najprodavaniji set u radnji. Evo šta ide na šta i kojim redom.
        </p>
      </div>

      <!-- Desktop: the set in the middle, its contents around it -->
      <div class="mt-12 hidden grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] gap-x-4 lg:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,23rem)_minmax(0,1fr)] xl:gap-x-8">
        <!-- Left four -->
        <ul class="grid grid-rows-4">
          <li v-for="step in left" :key="step.slug" class="flex items-center justify-end">
            <RouterLink :to="{ name: 'product', params: { slug: step.product.slug } }" class="group flex w-full max-w-[21rem] items-center gap-3 text-right">
              <span class="min-w-0 flex-1">
                <span class="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blush-600">{{ step.index }} · {{ step.where }}</span>
                <span class="mt-0.5 block text-[0.9375rem] font-semibold leading-snug text-ink transition-colors group-hover:text-blush-700">{{ step.product.name }}</span>
                <span class="mt-0.5 block text-[0.8125rem] leading-snug text-ink/55">{{ step.does }}</span>
              </span>
              <span class="w-[4.5rem] shrink-0">
                <ProductFigure :product="step.product" :tint="step.index" sizes="80px" />
              </span>
            </RouterLink>
            <span class="ml-2 hidden h-px w-6 shrink-0 bg-blush-300 xl:block" aria-hidden="true" />
          </li>
        </ul>

        <!-- The set itself -->
        <div class="relative flex items-center justify-center py-4">
          <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <g fill="none" stroke="#e1a4a0" stroke-width="1" vector-effect="non-scaling-stroke">
              <path v-for="y in anchors" :key="`l${y}`" :d="`M0 ${y} C 22 ${y}, 30 50, 46 50`" />
              <path v-for="y in anchors" :key="`r${y}`" :d="`M100 ${y} C 78 ${y}, 70 50, 54 50`" />
            </g>
            <circle v-for="y in anchors" :key="`dl${y}`" cx="0.6" :cy="y" r="2.2" fill="#c88585" />
            <circle v-for="y in anchors" :key="`dr${y}`" cx="99.4" :cy="y" r="2.2" fill="#c88585" />
          </svg>

          <div class="relative z-10 w-full text-center">
            <div class="mx-auto w-full max-w-[17rem] rounded-full bg-paper p-2 shadow-[0_30px_70px_-40px_rgba(142,59,69,0.55)] ring-1 ring-blush-100">
              <RouterLink :to="{ name: 'product', params: { slug: set.slug } }" class="group block">
                <ProductFigure :product="set" tint="rose" sizes="280px" />
              </RouterLink>
            </div>
            <h3 class="mt-4 font-display text-[1.25rem] leading-tight text-ink">{{ set.name }}</h3>
            <p class="mt-1 text-[1.125rem] font-bold text-blush-700">{{ set.price?.formatted }}</p>
            <button
              type="button"
              class="mt-3 w-full max-w-[15rem] rounded-full py-3 text-[0.875rem] font-bold text-paper transition-colors"
              :class="added ? 'bg-blush-700' : 'bg-blush-600 hover:bg-blush-700'"
              @click="addSet"
            >{{ added ? 'Dodato ✓' : 'Uzmi ceo set' }}</button>
          </div>
        </div>

        <!-- Right four -->
        <ul class="grid grid-rows-4">
          <li v-for="step in right" :key="step.slug" class="flex items-center">
            <span class="mr-2 hidden h-px w-6 shrink-0 bg-blush-300 xl:block" aria-hidden="true" />
            <RouterLink :to="{ name: 'product', params: { slug: step.product.slug } }" class="group flex w-full max-w-[21rem] items-center gap-3">
              <span class="w-[4.5rem] shrink-0">
                <ProductFigure :product="step.product" :tint="step.index" sizes="80px" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blush-600">{{ step.index }} · {{ step.where }}</span>
                <span class="mt-0.5 block text-[0.9375rem] font-semibold leading-snug text-ink transition-colors group-hover:text-blush-700">{{ step.product.name }}</span>
                <span class="mt-0.5 block text-[0.8125rem] leading-snug text-ink/55">{{ step.does }}</span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Phone: the same eight, as the routine they are -->
      <div class="mt-8 lg:hidden">
        <RouterLink :to="{ name: 'product', params: { slug: set.slug } }" class="group flex items-center gap-4 rounded-[1.5rem] border border-blush-100 bg-paper p-3">
          <span class="w-[6.5rem] shrink-0"><ProductFigure :product="set" tint="rose" sizes="110px" /></span>
          <span class="min-w-0 flex-1">
            <span class="block font-display text-[1.0625rem] leading-tight text-ink">{{ set.name }}</span>
            <span class="mt-1 block text-[1.0625rem] font-bold text-blush-700">{{ set.price?.formatted }}</span>
            <span class="mt-0.5 block text-[0.8125rem] text-ink/55">8 preparata · najprodavaniji set</span>
          </span>
        </RouterLink>

        <button
          type="button"
          class="mt-3 w-full rounded-full py-3.5 text-[0.9375rem] font-bold text-paper transition-colors"
          :class="added ? 'bg-blush-700' : 'bg-blush-600'"
          @click="addSet"
        >{{ added ? 'Dodato ✓' : 'Uzmi ceo set' }}</button>

        <ol class="relative mt-7 pl-8">
          <span class="absolute bottom-6 left-[1.4375rem] top-6 w-px bg-blush-200" aria-hidden="true" />
          <li v-for="step in steps" :key="step.slug" class="relative py-2.5">
            <span class="absolute -left-8 top-5 grid h-6 w-6 place-items-center rounded-full bg-blush-600 text-[0.6875rem] font-bold text-paper">{{ step.index }}</span>
            <RouterLink :to="{ name: 'product', params: { slug: step.product.slug } }" class="flex items-center gap-3">
              <span class="w-14 shrink-0"><ProductFigure :product="step.product" :tint="step.index" sizes="64px" /></span>
              <span class="min-w-0 flex-1">
                <span class="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blush-600">{{ step.where }}</span>
                <span class="block text-[0.9375rem] font-semibold leading-snug text-ink">{{ step.product.name }}</span>
                <span class="mt-0.5 block text-[0.8125rem] leading-snug text-ink/55">{{ step.does }}</span>
              </span>
            </RouterLink>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

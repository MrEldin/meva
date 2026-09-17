<script setup>
import ScalpCompare from '@/components/home/ScalpCompare.vue'
import ProductFigure from '@/components/shop/ProductFigure.vue'
import { ROUTINE, ROUTINE_SET } from '@/data/routine'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

/**
 * The best-selling set, drawn around the thing it is bought for.
 *
 * A hundred people have bought the eight-bottle seborrhoea set -- more than
 * any other single thing in the shop -- and nothing on the site said what the
 * eight bottles are for. So it is drawn rather than listed: in the middle, a
 * scalp with a line you drag across it, flaking on one side and clear on the
 * other; around it, the eight preparations in the order they are used, each
 * on the end of a curve that leaves the circle along its own radius.
 *
 * The diagram is one coordinate space. The curves are computed from the same
 * numbers that place the labels -- a thousand-and-something units wide, laid
 * over a box with that aspect ratio -- so a line always arrives exactly at
 * the middle of its thumbnail, at any width, with no measuring at runtime.
 *
 * A phone gets no circle: the scalp goes on top, full width, and the eight
 * become the numbered routine they actually are.
 */
const catalog = useCatalogStore()
const cart = useCartStore()
const added = ref(false)

/* The drawing. Everything below is in these units. */
const W = 1200
const H = 780
const CX = 600
const CY = 390
const R = 215
const ROWS = [92, 288, 492, 688]
const THUMB = 32
const LEFT_THUMB = 308
const RIGHT_THUMB = 892
const TEXT = 242

const pc = (value, total) => `${((value / total) * 100).toFixed(4)}%`

/** A curve that leaves the circle along its own radius and arrives level. */
function curve(ax, ay) {
  const dx = ax - CX
  const dy = ay - CY
  const length = Math.hypot(dx, dy)
  const ux = dx / length
  const uy = dy / length
  const sx = CX + ux * (R + 12)
  const sy = CY + uy * (R + 12)

  return `M${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx + ux * 62).toFixed(1)} ${(sy + uy * 62).toFixed(1)}, ${ax + (ax < CX ? 104 : -104)} ${ay}, ${ax} ${ay}`
}

const set = computed(() => catalog.products.find((p) => p.slug === ROUTINE_SET) ?? null)

const steps = computed(() =>
  ROUTINE.map((step, i) => ({
    ...step,
    index: i + 1,
    product: catalog.products.find((p) => p.slug === step.slug) ?? null,
  })).filter((step) => step.product),
)

/** Each step with the geometry that places it and the line that reaches it. */
const placed = computed(() =>
  steps.value.map((step, i) => {
    const side = i < 4 ? 'left' : 'right'
    const y = ROWS[i % 4]
    const cx = side === 'left' ? LEFT_THUMB : RIGHT_THUMB
    const anchor = side === 'left' ? cx + THUMB : cx - THUMB

    return {
      ...step,
      side,
      path: curve(anchor, y),
      dot: { x: anchor, y },
      thumb: {
        left: pc(cx - THUMB, W),
        top: pc(y - THUMB, H),
        width: pc(THUMB * 2, W),
      },
      text: {
        top: pc(y, H),
        width: pc(TEXT, W),
        ...(side === 'left'
          ? { right: pc(W - (cx - THUMB - 18), W) }
          : { left: pc(cx + THUMB + 18, W) }),
      },
    }
  }),
)

function addSet() {
  if (!set.value) return
  cart.add(set.value)
  added.value = true
  setTimeout(() => (added.value = false), 1800)
}
</script>

<template>
  <section v-if="set && steps.length === 8" class="bg-blush-50 py-12 lg:py-20">
    <div class="shell">
      <div class="mx-auto max-w-2xl text-center">
        <p class="kicker text-blush-700">Šta je u setu</p>
        <h2 class="mt-2 font-display text-[1.75rem] leading-[1.15] text-ink lg:text-[2.75rem]">
          Set za seboreju, <em class="not-italic text-blush-700">rasklopljen</em>
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink/65 lg:text-base">
          Osam preparata za kožu glave, kosu i lice — najprodavaniji set u radnji.
          Prevucite liniju preko temena, pa pogledajte šta ide na šta i kojim redom.
        </p>
      </div>

      <!-- Desktop: one drawing -->
      <div class="relative mx-auto mt-10 hidden w-full max-w-[82rem] lg:block" style="aspect-ratio: 1200 / 780">
        <svg class="absolute inset-0 h-full w-full" :viewBox="`0 0 ${W} ${H}`" fill="none" aria-hidden="true">
          <defs>
            <radialGradient :id="'anatomy-fade'">
              <stop offset="0.74" stop-color="#000" />
              <stop offset="1" stop-color="#fff" />
            </radialGradient>
            <mask id="anatomy-mask">
              <rect :width="W" :height="H" fill="#fff" />
              <circle :cx="CX" :cy="CY" :r="R + 120" fill="url(#anatomy-fade)" />
            </mask>
          </defs>

          <!-- The ring the curves leave from -->
          <circle :cx="CX" :cy="CY" :r="R + 16" stroke="#f8c1ba" stroke-width="1.5" stroke-dasharray="2 9" stroke-linecap="round" />

          <g mask="url(#anatomy-mask)">
            <path v-for="step in placed" :key="step.slug" :d="step.path" stroke="#e1a4a0" stroke-width="1.5" />
          </g>

          <circle v-for="step in placed" :key="`d-${step.slug}`" :cx="step.dot.x" :cy="step.dot.y" r="3.5" fill="#c88585" />
        </svg>

        <!-- The scalp, in the middle -->
        <div
          class="absolute -translate-y-1/2"
          :style="{ left: pc(CX - R, W), top: '50%', width: pc(R * 2, W), aspectRatio: '1' }"
        >
          <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_46%,#ffffff_0%,#fdeae6_58%,transparent_72%)]" aria-hidden="true" />
          <ScalpCompare class="relative" />
        </div>

        <!-- The eight, on the ends of the lines -->
        <template v-for="step in placed" :key="step.slug">
          <RouterLink
            :to="{ name: 'product', params: { slug: step.product.slug } }"
            class="group absolute grid place-items-center rounded-full bg-paper ring-1 ring-blush-100 transition-all duration-500 hover:ring-blush-300 hover:shadow-[0_14px_30px_-14px_rgba(142,59,69,0.5)]"
            :style="step.thumb"
            tabindex="-1"
            aria-hidden="true"
          >
            <ProductFigure :product="step.product" :tint="step.index" sizes="80px" />
          </RouterLink>

          <RouterLink
            :to="{ name: 'product', params: { slug: step.product.slug } }"
            class="group absolute -translate-y-1/2"
            :class="step.side === 'left' ? 'text-right' : 'text-left'"
            :style="step.text"
          >
            <span class="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blush-600">
              <span class="tabular-nums">{{ step.index }}</span> · {{ step.where }}
            </span>
            <span class="mt-1 block font-display text-[1.0625rem] leading-tight text-ink transition-colors group-hover:text-blush-700">{{ step.product.name }}</span>
            <span class="mt-1 block text-[0.8125rem] leading-snug text-ink/55">{{ step.does }}</span>
          </RouterLink>
        </template>
      </div>

      <!-- The set itself, under the drawing -->
      <div class="mx-auto mt-10 hidden max-w-[34rem] items-center gap-6 rounded-[1.75rem] border border-blush-100 bg-paper p-4 lg:flex">
        <RouterLink :to="{ name: 'product', params: { slug: set.slug } }" class="group w-28 shrink-0">
          <ProductFigure :product="set" tint="rose" sizes="120px" />
        </RouterLink>
        <div class="min-w-0 flex-1">
          <p class="kicker text-blush-600">Ceo set, jedna cena</p>
          <RouterLink :to="{ name: 'product', params: { slug: set.slug } }" class="mt-1 block font-display text-[1.25rem] leading-tight text-ink hover:text-blush-700">{{ set.name }}</RouterLink>
          <p class="mt-1 text-[1.25rem] font-bold text-blush-700">{{ set.price?.formatted }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-full px-7 py-3.5 text-[0.9375rem] font-bold text-paper transition-colors"
          :class="added ? 'bg-blush-700' : 'bg-blush-600 hover:bg-blush-700'"
          @click="addSet"
        >{{ added ? 'Dodato ✓' : 'Uzmi ceo set' }}</button>
      </div>

      <!-- Phone: the scalp on top, then the routine -->
      <div class="lg:hidden">
        <div class="relative mx-auto mt-8 aspect-square w-full max-w-[22rem]">
          <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_46%,#ffffff_0%,#fdeae6_58%,transparent_72%)]" aria-hidden="true" />
          <div class="absolute inset-0 rounded-full border-2 border-dashed border-peach" aria-hidden="true" />
          <ScalpCompare class="relative p-[4%]" />
        </div>

        <div class="mt-7 rounded-[1.5rem] border border-blush-100 bg-paper p-3">
          <RouterLink :to="{ name: 'product', params: { slug: set.slug } }" class="group flex items-center gap-4">
            <span class="w-24 shrink-0"><ProductFigure :product="set" tint="rose" sizes="110px" /></span>
            <span class="min-w-0 flex-1">
              <span class="kicker block text-blush-600">Ceo set</span>
              <span class="mt-0.5 block font-display text-[1.0625rem] leading-tight text-ink">{{ set.name }}</span>
              <span class="mt-1 block text-[1.125rem] font-bold text-blush-700">{{ set.price?.formatted }}</span>
            </span>
          </RouterLink>
          <button
            type="button"
            class="mt-3 w-full rounded-full py-3.5 text-[0.9375rem] font-bold text-paper transition-colors"
            :class="added ? 'bg-blush-700' : 'bg-blush-600'"
            @click="addSet"
          >{{ added ? 'Dodato ✓' : 'Uzmi ceo set' }}</button>
        </div>

        <!-- The numbers are a column of their own, so every one of them sits on
             the line and level with its own bottle however long the wording
             beside it runs. -->
        <ol class="relative mt-8">
          <span class="absolute bottom-10 left-[0.875rem] top-10 w-px -translate-x-1/2 bg-gradient-to-b from-peach via-blush-300 to-peach" aria-hidden="true" />
          <li v-for="step in steps" :key="step.slug" class="relative flex min-h-[5.75rem] items-center gap-3.5 py-2">
            <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blush-600 text-[0.6875rem] font-bold text-paper ring-4 ring-blush-50">{{ step.index }}</span>
            <RouterLink :to="{ name: 'product', params: { slug: step.product.slug } }" class="flex min-w-0 flex-1 items-center gap-3.5">
              <span class="w-16 shrink-0 rounded-full bg-paper ring-1 ring-blush-100"><ProductFigure :product="step.product" :tint="step.index" sizes="72px" /></span>
              <span class="min-w-0 flex-1">
                <span class="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blush-600">{{ step.where }}</span>
                <span class="block font-display text-[1rem] leading-tight text-ink">{{ step.product.name }}</span>
                <span class="mt-1 block text-[0.8125rem] leading-snug text-ink/55">{{ step.does }}</span>
              </span>
            </RouterLink>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

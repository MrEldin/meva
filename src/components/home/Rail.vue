<script setup>
import TiltCard from '@/components/ui/TiltCard.vue'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The best sellers on a horizontal rail. On desktop the section pins and the
 * scroll wheel pulls the rail sideways; on touch it is a native snap scroller.
 * Each photograph sits on its own pastel tile, multiplied in like a print.
 */
const catalog = useCatalogStore()
const cart = useCartStore()

const root = ref(null)
const track = ref(null)

// Sales order from the archive; the shop's most-bought products with photos.
const order = [
  'sampon-za-kosu-200ml',
  'losion-za-seboreicni-dermatitis',
  'ulje-za-rast-obrva-i-trepavica-50ml',
  'ulje-za-psorijazu-50ml',
  'losion-za-brzi-rast-kose-100ml',
  'krema-za-psorijazu-noc',
  'keratin-regenerator',
  'krema-protiv-bora-50ml',
  'retinolb3-serum',
  'hijaluronska-krema-sa-vitaminom-e',
]

const tiles = ['bg-blush-200', 'bg-wheat', 'bg-mint', 'bg-sky', 'bg-linen', 'bg-sage', 'bg-rose']

const items = computed(() =>
  order.map((slug) => catalog.products.find((p) => p.slug === slug)).filter((p) => p?.image),
)

const added = ref('')

function add(product) {
  cart.add(product)
  added.value = product.slug
  setTimeout(() => (added.value = ''), 1600)
}

let ctx

onMounted(() => {
  if (prefersReducedMotion()) return

  ctx = gsap.context(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const distance = () => track.value.scrollWidth - window.innerWidth
      root.value.style.height = `${window.innerHeight + distance()}px`

      gsap.to(track.value, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.value,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: () => (root.value.style.height = `${window.innerHeight + distance()}px`),
        },
      })

      gsap.from(root.value.querySelectorAll('.rail-title .rise'), {
        yPercent: 110,
        stagger: 0.08,
        duration: 1,
        scrollTrigger: { trigger: root.value, start: 'top 70%' },
      })

      return () => (root.value.style.height = '')
    })

    mm.add('(max-width: 1023px)', () => {
      gsap.from(root.value.querySelectorAll('.rail-card'), {
        y: 40,
        opacity: 0,
        stagger: 0.06,
        duration: 0.9,
        scrollTrigger: { trigger: root.value, start: 'top 75%' },
      })
    })
  }, root.value)

  requestAnimationFrame(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="shop" ref="root" class="relative bg-cream text-forest">
    <div class="lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
      <div class="shell pt-20 lg:pt-28">
        <div class="rail-title flex flex-col justify-between gap-8 border-b border-forest pb-8 sm:flex-row sm:items-end">
          <div>
            <p class="eyebrow text-clay-500">01 / Kolekcija</p>
            <h2 class="mt-4 font-display text-5xl leading-[1] tracking-tight sm:text-7xl">
              <span class="block line-mask"><span class="rise block">Ono što se</span></span>
              <span class="block line-mask"><span class="rise block">stalno <em class="italic text-blush-500">vraća</em>.</span></span>
            </h2>
          </div>
          <p class="max-w-xs text-sm leading-relaxed text-forest/65">
            Deset preparata koji čine većinu svega što je kuća ikad prodala — po redosledu porudžbina.
          </p>
        </div>
      </div>

      <div
        ref="track"
        class="shell-rail mt-10 flex gap-5 overflow-x-auto pb-20 scrollbar-none snap-x snap-mandatory lg:overflow-visible lg:pb-0"
      >
        <article
          v-for="(product, i) in items"
          :key="product.slug"
          class="rail-card group w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-[22vw]"
        >
          <TiltCard>
            <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block" data-cursor="view">
              <div class="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]" :class="tiles[i % tiles.length]">
                <img
                  :src="product.image"
                  :alt="product.name"
                  loading="lazy"
                  class="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-105"
                />
                <span class="eyebrow absolute left-4 top-4 rounded-full bg-cream px-3 py-2 text-[0.5625rem] tracking-[0.12em]">
                  {{ product.categories?.[0]?.name ?? 'Nega' }}
                </span>
                <span v-if="i === 0" class="eyebrow absolute right-4 top-4 rounded-full bg-forest px-3 py-2 text-[0.5625rem] tracking-[0.12em] text-cream">Najprodavanije</span>
              </div>
            </RouterLink>
          </TiltCard>
          <div class="mt-5 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-base font-semibold leading-snug">{{ product.name }}</h3>
              <p class="mt-1 text-xs text-forest/55">{{ product.excerpt?.split('.')[0]?.slice(0, 60) }}</p>
            </div>
            <span class="shrink-0 whitespace-nowrap font-mono text-[0.625rem] tabular-nums">{{ product.price?.formatted }}</span>
          </div>
          <button
            type="button"
            class="pill mt-5 w-full justify-between border border-forest/20 py-3 hover:bg-forest hover:text-cream"
            :class="added === product.slug && 'border-clay-500! bg-clay-500! text-cream!'"
            @click="add(product)"
          >
            {{ added === product.slug ? 'Dodato ✓' : 'Dodaj u korpu' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
          </button>
        </article>

        <RouterLink
          :to="{ name: 'catalog' }"
          class="rail-card flex w-[60vw] shrink-0 snap-start items-center justify-center rounded-[1.5rem] bg-forest text-cream sm:w-[40vw] lg:w-[18vw]"
          data-cursor="view"
        >
          <span class="text-center">
            <span class="block font-display text-4xl">Svih 73</span>
            <span class="eyebrow mt-3 block text-sage">Ceo katalog →</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

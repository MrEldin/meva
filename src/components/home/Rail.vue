<script setup>
import TiltCard from '@/components/ui/TiltCard.vue'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The best sellers on a horizontal rail. On desktop the section pins and the
 * scroll wheel pulls the rail sideways; on touch it is a native snap scroller.
 */
const catalog = useCatalogStore()
const cart = useCartStore()

const root = ref(null)
const track = ref(null)

// Sales order from the archive; the shop's eight most-bought products with photos.
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
  <section ref="root" class="relative bg-paper text-ink" data-surface="light">
    <div class="lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
      <div class="shell pt-24 lg:pt-32">
        <div class="rail-title flex flex-wrap items-end justify-between gap-6">
          <h2 class="font-display text-4xl leading-[1] lg:text-6xl">
            <span class="block overflow-hidden"><span class="rise block">Ono što se</span></span>
            <span class="block overflow-hidden"><span class="rise block">stalno <em class="italic text-blush-500">vraća</em>.</span></span>
          </h2>
          <p class="max-w-xs text-sm font-light leading-relaxed text-mist-500">
            Deset preparata koji čine većinu svega što je kuća ikad prodala — po redosledu porudžbina.
          </p>
        </div>
      </div>

      <div
        ref="track"
        class="mt-12 flex gap-5 overflow-x-auto px-5 pb-24 scrollbar-none snap-x snap-mandatory lg:mt-16 lg:overflow-visible lg:px-10 lg:pb-0 xl:px-16"
      >
        <article
          v-for="(product, i) in items"
          :key="product.slug"
          class="rail-card w-[72vw] shrink-0 snap-start sm:w-[46vw] lg:w-[24vw]"
        >
          <TiltCard>
            <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block" data-cursor="view">
              <div class="relative aspect-[4/5] overflow-hidden bg-mist-100">
                <img :src="product.image" :alt="product.name" loading="lazy" class="h-full w-full object-cover" />
                <span class="eyebrow absolute left-4 top-4 text-[0.6rem] text-ink/60">{{ String(i + 1).padStart(2, '0') }}</span>
                <span v-if="i === 0" class="eyebrow absolute right-4 top-4 bg-ink px-2.5 py-1.5 text-[0.55rem] text-paper">Najprodavanije</span>
              </div>
            </RouterLink>
          </TiltCard>
          <div class="mt-5 flex items-start justify-between gap-4">
            <div>
              <h3 class="font-display text-xl leading-tight">{{ product.name }}</h3>
              <p class="mt-1 text-sm font-light tabular-nums text-mist-500">{{ product.price?.formatted }}</p>
            </div>
            <button
              type="button"
              class="eyebrow shrink-0 border border-ink/15 px-4 py-3 text-[0.6rem] transition-all duration-400 hover:border-ink hover:bg-ink hover:text-paper"
              :class="added === product.slug && 'border-blush-500! bg-blush-500! text-paper!'"
              @click="add(product)"
            >
              {{ added === product.slug ? 'Dodato' : 'Dodaj' }}
            </button>
          </div>
        </article>

        <RouterLink
          :to="{ name: 'catalog' }"
          class="rail-card flex w-[60vw] shrink-0 snap-start items-center justify-center border border-ink/10 sm:w-[40vw] lg:w-[18vw]"
          data-cursor="view"
        >
          <span class="text-center">
            <span class="block font-display text-3xl">Svih 73</span>
            <span class="eyebrow mt-3 block text-blush-500">Ceo katalog →</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

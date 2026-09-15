<script setup>
import ProductCard from '@/components/shop/ProductCard.vue'
import ShareRow from '@/components/ui/ShareRow.vue'
import { setMeta } from '@/lib/meta'
import { track } from '@/lib/tracking'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cart = useCartStore()
const catalog = useCatalogStore()

const product = ref(null)
const loading = ref(true)
const failed = ref(false)
const activeImage = ref(0)
const quantity = ref(1)
const added = ref(false)

async function load(slug) {
  loading.value = true
  failed.value = false
  activeImage.value = 0
  quantity.value = 1

  try {
    product.value = await catalog.find(slug)
    describe()
    track.viewProduct(product.value)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }

  catalog.load()
}

watch(() => route.params.slug, (slug) => slug && load(slug), { immediate: true })

const images = computed(() => product.value?.images?.data ?? product.value?.images ?? [])
const setItems = computed(() => product.value?.set?.data ?? product.value?.set ?? [])

const related = computed(() => {
  if (!product.value) return []

  const slugs = product.value.categories.map((c) => c.slug)

  return catalog.products
    .filter((p) => p.id !== product.value.id && p.image && p.categories.some((c) => slugs.includes(c.slug)))
    .slice(0, 4)
})

function addToCart() {
  cart.add(product.value, quantity.value)
  track.addToCart(product.value, quantity.value)
  added.value = true
  setTimeout(() => (added.value = false), 1800)
}

/** What this page says about itself to browsers, share sheets and assistants. */
function describe() {
  const item = product.value
  if (!item) return

  const summary = (item.excerpt ?? '').trim()

  setMeta({
    title: item.name,
    description: `${summary.slice(0, 180)}${item.price ? ` · ${item.price.formatted} · besplatna dostava` : ''}`,
    image: item.image,
    type: 'product',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: item.name,
      description: summary,
      image: item.image ? [item.image] : undefined,
      sku: item.sku,
      brand: { '@type': 'Brand', name: 'Meva Kozmetika' },
      offers: item.price
        ? {
            '@type': 'Offer',
            priceCurrency: 'RSD',
            price: (item.price.minor / 100).toFixed(2),
            availability: 'https://schema.org/InStock',
            url: window.location.href,
          }
        : undefined,
    },
  })
}

/*
 * The old shop stored the whole label as one paragraph: a description, then
 * "Sastav:" and the ingredients, then "Način upotrebe:" and the directions.
 * Read as one block on a phone it is a wall that stands between the visitor
 * and the button, so it is cut back into its three parts here and the last
 * two fold away until they are wanted.
 */
const parts = computed(() => {
  const text = (product.value?.excerpt ?? '').replace(/\r/g, '').trim()
  const grab = (label, next) => {
    const m = text.match(new RegExp(label + ':\\s*([\\s\\S]*?)(?=' + (next ? next + ':' : '$') + ')', 'i'))
    return m ? m[1].trim() : ''
  }
  const intro = text.split(/Sastav:/i)[0].trim()
  const ingredients = grab('Sastav', 'Način upotrebe')
    .split(/\n+|\s+-\s+/).map((x) => x.replace(/^-\s*/, '').trim()).filter(Boolean)
  const usage = grab('Način upotrebe', null)

  return { intro, ingredients, usage }
})

const open = ref({ ingredients: false, usage: false })

const shareText = computed(() =>
  product.value ? `${(product.value.excerpt ?? '').slice(0, 120)}${product.value.price ? ` — ${product.value.price.formatted}` : ''}` : '',
)
</script>

<template>
  <div class="shell py-10 md:py-16">
    <div v-if="loading" class="grid gap-10 md:grid-cols-2">
      <div class="aspect-square animate-pulse bg-mist-100" />
      <div class="space-y-4">
        <div class="h-10 w-3/4 animate-pulse bg-mist-100" />
        <div class="h-4 w-1/3 animate-pulse bg-mist-100" />
      </div>
    </div>

    <div v-else-if="failed" class="py-28 text-center">
      <h1 class="font-display text-3xl text-ink">Proizvod nije pronađen</h1>
      <RouterLink :to="{ name: 'catalog' }" class="eyebrow mt-6 inline-block border-b border-ink pb-1">
        Nazad na proizvode
      </RouterLink>
    </div>

    <template v-else-if="product">
      <nav class="eyebrow mb-8 flex items-center gap-2 text-mist-400">
        <RouterLink :to="{ name: 'catalog' }" class="transition-colors hover:text-ink">Proizvodi</RouterLink>
        <span>/</span>
        <span class="text-ink">{{ product.name }}</span>
      </nav>

      <div class="grid gap-10 md:grid-cols-2 md:gap-16">
        <!-- Gallery -->
        <div>
          <div class="aspect-square overflow-hidden bg-mist-50">
            <img
              v-if="images[activeImage]"
              :src="images[activeImage].url"
              :alt="product.name"
              class="h-full w-full object-cover"
            />
          </div>

          <div v-if="images.length > 1" class="mt-3 grid grid-cols-5 gap-3">
            <button
              v-for="(image, i) in images.slice(0, 5)"
              :key="image.url"
              type="button"
              class="aspect-square overflow-hidden border transition-colors duration-300"
              :class="i === activeImage ? 'border-ink' : 'border-transparent hover:border-mist-300'"
              @click="activeImage = i"
            >
              <img :src="image.url" alt="" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Detail -->
        <div class="md:pt-4">
          <p v-if="product.categories.length" class="text-[0.8125rem] font-bold uppercase tracking-wider text-blush-500">
            {{ product.categories[0].name }}
          </p>

          <h1 class="mt-2 text-[1.75rem] leading-tight text-ink md:text-4xl">{{ product.name }}</h1>

          <p class="mt-3 text-2xl font-bold text-blush-600">
            {{ product.price ? product.price.formatted : 'Cena na upit' }}
          </p>

          <p v-if="parts.intro" class="mt-4 text-[0.9375rem] leading-relaxed text-mist-600">{{ parts.intro }}</p>

          <!-- Set contents -->
          <div v-if="setItems.length" class="mt-5 rounded-2xl bg-blush-50 p-4">
            <p class="text-[0.8125rem] font-bold uppercase tracking-wider text-blush-500">Set sadrži</p>
            <ul class="mt-2.5 space-y-2">
              <li v-for="item in setItems" :key="item.id" class="flex justify-between gap-4 text-[0.9375rem] text-mist-600">
                <span>{{ item.name }}</span>
                <span class="tabular-nums text-mist-400">×{{ item.quantity }}</span>
              </li>
            </ul>
          </div>

          <!-- Buy: right under the price, before anything else -->
          <div v-if="product.price" class="mt-6 flex gap-3">
            <div class="flex shrink-0 items-center rounded-full border border-blush-200">
              <button type="button" class="h-13 w-12 text-lg text-mist-500 transition-colors hover:text-ink" aria-label="Manje" @click="quantity = Math.max(1, quantity - 1)">−</button>
              <span class="w-8 text-center text-[0.9375rem] font-bold tabular-nums">{{ quantity }}</span>
              <button type="button" class="h-13 w-12 text-lg text-mist-500 transition-colors hover:text-ink" aria-label="Više" @click="quantity++">+</button>
            </div>

            <button
              type="button"
              class="h-13 flex-1 rounded-full px-6 text-[0.9375rem] font-bold text-paper transition-colors"
              :class="added ? 'bg-blush-700' : 'bg-blush-500 hover:bg-blush-600'"
              @click="addToCart"
            >
              {{ added ? 'Dodato u korpu ✓' : 'Dodaj u korpu' }}
            </button>
          </div>

          <ul class="mt-5 grid gap-2 text-[0.875rem] text-mist-600">
            <li v-for="line in ['Besplatna dostava u celoj Srbiji', 'Plaćanje pouzećem, kuriru pri preuzimanju', 'Isporuka 1–3 radna dana']" :key="line" class="flex items-center gap-2">
              <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-blush-500" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ line }}
            </li>
          </ul>

          <!-- The label's other two parts, folded until wanted -->
          <div class="mt-6 divide-y divide-blush-100 border-y border-blush-100">
            <div v-if="parts.ingredients.length">
              <button type="button" class="flex w-full items-center justify-between py-4 text-left text-[0.9375rem] font-bold" :aria-expanded="open.ingredients" @click="open.ingredients = !open.ingredients">
                Sastav
                <span class="text-xl leading-none text-blush-500 transition-transform" :class="open.ingredients && 'rotate-45'">+</span>
              </button>
              <ul v-if="open.ingredients" class="flex flex-wrap gap-2 pb-5">
                <li v-for="item in parts.ingredients" :key="item" class="rounded-full bg-blush-50 px-3 py-1.5 text-[0.8125rem] text-mist-600">{{ item }}</li>
              </ul>
            </div>
            <div v-if="parts.usage">
              <button type="button" class="flex w-full items-center justify-between py-4 text-left text-[0.9375rem] font-bold" :aria-expanded="open.usage" @click="open.usage = !open.usage">
                Način upotrebe
                <span class="text-xl leading-none text-blush-500 transition-transform" :class="open.usage && 'rotate-45'">+</span>
              </button>
              <p v-if="open.usage" class="pb-5 text-[0.9375rem] leading-relaxed text-mist-600">{{ parts.usage }}</p>
            </div>
          </div>

          <ShareRow class="mt-6" :title="product.name" :text="shareText" :id="product.sku" label="Pošalji nekome" />
        </div>
      </div>

      <!-- On a phone the button must never scroll out of reach -->
      <div v-if="product.price" class="fixed inset-x-0 bottom-0 z-30 border-t border-blush-100 bg-paper/95 p-3 backdrop-blur md:hidden">
        <div class="flex items-center gap-3">
          <p class="shrink-0 pl-2 text-lg font-bold text-blush-600">{{ product.price.formatted }}</p>
          <button type="button" class="h-12 flex-1 rounded-full bg-blush-500 text-[0.9375rem] font-bold text-paper" @click="addToCart">
            {{ added ? 'Dodato ✓' : 'Dodaj u korpu' }}
          </button>
        </div>
      </div>

      <!-- Related -->
      <section v-if="related.length" class="mt-20 md:mt-28">
        <h2 class="font-display text-2xl text-ink md:text-3xl">Moglo bi vam se svideti</h2>
        <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <ProductCard v-for="item in related" :key="item.id" :product="item" />
        </div>
      </section>
    </template>
  </div>
</template>

<style>
/* The descriptions come from the old shop as free HTML, so they are tamed here
   rather than trusted to arrive with sane markup. */
.prose-meva p { margin-bottom: 1rem; }
.prose-meva ul { list-style: disc; padding-left: 1.25rem; margin-bottom: 1rem; }
.prose-meva li { margin-bottom: 0.375rem; }
.prose-meva strong { font-weight: 500; color: var(--color-ink); }
.prose-meva img { display: none; }
</style>

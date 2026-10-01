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

/** What the parts of a set cost one by one, and what the set saves against that. */
const partsTotal = computed(() => setItems.value.reduce((sum, item) => sum + (item.price?.amount ?? 0) * (item.quantity ?? 1), 0))
const saving = computed(() => (product.value?.price ? Math.max(0, partsTotal.value - product.value.price.amount) : 0))
const rsd = (amount) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(amount)} RSD`

/*
 * HTML written on the desk is the shop's own text, but it is still tamed
 * before it is put on the page: no scripts, no inline handlers, no
 * javascript: links.
 */
function tame(html) {
  const clean = String(html)
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
    .trim()
  return clean.replace(/<[^>]+>|&nbsp;/g, '').trim() ? clean : ''
}

const description = computed(() => tame(product.value?.description?.data?.html ?? product.value?.description?.html ?? ''))

const descriptionOpen = ref(false)
const descriptionLong = computed(() => description.value.replace(/<[^>]+>/g, '').length > 260)

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
    description: `${summary.slice(0, 180)}${item.price ? ` · ${item.price.formatted}` : ''}`,
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
 * The label's three parts come as three fields: the description, the
 * ingredients and the directions. A set often has no ingredients of its
 * own, and then there is simply no such section.
 */
const label = computed(() => {
  const d = product.value?.description?.data ?? product.value?.description ?? {}
  const groups = (Array.isArray(d.ingredients) ? d.ingredients : []).filter((g) => g.items?.length)
  return { ingredients: groups, usage: tame(d.usage ?? '') }
})

/** The part the pointer is on, in the list or on the shelf, so both show it. */
const hovered = ref(null)

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
        <!-- Gallery. The cutout comes first from the API, so the page opens
             with the product standing on its stage rather than sitting in a box;
             the studio photographs follow as thumbnails. -->
        <div>
          <div
            class="relative aspect-square rounded-[1.75rem]"
            :class="images[activeImage]?.cutout ? 'stage' : 'bg-blush-50'"
          >
            <img
              v-if="images[activeImage]"
              :src="images[activeImage].url"
              :alt="product.name"
              fetchpriority="high"
              class="h-full w-full"
              :class="images[activeImage]?.cutout ? 'cutout object-contain p-[4%]' : 'object-cover'"
            />
          </div>

          <div v-if="images.length > 1" class="mt-3 grid grid-cols-5 gap-3">
            <button
              v-for="(image, i) in images.slice(0, 5)"
              :key="image.url"
              type="button"
              class="aspect-square overflow-hidden rounded-[0.875rem] border transition-colors duration-300"
              :class="[
                i === activeImage ? 'border-blush-500' : 'border-blush-100 hover:border-blush-300',
                image.cutout ? 'bg-blush-50/70' : 'bg-blush-50',
              ]"
              @click="activeImage = i"
            >
              <img :src="image.url" alt="" loading="lazy" class="h-full w-full" :class="image.cutout ? 'object-contain p-1.5' : 'object-cover'" />
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

          <p v-if="product.excerpt" class="mt-4 whitespace-pre-line text-[0.9375rem] leading-relaxed text-mist-600">{{ product.excerpt }}</p>

          <!-- The full description, written on the desk; long ones start folded -->
          <div v-if="description" class="mt-4">
            <div class="relative">
              <div
                class="prose-meva text-[0.9375rem] leading-relaxed text-mist-600"
                :class="descriptionLong && !descriptionOpen ? 'max-h-[6.5rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]' : ''"
                v-html="description"
              />
            </div>
            <button
              v-if="descriptionLong"
              type="button"
              class="mt-1 text-[0.875rem] font-bold text-blush-700 underline underline-offset-4 hover:text-blush-600"
              :aria-expanded="descriptionOpen"
              @click="descriptionOpen = !descriptionOpen"
            >{{ descriptionOpen ? 'Prikaži manje' : 'Prikaži ceo opis' }}</button>
          </div>


          <!--
            What is in the set. The parts stand together on one shelf, as they
            do in the set's own photograph, each numbered; the numbers repeat
            in the list beneath, so the picture and the words read as one.
          -->
          <section v-if="setItems.length" class="mt-6" aria-labelledby="set-contents">
            <div class="flex items-baseline justify-between gap-3">
              <h2 id="set-contents" class="text-[1.125rem] text-ink">U setu {{ setItems.length === 1 ? 'je 1 proizvod' : `${setItems.length < 5 ? 'su' : 'je'} ${setItems.length} proizvoda` }}</h2>
              <span v-if="partsTotal" class="text-[0.8125rem] text-mist-500">pojedinačno {{ rsd(partsTotal) }}</span>
            </div>

            <div class="mt-3 overflow-x-auto rounded-[1.25rem] bg-gradient-to-b from-blush-50 via-blush-50 to-blush-100/70">
              <ol class="flex min-w-max items-end justify-around gap-1 px-3 pb-3 pt-6">
                <li
                  v-for="(item, i) in setItems"
                  :key="item.id"
                  class="flex w-[4.75rem] flex-col items-center gap-2 transition-opacity duration-300 sm:w-[5.5rem]"
                  :class="hovered !== null && hovered !== item.id ? 'opacity-45' : ''"
                  @mouseenter="hovered = item.id"
                  @mouseleave="hovered = null"
                >
                  <component
                    :is="item.published && item.slug ? 'RouterLink' : 'span'"
                    :to="item.published && item.slug ? { name: 'product', params: { slug: item.slug } } : undefined"
                    class="flex h-24 items-end transition-transform duration-300 sm:h-28"
                    :class="hovered === item.id ? '-translate-y-2' : ''"
                    :aria-label="item.name"
                  >
                    <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" class="max-h-full w-auto max-w-[4.5rem] object-contain drop-shadow-[0_12px_14px_rgba(142,59,69,0.22)] sm:max-w-[5.25rem]" />
                  </component>
                  <span
                    class="grid h-5 w-5 place-items-center rounded-full text-[0.625rem] font-bold transition-colors duration-300"
                    :class="hovered === item.id ? 'bg-blush-600 text-paper' : 'bg-ink text-paper'"
                  >{{ i + 1 }}</span>
                </li>
              </ol>
            </div>

            <ol class="mt-2 divide-y divide-blush-100">
              <li
                v-for="(item, i) in setItems"
                :key="item.id"
                class="-mx-2 flex items-baseline gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200"
                :class="hovered === item.id ? 'bg-blush-50' : ''"
                @mouseenter="hovered = item.id"
                @mouseleave="hovered = null"
              >
                <span class="w-5 shrink-0 text-[0.75rem] font-bold tabular-nums transition-colors" :class="hovered === item.id ? 'text-blush-600' : 'text-mist-400'">{{ i + 1 }}</span>
                <component
                  :is="item.published && item.slug ? 'RouterLink' : 'span'"
                  :to="item.published && item.slug ? { name: 'product', params: { slug: item.slug } } : undefined"
                  class="min-w-0 flex-1 text-[0.9375rem] leading-snug text-ink"
                  :class="item.published && item.slug ? 'hover:text-blush-700' : ''"
                ><span v-if="item.quantity > 1" class="font-bold">{{ item.quantity }} × </span>{{ item.name }}</component>
                <span v-if="item.price" class="shrink-0 text-[0.9375rem] tabular-nums text-mist-500">{{ item.price.formatted }}</span>
              </li>
            </ol>

            <p v-if="saving > 0" class="mt-3 rounded-xl bg-blush-50 px-4 py-2.5 text-[0.875rem] text-mist-600">
              <span class="font-bold text-blush-700">U setu štedite {{ rsd(saving) }}</span> u odnosu na kupovinu svakog posebno.
            </p>
          </section>

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
            <li v-for="line in ['Dostava kurirom u celoj Srbiji', 'Plaćanje pouzećem, kuriru pri preuzimanju', 'Kurir vas pozove pre isporuke']" :key="line" class="flex items-center gap-2">
              <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-blush-500" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ line }}
            </li>
          </ul>

          <!-- The label's other two parts, folded until wanted; absent when the product has none -->
          <div v-if="label.ingredients.length || label.usage" class="mt-6 divide-y divide-blush-100 border-y border-blush-100">
            <div v-if="label.ingredients.length">
              <button type="button" class="flex w-full items-center justify-between py-4 text-left text-[0.9375rem] font-bold" :aria-expanded="open.ingredients" @click="open.ingredients = !open.ingredients">
                Sastav
                <span class="text-xl leading-none text-blush-500 transition-transform" :class="open.ingredients && 'rotate-45'">+</span>
              </button>
              <div v-if="open.ingredients" class="space-y-5 pb-5">
                <div v-for="(group, gi) in label.ingredients" :key="gi">
                  <p v-if="group.title" class="mb-2 text-[0.8125rem] font-bold text-ink">{{ group.title }}</p>
                  <ul class="flex flex-wrap gap-2">
                    <li
                      v-for="(item, i) in group.items"
                      :key="i"
                      class="inline-flex max-w-full flex-col rounded-2xl bg-gradient-to-br from-blush-100 to-blush-50 px-3.5 py-2 ring-1 ring-inset ring-blush-200/60 transition-colors hover:from-blush-200 hover:to-blush-100"
                    >
                      <span class="text-[0.875rem] font-semibold leading-snug text-ink">{{ item.name || item.inci }}</span>
                      <span v-if="item.name && item.inci" class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-blush-700/70">{{ item.inci }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div v-if="label.usage">
              <button type="button" class="flex w-full items-center justify-between py-4 text-left text-[0.9375rem] font-bold" :aria-expanded="open.usage" @click="open.usage = !open.usage">
                Način upotrebe
                <span class="text-xl leading-none text-blush-500 transition-transform" :class="open.usage && 'rotate-45'">+</span>
              </button>
              <div v-if="open.usage" class="prose-meva pb-5 text-[0.9375rem] leading-relaxed text-mist-600" v-html="label.usage" />
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
          <ProductCard v-for="(item, i) in related" :key="item.id" :product="item" />
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
.prose-meva h1, .prose-meva h2, .prose-meva h3, .prose-meva h4 { font-family: inherit; font-size: 0.9375rem; font-weight: 700; color: var(--color-ink); margin: 1rem 0 0.375rem; }
.prose-meva h3 strong { font-weight: 700; }
.prose-meva img { display: none; }
</style>

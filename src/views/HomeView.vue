<script setup>
import ProductCard from '@/components/product/ProductCard.vue'
import { useCatalogStore } from '@/stores/catalog'
import { computed, onMounted } from 'vue'

const catalog = useCatalogStore()

onMounted(() => catalog.load())

// The two products that carry 41% of revenue lead the page; the rest of the
// row fills out from the catalogue.
const heroSkus = ['sampon-za-kosu-200ml', 'losion-za-seboreicni-dermatitis']

const featured = computed(() => {
  const leading = heroSkus
    .map((slug) => catalog.products.find((p) => p.slug === slug))
    .filter(Boolean)

  const rest = catalog.products.filter((p) => p.image && !heroSkus.includes(p.slug))

  return [...leading, ...rest].slice(0, 8)
})

const sets = computed(() => catalog.products.filter((p) => p.is_set && p.image).slice(0, 3))

const heroImage = computed(() => featured.value[0]?.image ?? null)

const stats = [
  { value: '5.000+', label: 'porudžbina' },
  { value: '73', label: 'proizvoda' },
  { value: '0 din', label: 'dostava' },
]

const categories = computed(() =>
  catalog.collections.filter((c) => c.slug !== 'uncategorized').slice(0, 6),
)

const promises = [
  { title: 'Besplatna dostava', body: 'Na svaku porudžbinu, bez minimalnog iznosa.' },
  { title: 'Plaćanje pouzećem', body: 'Platite kuriru kada paket stigne na vašu adresu.' },
  { title: 'Ručno pravljeno', body: 'Male serije, prirodni sastojci, bez nepotrebnih punila.' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-paper">
      <!-- A soft blush field anchors the composition without tinting the photography. -->
      <div class="pointer-events-none absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-blush-100/70 blur-3xl md:-right-24" />

      <div class="shell relative">
        <div class="grid items-center gap-10 pb-16 pt-28 md:min-h-screen md:grid-cols-2 md:gap-16 md:pb-0 md:pt-0">
          <div class="w-full min-w-0 md:pr-8">
            <p class="eyebrow text-blush-500">Prirodna kozmetika</p>

            <h1 class="mt-6 font-display text-[2.75rem] leading-[1.03] text-ink sm:text-6xl lg:text-[4.5rem]">
              Elegancija kreće
              <span class="block italic text-blush-500">od prave nege</span>
            </h1>

            <p class="mt-7 max-w-md text-base font-light leading-relaxed text-mist-600 md:text-lg">
              Ručno pravljeni preparati za lice, telo i kosu. Bez obećanja koja se ne mogu
              ispuniti — samo sastojci koji rade svoj posao.
            </p>

            <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <RouterLink
                :to="{ name: 'catalog' }"
                class="eyebrow group inline-flex items-center justify-center gap-3 bg-ink px-9 py-4.5 text-paper transition-all duration-400 hover:bg-blush-500"
              >
                Pogledaj proizvode
                <span class="transition-transform duration-400 group-hover:translate-x-1">→</span>
              </RouterLink>

              <RouterLink
                :to="{ name: 'catalog', query: { tip: 'set' } }"
                class="eyebrow inline-flex items-center justify-center border border-ink/15 px-9 py-4.5 text-ink transition-all duration-400 hover:border-ink hover:bg-ink hover:text-paper"
              >
                Setovi
              </RouterLink>
            </div>

            <dl class="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-mist-200 pt-8">
              <div v-for="stat in stats" :key="stat.label">
                <dt class="font-display text-2xl text-ink md:text-3xl">{{ stat.value }}</dt>
                <dd class="eyebrow mt-1.5 text-[0.5625rem] text-mist-400">{{ stat.label }}</dd>
              </div>
            </dl>
          </div>

          <div class="relative -mx-5 md:mx-0 md:h-screen md:py-12">
            <div class="relative aspect-4/5 overflow-hidden bg-mist-100 md:h-full md:aspect-auto">
              <img
                v-if="heroImage"
                :src="heroImage"
                alt=""
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Promises -->
    <section class="border-b border-mist-200 bg-blush-50">
      <div class="shell grid gap-8 py-12 sm:grid-cols-3 md:py-14">
        <div v-for="(promise, i) in promises" :key="promise.title" v-reveal="{ delay: i * 90 }">
          <h3 class="eyebrow text-blush-600">{{ promise.title }}</h3>
          <p class="mt-3 text-sm font-light leading-relaxed text-mist-600">{{ promise.body }}</p>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="shell py-20 md:py-28">
      <div v-reveal class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="eyebrow text-blush-500">Kategorije</p>
          <h2 class="mt-4 max-w-lg font-display text-3xl leading-tight text-ink md:text-5xl">
            Nega koja počinje od problema, ne od police
          </h2>
        </div>
        <RouterLink :to="{ name: 'catalog' }" class="eyebrow border-b border-ink/25 pb-1.5 text-ink transition-colors hover:border-blush-500 hover:text-blush-500">
          Sve kategorije
        </RouterLink>
      </div>

      <div class="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-16 md:grid-cols-3 md:gap-8">
        <RouterLink
          v-for="(category, i) in categories"
          :key="category.slug"
          v-reveal="{ delay: i * 70 }"
          :to="{ name: 'catalog', query: { kategorija: category.slug } }"
          class="group relative flex flex-col justify-between overflow-hidden bg-mist-100 p-6 transition-colors duration-500 hover:bg-ink md:aspect-4/3 md:p-8"
        >
          <span class="eyebrow text-mist-400 transition-colors duration-500 group-hover:text-blush-300">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <div class="mt-10 md:mt-0">
            <h3 class="font-display text-xl leading-tight text-ink transition-colors duration-500 group-hover:text-paper md:text-3xl">
              {{ category.name }}
            </h3>
            <p class="mt-2 text-xs font-light text-mist-500 transition-colors duration-500 group-hover:text-paper/55">
              {{ category.products_count }} proizvoda
            </p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Bestsellers -->
    <section class="bg-mist-50 py-20 md:py-28">
      <div class="shell">
        <div v-reveal class="max-w-xl">
          <p class="eyebrow text-blush-500">Najprodavanije</p>
          <h2 class="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            Ono čemu se kupci vraćaju
          </h2>
        </div>

        <div v-if="catalog.loading" class="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-8">
          <div v-for="n in 4" :key="n" class="animate-pulse">
            <div class="aspect-4/5 bg-mist-200" />
            <div class="mt-4 h-4 w-3/4 bg-mist-200" />
            <div class="mt-2 h-3 w-1/3 bg-mist-200" />
          </div>
        </div>

        <div v-else class="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-8">
          <div v-for="(product, i) in featured" :key="product.id" v-reveal="{ delay: (i % 4) * 80 }">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>

    <!-- Story -->
    <section class="relative overflow-hidden bg-ink py-24 text-paper md:py-36">
      <div class="shell grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <div v-reveal>
          <p class="eyebrow text-blush-300">Naša priča</p>
          <h2 class="mt-6 font-display text-3xl leading-[1.15] md:text-5xl">
            Počelo je kućnom kuhinjom i jednim melemom koji je
            <span class="italic text-blush-300">stvarno pomogao</span>
          </h2>
          <p class="mt-7 max-w-md text-base font-light leading-relaxed text-paper/70">
            Danas Meva pravi preparate za ekcem, psorijazu, seboreju i akne — stanja
            s kojima se ljudi bore godinama. Svaka serija je mala, svaki sastojak ima razlog
            da bude tu.
          </p>
          <RouterLink
            :to="{ name: 'catalog' }"
            class="eyebrow group mt-10 inline-flex items-center gap-3 border-b border-paper/25 pb-2 transition-colors hover:border-blush-300 hover:text-blush-300"
          >
            Istraži proizvode
            <span class="transition-transform duration-400 group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>

        <div v-reveal="{ delay: 140 }" class="grid grid-cols-2 gap-4">
          <div
            v-for="(product, i) in sets"
            :key="product.id"
            class="overflow-hidden bg-ink-soft"
            :class="i === 0 && 'col-span-2 aspect-16/10'"
          >
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              loading="lazy"
              class="h-full w-full object-cover opacity-85 transition-all duration-[1.2s] ease-[var(--ease-silk)] hover:scale-105 hover:opacity-100"
              :class="i !== 0 && 'aspect-square'"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Delivery -->
    <section id="dostava" class="shell py-20 md:py-28">
      <div v-reveal class="mx-auto max-w-2xl text-center">
        <p class="eyebrow text-blush-500">Dostava i plaćanje</p>
        <h2 class="mt-5 font-display text-3xl leading-tight text-ink md:text-4xl">
          Naručite danas, platite kuriru
        </h2>
        <p class="mt-6 text-base font-light leading-relaxed text-mist-600">
          Dostava je besplatna na teritoriji Srbije i plaća se pouzećem — ništa unaprijed,
          ništa online. Paket obično stiže za dva do tri radna dana.
        </p>
        <RouterLink
          :to="{ name: 'catalog' }"
          class="eyebrow mt-10 inline-flex bg-ink px-10 py-4.5 text-paper transition-colors duration-400 hover:bg-blush-500"
        >
          Naruči
        </RouterLink>
      </div>
    </section>
  </div>
</template>

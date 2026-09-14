<script setup>
import Magnetic from '@/components/ui/Magnetic.vue'
import { gsap } from '@/lib/motion'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref } from 'vue'

/**
 * The finder: two questions, one answer. The visitor says where and what,
 * the shop answers with the preparation the house would hand them over the
 * counter — from the real catalogue, ready to add to the cart.
 */
const catalog = useCatalogStore()
const cart = useCartStore()

const areas = [
  {
    key: 'glava',
    label: 'Koža glave',
    hint: 'perut, svrab, masno teme',
    issues: [
      { label: 'Perutanje i svrab', slugs: ['losion-za-seboreicni-dermatitis', 'sampon-za-kosu-200ml'], why: 'Salicilna kiselina skida perut, niacinamid smiruje kožu glave. Šampon bez sulfata da je ne razdražuje ponovo.' },
      { label: 'Ljuskanje i crveni plakovi', slugs: ['set-za-psorijazu-za-kozu-glave', 'ulje-za-psorijazu-50ml'], why: 'Psorijaza na koži glave traži ceo ritual: šampon, losion, ulje i noćnu kremu koji rade zajedno.' },
      { label: 'Masno teme', slugs: ['sampon-za-kosu-200ml', 'losion-za-seboreicni-dermatitis'], why: 'Šampon N°10 pere bez silikona koji zatvaraju kožu; losion uveče reguliše lučenje.' },
      { label: 'Opadanje kose', slugs: ['losion-za-brzi-rast-kose-100ml', 'set-protiv-opadanja-kose-sa-manjim-uljem'], why: 'Losion za rast budi folikule; u setu sa šamponom i uljem daje najbolji rezultat.' },
    ],
  },
  {
    key: 'lice',
    label: 'Lice',
    hint: 'akne, crvenilo, bore, suvoća',
    issues: [
      { label: 'Akne i bubuljice', slugs: ['krema-protiv-akni', 'losion-protiv-akni-dan'], why: '„Dva dana mazanja i nestaju“ — Aleksandra, kupac. Krema uveče, losion ujutru.' },
      { label: 'Crvenilo i rozacea', slugs: ['dnevna-krema-za-rozaceu', 'nocna-krema-za-rozaceu'], why: 'Dnevna štiti i smiruje, noćna obnavlja. Bez mirisa i alkohola.' },
      { label: 'Bore i gubitak tonusa', slugs: ['krema-protiv-bora-50ml', 'hyalu-e-serum'], why: 'Krema N°4 hrani, hijaluron sa vitaminom E puni kožu iznutra.' },
      { label: 'Suva, dehidrirana koža', slugs: ['hijaluronska-krema-sa-vitaminom-e', 'n3-vita-vitaminski-serum'], why: 'Hijaluronska krema veže vodu u koži; vitaminski serum vraća sjaj.' },
      { label: 'Seboreja na licu', slugs: ['krema-za-seboreju-dan', 'krema-za-seboreju-noc'], why: 'Par kremova razvijen baš za seboreični dermatitis na licu — dan i noć.' },
      { label: 'Ekcem', slugs: ['dnevna-krema-za-ekcem', 'nocna-krema-za-ekcem'], why: 'Obnavlja barijeru kože i smiruje svrab, bez kortikosteroida.' },
    ],
  },
  {
    key: 'telo',
    label: 'Telo',
    hint: 'ekcem, psorijaza, suva koža',
    issues: [
      { label: 'Ekcem po telu', slugs: ['set-za-ekcem-po-telu', 'dnevna-krema-za-ekcem'], why: 'Set pokriva pranje, dnevnu i noćnu negu i detoks iznutra.' },
      { label: 'Psorijaza po telu', slugs: ['set-za-psorijazu-za-telo', 'krema-za-psorijazu-dan'], why: 'Dnevna i noćna krema za psorijazu plus body butter za hidrataciju između.' },
      { label: 'Suva i gruba koža', slugs: ['the-body-butter', 'kupka-za-telo-200ml'], why: 'Body butter od biljnih masti, upija se bez masnog traga.' },
      { label: 'Ispucale pete', slugs: ['krema-za-pete-i-stopala', 'the-body-butter'], why: 'Gusta krema koja omekšava zadebljanu kožu preko noći.' },
    ],
  },
  {
    key: 'kosa',
    label: 'Kosa',
    hint: 'opadanje, oštećenje, rast',
    issues: [
      { label: 'Opadanje', slugs: ['set-protiv-opadanja-kose-sa-manjim-uljem', 'losion-za-brzi-rast-kose-100ml'], why: 'Šampon, ulje i losion za rast — tri koraka koja se dopunjuju.' },
      { label: 'Oštećena, lomljiva kosa', slugs: ['keratin-regenerator', 'serum-za-krajeve-kose-30ml'], why: 'Keratin puni oštećenja u vlasi, serum zatvara krajeve.' },
      { label: 'Spor rast', slugs: ['losion-za-brzi-rast-kose-100ml', 'ulje-za-rast-obrva-i-trepavica-100ml'], why: 'Losion pojačava cirkulaciju kože glave; ulje hrani koren.' },
      { label: 'Obrve i trepavice', slugs: ['ulje-za-rast-obrva-i-trepavica-50ml'], why: 'Ricinusovo i bademovo ulje, naneti četkicom uveče.' },
    ],
  },
]

const step = ref(0)
const area = ref(null)
const issue = ref(null)
const added = ref('')

const products = computed(() =>
  (issue.value?.slugs ?? []).map((slug) => catalog.products.find((p) => p.slug === slug)).filter(Boolean),
)

function pickArea(a) {
  area.value = a
  step.value = 1
}

function pickIssue(i) {
  issue.value = i
  step.value = 2
}

function reset() {
  step.value = 0
  area.value = null
  issue.value = null
}

function add(product) {
  cart.add(product)
  added.value = product.slug
  setTimeout(() => (added.value = ''), 1600)
}

// GSAP-driven step transitions: options scatter out, the next set rises in.
function onEnter(el, done) {
  gsap.fromTo(el.querySelectorAll('.f-item'), { y: 36, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: 'power3.out', onComplete: done })
}

function onLeave(el, done) {
  gsap.to(el.querySelectorAll('.f-item'), { y: -24, opacity: 0, stagger: 0.03, duration: 0.3, ease: 'power2.in', onComplete: done })
}
</script>

<template>
  <section id="pronadji" class="relative overflow-hidden bg-ink text-paper" data-surface="dark">
    <div class="pointer-events-none absolute -right-40 top-1/3 h-[40rem] w-[40rem] rounded-full bg-blush-500/15 blur-[140px]" />

    <div class="shell py-24 lg:py-36">
      <div class="grid gap-14 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <p class="eyebrow text-blush-300">Pronađi svoj preparat</p>
          <h2 class="mt-5 font-display text-4xl leading-[1] lg:text-6xl">
            Kaži nam<br />šta te <em class="italic text-blush-300">muči</em>.
          </h2>
          <p class="mt-6 max-w-xs text-sm font-light leading-relaxed text-paper/55">
            Dva pitanja. Isti odgovor koji biste dobili preko pulta u Novom Pazaru.
          </p>

          <ol class="mt-10 flex items-center gap-3">
            <li v-for="n in 3" :key="n" class="flex items-center gap-3">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors duration-500"
                :class="step >= n - 1 ? 'border-blush-300 text-blush-300' : 'border-paper/20 text-paper/30'"
              >{{ n }}</span>
              <span v-if="n < 3" class="h-px w-8 transition-colors duration-500" :class="step >= n ? 'bg-blush-300' : 'bg-paper/15'" />
            </li>
          </ol>

          <button v-if="step > 0" type="button" class="eyebrow mt-10 text-paper/50 transition-colors hover:text-blush-300" @click="reset">
            ← Od početka
          </button>
        </div>

        <div class="min-h-[22rem] lg:col-span-8">
          <Transition mode="out-in" :css="false" @enter="onEnter" @leave="onLeave">
            <!-- Step 1: where -->
            <div v-if="step === 0" key="area" class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="a in areas"
                :key="a.key"
                type="button"
                class="f-item group flex items-end justify-between border border-paper/12 p-6 text-left transition-all duration-500 hover:border-blush-300 hover:bg-paper/[0.03] sm:min-h-[11rem]"
                @click="pickArea(a)"
              >
                <span>
                  <span class="block font-display text-3xl">{{ a.label }}</span>
                  <span class="mt-2 block text-xs font-light text-paper/45">{{ a.hint }}</span>
                </span>
                <span class="flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 transition-all duration-500 group-hover:border-blush-300 group-hover:bg-blush-300 group-hover:text-ink">→</span>
              </button>
            </div>

            <!-- Step 2: what -->
            <div v-else-if="step === 1" key="issue">
              <p class="f-item eyebrow mb-6 text-paper/45">{{ area.label }} — šta se dešava?</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="i in area.issues"
                  :key="i.label"
                  type="button"
                  class="f-item group flex items-center justify-between border border-paper/12 px-6 py-6 text-left transition-all duration-500 hover:border-blush-300 hover:bg-paper/[0.03]"
                  @click="pickIssue(i)"
                >
                  <span class="font-display text-2xl">{{ i.label }}</span>
                  <span class="text-paper/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-blush-300">→</span>
                </button>
              </div>
            </div>

            <!-- Step 3: the answer -->
            <div v-else key="result">
              <p class="f-item eyebrow mb-6 text-blush-300">{{ area.label }} · {{ issue.label }}</p>
              <div class="grid gap-6 md:grid-cols-2">
                <article
                  v-for="(product, i) in products"
                  :key="product.slug"
                  class="f-item group relative border border-paper/12 p-5 transition-colors duration-500 hover:border-blush-300"
                  :class="i === 0 ? '' : 'md:mt-10'"
                >
                  <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block" data-cursor="view">
                    <div class="aspect-square overflow-hidden bg-mist-200">
                      <img v-if="product.image" :src="product.image" :alt="product.name" class="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-silk)] group-hover:scale-105" />
                    </div>
                  </RouterLink>
                  <p class="eyebrow mt-5 text-[0.6rem] text-paper/40">{{ i === 0 ? 'Preporuka' : 'Uz to' }}</p>
                  <h3 class="mt-2 font-display text-2xl leading-tight">{{ product.name }}</h3>
                  <div class="mt-4 flex items-center justify-between">
                    <span class="text-sm tabular-nums text-paper/70">{{ product.price?.formatted }}</span>
                    <Magnetic :strength="0.2">
                      <button
                        type="button"
                        class="eyebrow border border-paper/30 px-5 py-3 text-[0.6rem] transition-all duration-400 hover:border-paper hover:bg-paper hover:text-ink"
                        :class="added === product.slug && 'border-blush-300! bg-blush-300! text-ink!'"
                        @click="add(product)"
                      >
                        {{ added === product.slug ? 'Dodato ✓' : 'Dodaj u korpu' }}
                      </button>
                    </Magnetic>
                  </div>
                </article>
              </div>
              <p class="f-item mt-8 max-w-lg text-sm font-light leading-relaxed text-paper/55">
                <span class="text-blush-300">Zašto ovo:</span> {{ issue.why }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

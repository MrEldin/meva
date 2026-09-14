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
  <section id="pronadji" class="relative overflow-hidden bg-sage text-forest">
    <div class="shell py-20 lg:py-28">
      <div class="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div class="flex flex-col justify-between">
          <div>
            <p class="eyebrow text-sage-deep">02 / Pronađi svoj preparat</p>
            <h2 class="mt-5 font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Kaži nam<br />šta te <em class="italic">muči</em>.
            </h2>
            <p class="mt-6 max-w-xs text-sm leading-relaxed text-forest/70">
              Dva pitanja. Isti odgovor koji biste dobili preko pulta u Novom Pazaru.
            </p>
          </div>

          <div class="mt-10 flex items-center gap-3">
            <ol class="flex items-center gap-3">
              <li v-for="n in 3" :key="n" class="flex items-center gap-3">
                <span
                  class="flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[0.625rem] transition-colors duration-500"
                  :class="step >= n - 1 ? 'border-forest bg-forest text-cream' : 'border-forest/25 text-forest/40'"
                >{{ n }}</span>
                <span v-if="n < 3" class="h-px w-8 transition-colors duration-500" :class="step >= n ? 'bg-forest' : 'bg-forest/20'" />
              </li>
            </ol>
            <button v-if="step > 0" type="button" class="eyebrow ml-4 text-forest/60 transition-colors hover:text-clay-600" @click="reset">← Od početka</button>
          </div>
        </div>

        <div class="min-h-[22rem]">
          <Transition mode="out-in" :css="false" @enter="onEnter" @leave="onLeave">
            <!-- Step 1: where -->
            <div v-if="step === 0" key="area" class="grid gap-4 sm:grid-cols-2">
              <button
                v-for="a in areas"
                :key="a.key"
                type="button"
                class="f-item group flex items-end justify-between rounded-[1.5rem] bg-sand p-7 text-left transition-all duration-500 hover:bg-forest hover:text-cream sm:min-h-[12rem]"
                @click="pickArea(a)"
              >
                <span>
                  <span class="block font-display text-3xl">{{ a.label }}</span>
                  <span class="mt-2 block text-xs text-current/55">{{ a.hint }}</span>
                </span>
                <span class="flex h-11 w-11 items-center justify-center rounded-full border border-current/20 transition-all duration-500 group-hover:bg-sage group-hover:text-forest">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4"><path d="M7 7l10 10M17 7v10H7" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
              </button>
            </div>

            <!-- Step 2: what -->
            <div v-else-if="step === 1" key="issue">
              <p class="f-item eyebrow mb-6 text-forest/60">{{ area.label }} — šta se dešava?</p>
              <div class="grid gap-4 sm:grid-cols-2">
                <button
                  v-for="i in area.issues"
                  :key="i.label"
                  type="button"
                  class="f-item group flex items-center justify-between rounded-[1.5rem] bg-sand px-7 py-6 text-left transition-all duration-500 hover:bg-forest hover:text-cream"
                  @click="pickIssue(i)"
                >
                  <span class="font-display text-2xl">{{ i.label }}</span>
                  <span class="text-current/50 transition-all duration-500 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>

            <!-- Step 3: the answer -->
            <div v-else key="result">
              <p class="f-item eyebrow mb-6 text-clay-600">{{ area.label }} · {{ issue.label }}</p>
              <div class="grid gap-5 md:grid-cols-2">
                <article
                  v-for="(product, i) in products"
                  :key="product.slug"
                  class="f-item group rounded-[1.5rem] bg-sand p-4"
                >
                  <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="block" data-cursor="view">
                    <div class="aspect-square overflow-hidden rounded-[1.25rem]" :class="i === 0 ? 'bg-rose' : 'bg-sky'">
                      <img v-if="product.image" :src="product.image" :alt="product.name" class="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-105" />
                    </div>
                  </RouterLink>
                  <div class="px-2 pb-2 pt-5">
                    <p class="eyebrow text-[0.5625rem] text-clay-500">{{ i === 0 ? 'Preporuka' : 'Uz to' }}</p>
                    <h3 class="mt-2 text-base font-semibold leading-snug">{{ product.name }}</h3>
                    <div class="mt-4 flex items-center justify-between gap-3">
                      <span class="font-mono text-[0.625rem] tabular-nums">{{ product.price?.formatted }}</span>
                      <Magnetic :strength="0.2">
                        <button
                          type="button"
                          class="pill border border-forest/20 py-3 hover:bg-forest hover:text-cream"
                          :class="added === product.slug && 'border-clay-500! bg-clay-500! text-cream!'"
                          @click="add(product)"
                        >
                          {{ added === product.slug ? 'Dodato ✓' : 'Dodaj' }}
                        </button>
                      </Magnetic>
                    </div>
                  </div>
                </article>
              </div>
              <p class="f-item mt-8 max-w-lg text-sm leading-relaxed text-forest/70">
                <span class="font-semibold text-forest">Zašto ovo:</span> {{ issue.why }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

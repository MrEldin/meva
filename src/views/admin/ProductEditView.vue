<script setup>
import ImageManager from '@/components/admin/editor/ImageManager.vue'
import SetComposer from '@/components/admin/editor/SetComposer.vue'
import IngredientsEditor from '@/components/admin/editor/IngredientsEditor.vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import RichText from '@/components/admin/editor/RichText.vue'
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * One product.
 *
 * The form is in the order the work is done -- what it is, what it says, what
 * it costs, what it looks like -- rather than one column of identical boxes.
 * The description is written rather than typed as HTML, and the address is
 * not a field: it is derived from the name, and changing it breaks every link
 * to the product that has ever been shared, so it is shown as a fact with a
 * way to change it on purpose.
 */
const route = useRoute()
const router = useRouter()

// "new" is the editor in its empty state; anything else is a product's id.
const creating = computed(() => route.params.id === 'new' || route.params.id === 'novi')

const form = ref(null)
const original = ref(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const errors = ref({})
const editingSlug = ref(false)

const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(original.value))

/**
 * The set side of the editor.
 *
 * A new set arrives from the product list with its parts in the address
 * (?set=1,2,3) and is made in one call, parts and all. An existing set keeps
 * its parts here and saves them separately from its own fields; a plain
 * product can be given parts and become a set, and a set can be taken apart.
 */
/** Every shelf, and the ones this product sits on. The storefront filters by these. */
const categories = ref([])

const isSet = ref(false)
const items = ref([])
const originalItems = ref([])
const composing = ref(false)
const savingItems = ref(false)
const itemsError = ref('')

const assembling = computed(() => creating.value && Boolean(route.query.set))
const itemsDirty = computed(() => JSON.stringify(items.value) !== JSON.stringify(originalItems.value))
const partsTotal = computed(() => items.value.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0))
const money = (dinars) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(dinars)} RSD`

function toggleCategory(id) {
  const i = form.value.categories.indexOf(id)
  if (i === -1) form.value.categories.push(id)
  else form.value.categories.splice(i, 1)
}

const asItems = (list) => list.map((item) => ({ product_id: item.id, quantity: item.quantity }))

async function loadItems(id) {
  const { data } = await client.get(`/admin/products/${id}/set`)
  items.value = data.data
  originalItems.value = JSON.parse(JSON.stringify(items.value))
}

async function saveItems() {
  if (savingItems.value) return
  savingItems.value = true
  itemsError.value = ''

  try {
    const { data } = await client.put(`/admin/products/${route.params.id}/set`, { items: asItems(items.value) })
    items.value = data.data
    originalItems.value = JSON.parse(JSON.stringify(items.value))
    isSet.value = true
    composing.value = false
  } catch (error) {
    itemsError.value = error.response?.data?.errors?.items?.[0] ?? error.response?.data?.message ?? 'Nije sačuvano.'
  } finally {
    savingItems.value = false
  }
}

async function dissolve() {
  if (!window.confirm('Razložiti set? Proizvod ostaje, sa istim imenom, cenom i slikama, ali više nije set i ne prikazuje delove.')) return

  await client.delete(`/admin/products/${route.params.id}/set`)
  isSet.value = false
  items.value = []
  originalItems.value = []
  composing.value = false
}

const slugify = (value) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

async function load() {
  loading.value = true
  editingSlug.value = false

  if (!categories.value.length) {
    const { data } = await client.get('/admin/products/categories')
    categories.value = data.data.filter((c) => c.slug !== 'uncategorized')
  }

  if (creating.value) {
    form.value = { name: '', slug: '', short_description: '', description: '', ingredients: [], usage: '', price: 0, status: 'draft', categories: [] }

    // Arriving from the list with parts ticked: fetch them, and start the
    // price at what they cost together, which the desk then lowers.
    if (assembling.value) {
      const ids = String(route.query.set).split(',').map(Number).filter(Boolean)
      const parts = await Promise.all(ids.map((id) => client.get(`/admin/products/${id}`).then(({ data }) => data.data)))
      items.value = parts.filter((p) => !p.is_set).map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 }))
      form.value.price = partsTotal.value
      composing.value = true
      // A set sits on Setovi whatever else is ticked; the API adds it too.
      const sets = categories.value.find((c) => c.slug === 'setovi')
      if (sets) form.value.categories = [sets.id]
    }

    original.value = JSON.parse(JSON.stringify(form.value))
    setMeta({ title: assembling.value ? 'Novi set' : 'Novi proizvod' })
    loading.value = false

    return
  }

  const { data } = await client.get(`/admin/products/${route.params.id}`)
  const product = data.data

  form.value = {
    name: product.name ?? '',
    slug: product.slug ?? '',
    short_description: product.short_description ?? '',
    description: product.description ?? '',
    ingredients: (product.ingredients ?? []).map((r) => ({ inci: r.inci ?? '', name: r.name ?? '' })),
    usage: product.usage ?? '',
    price: product.price ?? 0,
    status: product.status,
    categories: (product.categories ?? []).map((c) => c.id),
  }
  original.value = JSON.parse(JSON.stringify(form.value))

  isSet.value = Boolean(product.is_set)
  items.value = []
  originalItems.value = []
  composing.value = false
  if (isSet.value) await loadItems(product.id)

  setMeta({ title: product.name ?? 'Proizvod' })
  loading.value = false
}

// A new product's address follows its name until it has been saved once.
watch(() => form.value?.name, (name) => {
  if (creating.value && form.value) form.value.slug = slugify(name)
})

async function save() {
  if (saving.value) return

  saving.value = true
  errors.value = {}

  try {
    if (creating.value) {
      const { data } = assembling.value
        ? await client.post('/admin/products/sets', { ...form.value, items: asItems(items.value) })
        : await client.post('/admin/products', form.value)
      router.replace({ name: 'admin.product', params: { id: data.data.id } })

      return
    }

    await client.put(`/admin/products/${route.params.id}`, form.value)
    original.value = JSON.parse(JSON.stringify(form.value))
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (error) {
    errors.value = error.response?.data?.errors ?? {}
  } finally {
    saving.value = false
  }
}

watch(() => route.params.id, load)

onMounted(load)
</script>

<template>
  <div>
    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <form v-else @submit.prevent="save">
      <PageHeader
        tone="products"
        :eyebrow="creating ? (assembling ? 'Novi set' : 'Novi proizvod') : (isSet ? 'Izmena seta' : 'Izmena proizvoda')"
        :title="form.name || 'Bez naziva'"
        :back="{ name: 'admin.products' }"
        back-label="Svi proizvodi"
      >
        <template #actions>
          <span v-if="saved" class="delta delta-up">Sačuvano</span>
          <span v-else-if="dirty && !creating" class="delta delta-flat">Ima nesačuvanih izmena</span>
          <button type="submit" class="btn btn-primary" :disabled="saving || (!dirty && !creating)">
            {{ saving ? 'Čuvanje…' : (creating ? (assembling ? 'Napravi set' : 'Napravi proizvod') : 'Sačuvaj') }}
          </button>
        </template>
      </PageHeader>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <!-- What it is, and what it says -->
        <div class="space-y-4">
          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Osnovno</h2>

            <label class="mt-4 block">
              <span class="label text-forest/55">Naziv</span>
              <input v-model="form.name" type="text" class="field mt-1.5 w-full text-[1.0625rem]" :placeholder="assembling || isSet ? 'npr. Set protiv flekica' : 'npr. Krema za seboreju — dan (50ml)'" />
              <span v-if="errors.name" class="mt-1 block text-xs text-clay-700">{{ errors.name[0] }}</span>
            </label>

            <!-- The address. A fact, not a field. -->
            <div class="mt-4">
              <span class="label text-forest/55">Adresa u prodavnici</span>

              <div v-if="!editingSlug" class="mt-1.5 flex items-center gap-2 rounded-xl bg-cream px-3.5 py-2.5">
                <span class="min-w-0 flex-1 truncate font-mono text-[0.8125rem] text-forest/70">meva.life/product/{{ form.slug || '…' }}</span>
                <button v-if="!creating" type="button" class="shrink-0 text-[0.75rem] font-bold text-clay-600 hover:text-clay-700" @click="editingSlug = true">
                  Promeni
                </button>
              </div>

              <template v-else>
                <input v-model="form.slug" type="text" class="field mt-1.5 w-full font-mono text-[0.875rem]" />
                <p class="mt-1.5 text-[0.8125rem] text-clay-700">
                  Menjanjem adrese prestaje da radi svaki link ka ovom proizvodu koji je do sada poslat ili podeljen. Menjajte je samo ako stvarno morate.
                </p>
              </template>

              <span v-if="errors.slug" class="mt-1 block text-xs text-clay-700">{{ errors.slug[0] }}</span>
            </div>

            <label class="mt-4 block">
              <span class="label text-forest/55">Kratak opis</span>
              <textarea v-model="form.short_description" rows="3" class="field mt-1.5 w-full" placeholder="Jedna do dve rečenice — ovo stoji ispod cene i u pretrazi." />
            </label>
          </section>

          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Opis</h2>
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">Šta je proizvod i kome je namenjen. Sastav i način upotrebe idu u svoja polja ispod.</p>

            <div class="mt-3">
              <RichText v-model="form.description" />
            </div>
          </section>

          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Sastav</h2>
            <p v-if="isSet || assembling" class="mt-0.5 text-[0.8125rem] text-forest/50">
              Set nema svoj sastav: na stranici se prikazuje sastav svakog proizvoda iz seta, grupisano po proizvodu.
            </p>
            <template v-else>
              <p class="mt-0.5 text-[0.8125rem] text-forest/50">Jedan red po sastojku, redosledom sa etikete. Prazno: sekcija se ne prikazuje.</p>
              <div class="mt-3">
                <IngredientsEditor v-model="form.ingredients" />
              </div>
            </template>
          </section>

          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Način upotrebe</h2>
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">Na stranici stoji kao posebna sekcija „Način upotrebe". Prazno: sekcija se ne prikazuje.</p>

            <div class="mt-3">
              <RichText v-model="form.usage" />
            </div>
          </section>
        </div>

        <!-- What it costs, and what it looks like -->
        <div class="space-y-4">
          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Cena i status</h2>

            <label class="mt-4 block">
              <span class="label text-forest/55">Cena</span>
              <span class="relative mt-1.5 block">
                <input v-model.number="form.price" type="number" min="0" step="10" class="field w-full pr-14 text-[1.125rem] tabular-nums" />
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.8125rem] font-semibold text-forest/40">RSD</span>
              </span>
              <span v-if="errors.price" class="mt-1 block text-xs text-clay-700">{{ errors.price[0] }}</span>
              <span v-if="(assembling || isSet) && items.length" class="mt-1.5 block text-[0.75rem] text-forest/50">
                Delovi pojedinačno: {{ money(partsTotal) }}<template v-if="form.price < partsTotal"> · set je jeftiniji za {{ money(partsTotal - form.price) }}</template>
              </span>
            </label>

            <fieldset class="mt-4">
              <span class="label text-forest/55">Status</span>
              <div class="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  v-for="option in [{ v: 'published', l: 'Objavljen', n: 'Vidi se u prodavnici' }, { v: 'draft', l: 'Skica', n: 'Niko ga ne vidi' }]"
                  :key="option.v"
                  type="button"
                  class="rounded-xl border p-3 text-left transition-colors"
                  :class="form.status === option.v ? 'border-clay-500 bg-clay-50' : 'border-forest/10 hover:bg-cream'"
                  @click="form.status = option.v"
                >
                  <span class="block text-[0.875rem] font-bold">{{ option.l }}</span>
                  <span class="mt-0.5 block text-[0.75rem] text-forest/50">{{ option.n }}</span>
                </button>
              </div>
            </fieldset>

            <RouterLink
              v-if="!creating && form.slug"
              :to="{ name: 'product', params: { slug: form.slug } }"
              target="_blank"
              class="mt-4 flex items-center justify-between rounded-xl bg-cream px-3.5 py-2.5 text-[0.8125rem] font-semibold transition-colors hover:bg-sand"
            >
              Pogledaj u prodavnici
              <span aria-hidden="true">↗</span>
            </RouterLink>
          </section>

          <!-- Where it sits in the shop -->
          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Kategorije</h2>
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">Po ovome se filtrira u prodavnici. Može više odjednom.</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="c in categories"
                :key="c.id"
                type="button"
                class="rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition-colors"
                :class="form.categories.includes(c.id) ? 'border-forest bg-forest text-cream' : 'border-forest/12 hover:bg-cream'"
                @click="toggleCategory(c.id)"
              >{{ c.name }}</button>
            </div>
            <p v-if="(isSet || assembling) && !form.categories.includes(categories.find((c) => c.slug === 'setovi')?.id)" class="mt-2 text-[0.75rem] text-forest/50">
              Set uvek ide i u „Setovi", to se dodaje samo.
            </p>
            <span v-if="errors.categories" class="mt-1 block text-xs text-clay-700">{{ errors.categories[0] }}</span>
          </section>

          <!-- What is in it -->
          <section v-if="assembling || isSet || composing || !creating" class="panel p-4 sm:p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="font-display text-[1.25rem] leading-tight">{{ isSet || assembling ? 'Sadržaj seta' : 'Set' }}</h2>
                <p class="mt-0.5 text-[0.8125rem] text-forest/50">
                  <template v-if="isSet || assembling">Šta kupac dobija. Prodaje se kao jedan artikal.</template>
                  <template v-else>Ovaj proizvod može da postane set: dodajte mu delove.</template>
                </p>
              </div>
              <button v-if="isSet && !creating" type="button" class="btn btn-ghost shrink-0 text-clay-700" @click="dissolve">Razloži set</button>
            </div>

            <template v-if="assembling || isSet || composing">
              <div class="mt-4">
                <SetComposer v-model="items" :exclude-id="creating ? null : route.params.id" />
              </div>
              <p v-if="errors.items" class="mt-2 text-xs text-clay-700">{{ errors.items[0] }}</p>
              <p v-if="itemsError" class="mt-2 text-xs text-clay-700">{{ itemsError }}</p>

              <div v-if="!creating" class="mt-4 flex items-center justify-end gap-2">
                <button v-if="composing && !isSet" type="button" class="btn btn-ghost" @click="composing = false; items = []">Odustani</button>
                <button type="button" class="btn btn-primary" :disabled="savingItems || !items.length || (isSet && !itemsDirty)" @click="saveItems">
                  {{ savingItems ? 'Čuvanje…' : (isSet ? 'Sačuvaj sadržaj' : 'Pretvori u set') }}
                </button>
              </div>
            </template>

            <button v-else type="button" class="btn btn-ghost mt-3" @click="composing = true">Pretvori u set</button>
          </section>

          <section class="panel p-4 sm:p-5">
            <ImageManager v-if="!creating" :product-id="route.params.id" />
            <p v-else class="text-sm text-forest/55">Slike možete dodati čim {{ assembling ? 'napravite set' : 'sačuvate proizvod' }}.</p>
          </section>
        </div>
      </div>
    </form>
  </div>
</template>

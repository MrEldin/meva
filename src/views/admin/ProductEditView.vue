<script setup>
import ImageManager from '@/components/admin/editor/ImageManager.vue'
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

const slugify = (value) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

async function load() {
  loading.value = true
  editingSlug.value = false

  if (creating.value) {
    form.value = { name: '', slug: '', short_description: '', description: '', price: 0, status: 'draft' }
    original.value = { ...form.value }
    setMeta({ title: 'Novi proizvod' })
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
    price: product.price ?? 0,
    status: product.status,
  }
  original.value = { ...form.value }

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
      const { data } = await client.post('/admin/products', form.value)
      router.replace({ name: 'admin.product', params: { id: data.data.id } })

      return
    }

    await client.put(`/admin/products/${route.params.id}`, form.value)
    original.value = { ...form.value }
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
        :eyebrow="creating ? 'Novi proizvod' : 'Izmena proizvoda'"
        :title="form.name || 'Bez naziva'"
        :back="{ name: 'admin.products' }"
        back-label="Svi proizvodi"
      >
        <template #actions>
          <span v-if="saved" class="delta delta-up">Sačuvano</span>
          <span v-else-if="dirty && !creating" class="delta delta-flat">Ima nesačuvanih izmena</span>
          <button type="submit" class="btn btn-primary" :disabled="saving || (!dirty && !creating)">
            {{ saving ? 'Čuvanje…' : (creating ? 'Napravi proizvod' : 'Sačuvaj') }}
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
              <input v-model="form.name" type="text" class="field mt-1.5 w-full text-[1.0625rem]" placeholder="npr. Krema za seboreju — dan (50ml)" />
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
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">Sastav, način upotrebe, sve što stoji na stranici proizvoda.</p>

            <div class="mt-3">
              <RichText v-model="form.description" />
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

          <section class="panel p-4 sm:p-5">
            <ImageManager v-if="!creating" :product-id="route.params.id" />
            <p v-else class="text-sm text-forest/55">Slike možete dodati čim sačuvate proizvod.</p>
          </section>
        </div>
      </div>
    </form>
  </div>
</template>

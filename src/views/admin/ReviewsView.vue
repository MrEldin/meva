<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref } from 'vue'

/**
 * The reviews desk.
 *
 * Reviews are the only words on the front page the shop did not write, and
 * they used to live in a file that needed a deploy to change. Here they can
 * be added as they arrive, attached to the product they were left on, and
 * held back without being deleted.
 *
 * Three of the six carried over from the old shop name something the shop
 * does not sell under that name -- "Hidratantna krema", "Serum za lice",
 * "Nega tela". They are listed first, marked, and one dropdown away from
 * being attached, because only Eldin knows which jar each meant.
 */
const reviews = ref([])
const products = ref([])
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errors = ref({})
const editing = ref(null)

const blank = () => ({ id: null, name: '', body: '', rating: 5, product_id: null, product_label: '', published: true })
const form = ref(blank())

const unattached = computed(() => reviews.value.filter((review) => !review.product_id).length)

async function load() {
  loading.value = true

  try {
    const [list, catalogue] = await Promise.all([
      client.get('/admin/reviews', { params: { per_page: 200 } }),
      client.get('/admin/reviews/products'),
    ])

    reviews.value = list.data.data
    products.value = catalogue.data.data
  } finally {
    loading.value = false
  }
}

function edit(review) {
  editing.value = review.id
  form.value = {
    id: review.id,
    name: review.name,
    body: review.body,
    rating: review.rating,
    product_id: review.product_id,
    product_label: review.product_label ?? '',
    published: review.published,
  }
  errors.value = {}
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function add() {
  editing.value = 'new'
  form.value = blank()
  errors.value = {}
}

function cancel() {
  editing.value = null
  form.value = blank()
  errors.value = {}
}

async function save() {
  if (saving.value) return

  saving.value = true
  errors.value = {}

  const payload = {
    name: form.value.name.trim(),
    body: form.value.body.trim(),
    rating: Number(form.value.rating),
    product_id: form.value.product_id || null,
    product_label: form.value.product_label?.trim() || null,
    published: Boolean(form.value.published),
  }

  try {
    if (form.value.id) {
      await client.put(`/admin/reviews/${form.value.id}`, payload)
      notice.value = 'Recenzija je sačuvana.'
    } else {
      await client.post('/admin/reviews', payload)
      notice.value = 'Recenzija je dodata.'
    }

    cancel()
    await load()
    setTimeout(() => (notice.value = ''), 4000)
  } catch (error) {
    errors.value = error.response?.data?.errors ?? { general: ['Nije sačuvano. Pokušajte ponovo.'] }
  } finally {
    saving.value = false
  }
}

/** Publishing and holding back is one press, not a trip through the form. */
async function toggle(review) {
  await client.put(`/admin/reviews/${review.id}`, {
    name: review.name,
    body: review.body,
    rating: review.rating,
    product_id: review.product_id,
    product_label: review.product_label,
    published: !review.published,
    published_at: review.published_at,
  })

  await load()
}

/** Attaching a product straight from the row, for the ones that arrived without one. */
async function attach(review, productId) {
  await client.put(`/admin/reviews/${review.id}`, {
    name: review.name,
    body: review.body,
    rating: review.rating,
    product_id: productId || null,
    product_label: review.product_label,
    published: review.published,
    published_at: review.published_at,
  })

  await load()
}

async function remove(review) {
  if (!window.confirm(`Obrisati recenziju koju je napisala ${review.name}?`)) return

  await client.delete(`/admin/reviews/${review.id}`)
  await load()
}

onMounted(() => {
  setMeta({ title: 'Recenzije' })
  load()
})
</script>

<template>
  <div>
    <PageHeader
      tone="products"
      eyebrow="Reči kupaca"
      title="Recenzije"
      note="Šta stoji na početnoj strani, ispod proizvoda. Recenzija vezana za proizvod prikazuje se sa njegovom slikom i vodi na njega."
    >
      <template #actions>
        <button type="button" class="btn btn-primary" @click="editing === 'new' ? cancel() : add()">
          {{ editing === 'new' ? 'Otkaži' : 'Dodaj recenziju' }}
        </button>
      </template>
    </PageHeader>

    <p v-if="notice" class="mb-4 rounded-2xl bg-sage px-4 py-3 text-sm text-sage-deep">{{ notice }}</p>

    <p v-if="!loading && unattached" class="mb-4 rounded-2xl bg-sand px-4 py-3 text-sm text-forest/70">
      {{ unattached }} {{ unattached === 1 ? 'recenzija nije vezana' : 'recenzije nisu vezane' }} za proizvod — prikazuju se bez slike.
      Izaberite proizvod u redu ispod i dobiće je.
    </p>

    <!-- The form -->
    <form v-if="editing" class="mb-6 rounded-[1.5rem] bg-sand p-5 sm:p-6" @submit.prevent="save">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label text-forest/65">Ime kupca</span>
          <input v-model="form.name" type="text" required maxlength="120" class="field mt-2 w-full" />
          <span v-if="errors.name" class="mt-1 block text-xs text-clay-600">{{ errors.name[0] }}</span>
        </label>

        <label class="block">
          <span class="label text-forest/65">Proizvod</span>
          <select v-model="form.product_id" class="field field-select mt-2 w-full">
            <option :value="null">— bez proizvoda —</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </label>

        <label class="block sm:col-span-2">
          <span class="label text-forest/65">Tekst recenzije</span>
          <textarea v-model="form.body" required rows="4" maxlength="2000" class="field mt-2 w-full resize-y"></textarea>
          <span v-if="errors.body" class="mt-1 block text-xs text-clay-600">{{ errors.body[0] }}</span>
        </label>

        <label class="block">
          <span class="label text-forest/65">Ocena</span>
          <select v-model.number="form.rating" class="field field-select mt-2 w-full">
            <option v-for="n in 5" :key="n" :value="6 - n">{{ '★'.repeat(6 - n) }} ({{ 6 - n }})</option>
          </select>
        </label>

        <label class="block">
          <span class="label text-forest/65">Naziv bez proizvoda (opciono)</span>
          <input v-model="form.product_label" type="text" maxlength="120" placeholder="npr. Nega tela" class="field mt-2 w-full" />
          <span class="mt-1 block text-xs text-forest/50">Prikazuje se samo kad recenzija nije vezana za proizvod.</span>
        </label>
      </div>

      <label class="mt-5 flex w-fit cursor-pointer items-center gap-2.5">
        <input v-model="form.published" type="checkbox" class="h-4 w-4 accent-clay-600" />
        <span class="text-sm font-semibold">Objavljena (vidi se na sajtu)</span>
      </label>

      <p v-if="errors.general" class="mt-3 text-sm text-clay-600">{{ errors.general[0] }}</p>

      <div class="mt-5 flex flex-wrap gap-2">
        <button type="submit" class="btn btn-accent" :disabled="saving">
          {{ saving ? 'Čuvam…' : (form.id ? 'Sačuvaj izmene' : 'Dodaj recenziju') }}
        </button>
        <button type="button" class="btn" @click="cancel">Otkaži</button>
      </div>
    </form>

    <!-- The list -->
    <p v-if="loading" class="label text-forest/50">Učitavam…</p>

    <p v-else-if="!reviews.length" class="rounded-2xl bg-sand p-6 text-sm text-forest/65">
      Još nema nijedne recenzije. Dodajte prvu.
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="review in reviews"
        :key="review.id"
        class="rounded-[1.25rem] p-5 transition-colors"
        :class="review.published ? 'bg-cream' : 'bg-sand'"
      >
        <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="font-semibold">{{ review.name }}</span>
              <span class="text-sm tracking-[0.15em] text-clay-500">{{ '★'.repeat(review.rating) }}</span>
              <span v-if="!review.published" class="chip">Nije objavljena</span>
              <span v-if="review.source" class="label text-forest/40">{{ review.source }}</span>
            </div>

            <p class="mt-2 max-w-3xl text-sm leading-relaxed text-forest/75">{{ review.body }}</p>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="label text-forest/50">Proizvod</span>
              <select
                class="field field-select field-pill max-w-[22rem]"
                :value="review.product_id ?? ''"
                @change="attach(review, $event.target.value ? Number($event.target.value) : null)"
              >
                <option value="">— bez proizvoda{{ review.product_label ? ` (${review.product_label})` : '' }} —</option>
                <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" class="btn" @click="toggle(review)">
              {{ review.published ? 'Skloni sa sajta' : 'Objavi' }}
            </button>
            <button type="button" class="btn" @click="edit(review)">Izmeni</button>
            <button type="button" class="label text-clay-600 transition-colors hover:text-clay-700" @click="remove(review)">Obriši</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

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
      note="Ovo stoji na početnoj strani. Recenzija vezana za proizvod prikazuje se sa njegovom slikom i vodi na njega."
    >
      <template #actions>
        <button type="button" class="btn btn-primary" @click="editing === 'new' ? cancel() : add()">
          {{ editing === 'new' ? 'Otkaži' : 'Dodaj recenziju' }}
        </button>
      </template>
    </PageHeader>

    <p v-if="notice" class="mb-4 rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-sage-deep">{{ notice }}</p>

    <p v-if="!loading && unattached" class="mb-4 flex items-start gap-3 rounded-xl bg-clay-50 px-4 py-3 text-[0.875rem] text-forest/70">
      <svg viewBox="0 0 24 24" class="mt-0.5 h-4 w-4 shrink-0 text-clay-600" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.1" /></svg>
      <span>
        {{ unattached }} {{ unattached === 1 ? 'recenzija nije vezana' : 'recenzije nisu vezane' }} za proizvod — prikazuju se bez slike.
        Izaberite proizvod u redu ispod i dobiće je.
      </span>
    </p>

    <!-- Writing one -->
    <form v-if="editing" class="panel mb-4 p-4 sm:p-6" @submit.prevent="save">
      <h2 class="font-display text-[1.25rem] leading-tight">{{ form.id ? 'Izmena recenzije' : 'Nova recenzija' }}</h2>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label text-forest/55">Ime kupca</span>
          <input v-model="form.name" type="text" required maxlength="120" class="field mt-1.5 w-full" />
          <span v-if="errors.name" class="mt-1 block text-xs text-clay-700">{{ errors.name[0] }}</span>
        </label>

        <label class="block">
          <span class="label text-forest/55">Proizvod</span>
          <select v-model="form.product_id" class="field field-select mt-1.5 w-full">
            <option :value="null">— bez proizvoda —</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </label>

        <label class="block sm:col-span-2">
          <span class="label text-forest/55">Tekst recenzije</span>
          <textarea v-model="form.body" required rows="4" maxlength="2000" class="field mt-1.5 w-full resize-y"></textarea>
          <span v-if="errors.body" class="mt-1 block text-xs text-clay-700">{{ errors.body[0] }}</span>
        </label>

        <fieldset>
          <span class="label text-forest/55">Ocena</span>
          <div class="mt-1.5 flex gap-1">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="grid h-10 w-10 place-items-center rounded-lg transition-colors"
              :class="n <= form.rating ? 'bg-clay-100 text-clay-600' : 'bg-cream text-forest/25 hover:bg-sand'"
              :aria-label="`${n} od 5`"
              @click="form.rating = n"
            >
              <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" /></svg>
            </button>
          </div>
        </fieldset>

        <label class="block">
          <span class="label text-forest/55">Naziv bez proizvoda</span>
          <input v-model="form.product_label" type="text" maxlength="120" placeholder="npr. Nega tela" class="field mt-1.5 w-full" />
          <span class="mt-1 block text-[0.8125rem] text-forest/45">Prikazuje se samo kad recenzija nije vezana za proizvod.</span>
        </label>
      </div>

      <label class="mt-5 flex w-fit cursor-pointer items-center gap-2.5">
        <input v-model="form.published" type="checkbox" class="h-4 w-4 accent-clay-600" />
        <span class="text-[0.875rem] font-semibold">Objavljena — vidi se na sajtu</span>
      </label>

      <p v-if="errors.general" class="mt-3 text-sm font-semibold text-clay-700">{{ errors.general[0] }}</p>

      <div class="mt-5 flex flex-wrap gap-2">
        <button type="submit" class="btn btn-accent" :disabled="saving">
          {{ saving ? 'Čuvam…' : (form.id ? 'Sačuvaj izmene' : 'Dodaj recenziju') }}
        </button>
        <button type="button" class="btn" @click="cancel">Otkaži</button>
      </div>
    </form>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <p v-else-if="!reviews.length" class="panel px-6 py-16 text-center text-sm text-forest/60">
      Još nema nijedne recenzije. Dodajte prvu.
    </p>

    <!-- What has been written -->
    <ul v-else class="panel divide-y divide-forest/8 overflow-hidden">
      <li v-for="review in reviews" :key="review.id" class="p-4 sm:p-5" :class="review.published ? '' : 'bg-cream'">
        <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="text-[0.9375rem] font-bold">{{ review.name }}</span>
              <span class="flex gap-0.5" :aria-label="`${review.rating} od 5`">
                <svg v-for="n in review.rating" :key="n" viewBox="0 0 20 20" class="h-3.5 w-3.5 text-clay-400" fill="currentColor" aria-hidden="true"><path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" /></svg>
              </span>
              <span v-if="!review.published" class="delta delta-flat">Nije objavljena</span>
            </div>

            <p class="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-forest/75">{{ review.body }}</p>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="label text-forest/45">Proizvod</span>
              <select
                class="field field-select field-pill max-w-[22rem] text-[0.875rem]"
                :value="review.product_id ?? ''"
                @change="attach(review, $event.target.value ? Number($event.target.value) : null)"
              >
                <option value="">— bez proizvoda{{ review.product_label ? ` (${review.product_label})` : '' }} —</option>
                <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="rounded-full px-3.5 py-1.5 text-[0.75rem] font-bold transition-colors"
              :class="review.published ? 'bg-sage text-sage-deep hover:bg-sage-deep hover:text-white' : 'bg-sand text-forest/55 hover:bg-forest hover:text-white'"
              @click="toggle(review)"
            >{{ review.published ? 'Objavljena' : 'Objavi' }}</button>

            <button type="button" class="rounded-full border border-forest/12 px-3.5 py-1.5 text-[0.75rem] font-bold transition-colors hover:bg-forest hover:text-white" @click="edit(review)">
              Izmeni
            </button>

            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-forest/35 transition-colors hover:bg-clay-100 hover:text-clay-700"
              aria-label="Obriši recenziju"
              @click="remove(review)"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 11v6M15 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" /></svg>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

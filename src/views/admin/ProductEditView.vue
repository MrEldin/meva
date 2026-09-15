<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// "novi" is the editor in its empty state; anything else is a product's id.
const creating = computed(() => route.params.id === 'novi')

const form = ref(null)
const image = ref(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const uploading = ref(false)
const errors = ref({})

async function load() {
  if (creating.value) {
    form.value = { name: '', slug: '', short_description: '', description: '', price: 0, status: 'draft' }
    setMeta({ title: 'Novi proizvod' })
    loading.value = false

    return
  }

  const { data } = await client.get(`/admin/products/${route.params.id}`)
  const product = data.data

  image.value = product.image
  form.value = {
    name: product.name ?? '',
    slug: product.slug ?? '',
    short_description: product.short_description ?? '',
    description: product.description ?? '',
    price: product.price ?? 0,
    status: product.status,
  }

  setMeta({ title: product.name ?? 'Proizvod' })
  loading.value = false
}

async function save() {
  saving.value = true
  errors.value = {}

  try {
    if (creating.value) {
      const { data } = await client.post('/admin/products', form.value)
      // Carry on editing the product that was just made, so a photograph can
      // be attached without hunting for it in the list.
      router.replace({ name: 'admin.product', params: { id: data.data.id } })

      return
    }

    await client.put(`/admin/products/${route.params.id}`, form.value)
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (error) {
    errors.value = error.response?.data?.errors ?? {}
  } finally {
    saving.value = false
  }
}

/** Attach the photograph the storefront, share cards and adverts all use. */
async function upload(event) {
  const file = event.target.files?.[0]

  if (!file || creating.value) return

  uploading.value = true

  const body = new FormData()
  body.append('image', file)

  try {
    const { data } = await client.post(`/admin/products/${route.params.id}/slika`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    image.value = data.data.image
  } catch (error) {
    errors.value = error.response?.data?.errors ?? { image: ['Slika nije prihvaćena.'] }
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

// Reload when moving between "new" and a saved product.
watch(() => route.params.id, load)

onMounted(load)
</script>

<template>
  <div>
    <RouterLink :to="{ name: 'admin.products' }" class="eyebrow text-forest/50 transition-colors hover:text-forest">← Svi proizvodi</RouterLink>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>

    <form v-else class="mt-4 max-w-3xl" @submit.prevent="save">
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
        <div class="flex items-center gap-4">
          <div v-if="image" class="h-16 w-16 overflow-hidden rounded-2xl bg-sand">
            <img :src="image" :alt="form.name" class="h-full w-full object-cover" />
          </div>
          <div>
            <p class="eyebrow text-clay-500">{{ creating ? 'Novi proizvod' : 'Izmena' }}</p>
            <h1 class="mt-1 font-display text-2xl tracking-tight sm:text-3xl">{{ form.name || 'Bez naziva' }}</h1>
          </div>
        </div>
        <button type="submit" class="pill bg-forest text-cream hover:bg-forest-soft disabled:opacity-50" :disabled="saving">
          {{ saving ? 'Čuvanje…' : 'Sačuvaj' }}
        </button>
      </header>

      <div class="space-y-5 pt-6">
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Naziv</span>
          <input v-model="form.name" type="text" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
          <span v-if="errors.name" class="mt-1 block text-xs text-clay-600">{{ errors.name[0] }}</span>
        </label>

        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="eyebrow text-[0.5625rem] text-forest/55">Adresa (slug)</span>
            <input v-model="form.slug" type="text" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 font-mono text-sm outline-none focus:border-forest/40" />
            <span v-if="errors.slug" class="mt-1 block text-xs text-clay-600">{{ errors.slug[0] }}</span>
          </label>

          <label class="block">
            <span class="eyebrow text-[0.5625rem] text-forest/55">Cena (RSD)</span>
            <input v-model.number="form.price" type="number" min="0" step="10" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 tabular-nums outline-none focus:border-forest/40" />
            <span v-if="errors.price" class="mt-1 block text-xs text-clay-600">{{ errors.price[0] }}</span>
          </label>
        </div>

        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Kratak opis</span>
          <textarea v-model="form.short_description" rows="3" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 text-sm outline-none focus:border-forest/40" />
        </label>

        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Opis</span>
          <textarea v-model="form.description" rows="12" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-forest/40" />
          <span class="mt-1 block text-xs text-forest/45">Dozvoljen je HTML — tako je opis i uvezen sa starog sajta.</span>
        </label>

        <fieldset>
          <span class="eyebrow text-[0.5625rem] text-forest/55">Status</span>
          <div class="mt-2 flex gap-2">
            <button v-for="option in [{ v: 'published', l: 'Objavljen' }, { v: 'draft', l: 'Skica' }]" :key="option.v"
              type="button" class="eyebrow rounded-full px-5 py-2.5 text-[0.5625rem] transition-colors"
              :class="form.status === option.v ? 'bg-forest text-cream' : 'bg-sand hover:bg-sage'"
              @click="form.status = option.v">
              {{ option.l }}
            </button>
          </div>
        </fieldset>

        <div v-if="!creating">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Fotografija</span>
          <div class="mt-2 flex flex-wrap items-center gap-4">
            <div class="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-sand">
              <img v-if="image" :src="image" :alt="form.name" class="h-full w-full object-cover" />
            </div>
            <label class="pill cursor-pointer border border-forest/20 hover:bg-forest hover:text-cream">
              {{ uploading ? 'Šaljem…' : (image ? 'Zameni sliku' : 'Dodaj sliku') }}
              <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="uploading" @change="upload" />
            </label>
          </div>
          <span v-if="errors.image" class="mt-1 block text-xs text-clay-600">{{ errors.image[0] }}</span>
        </div>

        <p v-if="creating" class="text-sm text-forest/55">Sliku možete dodati čim sačuvate proizvod.</p>
        <p v-if="saved" class="text-sm text-sage-deep">Sačuvano.</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import client from '@/api/client'
import { computed, onMounted, ref } from 'vue'

/**
 * The product's photographs: all of them, added several at a time.
 *
 * What was here before took one file, silently destroyed the rest, and gave
 * no sign of how long it would be. This shows the whole gallery, says which
 * one the shop leads with, takes a drop of several files at once, and draws
 * a bar per file while it goes up -- so a slow phone photograph looks like
 * work being done rather than a page that has stopped.
 */
const props = defineProps({
  productId: { type: [String, Number], required: true },
})

const images = ref([])
const loading = ref(true)
const dragging = ref(false)
const error = ref('')

/** One entry per file being sent: name, size and how far along it is. */
const queue = ref([])

const input = ref(null)

const leading = computed(() => images.value.find((image) => image.primary) ?? images.value[0] ?? null)

async function load() {
  loading.value = true

  try {
    const { data } = await client.get(`/admin/products/${props.productId}/images`)
    images.value = data.data
  } finally {
    loading.value = false
  }
}

function pick() {
  input.value?.click()
}

function onDrop(event) {
  dragging.value = false
  send([...(event.dataTransfer?.files ?? [])])
}

function onPick(event) {
  send([...(event.target.files ?? [])])
  event.target.value = ''
}

async function send(files) {
  const pictures = files.filter((file) => file.type.startsWith('image/'))

  if (!pictures.length) return

  error.value = ''

  const job = { id: Date.now(), files: pictures.map((f) => ({ name: f.name, size: f.size })), progress: 0 }
  queue.value.push(job)

  const body = new FormData()
  pictures.forEach((file) => body.append('images[]', file))

  try {
    const { data } = await client.post(`/admin/products/${props.productId}/images`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        job.progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0
      },
    })

    images.value = data.data
  } catch (e) {
    error.value = e.response?.data?.errors?.['images.0']?.[0]
      ?? e.response?.data?.message
      ?? 'Slike nisu prihvaćene. Dozvoljeni su JPG, PNG i WebP do 8 MB.'
  } finally {
    queue.value = queue.value.filter((item) => item.id !== job.id)
  }
}

async function makeLeading(image) {
  const { data } = await client.put(`/admin/products/${props.productId}/images/${image.id}/primary`)
  images.value = data.data
}

async function remove(image) {
  if (!window.confirm('Obrisati ovu sliku?')) return

  const { data } = await client.delete(`/admin/products/${props.productId}/images/${image.id}`)
  images.value = data.data
}

const kb = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-3">
      <div>
        <h2 class="font-display text-[1.25rem] leading-tight">Slike</h2>
        <p class="mt-0.5 text-[0.8125rem] text-forest/50">
          Prva slika je ona koju prodavnica prikazuje. Možete dodati više njih odjednom.
        </p>
      </div>
      <button type="button" class="btn btn-ghost" @click="pick">Dodaj slike</button>
    </div>

    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" multiple class="sr-only" @change="onPick" />

    <!-- Where files land -->
    <div
      class="mt-4 rounded-2xl border-2 border-dashed p-4 transition-colors"
      :class="dragging ? 'border-clay-500 bg-clay-50' : 'border-forest/12'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <p v-if="loading" class="py-8 text-center text-sm text-forest/50">Učitavam…</p>

      <p v-else-if="!images.length && !queue.length" class="py-10 text-center text-sm text-forest/55">
        Prevucite slike ovde, ili <button type="button" class="font-semibold text-clay-600 underline underline-offset-4" @click="pick">izaberite sa računara</button>.
      </p>

      <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <li
          v-for="image in images"
          :key="image.id"
          class="group relative overflow-hidden rounded-xl border bg-cream"
          :class="image.primary ? 'border-clay-500 ring-2 ring-clay-500/25' : 'border-forest/10'"
        >
          <div class="aspect-square">
            <img :src="image.url" :alt="image.name" loading="lazy" class="h-full w-full object-contain" />
          </div>

          <span v-if="image.primary" class="absolute left-2 top-2 rounded-full bg-clay-600 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-white">
            Glavna
          </span>
          <span v-else-if="image.cutout" class="absolute left-2 top-2 rounded-full bg-forest/75 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-white">
            Bez pozadine
          </span>

          <!-- What can be done with it, on hover and always on a touch screen -->
          <div class="flex items-center justify-between gap-1 border-t border-forest/8 bg-paper px-2 py-1.5">
            <button
              v-if="!image.primary"
              type="button"
              class="truncate text-[0.75rem] font-semibold text-clay-600 transition-colors hover:text-clay-700"
              @click="makeLeading(image)"
            >Postavi kao glavnu</button>
            <span v-else class="truncate text-[0.75rem] text-forest/40">{{ kb(image.size) }}</span>

            <button
              type="button"
              class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-forest/40 transition-colors hover:bg-clay-100 hover:text-clay-700"
              aria-label="Obriši sliku"
              @click="remove(image)"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 11v6M15 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" /></svg>
            </button>
          </div>
        </li>
      </ul>

      <!-- What is on its way up -->
      <ul v-if="queue.length" class="mt-3 space-y-2">
        <li v-for="job in queue" :key="job.id" class="rounded-xl bg-paper p-3">
          <div class="flex items-baseline justify-between gap-3 text-[0.8125rem]">
            <span class="min-w-0 truncate font-semibold">
              {{ job.files.length === 1 ? job.files[0].name : `${job.files.length} slika` }}
            </span>
            <span class="shrink-0 tabular-nums text-forest/50">{{ job.progress }}%</span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
            <div class="h-full rounded-full bg-clay-600 transition-[width] duration-200" :style="{ width: `${job.progress}%` }" />
          </div>
        </li>
      </ul>
    </div>

    <p v-if="error" class="mt-2 text-[0.8125rem] font-semibold text-clay-700">{{ error }}</p>

    <p v-if="leading" class="mt-2 text-[0.8125rem] text-forest/50">
      {{ images.length }} {{ images.length === 1 ? 'slika' : 'slika' }} · JPG, PNG ili WebP, do 8 MB po slici.
    </p>
  </div>
</template>

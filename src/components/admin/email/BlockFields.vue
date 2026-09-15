<script setup>
import { computed } from 'vue'

/**
 * The form for one block.
 *
 * Which fields a block has comes from the server's block library, so the editor
 * never holds its own copy of what a block is made of. Adding a block type on
 * the back end makes it editable here without a change in this file.
 */
const props = defineProps({
  block: { type: Object, required: true },
  definition: { type: Object, default: null },
  products: { type: Array, default: () => [] },
  tokens: { type: Array, default: () => [] },
})

const emit = defineEmits(['change'])

const LABELS = {
  eyebrow: 'Nadnaslov',
  heading: 'Naslov',
  text: 'Tekst',
  button_label: 'Natpis na dugmetu',
  button_url: 'Adresa dugmeta',
  image: 'Slika (adresa)',
  alt: 'Opis slike',
  product_slug: 'Proizvod',
  product_slugs: 'Proizvodi',
  benefit: 'Korist u jednoj rečenici',
  quote: 'Citat',
  author: 'Ime',
  product: 'Proizvod (tekst)',
  code: 'Kod za popust',
  deadline: 'Rok',
  size: 'Visina (px)',
  items: 'Stavke',
}

const LONG = ['text', 'quote']

const fields = computed(() => props.definition?.fields ?? [])

function set(field, value) {
  emit('change', { ...props.block, [field]: value })
}

/** Add, edit and remove the rows of a list block. */
function setItem(index, key, value) {
  const items = [...(props.block.items ?? [])]
  items[index] = { ...items[index], [key]: value }
  set('items', items)
}

function addItem() {
  set('items', [...(props.block.items ?? []), { title: '', text: '' }])
}

function removeItem(index) {
  set('items', (props.block.items ?? []).filter((_, i) => i !== index))
}

function moveItem(index, by) {
  const items = [...(props.block.items ?? [])]
  const target = index + by

  if (target < 0 || target >= items.length) return

  ;[items[index], items[target]] = [items[target], items[index]]
  set('items', items)
}

/** Toggle one product in a multi-product block. */
function toggleProduct(slug) {
  const chosen = props.block.product_slugs ?? []

  set('product_slugs', chosen.includes(slug) ? chosen.filter((s) => s !== slug) : [...chosen, slug])
}

/** Product pictures double as the picture library for image blocks. */
const gallery = computed(() => props.products.filter((p) => p.image))
</script>

<template>
  <div class="space-y-3.5">
    <div v-for="field in fields" :key="field">
      <!-- One product -->
      <template v-if="field === 'product_slug'">
        <label class="eyebrow block text-forest/40">{{ LABELS[field] }}</label>
        <select
          :value="block.product_slug ?? ''"
          class="mt-1.5 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-forest/40"
          @change="set('product_slug', $event.target.value || null)"
        >
          <option value="">— izaberite proizvod —</option>
          <option v-for="product in products" :key="product.slug" :value="product.slug">
            {{ product.name }}{{ product.price ? ` · ${product.price}` : '' }}
          </option>
        </select>
      </template>

      <!-- Several products -->
      <template v-else-if="field === 'product_slugs'">
        <label class="eyebrow block text-forest/40">
          {{ LABELS[field] }}
          <span class="ml-1 normal-case tracking-normal text-forest/30">izabrano {{ (block.product_slugs ?? []).length }}</span>
        </label>
        <div class="mt-1.5 flex flex-wrap gap-1.5">
          <button
            v-for="product in products"
            :key="product.slug"
            type="button"
            class="rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors"
            :class="(block.product_slugs ?? []).includes(product.slug)
              ? 'border-transparent bg-forest text-cream'
              : 'border-forest/15 hover:border-forest/35'"
            @click="toggleProduct(product.slug)"
          >
            {{ product.name }}
          </button>
        </div>
        <p class="mt-1.5 text-[0.75rem] text-forest/40">Najviše šest. Preko toga niko ne bira.</p>
      </template>

      <!-- Repeatable rows -->
      <template v-else-if="field === 'items'">
        <label class="eyebrow block text-forest/40">{{ LABELS[field] }}</label>
        <div class="mt-1.5 space-y-2">
          <div v-for="(item, index) in block.items ?? []" :key="index" class="rounded-2xl bg-cream p-3">
            <div class="flex items-center gap-1.5">
              <input
                :value="item.title"
                type="text"
                placeholder="Naslov stavke"
                class="min-w-0 flex-1 rounded-full border border-forest/15 bg-sand px-3.5 py-2 text-[0.8125rem] outline-none focus:border-forest/40"
                @input="setItem(index, 'title', $event.target.value)"
              />
              <button type="button" class="rounded-full p-1.5 text-forest/30 hover:bg-sand hover:text-forest" aria-label="Gore" @click="moveItem(index, -1)">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 12V4M4.5 7.5L8 4l3.5 3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              <button type="button" class="rounded-full p-1.5 text-forest/30 hover:bg-sand hover:text-forest" aria-label="Dole" @click="moveItem(index, 1)">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4v8M4.5 8.5L8 12l3.5-3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              <button type="button" class="rounded-full p-1.5 text-forest/30 hover:bg-clay-100 hover:text-clay-600" aria-label="Obriši" @click="removeItem(index)">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" /></svg>
              </button>
            </div>
            <textarea
              :value="item.text"
              rows="2"
              placeholder="Objašnjenje u jednoj rečenici"
              class="mt-1.5 w-full resize-none rounded-2xl border border-forest/15 bg-sand px-3.5 py-2 text-[0.8125rem] leading-relaxed outline-none focus:border-forest/40"
              @input="setItem(index, 'text', $event.target.value)"
            />
          </div>
        </div>
        <button type="button" class="mt-2 text-[0.8125rem] text-clay-600 underline underline-offset-4 hover:text-clay-700" @click="addItem">
          Dodaj stavku
        </button>
      </template>

      <!-- A number -->
      <template v-else-if="field === 'size'">
        <label class="eyebrow block text-forest/40">{{ LABELS[field] }}</label>
        <input
          :value="block.size ?? 24"
          type="range" min="8" max="96" step="4"
          class="mt-2 w-full accent-[#C56D59]"
          @input="set('size', Number($event.target.value))"
        />
        <p class="mt-0.5 text-right font-mono text-[0.75rem] tabular-nums text-forest/40">{{ block.size ?? 24 }} px</p>
      </template>

      <!-- A picture: pasted address, or one already in the shop -->
      <template v-else-if="field === 'image'">
        <label class="eyebrow block text-forest/40">{{ LABELS[field] }}</label>
        <input
          :value="block.image ?? ''"
          type="url"
          placeholder="https://…"
          class="mt-1.5 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-forest/40"
          @input="set('image', $event.target.value || null)"
        />
        <div v-if="gallery.length" class="mt-2">
          <p class="text-[0.75rem] text-forest/40">Ili uzmite sliku proizvoda:</p>
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            <button
              v-for="product in gallery"
              :key="product.slug"
              type="button"
              class="h-12 w-12 overflow-hidden rounded-xl border-2 transition-colors"
              :class="block.image === product.image ? 'border-clay-500' : 'border-transparent hover:border-forest/25'"
              :title="product.name"
              @click="set('image', product.image)"
            >
              <img :src="product.image" :alt="product.name" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>
      </template>

      <!-- Long text -->
      <template v-else-if="LONG.includes(field)">
        <label class="eyebrow block text-forest/40">{{ LABELS[field] ?? field }}</label>
        <textarea
          :value="block[field] ?? ''"
          rows="5"
          class="mt-1.5 w-full resize-y rounded-2xl border border-forest/15 bg-cream px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-forest/40"
          @input="set(field, $event.target.value)"
        />
      </template>

      <!-- Everything else -->
      <template v-else>
        <label class="eyebrow block text-forest/40">{{ LABELS[field] ?? field }}</label>
        <input
          :value="block[field] ?? ''"
          :type="field.endsWith('_url') ? 'url' : 'text'"
          class="mt-1.5 w-full rounded-full border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-forest/40"
          @input="set(field, $event.target.value)"
        />
      </template>
    </div>

    <p v-if="!fields.length" class="text-[0.8125rem] text-forest/45">Ovaj blok nema šta da se podesi.</p>

    <!-- What can be dropped into any text field -->
    <div v-if="fields.length" class="rounded-2xl bg-cream px-3.5 py-3">
      <p class="eyebrow text-[0.5rem] text-forest/35">Zamene u tekstu</p>
      <div class="mt-1.5 flex flex-wrap gap-1.5">
        <span v-for="token in tokens" :key="token.token" class="font-mono text-[0.6875rem] text-forest/55" :title="token.note">
          {{ token.token }}
        </span>
      </div>
    </div>
  </div>
</template>

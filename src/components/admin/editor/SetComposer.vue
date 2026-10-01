<script setup>
import client from '@/api/client'
import { computed, ref, watch } from 'vue'

/**
 * What a set is made of.
 *
 * A list of parts with how many of each, and a search box to add another.
 * Sets cannot go in (a box in a box), and neither can the product itself.
 * The parent owns the list; this only edits it.
 */
const props = defineProps({
  modelValue: { type: Array, required: true },
  excludeId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue'])

const term = ref('')
const results = ref([])
const searching = ref(false)
const open = ref(false)

const money = (dinars) => (dinars == null ? '—' : `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(dinars)} RSD`)

const total = computed(() => props.modelValue.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0))

const taken = computed(() => new Set(props.modelValue.map((item) => item.id)))

function set(items) {
  emit('update:modelValue', items)
}

function add(product) {
  if (taken.value.has(product.id)) return
  set([...props.modelValue, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }])
  term.value = ''
  results.value = []
  open.value = false
}

function remove(item) {
  set(props.modelValue.filter((other) => other.id !== item.id))
}

function count(item, delta) {
  set(props.modelValue.map((other) => (
    other.id === item.id ? { ...other, quantity: Math.max(1, other.quantity + delta) } : other
  )))
}

let debounce
watch(term, (value) => {
  clearTimeout(debounce)
  if (!value.trim()) { results.value = []; return }

  debounce = setTimeout(async () => {
    searching.value = true
    try {
      const { data } = await client.get('/admin/products', { params: { q: value.trim(), per_page: 8 } })
      results.value = data.data.filter((p) => !p.is_set && String(p.id) !== String(props.excludeId) && !taken.value.has(p.id))
      open.value = true
    } finally {
      searching.value = false
    }
  }, 250)
})
</script>

<template>
  <div>
    <ul v-if="modelValue.length" class="divide-y divide-forest/8 rounded-xl border border-forest/10">
      <li v-for="item in modelValue" :key="item.id" class="flex items-center gap-3 p-2.5">
        <span class="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="h-full w-full object-contain p-0.5" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[0.875rem] font-bold leading-snug">{{ item.name }}</span>
          <span class="block text-[0.75rem] text-forest/45">{{ money(item.price) }}</span>
        </span>
        <span class="flex shrink-0 items-center rounded-full border border-forest/10">
          <button type="button" class="grid h-8 w-8 place-items-center text-forest/60 hover:text-forest" aria-label="Manje" @click="count(item, -1)">−</button>
          <span class="w-6 text-center text-[0.875rem] font-bold tabular-nums">{{ item.quantity }}</span>
          <button type="button" class="grid h-8 w-8 place-items-center text-forest/60 hover:text-forest" aria-label="Više" @click="count(item, 1)">+</button>
        </span>
        <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-forest/40 hover:bg-cream hover:text-clay-700" aria-label="Skloni iz seta" @click="remove(item)">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </li>
    </ul>
    <p v-else class="rounded-xl bg-cream px-3.5 py-3 text-[0.8125rem] text-forest/55">Još ništa nije u setu. Potražite proizvod ispod.</p>

    <p v-if="modelValue.length" class="mt-2 flex justify-between text-[0.8125rem] text-forest/55">
      <span>{{ modelValue.length }} {{ modelValue.length === 1 ? 'proizvod' : 'proizvoda' }} · delovi pojedinačno</span>
      <span class="font-bold tabular-nums text-forest">{{ money(total) }}</span>
    </p>

    <!-- Adding one -->
    <div class="relative mt-3">
      <input
        v-model="term"
        type="search"
        class="field w-full"
        placeholder="Dodaj proizvod: ukucaj naziv…"
        @focus="open = results.length > 0"
        @blur="setTimeout(() => (open = false), 150)"
      />
      <ul v-if="open && results.length" class="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-xl border border-forest/10 bg-white shadow-lg">
        <li v-for="product in results" :key="product.id">
          <button type="button" class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-cream" @mousedown.prevent="add(product)">
            <span class="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream">
              <img v-if="product.image" :src="product.image" :alt="product.name" class="h-full w-full object-contain" />
            </span>
            <span class="min-w-0 flex-1 truncate text-[0.875rem] font-semibold">{{ product.name }}</span>
            <span class="shrink-0 text-[0.75rem] text-forest/45">{{ money(product.price) }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="open && term && !searching" class="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-forest/10 bg-white px-3 py-2 text-[0.8125rem] text-forest/55 shadow-lg">
        Nema proizvoda sa tim nazivom.
      </p>
    </div>
  </div>
</template>

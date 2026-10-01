<script setup>
import { computed, ref } from 'vue'

/**
 * The ingredients, one row each: the INCI name the label must carry and
 * the Serbian name a customer reads. Rows are added one at a time, moved
 * by dragging or with the arrows, and a whole label can be pasted in and
 * read into rows. The parent owns the list; this only edits it.
 */
const props = defineProps({
  modelValue: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const pasting = ref(false)
const pasted = ref('')
const dragging = ref(null)
const over = ref(null)

const rows = computed(() => props.modelValue)

function set(list) {
  emit('update:modelValue', list.map((r) => ({ inci: r.inci ?? '', name: r.name ?? '' })))
}

function change(i, key, value) {
  set(rows.value.map((r, j) => (j === i ? { ...r, [key]: value } : r)))
}

function add() {
  set([...rows.value, { inci: '', name: '' }])
}

function remove(i) {
  set(rows.value.filter((_, j) => j !== i))
}

function move(from, to) {
  if (to < 0 || to >= rows.value.length || from === to) return
  const list = [...rows.value]
  const [row] = list.splice(from, 1)
  list.splice(to, 0, row)
  set(list)
}

function drop(i) {
  if (dragging.value !== null) move(dragging.value, i)
  dragging.value = null
  over.value = null
}

/** "Aqua (Voda), Glycerin (Glicerin)" or one per line: into rows, appended. */
function readPasted() {
  const parsed = pasted.value
    .split(/\n|,|;/)
    .map((x) => x.replace(/^[\s\-•·]+|[\s]+$/g, ''))
    .filter((x) => x && x !== '/')
    .map((x) => {
      const m = x.match(/^(.*?)\s*\(([^()]*)\)\s*$/)
      return m ? { inci: m[1].trim(), name: m[2].trim() } : { inci: x, name: '' }
    })
  set([...rows.value.filter((r) => r.inci || r.name), ...parsed])
  pasted.value = ''
  pasting.value = false
}
</script>

<template>
  <div>
    <div v-if="rows.length" class="grid grid-cols-[1.5rem_1fr_1fr_4.5rem] items-center gap-x-2 px-1 pb-1 text-[0.6875rem] font-bold uppercase tracking-wider text-forest/40">
      <span />
      <span>INCI naziv</span>
      <span>Srpski naziv</span>
      <span />
    </div>

    <ol v-if="rows.length" class="space-y-1.5">
      <li
        v-for="(row, i) in rows"
        :key="i"
        class="grid grid-cols-[1.5rem_1fr_1fr_4.5rem] items-center gap-x-2 rounded-xl border px-1 py-1 transition-colors"
        :class="over === i && dragging !== null && dragging !== i ? 'border-clay-500 bg-clay-50' : 'border-forest/8 bg-white'"
        draggable="true"
        @dragstart="dragging = i"
        @dragover.prevent="over = i"
        @dragleave="over = null"
        @drop.prevent="drop(i)"
        @dragend="dragging = null; over = null"
      >
        <span class="grid h-8 cursor-grab place-items-center text-forest/35" title="Prevuci da promeniš redosled">
          <svg viewBox="0 0 16 16" class="h-4 w-4" fill="currentColor"><circle cx="5" cy="4" r="1.3" /><circle cx="11" cy="4" r="1.3" /><circle cx="5" cy="8" r="1.3" /><circle cx="11" cy="8" r="1.3" /><circle cx="5" cy="12" r="1.3" /><circle cx="11" cy="12" r="1.3" /></svg>
        </span>
        <input :value="row.inci" type="text" class="field h-9 w-full text-[0.875rem]" placeholder="npr. Aqua" @input="change(i, 'inci', $event.target.value)" />
        <input :value="row.name" type="text" class="field h-9 w-full text-[0.875rem]" placeholder="npr. Voda" @input="change(i, 'name', $event.target.value)" />
        <span class="flex items-center justify-end">
          <button type="button" class="grid h-8 w-6 place-items-center text-forest/45 hover:text-forest disabled:opacity-25" :disabled="i === 0" aria-label="Gore" @click="move(i, i - 1)">↑</button>
          <button type="button" class="grid h-8 w-6 place-items-center text-forest/45 hover:text-forest disabled:opacity-25" :disabled="i === rows.length - 1" aria-label="Dole" @click="move(i, i + 1)">↓</button>
          <button type="button" class="grid h-8 w-7 place-items-center rounded-full text-forest/40 hover:bg-cream hover:text-clay-700" aria-label="Obriši" @click="remove(i)">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </span>
      </li>
    </ol>
    <p v-else class="rounded-xl bg-cream px-3.5 py-3 text-[0.8125rem] text-forest/55">Još nema sastojaka. Dodajte ih jedan po jedan, ili nalepite celu listu sa etikete.</p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" class="btn btn-ghost text-[0.8125rem]" @click="add">+ Dodaj sastojak</button>
      <button type="button" class="btn btn-ghost text-[0.8125rem]" @click="pasting = !pasting">Nalepi listu</button>
      <span v-if="rows.length" class="ml-auto text-[0.75rem] text-forest/45">{{ rows.length }} {{ rows.length === 1 ? 'sastojak' : 'sastojaka' }}</span>
    </div>

    <div v-if="pasting" class="mt-3 rounded-xl bg-cream p-3">
      <textarea v-model="pasted" rows="4" class="field w-full text-[0.875rem]" placeholder="Aqua (Voda), Glycerin (Glicerin), Cetearyl Alcohol… ili jedan sastojak u svakom redu" />
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost text-[0.8125rem]" @click="pasting = false; pasted = ''">Odustani</button>
        <button type="button" class="btn btn-primary text-[0.8125rem]" :disabled="!pasted.trim()" @click="readPasted">Pročitaj u redove</button>
      </div>
    </div>
  </div>
</template>

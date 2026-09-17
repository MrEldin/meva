<script setup>
import { computed, ref } from 'vue'

/**
 * Eight lists that were eight identical panels, in one.
 *
 * They all answer the same shape of question -- which of these accounts for
 * how much -- so they share a frame and a set of tabs instead of stacking
 * down the page as separate widgets that look the same and say different
 * things. One at a time is also the only honest way to read them: they are
 * not comparable to each other, only within themselves.
 */
const props = defineProps({
  /** [{ key, label, rows, metric, unit, empty, to }] */
  tabs: { type: Array, required: true },
})

const active = ref(props.tabs[0]?.key)

const current = computed(() => props.tabs.find((tab) => tab.key === active.value) ?? props.tabs[0])

const nf = new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 })

const total = computed(() =>
  (current.value?.rows ?? []).reduce((sum, row) => sum + (row[current.value.metric] ?? 0), 0),
)

const max = computed(() =>
  Math.max(1, ...(current.value?.rows ?? []).map((row) => row[current.value.metric] ?? 0)),
)

function show(row) {
  const v = row[current.value.metric] ?? 0

  return current.value.unit === 'money' ? `${nf.format(v / 100)} RSD` : nf.format(v)
}

const share = (row) => (total.value ? Math.round(((row[current.value.metric] ?? 0) / total.value) * 100) : 0)
</script>

<template>
  <section class="panel overflow-hidden">
    <div class="border-b border-forest/8 px-4 py-3 sm:px-5">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="tab.key === active ? 'is-on' : ''"
          @click="active = tab.key"
        >{{ tab.label }}</button>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5 sm:py-5">
      <p v-if="!current.rows?.length" class="py-8 text-center text-sm text-forest/50">
        {{ current.empty ?? 'Nema podataka za ovaj period.' }}
      </p>

      <ol v-else class="space-y-1">
        <li
          v-for="(row, i) in current.rows"
          :key="row.label"
          class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5"
        >
          <!-- The share, drawn behind the row rather than as a separate bar -->
          <span
            class="absolute inset-y-0 left-0 rounded-xl bg-clay-100 transition-[width] duration-500"
            :style="{ width: `${Math.max(2, ((row[current.metric] ?? 0) / max) * 100)}%` }"
            aria-hidden="true"
          />

          <span class="relative w-5 shrink-0 text-[0.75rem] font-bold tabular-nums text-forest/35">{{ i + 1 }}</span>
          <span class="relative min-w-0 flex-1 truncate text-[0.9375rem] font-semibold text-forest">{{ row.label }}</span>
          <span class="relative shrink-0 text-[0.75rem] tabular-nums text-forest/45">{{ share(row) }}%</span>
          <span class="relative shrink-0 text-[0.9375rem] font-bold tabular-nums text-forest">{{ show(row) }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

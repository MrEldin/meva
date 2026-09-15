<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { onMounted, ref } from 'vue'

const form = ref({ reference: '', email: '' })
const order = ref(null)
const error = ref('')
const loading = ref(false)

const when = (iso) => (iso ? new Date(iso).toLocaleDateString('sr-RS', { day: '2-digit', month: 'long', year: 'numeric' }) : '')

// What each status means for someone waiting at home.
const STEPS = [
  { status: 'awaiting-dispatch', label: 'Primljena', note: 'Pakujemo vašu porudžbinu.' },
  { status: 'dispatched', label: 'Poslata', note: 'Kurir je preuzeo paket.' },
  { status: 'delivered', label: 'Isporučena', note: 'Paket je uručen.' },
]

const reached = (status) => {
  const order_ = ['awaiting-dispatch', 'dispatched', 'delivered']
  return order_.indexOf(order.value?.status) >= order_.indexOf(status)
}

async function submit() {
  loading.value = true
  error.value = ''
  order.value = null

  try {
    const { data } = await client.post('/account/track', form.value)
    order.value = data.data
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Praćenje trenutno nije dostupno.'
  } finally {
    loading.value = false
  }
}

onMounted(() => setMeta({
  title: 'Praćenje porudžbine',
  description: 'Unesite broj porudžbine i e-mail da vidite dokle je stigla vaša Meva porudžbina.',
}))
</script>

<template>
  <div class="shell max-w-2xl py-14 lg:py-20">
    <p class="eyebrow text-clay-500">Praćenje</p>
    <h1 class="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Gde je moja porudžbina?</h1>
    <p class="mt-4 text-forest/70">Unesite broj porudžbine iz potvrde i e-mail sa kojim ste poručili.</p>

    <form class="mt-8 grid gap-4 sm:grid-cols-[1fr_1.4fr_auto]" @submit.prevent="submit">
      <input v-model="form.reference" required placeholder="Broj (npr. 00000012)" class="rounded-full border border-forest/15 bg-sand px-5 py-3.5 text-sm outline-none placeholder:text-forest/40 focus:border-forest/40" />
      <input v-model="form.email" required type="email" placeholder="E-mail" class="rounded-full border border-forest/15 bg-sand px-5 py-3.5 text-sm outline-none placeholder:text-forest/40 focus:border-forest/40" />
      <button type="submit" class="pill bg-forest text-cream hover:bg-forest-soft disabled:opacity-50" :disabled="loading">
        {{ loading ? 'Tražim…' : 'Pronađi' }}
      </button>
    </form>

    <p v-if="error" class="mt-5 rounded-2xl bg-clay-100 px-4 py-3 text-sm text-clay-700">{{ error }}</p>

    <section v-if="order" class="mt-8 rounded-[1.5rem] bg-sand p-6">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <p class="font-mono text-sm">{{ order.reference }}</p>
        <p class="text-xs text-forest/55">{{ when(order.placed_at) }}</p>
      </div>

      <ol v-if="order.status !== 'cancelled' && order.status !== 'returned'" class="mt-6 space-y-4">
        <li v-for="step in STEPS" :key="step.status" class="flex gap-4">
          <span class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.625rem]"
            :class="reached(step.status) ? 'bg-forest text-cream' : 'bg-cream text-forest/40'">
            {{ reached(step.status) ? '✓' : '·' }}
          </span>
          <div>
            <p class="text-sm font-semibold" :class="!reached(step.status) && 'text-forest/45'">{{ step.label }}</p>
            <p class="text-xs text-forest/55">{{ step.note }}</p>
          </div>
        </li>
      </ol>
      <p v-else class="mt-5 text-sm text-clay-700">Status: {{ order.status_label }}</p>

      <ul class="mt-6 space-y-1.5 border-t border-forest/10 pt-5 text-sm text-forest/70">
        <li v-for="line in order.lines" :key="line.identifier" class="flex justify-between gap-4">
          <span class="min-w-0 truncate">{{ line.quantity }} × {{ line.description }}</span>
          <span class="shrink-0 tabular-nums">{{ line.total_formatted }}</span>
        </li>
        <li class="flex justify-between gap-4 border-t border-forest/10 pt-3 text-base font-semibold text-forest">
          <span>Ukupno</span><span class="tabular-nums">{{ order.total_formatted }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

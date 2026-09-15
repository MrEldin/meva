<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const auth = useAuthStore()

const order = ref(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

const STATUSES = [
  { value: 'awaiting-dispatch', label: 'Za slanje' },
  { value: 'dispatched', label: 'Poslato' },
  { value: 'delivered', label: 'Isporučeno' },
  { value: 'returned', label: 'Vraćeno' },
  { value: 'cancelled', label: 'Otkazano' },
]

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`
const when = (iso) => (iso ? new Date(iso).toLocaleString('sr-RS', { dateStyle: 'long', timeStyle: 'short' }) : '—')

async function load() {
  loading.value = true

  try {
    const { data } = await client.get(`/admin/orders/${route.params.id}`)
    order.value = data.data
  } finally {
    loading.value = false
  }
}

async function setStatus(status) {
  if (!auth.can('orders.manage') || saving.value) return

  saving.value = true

  try {
    const { data } = await client.put(`/admin/orders/${route.params.id}/status`, { status })
    order.value = data.data
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await load()
  setMeta({ title: `Porudžbina ${order.value?.reference ?? ''}` })
})
</script>

<template>
  <div>
    <RouterLink :to="{ name: 'admin.orders' }" class="eyebrow text-forest/50 transition-colors hover:text-forest">← Sve porudžbine</RouterLink>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>

    <div v-else-if="order" class="mt-4">
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
        <div>
          <p class="eyebrow text-clay-500">Porudžbina</p>
          <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">{{ order.reference }}</h1>
          <p class="mt-2 text-sm text-forest/60">{{ when(order.placed_at) }}</p>
        </div>
        <p class="font-display text-3xl tabular-nums">{{ order.total_formatted }}</p>
      </header>

      <div class="grid gap-5 pt-6 lg:grid-cols-[1.4fr_1fr]">
        <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
          <h2 class="eyebrow text-[0.5625rem] text-forest/50">Artikli</h2>
          <ul class="mt-4 divide-y divide-forest/10">
            <li v-for="line in order.lines" :key="line.identifier" class="flex items-start justify-between gap-4 py-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold">{{ line.description }}</p>
                <p class="mt-0.5 font-mono text-xs text-forest/50">{{ line.identifier }} · {{ line.quantity }} × {{ money(line.unit_price) }}</p>
              </div>
              <span class="shrink-0 tabular-nums">{{ line.total_formatted }}</span>
            </li>
          </ul>

          <dl class="mt-5 space-y-1.5 border-t border-forest/10 pt-4 text-sm">
            <div class="flex justify-between"><dt class="text-forest/60">Roba</dt><dd class="tabular-nums">{{ money(order.sub_total) }}</dd></div>
            <div class="flex justify-between"><dt class="text-forest/60">Dostava</dt><dd class="tabular-nums">{{ order.shipping_total ? money(order.shipping_total) : 'besplatno' }}</dd></div>
            <div class="flex justify-between text-base font-semibold"><dt>Ukupno</dt><dd class="tabular-nums">{{ order.total_formatted }}</dd></div>
          </dl>
        </section>

        <div class="space-y-5">
          <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
            <h2 class="eyebrow text-[0.5625rem] text-forest/50">Kupac</h2>
            <p class="mt-3 text-base font-semibold">{{ order.customer?.name }}</p>
            <dl class="mt-3 space-y-1.5 text-sm text-forest/75">
              <dd><a :href="`tel:${order.customer?.phone}`" class="hover:text-clay-600">{{ order.customer?.phone }}</a></dd>
              <dd><a :href="`mailto:${order.customer?.email}`" class="hover:text-clay-600">{{ order.customer?.email }}</a></dd>
              <dd>{{ order.customer?.address }}</dd>
              <dd>{{ order.customer?.postcode }} {{ order.customer?.city }}</dd>
            </dl>
            <p v-if="order.notes" class="mt-4 rounded-xl bg-cream p-3 text-sm text-forest/75">„{{ order.notes }}"</p>
          </section>

          <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
            <h2 class="eyebrow text-[0.5625rem] text-forest/50">Status</h2>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="option in STATUSES"
                :key="option.value"
                type="button"
                class="eyebrow rounded-full px-4 py-2.5 text-[0.5625rem] transition-colors disabled:opacity-40"
                :class="order.status === option.value ? 'bg-forest text-cream' : 'bg-cream hover:bg-sage'"
                :disabled="!auth.can('orders.manage') || saving"
                @click="setStatus(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <p v-if="saved" class="mt-3 text-xs text-sage-deep">Sačuvano.</p>
            <p v-else-if="!auth.can('orders.manage')" class="mt-3 text-xs text-forest/50">Nemate dozvolu za izmenu porudžbina.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

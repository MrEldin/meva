<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { useLoyaltyStore } from '@/stores/loyalty'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const loyalty = useLoyaltyStore()
const router = useRouter()

const orders = ref([])
const loading = ref(true)

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`
const number = (value) => new Intl.NumberFormat('sr-RS').format(value ?? 0)
const when = (iso) => (iso ? new Date(iso).toLocaleDateString('sr-RS', { day: '2-digit', month: 'long', year: 'numeric' }) : '')

const TONE = {
  'awaiting-dispatch': 'bg-wheat text-forest',
  dispatched: 'bg-sky text-forest',
  delivered: 'bg-sage text-sage-deep',
  returned: 'bg-clay-100 text-clay-700',
  cancelled: 'bg-blush-500/10 text-forest/60',
}

function signOut() {
  auth.logout()
  router.push({ name: 'home' })
}

onMounted(async () => {
  setMeta({ title: 'Moj nalog' })

  if (!auth.user) await auth.fetchUser()

  // The club card fills in on its own; the orders do not wait for it.
  loyalty.load()

  try {
    const { data } = await client.get('/account/orders')
    orders.value = data.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="shell py-14 lg:py-20">
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/15 pb-6">
      <div>
        <p class="eyebrow text-clay-500">Moj nalog</p>
        <h1 class="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Zdravo, {{ auth.user?.first_name }}</h1>
        <p class="mt-2 text-sm text-forest/60">{{ auth.user?.email }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <RouterLink v-if="auth.isStaff" :to="{ name: 'admin' }" class="pill border border-forest/20 hover:bg-blush-500 hover:text-paper">Administracija</RouterLink>
        <button type="button" class="pill border border-forest/20 hover:bg-blush-500 hover:text-paper" @click="signOut">Odjava</button>
      </div>
    </header>

    <RouterLink
      :to="{ name: 'loyalty' }"
      class="group mt-8 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-blush-200 via-blush-400 to-blush-600 p-6 text-paper transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(142,59,69,0.6)] sm:p-7"
    >
      <div>
        <p class="kicker text-paper/80">Meva Klub · {{ loyalty.tier?.label ?? 'Pupoljak' }}</p>
        <p class="mt-2 font-display text-4xl leading-none tabular-nums">
          {{ number(loyalty.points) }}
          <span class="text-lg italic">poena</span>
        </p>
        <p v-if="loyalty.tier?.next" class="mt-2 text-[0.8125rem] text-paper/85">
          još {{ number(loyalty.tier.next.points_needed) }} poena do {{ loyalty.tier.next.label }}
        </p>
        <p v-else-if="loyalty.pendingPoints > 0" class="mt-2 text-[0.8125rem] text-paper/85">+{{ number(loyalty.pendingPoints) }} poena na čekanju</p>
      </div>
      <span class="pill bg-paper text-blush-600 group-hover:bg-blush-50">Nagrade i kuponi →</span>
    </RouterLink>

    <h2 class="eyebrow mt-10 text-forest/50">Moje porudžbine</h2>

    <p v-if="loading" class="py-12 text-sm text-forest/50">Učitavanje…</p>

    <div v-else-if="!orders.length" class="rounded-[1.5rem] bg-sand p-8 text-center">
      <p class="text-forest/70">Još nemate porudžbina.</p>
      <RouterLink :to="{ name: 'catalog' }" class="pill mt-5 bg-blush-500 text-paper hover:bg-blush-500">Pogledaj preparate</RouterLink>
    </div>

    <ul v-else class="mt-5 space-y-4">
      <li v-for="order in orders" :key="order.id" class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-sm">{{ order.reference }}</p>
            <p class="mt-1 text-xs text-forest/55">{{ when(order.placed_at) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="eyebrow rounded-full px-3 py-1.5 text-[0.5rem]" :class="TONE[order.status] ?? 'bg-blush-500/10'">{{ order.status_label }}</span>
            <span class="font-display text-xl tabular-nums">{{ order.total_formatted }}</span>
          </div>
        </div>

        <ul class="mt-4 space-y-1.5 border-t border-forest/10 pt-4 text-sm text-forest/70">
          <li v-for="line in order.lines" :key="line.identifier" class="flex justify-between gap-4">
            <span class="min-w-0 truncate">{{ line.quantity }} × {{ line.description }}</span>
            <span class="shrink-0 tabular-nums">{{ line.total_formatted }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

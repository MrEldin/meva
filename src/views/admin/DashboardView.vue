<script setup>
import client from '@/api/client'
import logoBlack from '@/assets/brand/logo-black.png'
import BarList from '@/components/admin/BarList.vue'
import RevenueChart from '@/components/admin/RevenueChart.vue'
import StatTile from '@/components/admin/StatTile.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const data = ref(null)
const loading = ref(true)
const failed = ref(false)

onMounted(async () => {
  try {
    const response = await client.get('/admin/analytics')
    data.value = response.data.data
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

const dinars = (minor) => new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)
const count = (value) => new Intl.NumberFormat('sr-RS').format(value)

const totals = computed(() => data.value?.totals)

const revenueOf = (row) => `${dinars(row.revenue)} RSD`
const ordersOf = (row) => `${count(row.orders)}`

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-mist-50">
    <!-- Bar -->
    <header class="border-b border-mist-200 bg-paper">
      <div class="shell flex items-center justify-between py-4">
        <div class="flex items-center gap-4">
          <img :src="logoBlack" alt="Meva" class="h-6 w-auto" />
          <span class="eyebrow hidden text-mist-400 sm:inline">Administracija</span>
        </div>

        <div class="flex items-center gap-5">
          <RouterLink :to="{ name: 'home' }" class="eyebrow text-mist-500 transition-colors hover:text-ink">
            Prodavnica
          </RouterLink>
          <button type="button" class="eyebrow text-mist-500 transition-colors hover:text-blush-600" @click="signOut">
            Odjava
          </button>
        </div>
      </div>
    </header>

    <div class="shell py-10 md:py-14">
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-32 animate-pulse border border-mist-200 bg-paper" />
      </div>

      <div v-else-if="failed" class="border border-mist-200 bg-paper p-10 text-center">
        <p class="font-display text-2xl text-ink">Analitika nije dostupna</p>
        <p class="mt-3 text-sm font-light text-mist-500">Proverite da li ste i dalje prijavljeni.</p>
      </div>

      <template v-else-if="data">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="font-display text-3xl text-ink md:text-4xl">Pregled prodaje</h1>
            <p class="mt-2 text-sm font-light text-mist-500">
              {{ data.period.from }} — {{ data.period.to }}
            </p>
          </div>
        </div>

        <!-- Headline -->
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Promet" :value="`${dinars(totals.revenue)} RSD`" />
          <StatTile label="Porudžbina" :value="count(totals.orders)" />
          <StatTile label="Prosečna porudžbina" :value="`${dinars(totals.average_order)} RSD`" />
          <StatTile label="Kupaca" :value="count(totals.customers)" hint="jedinstveno po e-mailu" />
        </div>

        <!-- Trend -->
        <div class="mt-4">
          <RevenueChart :points="data.monthly" />
        </div>

        <!-- Breakdowns -->
        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <BarList title="Kanali dolaska" :rows="data.channels" :format="revenueOf" />
          <BarList title="Uređaj" :rows="data.devices" :format="ordersOf" metric="orders" />
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <BarList title="Gradovi" :rows="data.cities" :format="ordersOf" metric="orders" />
          <BarList title="Najprodavaniji proizvodi" :rows="data.products" :format="revenueOf" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const open = ref(false)

/*
 * Every section carries its own colour, on its icon here and on the heading of
 * the page it opens. Seven items in one shade all look the same; seven colours
 * are recognised before they are read.
 */
const SECTIONS = [
  { to: 'admin.overview', label: 'Pregled', permission: 'analytics.view', icon: 'chart', tone: 'overview', note: 'Promet i kupci' },
  { to: 'admin.orders', label: 'Porudžbine', permission: 'orders.view', icon: 'box', tone: 'orders', note: 'Ko je šta poručio' },
  { to: 'admin.products', label: 'Proizvodi', permission: 'products.view', icon: 'bottle', tone: 'products', note: 'Katalog i cene' },
  { to: 'admin.marketing', label: 'Marketing', permission: 'marketing.manage', icon: 'megaphone', tone: 'marketing', note: 'Koga kontaktirati' },
  { to: 'admin.email', label: 'Email kampanje', permission: 'marketing.manage', icon: 'envelope', tone: 'email', note: 'Pisanje i slanje' },
  { to: 'admin.team', label: 'Tim', permission: 'users.manage', icon: 'people', tone: 'team', note: 'Nalozi i prava' },
  { to: 'admin.profile', label: 'Moj nalog', permission: null, icon: 'user', tone: 'account', note: 'Lozinka i podaci' },
]

// Written out rather than built from strings, so Tailwind keeps the classes.
const TONES = {
  overview: 'bg-desk-overview',
  orders: 'bg-desk-orders',
  products: 'bg-desk-products',
  marketing: 'bg-desk-marketing',
  email: 'bg-desk-email',
  team: 'bg-desk-team',
  account: 'bg-desk-account',
}

const links = computed(() => SECTIONS.filter((s) => !s.permission || auth.can(s.permission)))

const isActive = (name) => route.name === name || String(route.name ?? '').startsWith(`${name}.`)

const initials = computed(() =>
  (auth.name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-cream text-forest lg:flex">
    <aside class="bg-forest text-cream lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[17.5rem] lg:shrink-0 lg:flex-col">
      <div class="flex items-center justify-between px-5 py-4 lg:px-6 lg:py-7">
        <RouterLink :to="{ name: 'admin.overview' }" class="flex items-center gap-3">
          <img :src="logoBlack" alt="Meva" class="h-7 w-auto brightness-0 invert" />
          <span class="label text-cream/55">Admin</span>
        </RouterLink>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 lg:hidden"
          :aria-expanded="open"
          aria-label="Meni"
          @click="open = !open"
        >
          <span class="relative block h-3 w-4">
            <span class="absolute left-0 block h-px w-4 bg-current transition-all duration-300" :class="open ? 'top-1.5 rotate-45' : 'top-0'" />
            <span class="absolute left-0 block h-px w-4 bg-current transition-all duration-300" :class="open ? 'top-1.5 -rotate-45' : 'top-3'" />
          </span>
        </button>
      </div>

      <nav class="px-3 pb-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto" :class="open ? 'block' : 'hidden lg:block'">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="{ name: link.to }"
          class="group mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors"
          :class="isActive(link.to) ? 'bg-cream text-forest' : 'text-cream/80 hover:bg-cream/10 hover:text-cream'"
          @click="open = false"
        >
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-cream transition-transform duration-300 group-hover:scale-105"
            :class="TONES[link.tone]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="h-[1.125rem] w-[1.125rem]">
              <template v-if="link.icon === 'chart'"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></template>
              <template v-else-if="link.icon === 'box'"><path d="M3 8l9-5 9 5v8l-9 5-9-5Z" /><path d="M3 8l9 5 9-5M12 13v8" /></template>
              <template v-else-if="link.icon === 'bottle'"><path d="M10 2h4v4l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3Z" /><path d="M8 13h8" /></template>
              <template v-else-if="link.icon === 'megaphone'"><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z" /><path d="M17 9a4 4 0 0 1 0 6" /></template>
              <template v-else-if="link.icon === 'envelope'"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.8 7.2 12 13l8.2-5.8" /></template>
              <template v-else-if="link.icon === 'people'"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><path d="M17 7.5a3 3 0 0 1 0 5.6M18 20c0-2.2-.8-3.9-2.2-5" /></template>
              <template v-else><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></template>
            </svg>
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate text-[0.9375rem] font-semibold leading-tight">{{ link.label }}</span>
            <span class="mt-0.5 block truncate text-xs" :class="isActive(link.to) ? 'text-forest/55' : 'text-cream/45'">{{ link.note }}</span>
          </span>
        </RouterLink>
      </nav>

      <!-- Who is signed in, and the two ways out -->
      <div class="border-t border-cream/12 px-5 py-4 lg:px-5 lg:py-5" :class="open ? 'block' : 'hidden lg:block'">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream/12 text-sm font-semibold text-cream">{{ initials || '·' }}</span>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ auth.name }}</p>
            <p class="truncate text-xs text-cream/50">{{ auth.user?.email }}</p>
          </div>
        </div>

        <p class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="role in auth.roles" :key="role" class="chip bg-cream/12 text-[0.6875rem] font-medium text-cream/80">{{ role }}</span>
        </p>

        <div class="mt-4 flex items-center gap-2">
          <RouterLink :to="{ name: 'home' }" class="btn flex-1 border border-cream/25 px-3 text-cream transition-colors hover:bg-cream hover:text-forest">
            Prodavnica
          </RouterLink>
          <button type="button" class="btn border border-cream/25 px-3 text-cream/80 transition-colors hover:bg-clay-500 hover:border-clay-500 hover:text-white" @click="signOut">
            Odjava
          </button>
        </div>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-5 pb-20 pt-6 sm:px-8 lg:px-10 lg:pt-9">
      <RouterView />
    </main>
  </div>
</template>

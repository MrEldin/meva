<script setup>
import logoWhite from '@/assets/brand/logo-white.png'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const open = ref(false)

/*
 * The rail is written in the shop's own language rather than a dashboard's:
 * mono numerals, the section named in the display serif, and a spine of colour
 * down the left of each row -- the same mark the labels on the bottles carry.
 * Each section keeps its colour on the heading of the page it opens, so the
 * rail and the page always agree about where you are.
 */
const SECTIONS = [
  { to: 'admin.overview', label: 'Pregled', permission: 'analytics.view', tone: 'overview', note: 'Promet i kupci' },
  { to: 'admin.orders', label: 'Porudžbine', permission: 'orders.view', tone: 'orders', note: 'Ko je šta poručio' },
  { to: 'admin.products', label: 'Proizvodi', permission: 'products.view', tone: 'products', note: 'Katalog i cene' },
  { to: 'admin.marketing', label: 'Marketing', permission: 'marketing.manage', tone: 'marketing', note: 'Koga kontaktirati' },
  { to: 'admin.email', label: 'Kampanje', permission: 'marketing.manage', tone: 'email', note: 'Pisanje i slanje' },
  { to: 'admin.team', label: 'Tim', permission: 'users.manage', tone: 'team', note: 'Nalozi i prava' },
  { to: 'admin.profile', label: 'Nalog', permission: null, tone: 'account', note: 'Lozinka i podaci' },
]

// Written out rather than built from strings, so Tailwind keeps the classes.
const SPINE = {
  overview: 'bg-desk-overview',
  orders: 'bg-desk-orders',
  products: 'bg-desk-products',
  marketing: 'bg-desk-marketing',
  email: 'bg-desk-email',
  team: 'bg-desk-team',
  account: 'bg-desk-account',
}

const INK = {
  overview: 'text-desk-overview',
  orders: 'text-desk-orders',
  products: 'text-desk-products',
  marketing: 'text-desk-marketing',
  email: 'text-desk-email',
  team: 'text-desk-team',
  account: 'text-desk-account',
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
    <aside class="desk-rail text-cream lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[17.5rem] lg:shrink-0 lg:flex-col">
      <div class="flex items-center justify-between gap-4 px-6 py-5 lg:py-7">
        <RouterLink :to="{ name: 'admin.overview' }" class="min-w-0">
          <img :src="logoWhite" alt="Meva" class="h-8 w-auto" />
          <span class="label mt-2 block text-cream/40">Admin · Novi Pazar</span>
        </RouterLink>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/25 lg:hidden"
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

      <div class="rule-soft mx-6 h-px" :class="open ? 'block' : 'hidden lg:block'" />

      <nav class="px-3 py-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto" :class="open ? 'block' : 'hidden lg:block'">
        <RouterLink
          v-for="(link, index) in links"
          :key="link.to"
          :to="{ name: link.to }"
          class="group relative mb-0.5 flex items-baseline gap-3 overflow-hidden rounded-xl py-2.5 pl-4 pr-3 transition-colors duration-300"
          :class="isActive(link.to) ? 'bg-cream text-forest' : 'text-cream/85 hover:bg-cream/[0.07]'"
          @click="open = false"
        >
          <!-- The spine: a thin mark that fills out when the section is open -->
          <span
            class="absolute inset-y-1.5 left-0 w-[3px] rounded-full transition-all duration-300"
            :class="[SPINE[link.tone], isActive(link.to) ? 'opacity-100' : 'opacity-35 group-hover:opacity-70']"
          />

          <span
            class="font-mono text-[0.6875rem] tabular-nums transition-colors"
            :class="isActive(link.to) ? INK[link.tone] : 'text-cream/35'"
          >
            {{ String(index + 1).padStart(2, '0') }}
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate font-display text-[1.0625rem] leading-tight tracking-tight">{{ link.label }}</span>
            <span class="mt-0.5 block truncate text-xs" :class="isActive(link.to) ? 'text-forest/55' : 'text-cream/40'">{{ link.note }}</span>
          </span>
        </RouterLink>
      </nav>

      <!-- Who is signed in, and the two ways out -->
      <div class="px-6 pb-5 pt-1 lg:pb-6" :class="open ? 'block' : 'hidden lg:block'">
        <div class="rule-soft mb-4 h-px" />

        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/20 font-mono text-xs text-cream">{{ initials || '·' }}</span>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ auth.name }}</p>
            <p class="truncate font-mono text-[0.6875rem] text-cream/45">{{ auth.roles.join(' · ') }}</p>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-2">
          <RouterLink :to="{ name: 'home' }" class="btn flex-1 border border-cream/25 px-3 text-cream transition-colors hover:bg-cream hover:text-forest">
            Prodavnica
          </RouterLink>
          <button type="button" class="btn border border-cream/25 px-3 text-cream/80 transition-colors hover:border-clay-500 hover:bg-clay-500 hover:text-white" @click="signOut">
            Odjava
          </button>
        </div>

        <p class="mt-4 font-mono text-[0.625rem] leading-relaxed tracking-[0.12em] text-cream/35 uppercase">
          Ručno rađeno · od 2010.
        </p>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-5 pb-20 pt-6 sm:px-8 lg:px-10 lg:pt-9">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * The desk.
 *
 * The rail used to be a dark column of small grey type over a numbered
 * spine, which was hard to read and told you nothing about where you were.
 * It is white now, the sections carry icons rather than numbers, and the one
 * you have open is the only coloured thing on it. The sections are grouped
 * the way the work is: what is selling, what is for sale, who is being
 * written to, and the shop itself.
 */
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const open = ref(false)

const GROUPS = [
  {
    title: 'Prodaja',
    items: [
      { to: 'admin.overview', label: 'Pregled', permission: 'analytics.view', icon: 'chart' },
      { to: 'admin.orders', label: 'Porudžbine', permission: 'orders.view', icon: 'box' },
    ],
  },
  {
    title: 'Katalog',
    items: [
      { to: 'admin.products', label: 'Proizvodi', permission: 'products.view', icon: 'bottle' },
      { to: 'admin.reviews', label: 'Recenzije', permission: 'products.manage', icon: 'star' },
    ],
  },
  {
    title: 'Kupci',
    items: [
      { to: 'admin.marketing', label: 'Marketing', permission: 'marketing.manage', icon: 'people' },
      { to: 'admin.email', label: 'Kampanje', permission: 'marketing.manage', icon: 'mail' },
    ],
  },
  {
    title: 'Podešavanja',
    items: [
      { to: 'admin.team', label: 'Tim', permission: 'users.manage', icon: 'key' },
      { to: 'admin.profile', label: 'Moj nalog', permission: null, icon: 'user' },
    ],
  },
]

const groups = computed(() =>
  GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || auth.can(item.permission)),
  })).filter((group) => group.items.length),
)

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

watch(() => route.fullPath, () => (open.value = false))

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-cream text-forest lg:flex">
    <aside class="desk-rail lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[16.5rem] lg:shrink-0 lg:flex-col">
      <div class="flex items-center justify-between gap-4 px-5 py-4 lg:px-6 lg:py-6">
        <RouterLink :to="{ name: 'admin.overview' }" class="min-w-0">
          <img :src="logoBlack" alt="Meva" class="h-8 w-auto" />
          <span class="label mt-1.5 block text-forest/40">Admin</span>
        </RouterLink>
        <button
          type="button"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/12 lg:hidden"
          :aria-expanded="open"
          aria-label="Meni"
          @click="open = !open"
        >
          <span class="relative block h-3 w-4">
            <span class="absolute left-0 block h-[1.5px] w-4 rounded bg-current transition-all duration-300" :class="open ? 'top-1.5 rotate-45' : 'top-0'" />
            <span class="absolute left-0 block h-[1.5px] w-4 rounded bg-current transition-all duration-300" :class="open ? 'top-1.5 -rotate-45' : 'top-3'" />
          </span>
        </button>
      </div>

      <nav class="px-3 pb-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto" :class="open ? 'block' : 'hidden lg:block'">
        <div v-for="group in groups" :key="group.title" class="mb-5 last:mb-0">
          <p class="label px-3 pb-2 text-forest/35">{{ group.title }}</p>

          <RouterLink
            v-for="link in group.items"
            :key="link.to"
            :to="{ name: link.to }"
            class="relative mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-semibold transition-colors duration-200"
            :class="isActive(link.to) ? 'bg-clay-600 text-white' : 'text-forest/75 hover:bg-sand hover:text-forest'"
          >
            <svg viewBox="0 0 24 24" class="h-[1.125rem] w-[1.125rem] shrink-0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <template v-if="link.icon === 'chart'"><path d="M4 19V5M4 19h16" /><path d="m7.5 14 3.5-4 3 2.5L19 7" /></template>
              <template v-else-if="link.icon === 'box'"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5 3.5 16.5z" /><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" /></template>
              <template v-else-if="link.icon === 'bottle'"><path d="M10 2.5h4v3l2.2 3.2a4 4 0 0 1 .8 2.4v8.4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8.4a4 4 0 0 1 .8-2.4L10 5.5z" /><path d="M7.4 13.5h9.2" /></template>
              <template v-else-if="link.icon === 'star'"><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" /></template>
              <template v-else-if="link.icon === 'people'"><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6" /><path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.4M17.5 14.8c2.2.6 3.7 2.4 3.7 5.2" /></template>
              <template v-else-if="link.icon === 'mail'"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7 8 5.5L20 7" /></template>
              <template v-else-if="link.icon === 'key'"><circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3.2M15.5 12v2.4" /></template>
              <template v-else><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.6 3.3-6 7.2-6s7.2 2.4 7.2 6" /></template>
            </svg>
            {{ link.label }}
          </RouterLink>
        </div>
      </nav>

      <!-- Who is signed in, and the two ways out -->
      <div class="border-t border-forest/8 px-5 py-4 lg:px-6" :class="open ? 'block' : 'hidden lg:block'">
        <div class="flex items-center gap-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-clay-100 text-[0.75rem] font-bold text-clay-700">{{ initials || '·' }}</span>
          <div class="min-w-0">
            <p class="truncate text-[0.875rem] font-bold">{{ auth.name }}</p>
            <p class="truncate text-[0.75rem] text-forest/45">{{ auth.roles.join(' · ') }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <RouterLink :to="{ name: 'home' }" class="flex-1 rounded-full border border-forest/12 px-3 py-2 text-center text-[0.8125rem] font-semibold transition-colors hover:bg-sand">
            Prodavnica
          </RouterLink>
          <button type="button" class="rounded-full border border-forest/12 px-3 py-2 text-[0.8125rem] font-semibold text-forest/70 transition-colors hover:border-clay-600 hover:bg-clay-600 hover:text-white" @click="signOut">
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

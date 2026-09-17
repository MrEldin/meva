<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * The desk.
 *
 * The rail sits on its own warm ground so the working area beside it reads
 * as the page and this reads as the furniture. The sections are grouped the
 * way the work is -- what is selling, what is for sale, who is being written
 * to, and the shop itself -- each behind a quiet heading, so nobody has to
 * read seven labels to find one thing.
 *
 * Only one item is ever coloured: the one you have open. It carries a solid
 * pink pill; everything else is dark type on the rail's own ground, which is
 * what makes the open one findable without looking.
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
  <div class="min-h-screen bg-paper text-forest lg:flex">
    <aside class="desk-rail lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[16.75rem] lg:shrink-0 lg:flex-col">
      <div class="flex items-center justify-between gap-4 px-5 py-4 lg:px-5 lg:pb-3 lg:pt-6">
        <RouterLink :to="{ name: 'admin.overview' }" class="flex min-w-0 items-center gap-3">
          <img :src="logoBlack" alt="Meva" class="h-9 w-auto" />
          <span class="mt-1 rounded-full bg-clay-100 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-clay-700">Admin</span>
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

      <nav class="px-3 pb-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-3" :class="open ? 'block' : 'hidden lg:block'">
        <div v-for="group in groups" :key="group.title" class="mb-6 last:mb-2">
          <p class="mb-1.5 px-3 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-forest/30">{{ group.title }}</p>

          <RouterLink
            v-for="link in group.items"
            :key="link.to"
            :to="{ name: link.to }"
            class="group relative mb-1 flex items-center gap-3 rounded-[0.875rem] py-2.5 pl-2.5 pr-3 text-[0.9375rem] font-semibold transition-all duration-200"
            :class="isActive(link.to)
              ? 'bg-clay-600 text-white shadow-[0_10px_20px_-12px_rgba(158,79,86,0.9)]'
              : 'text-forest/80 hover:bg-paper hover:text-forest hover:shadow-[0_6px_16px_-12px_rgba(26,20,22,0.7)]'"
          >
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-[0.625rem] transition-colors duration-200"
              :class="isActive(link.to) ? 'bg-white/18 text-white' : 'bg-paper text-forest/55 group-hover:bg-clay-50 group-hover:text-clay-700'"
            >
            <svg viewBox="0 0 24 24" class="h-[1.0625rem] w-[1.0625rem]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <template v-if="link.icon === 'chart'"><path d="M4 19V5M4 19h16" /><path d="m7.5 14 3.5-4 3 2.5L19 7" /></template>
              <template v-else-if="link.icon === 'box'"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5 3.5 16.5z" /><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" /></template>
              <template v-else-if="link.icon === 'bottle'"><path d="M10 2.5h4v3l2.2 3.2a4 4 0 0 1 .8 2.4v8.4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8.4a4 4 0 0 1 .8-2.4L10 5.5z" /><path d="M7.4 13.5h9.2" /></template>
              <template v-else-if="link.icon === 'star'"><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" /></template>
              <template v-else-if="link.icon === 'people'"><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6" /><path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.4M17.5 14.8c2.2.6 3.7 2.4 3.7 5.2" /></template>
              <template v-else-if="link.icon === 'mail'"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7 8 5.5L20 7" /></template>
              <template v-else-if="link.icon === 'key'"><circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3.2M15.5 12v2.4" /></template>
              <template v-else><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.6 3.3-6 7.2-6s7.2 2.4 7.2 6" /></template>
            </svg>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ link.label }}</span>
            <svg
              v-if="isActive(link.to)"
              viewBox="0 0 24 24"
              class="h-3.5 w-3.5 shrink-0 text-white/70"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            ><path d="m9 6 6 6-6 6" /></svg>
          </RouterLink>
        </div>
      </nav>

      <!-- Who is signed in, and the two ways out -->
      <div class="px-3 pb-4 lg:px-3" :class="open ? 'block' : 'hidden lg:block'">
        <div class="rounded-[1rem] bg-paper p-3 shadow-[0_8px_24px_-18px_rgba(26,20,22,0.8)]">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay-600 text-[0.8125rem] font-bold text-white">{{ initials || '·' }}</span>
            <div class="min-w-0">
              <p class="truncate text-[0.875rem] font-bold leading-tight">{{ auth.name }}</p>
              <p class="truncate text-[0.75rem] text-forest/45">{{ auth.roles.join(' · ') }}</p>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <RouterLink :to="{ name: 'home' }" class="rounded-[0.625rem] bg-cream px-3 py-2 text-center text-[0.8125rem] font-semibold transition-colors hover:bg-sand">
              Prodavnica
            </RouterLink>
            <button type="button" class="rounded-[0.625rem] bg-cream px-3 py-2 text-[0.8125rem] font-semibold text-forest/70 transition-colors hover:bg-clay-600 hover:text-white" @click="signOut">
              Odjava
            </button>
          </div>
        </div>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-5 pb-20 pt-6 sm:px-8 lg:px-10 lg:pt-9">
      <RouterView />
    </main>
  </div>
</template>

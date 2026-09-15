<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

const links = computed(() =>
  [
    { to: { name: 'admin.overview' }, label: 'Pregled', permission: 'analytics.view', icon: 'chart' },
    { to: { name: 'admin.orders' }, label: 'Porudžbine', permission: 'orders.view', icon: 'box' },
    { to: { name: 'admin.products' }, label: 'Proizvodi', permission: 'products.view', icon: 'bottle' },
    { to: { name: 'admin.marketing' }, label: 'Marketing', permission: 'marketing.manage', icon: 'megaphone' },
    { to: { name: 'admin.email' }, label: 'Email kampanje', permission: 'marketing.manage', icon: 'envelope' },
    { to: { name: 'admin.team' }, label: 'Tim', permission: 'users.manage', icon: 'people' },
    { to: { name: 'admin.profile' }, label: 'Moj nalog', permission: null, icon: 'user' },
  ].filter((link) => !link.permission || auth.can(link.permission)),
)

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-cream text-forest lg:flex">
    <aside class="lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-forest/10">
      <div class="flex items-center justify-between px-5 py-4 lg:px-6 lg:py-6">
        <RouterLink :to="{ name: 'admin.overview' }" class="flex items-center gap-3">
          <img :src="logoBlack" alt="Meva" class="h-7 w-auto" />
          <span class="eyebrow text-[0.5625rem] text-forest/50">Admin</span>
        </RouterLink>
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 lg:hidden" aria-label="Meni" @click="open = !open">
          <span class="relative block h-3 w-4">
            <span class="absolute left-0 block h-px w-4 bg-current transition-all duration-300" :class="open ? 'top-1.5 rotate-45' : 'top-0'" />
            <span class="absolute left-0 block h-px w-4 bg-current transition-all duration-300" :class="open ? 'top-1.5 -rotate-45' : 'top-3'" />
          </span>
        </button>
      </div>

      <nav class="px-3 pb-4 lg:px-3" :class="open ? 'block' : 'hidden lg:block'">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors hover:bg-sand"
          active-class="bg-forest text-cream hover:bg-forest"
          @click="open = false"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 opacity-70">
            <template v-if="link.icon === 'chart'"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></template>
            <template v-else-if="link.icon === 'box'"><path d="M3 8l9-5 9 5v8l-9 5-9-5Z" /><path d="M3 8l9 5 9-5M12 13v8" /></template>
            <template v-else-if="link.icon === 'bottle'"><path d="M10 2h4v4l2 3v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3Z" /><path d="M8 13h8" /></template>
            <template v-else-if="link.icon === 'megaphone'"><path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z" /><path d="M17 9a4 4 0 0 1 0 6" /></template>
            <template v-else-if="link.icon === 'envelope'"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.8 7.2 12 13l8.2-5.8" /></template>
            <template v-else-if="link.icon === 'people'"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><path d="M17 7.5a3 3 0 0 1 0 5.6M18 20c0-2.2-.8-3.9-2.2-5" /></template>
            <template v-else><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></template>
          </svg>
          {{ link.label }}
        </RouterLink>

        <div class="mt-4 border-t border-forest/10 px-4 pt-4">
          <p class="text-sm font-semibold">{{ auth.name }}</p>
          <p class="mt-0.5 text-xs text-forest/55">{{ auth.user?.email }}</p>
          <p class="eyebrow mt-2 text-[0.5rem] text-clay-500">{{ auth.roles.join(', ') }}</p>
          <div class="mt-4 flex flex-col gap-2">
            <RouterLink :to="{ name: 'home' }" class="eyebrow text-forest/60 transition-colors hover:text-forest">Prodavnica →</RouterLink>
            <button type="button" class="eyebrow text-left text-forest/60 transition-colors hover:text-clay-600" @click="signOut">Odjava</button>
          </div>
        </div>
      </nav>
    </aside>

    <main class="min-w-0 flex-1 px-5 pb-16 pt-2 sm:px-8 lg:px-10 lg:pt-8">
      <RouterView />
    </main>
  </div>
</template>

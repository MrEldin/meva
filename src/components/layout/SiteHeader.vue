<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * The header.
 *
 * White, on every page. Its character comes from type and air, not colour:
 * a slim line at the top for the two facts every order confirms, the wordmark
 * with room around it, navigation in small tracked capitals with a fine pink
 * rule that draws itself under the item you are on, thin icons, and a single
 * pink hairline where the header ends.
 */
const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const catalog = useCatalogStore()

const menuOpen = ref(false)
const searchOpen = ref(false)
const term = ref('')

watch(() => route.fullPath, () => {
  menuOpen.value = false
  searchOpen.value = false
})

const links = [
  { label: 'Svi proizvodi', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Seboreja', to: { name: 'catalog', query: { kategorija: 'seboreja' } } },
  { label: 'Psorijaza', to: { name: 'catalog', query: { kategorija: 'psorijaza' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { kategorija: 'setovi' } } },
]

const matches = computed(() => {
  const needle = term.value.trim().toLowerCase()
  if (needle.length < 2) return []
  return catalog.products.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 6)
})

function search() {
  if (!term.value.trim()) return
  router.push({ name: 'catalog', query: { q: term.value.trim() } })
  term.value = ''
}

function openSearch() {
  catalog.load()
  searchOpen.value = !searchOpen.value
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-paper">
    <!-- The two facts every one of 5.479 orders confirms: no delivery charge,
         paid to the courier. One slim line, a hairline, nothing shouting. -->
    <div class="border-b border-blush-100">
      <div class="shell flex h-9 items-center justify-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-blush-700 sm:text-[0.75rem]">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.5h11v9h-11zM13.5 10.5h3.6l3.4 3.2v2.8h-7z" /><circle cx="6" cy="18.3" r="1.5" /><circle cx="17.3" cy="18.3" r="1.5" /></svg>
        <span>Besplatna dostava</span>
        <span class="h-[3px] w-[3px] rounded-full bg-blush-400" aria-hidden="true" />
        <span>Plaćanje pouzećem</span>
      </div>
    </div>

    <div class="shell relative flex h-[4.5rem] items-center justify-between gap-4 lg:h-[5.25rem]">
      <!-- Left: menu on a phone, the wordmark on a desktop -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5 lg:hidden"
          :aria-expanded="menuOpen"
          aria-label="Meni"
          @click="menuOpen = !menuOpen"
        >
          <span class="relative block h-3 w-5">
            <span class="absolute left-0 block h-[1.5px] w-5 rounded bg-current transition-all duration-300" :class="menuOpen ? 'top-1.5 rotate-45' : 'top-0'" />
            <span class="absolute left-0 block h-[1.5px] w-5 rounded bg-current transition-all duration-300" :class="menuOpen ? 'top-1.5 -rotate-45' : 'top-3'" />
          </span>
        </button>
        <RouterLink :to="{ name: 'home' }" aria-label="Meva Cosmetics" class="hidden lg:block">
          <img :src="logoBlack" alt="Meva Cosmetics" class="h-10 w-auto" />
        </RouterLink>
      </div>

      <!-- Centre: the wordmark on a phone, the navigation on a desktop -->
      <RouterLink :to="{ name: 'home' }" aria-label="Meva Cosmetics" class="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <img :src="logoBlack" alt="Meva Cosmetics" class="h-8 w-auto" />
      </RouterLink>

      <nav class="hidden items-center gap-7 lg:flex">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="nav-item relative py-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-ink"
          active-class="is-on text-ink"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Right: search, account, basket -->
      <div class="flex items-center gap-0.5">
        <button type="button" class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5" aria-label="Pretraga" @click="openSearch">
          <svg viewBox="0 0 24 24" class="h-[1.25rem] w-[1.25rem]" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
        </button>
        <RouterLink
          :to="auth.signedIn ? { name: 'account' } : { name: 'login' }"
          class="hidden h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5 sm:grid"
          :aria-label="auth.signedIn ? 'Moj nalog' : 'Prijava'"
        >
          <svg viewBox="0 0 24 24" class="h-[1.25rem] w-[1.25rem]" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.6 3.3-6 7.2-6s7.2 2.4 7.2 6" stroke-linecap="round" /></svg>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-ink/5" aria-label="Korpa">
          <svg viewBox="0 0 24 24" class="h-[1.25rem] w-[1.25rem]" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16l-1.3 12.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8Z" stroke-linejoin="round" /><path d="M8.5 7V5.8a3.5 3.5 0 0 1 7 0V7" stroke-linecap="round" /></svg>
          <span v-if="cart.count" class="absolute right-0.5 top-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-blush-600 px-1 text-[0.625rem] font-bold text-paper">{{ cart.count }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="h-px w-full bg-gradient-to-r from-blush-200 via-blush-300 to-blush-200" aria-hidden="true" />

    <!-- Search -->
    <Transition enter-from-class="opacity-0 -translate-y-1" enter-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150">
      <div v-if="searchOpen" class="border-t border-blush-100 bg-paper">
        <div class="shell py-4">
          <form class="relative" @submit.prevent="search">
            <input v-model="term" type="search" autofocus placeholder="Šta tražite? Na primer: šampon, seboreja, krema…"
              class="w-full rounded-full border border-ink/15 bg-paper py-3.5 pl-5 pr-28 text-[0.9375rem] outline-none transition-colors placeholder:text-ink/40 focus:border-blush-500" />
            <button type="submit" class="absolute right-1.5 top-1.5 rounded-full bg-blush-600 px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-blush-700">Traži</button>
          </form>
          <ul v-if="matches.length" class="mt-3 space-y-1">
            <li v-for="product in matches" :key="product.slug">
              <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-paper/60">
                <img v-if="product.image" :src="product.image" alt="" class="h-11 w-11 rounded-lg object-cover" />
                <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ product.name }}</span>
                <span class="shrink-0 text-sm text-ink/55">{{ product.price?.formatted }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </Transition>

    <!-- Menu (phone) -->
    <Transition enter-from-class="opacity-0 -translate-y-1" enter-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150">
      <nav v-if="menuOpen" class="border-t border-blush-100 bg-paper lg:hidden">
        <div class="shell py-2">
          <RouterLink v-for="link in links" :key="link.label" :to="link.to" class="block border-b border-ink/10 py-3.5 text-[1.0625rem] font-medium last:border-0">{{ link.label }}</RouterLink>
          <RouterLink :to="auth.signedIn ? { name: 'account' } : { name: 'login' }" class="block py-3.5 text-[1.0625rem] font-medium sm:hidden">{{ auth.signedIn ? 'Moj nalog' : 'Prijava' }}</RouterLink>
        </div>
      </nav>
    </Transition>
  </header>
</template>

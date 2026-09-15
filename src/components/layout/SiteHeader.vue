<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const catalog = useCatalogStore()

const menuOpen = ref(false)
const searchOpen = ref(false)
const term = ref('')

// Any navigation closes the panels; leaving one open across routes is a
// classic mobile annoyance.
watch(() => route.fullPath, () => {
  menuOpen.value = false
  searchOpen.value = false
})

/*
 * The shop is the first link and the shop is the point. The rest are the
 * concerns people arrive with, named the way they would say them out loud,
 * because a visitor who has seborrhoea does not browse "skincare".
 */
const links = [
  { label: 'Svi proizvodi', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Seboreja', to: { name: 'catalog', query: { kategorija: 'seboreja' } } },
  { label: 'Psorijaza', to: { name: 'catalog', query: { kategorija: 'psorijaza' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { kategorija: 'setovi' } } },
]

/** The first few matches, so the answer appears while the word is typed. */
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
    <!-- The two things that decide a purchase, said before anything else. -->
    <p class="bg-ink px-4 py-2.5 text-center text-[0.8125rem] font-medium text-paper">
      Besplatna dostava u celoj Srbiji · Plaćanje pouzećem
    </p>

    <div class="border-b border-mist-200">
      <div class="shell flex items-center justify-between gap-4 py-3.5 md:py-4">
        <!-- Menu and search, on the left, where the reference site puts them -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-mist-100 lg:hidden"
            :aria-expanded="menuOpen"
            aria-label="Meni"
            @click="menuOpen = !menuOpen"
          >
            <span class="relative block h-3 w-5">
              <span class="absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300" :class="menuOpen ? 'top-1.5 rotate-45' : 'top-0'" />
              <span class="absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300" :class="menuOpen ? 'top-1.5 -rotate-45' : 'top-3'" />
            </span>
          </button>

          <button type="button" class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-mist-100" aria-label="Pretraga" @click="openSearch">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
          </button>
        </div>

        <RouterLink :to="{ name: 'home' }" aria-label="Meva Cosmetics" class="shrink-0 lg:order-first">
          <img :src="logoBlack" alt="Meva Cosmetics" class="h-8 w-auto md:h-9" />
        </RouterLink>

        <!-- Navigation, plainly, in the middle -->
        <nav class="hidden items-center gap-1 lg:flex">
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="rounded-full px-3.5 py-2 text-sm font-medium text-mist-600 transition-colors hover:bg-mist-100 hover:text-ink"
            active-class="text-ink"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="flex items-center gap-1">
          <RouterLink
            :to="auth.signedIn ? { name: 'account' } : { name: 'login' }"
            class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-mist-100"
            :aria-label="auth.signedIn ? 'Moj nalog' : 'Prijava'"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.6 3.3-6 7.2-6s7.2 2.4 7.2 6" stroke-linecap="round" /></svg>
          </RouterLink>

          <RouterLink :to="{ name: 'cart' }" class="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-mist-100" aria-label="Korpa">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16l-1.3 12.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8Z" stroke-linejoin="round" /><path d="M8.5 7V5.8a3.5 3.5 0 0 1 7 0V7" stroke-linecap="round" /></svg>
            <span
              v-if="cart.count"
              class="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-blush-500 px-1 text-[0.6875rem] font-bold text-paper"
            >{{ cart.count }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Search -->
    <Transition
      enter-from-class="opacity-0 -translate-y-2" enter-active-class="transition duration-200"
      leave-to-class="opacity-0 -translate-y-2" leave-active-class="transition duration-150"
    >
      <div v-if="searchOpen" class="border-b border-mist-200 bg-paper">
        <div class="shell py-4">
          <form class="relative" @submit.prevent="search">
            <input
              v-model="term"
              type="search"
              autofocus
              placeholder="Šta tražite? Na primer: šampon, seboreja, krema…"
              class="w-full rounded-full border border-mist-300 bg-paper py-3.5 pl-5 pr-28 text-[0.9375rem] outline-none transition-colors placeholder:text-mist-400 focus:border-ink"
            />
            <button type="submit" class="absolute right-1.5 top-1.5 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink-soft">
              Traži
            </button>
          </form>

          <ul v-if="matches.length" class="mt-3 space-y-1">
            <li v-for="product in matches" :key="product.slug">
              <RouterLink
                :to="{ name: 'product', params: { slug: product.slug } }"
                class="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-mist-50"
              >
                <img v-if="product.image" :src="product.image" alt="" class="h-11 w-11 rounded-lg object-cover" />
                <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ product.name }}</span>
                <span class="shrink-0 text-sm text-mist-500">{{ product.price?.formatted }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </Transition>

    <!-- Menu (mobile) -->
    <Transition
      enter-from-class="opacity-0 -translate-y-2" enter-active-class="transition duration-200"
      leave-to-class="opacity-0 -translate-y-2" leave-active-class="transition duration-150"
    >
      <nav v-if="menuOpen" class="border-b border-mist-200 bg-paper lg:hidden">
        <div class="shell py-3">
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="block border-b border-mist-100 py-3.5 text-base font-medium last:border-0"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </nav>
    </Transition>
  </header>
</template>

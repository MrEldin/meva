<script setup>
import { useCartStore } from '@/stores/cart'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import logoBlack from '@/assets/brand/logo-black.png'

const route = useRoute()
const cart = useCartStore()
const menuOpen = ref(false)

// Any navigation closes the panel; leaving it open across routes is a classic
// mobile annoyance.
watch(() => route.fullPath, () => (menuOpen.value = false))

const links = [
  { label: 'Prodavnica', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { tip: 'set' } } },
  { label: 'Pronađi svoj', to: { name: 'home', hash: '#pronadji' } },
]
</script>

<template>
  <header class="relative z-40 bg-cream text-forest">
    <div class="shell">
      <div class="flex items-center justify-between gap-6 py-5 md:py-6">
        <div class="flex items-center gap-3">
          <!-- Menu (mobile) -->
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-sand lg:hidden"
            :aria-expanded="menuOpen"
            aria-label="Meni"
            @click="menuOpen = !menuOpen"
          >
            <span class="relative block h-3 w-4">
              <span class="absolute left-0 block h-px w-4 bg-current transition-all duration-400" :class="menuOpen ? 'top-1.5 rotate-45' : 'top-0'" />
              <span class="absolute left-0 block h-px w-4 bg-current transition-all duration-400" :class="menuOpen ? 'top-1.5 -rotate-45' : 'top-3'" />
            </span>
          </button>

          <RouterLink :to="{ name: 'home' }" aria-label="Meva Cosmetics">
            <img :src="logoBlack" alt="Meva Cosmetics" class="h-8 w-auto md:h-9" />
          </RouterLink>
        </div>

        <!-- Navigation (desktop): the template's pill -->
        <nav class="hidden items-center rounded-full border border-forest/15 bg-sand p-2 lg:flex">
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="eyebrow rounded-full px-5 py-2.5 transition-colors duration-300 hover:bg-sage"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Account and cart -->
        <div class="flex items-center gap-2">
          <RouterLink
            :to="{ name: 'login' }"
            class="hidden h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-sand transition-colors duration-300 hover:bg-sage sm:flex"
            aria-label="Nalog"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-4.5 w-4.5" stroke="currentColor" stroke-width="1.4">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" stroke-linecap="round" />
            </svg>
          </RouterLink>

          <RouterLink
            :to="{ name: 'cart' }"
            class="pill h-11 bg-clay-500 py-0 text-cream shadow-sm transition-colors hover:bg-clay-600"
            aria-label="Korpa"
          >
            Korpa
            <span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-cream px-1 text-[0.625rem] text-forest tabular-nums">
              {{ cart.count }}
            </span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Mobile panel -->
    <Transition
      enter-from-class="opacity-0 -translate-y-2"
      enter-active-class="transition-all duration-400 ease-[var(--ease-silk)]"
      leave-to-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-250"
    >
      <nav v-if="menuOpen" class="absolute inset-x-5 top-full z-50 rounded-[1.5rem] border border-forest/10 bg-sand p-3 shadow-xl lg:hidden">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="block rounded-full px-5 py-4 font-display text-2xl transition-colors hover:bg-sage"
        >
          {{ link.label }}
        </RouterLink>
        <RouterLink :to="{ name: 'login' }" class="eyebrow block px-5 py-4 text-mist-500">Prijava</RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import logoBlack from '@/assets/brand/logo-black.png'

const props = defineProps({
  // The home hero is dark imagery, so the header floats over it until scrolled.
  overHero: { type: Boolean, default: false },
})

const route = useRoute()
const cart = useCartStore()
const { y } = useWindowScroll()

const menuOpen = ref(false)

const scrolled = computed(() => y.value > 24)
const solid = computed(() => !props.overHero || scrolled.value || menuOpen.value)
// Over the hero the header is quiet: no nav row, just the mark and the cart.
const quiet = computed(() => props.overHero && !scrolled.value && !menuOpen.value)

// Any navigation closes the panel; leaving it open across routes is a classic
// mobile annoyance.
watch(() => route.fullPath, () => (menuOpen.value = false))

const links = [
  { label: 'Proizvodi', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { tip: 'set' } } },
]
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="solid ? 'bg-paper/92 backdrop-blur-xl' : 'bg-transparent'"
  >
    <div
      class="h-px w-full origin-left transition-transform duration-500"
      :class="solid ? 'scale-x-100 bg-mist-200' : 'scale-x-0 bg-transparent'"
    />

    <div class="shell">
      <div class="flex items-center justify-between gap-6 py-4 md:py-6">
        <!-- Menu (mobile) -->
        <button
          type="button"
          class="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
          :aria-expanded="menuOpen"
          aria-label="Meni"
          @click="menuOpen = !menuOpen"
        >
          <span class="relative block h-3 w-5">
            <span
              class="absolute left-0 block h-px w-5 transition-all duration-400"
              :class="[
                'bg-ink',
                menuOpen ? 'top-1.5 rotate-45' : 'top-0',
              ]"
            />
            <span
              class="absolute left-0 block h-px w-5 transition-all duration-400"
              :class="[
                'bg-ink',
                menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
              ]"
            />
          </span>
        </button>

        <!-- Navigation (desktop) -->
        <nav
          class="hidden items-center gap-9 transition-all duration-500 ease-[var(--ease-silk)] lg:flex"
          :class="quiet ? '-translate-y-2 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'"
        >
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="eyebrow relative py-1 text-ink-soft transition-colors duration-300 hover:text-blush-500"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Word-mark -->
        <RouterLink
          :to="{ name: 'home' }"
          class="absolute left-1/2 -translate-x-1/2"
          aria-label="Meva Cosmetics"
        >
          <img
            :src="logoBlack"
            alt="Meva Cosmetics"
            class="h-7 w-auto transition-all duration-500 md:h-9"
            :class="solid ? 'opacity-100' : 'opacity-0'"
          />
          <span
            class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
            :class="solid ? 'opacity-0' : 'opacity-100'"
          >
            <span class="font-display text-2xl leading-none tracking-tight text-ink md:text-3xl">MEVA</span>
            <span class="eyebrow mt-1 text-[0.5rem] text-ink/60">cosmetics</span>
          </span>
        </RouterLink>

        <!-- Account and cart -->
        <div class="flex items-center gap-1">
          <RouterLink
            :to="{ name: 'login' }"
            class="hidden h-11 w-11 items-center justify-center transition-colors duration-300 sm:flex"
            :class="'text-ink hover:text-blush-500'"
            aria-label="Nalog"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.2">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" stroke-linecap="round" />
            </svg>
          </RouterLink>

          <RouterLink
            :to="{ name: 'cart' }"
            class="relative -mr-2 flex h-11 w-11 items-center justify-center transition-colors duration-300"
            :class="'text-ink hover:text-blush-500'"
            aria-label="Korpa"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.2">
              <path d="M5.5 8h13l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.2a1.6 1.6 0 0 1-1.6-1.4Z" />
              <path d="M9 8V6.4a3 3 0 0 1 6 0V8" stroke-linecap="round" />
            </svg>
            <Transition
              enter-from-class="scale-0"
              enter-active-class="transition-transform duration-300 ease-[var(--ease-silk)]"
            >
              <span
                v-if="cart.count"
                class="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blush-500 px-1 text-[0.625rem] font-medium text-paper tabular-nums"
              >
                {{ cart.count }}
              </span>
            </Transition>
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
      <nav v-if="menuOpen" class="border-t border-mist-200 bg-paper lg:hidden">
        <div class="shell flex flex-col py-3">
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="border-b border-mist-100 py-4 font-display text-2xl text-ink last:border-0"
          >
            {{ link.label }}
          </RouterLink>
          <RouterLink :to="{ name: 'login' }" class="eyebrow py-5 text-mist-500">
            Prijava
          </RouterLink>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import SearchResults from '@/components/search/SearchResults.vue'
import { useSearch } from '@/lib/useSearch'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * The header.
 *
 * White on every page, organised in three rows the way a shop is: a pink
 * line for the two facts every order confirms; the wordmark, a real search
 * field and the account and basket with their names under them; and the
 * shelves -- the categories -- in small tracked capitals with a fine pink
 * rule that draws itself under the one you are on. Once you scroll, the
 * facts fold away and the main row tightens so the header stops taking the
 * screen. On a phone the search and the menu open as panels beneath it.
 */
const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const search = useSearch()

const menuOpen = ref(false)
const searchOpen = ref(false)
const scrolled = ref(false)
const phoneField = ref(null)
const root = ref(null)

const links = [
  { label: 'Svi proizvodi', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Seboreja', to: { name: 'catalog', query: { kategorija: 'seboreja' } } },
  { label: 'Psorijaza', to: { name: 'catalog', query: { kategorija: 'psorijaza' } } },
  { label: 'Ekcem', to: { name: 'catalog', query: { kategorija: 'ekcem' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { kategorija: 'setovi' } } },
]

const more = [
  { label: 'Naša priča', to: { name: 'story' } },
  { label: 'Dostava', to: { name: 'delivery' } },
  { label: 'Česta pitanja', to: { name: 'faq' } },
]

/*
 * Which shelf you are on.
 *
 * Every one of these links goes to /proizvodi and differs only in its query,
 * and RouterLink's own active class compares paths and ignores the query --
 * so on any category page it marked all seven at once. The category in the
 * address is what decides it, and "Svi proizvodi" is the one with none.
 */
function isOn(link) {
  if (route.name !== 'catalog') return false

  return (route.query.kategorija ?? null) === (link.to.query?.kategorija ?? null)
}

const showResults = computed(() => searchOpen.value && search.term.value.trim().length >= 2)

function close() {
  searchOpen.value = false
  menuOpen.value = false
  search.reset()
}

/** Enter takes the highlighted hit, or the whole catalogue for these words. */
function submit() {
  search.submit()
  close()
}

/** The arrow keys walk the drop-down as though it were a single column. */
function onKeys(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    search.move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    search.move(-1)
  }
}

function focusSearch() {
  searchOpen.value = true
  menuOpen.value = false
}

async function togglePhoneSearch() {
  menuOpen.value = false
  searchOpen.value = !searchOpen.value

  if (searchOpen.value) {
    await nextTick()
    phoneField.value?.focus()
  } else {
    search.reset()
  }
}

function toggleMenu() {
  searchOpen.value = false
  menuOpen.value = !menuOpen.value
}

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function onKey(event) {
  if (event.key === 'Escape') close()
}

function onPointer(event) {
  if (!root.value?.contains(event.target)) {
    searchOpen.value = false
  }
}

watch(() => route.fullPath, close)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', onPointer)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', onPointer)
})
</script>

<template>
  <header
    ref="root"
    class="sticky top-0 z-40 bg-paper transition-shadow duration-500"
    :class="scrolled ? 'shadow-[0_12px_40px_-24px_rgba(142,59,69,0.35)]' : ''"
  >
    <!-- The two facts every order confirms. Pink, as it was;
         it folds away once you start reading the page. -->
    <div
      class="overflow-hidden bg-peach transition-[max-height] duration-500 ease-[var(--ease-silk)]"
      :class="scrolled ? 'max-h-0' : 'max-h-10'"
    >
      <div class="shell flex h-10 items-center justify-center gap-3 text-[0.75rem] font-semibold tracking-[0.04em] text-blush-700 sm:text-[0.8125rem]">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.5h11v9h-11zM13.5 10.5h3.6l3.4 3.2v2.8h-7z" /><circle cx="6" cy="18.3" r="1.5" /><circle cx="17.3" cy="18.3" r="1.5" /></svg>
        <span>Besplatna dostava u celoj Srbiji</span>
        <span class="h-[3px] w-[3px] rounded-full bg-blush-400" aria-hidden="true" />
        <span>Plaćanje pouzećem</span>
      </div>
    </div>

    <!-- Main row: wordmark, search, account, basket -->
    <div
      class="shell relative flex items-center justify-between gap-4 transition-[height] duration-500 ease-[var(--ease-silk)] lg:gap-10"
      :class="scrolled ? 'h-[4.25rem] lg:h-[4.75rem]' : 'h-[4.5rem] lg:h-[5.75rem]'"
    >
      <!-- Phone: menu -->
      <button
        type="button"
        class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-blush-50 lg:hidden"
        :aria-expanded="menuOpen"
        aria-label="Meni"
        @click="toggleMenu"
      >
        <span class="relative block h-3 w-5">
          <span class="absolute left-0 block h-[1.5px] w-5 rounded bg-current transition-all duration-300" :class="menuOpen ? 'top-1.5 rotate-45' : 'top-0'" />
          <span class="absolute left-0 block h-[1.5px] w-5 rounded bg-current transition-all duration-300" :class="menuOpen ? 'top-1.5 -rotate-45' : 'top-3'" />
        </span>
      </button>

      <!-- Wordmark: centred on a phone, left on a desktop -->
      <RouterLink
        :to="{ name: 'home' }"
        aria-label="Meva Cosmetics"
        class="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
      >
        <img
          :src="logoBlack"
          alt="Meva Cosmetics"
          class="w-auto transition-[height] duration-500 ease-[var(--ease-silk)]"
          :class="scrolled ? 'h-10 lg:h-12' : 'h-11 lg:h-16'"
        />
      </RouterLink>

      <!-- Desktop: the search field, a real one, in the middle -->
      <form class="relative hidden w-full max-w-[26rem] lg:block xl:max-w-[30rem]" role="search" @submit.prevent="submit">
        <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-4 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-ink/45" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
        <input
          v-model="search.term.value"
          type="search"
          autocomplete="off"
          placeholder="Pretražite: šampon, seboreja, perut, dostava…"
          class="h-11 w-full rounded-full border border-blush-200 bg-blush-50/60 pl-11 pr-4 text-[0.9rem] text-ink outline-none transition-all duration-300 placeholder:text-ink/40 focus:border-blush-400 focus:bg-paper focus:shadow-[0_0_0_4px_rgba(225,164,160,0.3)]"
          @focus="focusSearch"
          @keydown="onKeys"
        />

        <Transition enter-from-class="opacity-0 -translate-y-1" enter-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150">
          <div v-if="showResults" class="absolute left-0 right-0 top-[calc(100%+0.625rem)] overflow-hidden rounded-2xl border border-blush-100 bg-paper shadow-[0_24px_60px_-20px_rgba(142,59,69,0.3)]">
            <SearchResults
              :groups="search.groups.value"
              :flat="search.flat.value"
              :loading="search.loading.value"
              :empty="search.empty.value"
              :term="search.term.value"
              :highlighted="search.highlighted.value"
              :destination="search.destination"
              @choose="close"
            />
          </div>
        </Transition>
      </form>

      <!-- Right: search (phone), account, basket -->
      <div class="flex items-center gap-1 lg:gap-3">
        <button type="button" class="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-blush-50 lg:hidden" :aria-expanded="searchOpen" aria-label="Pretraga" @click="togglePhoneSearch">
          <svg viewBox="0 0 24 24" class="h-[1.3rem] w-[1.3rem]" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
        </button>

        <RouterLink
          :to="auth.signedIn ? { name: 'account' } : { name: 'login' }"
          class="hidden flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-ink transition-colors hover:bg-blush-50 lg:flex"
        >
          <svg viewBox="0 0 24 24" class="h-[1.3rem] w-[1.3rem]" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.6 3.3-6 7.2-6s7.2 2.4 7.2 6" stroke-linecap="round" /></svg>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink/65">{{ auth.signedIn ? 'Nalog' : 'Prijava' }}</span>
        </RouterLink>

        <RouterLink :to="{ name: 'cart' }" class="relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-ink transition-colors hover:bg-blush-50" aria-label="Korpa">
          <span class="relative">
            <svg viewBox="0 0 24 24" class="h-[1.3rem] w-[1.3rem]" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16l-1.3 12.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8Z" stroke-linejoin="round" /><path d="M8.5 7V5.8a3.5 3.5 0 0 1 7 0V7" stroke-linecap="round" /></svg>
            <span v-if="cart.count" class="absolute -right-2.5 -top-2 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-blush-600 px-1 text-[0.625rem] font-bold text-paper">{{ cart.count }}</span>
          </span>
          <span class="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink/65 lg:block">Korpa</span>
        </RouterLink>
      </div>
    </div>

    <!-- The shelves -->
    <nav class="hidden border-t border-blush-100 lg:block" aria-label="Kategorije">
      <div class="shell flex h-11 items-center justify-between">
        <div class="flex items-center gap-8">
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="nav-item relative py-3 text-[0.75rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-ink"
            :class="isOn(link) ? 'is-on text-ink' : 'text-ink/70'"
          >
            {{ link.label }}
          </RouterLink>
        </div>
        <div class="flex items-center gap-6">
          <RouterLink
            v-for="link in more"
            :key="link.label"
            :to="link.to"
            class="font-display text-[0.9375rem] italic text-ink/60 transition-colors hover:text-blush-700"
            active-class="text-blush-700"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="hidden h-px w-full bg-gradient-to-r from-blush-100 via-peach to-blush-100 lg:block" aria-hidden="true" />
    <div class="h-px w-full bg-peach lg:hidden" aria-hidden="true" />

    <!-- Phone: search panel -->
    <Transition enter-from-class="opacity-0 -translate-y-1" enter-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150">
      <div v-if="searchOpen" class="border-t border-blush-100 bg-paper lg:hidden">
        <div class="shell pb-2 pt-4">
          <form class="relative" role="search" @submit.prevent="submit">
            <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-4 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-ink/45" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
            <input
              ref="phoneField"
              v-model="search.term.value"
              type="search"
              autocomplete="off"
              placeholder="Šampon, seboreja, perut, dostava…"
              class="h-12 w-full rounded-full border border-blush-200 bg-blush-50/60 pl-11 pr-24 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-blush-400 focus:bg-paper"
              @keydown="onKeys"
            />
            <button type="submit" class="absolute right-1.5 top-1.5 h-9 rounded-full bg-blush-600 px-4 text-[0.8125rem] font-semibold text-paper transition-colors hover:bg-blush-700">Traži</button>
          </form>
        </div>

        <div v-if="showResults" class="border-t border-blush-100">
            <SearchResults
            :groups="search.groups.value"
            :flat="search.flat.value"
            :loading="search.loading.value"
            :empty="search.empty.value"
            :term="search.term.value"
            :highlighted="search.highlighted.value"
            :destination="search.destination"
            @choose="close"
            />
        </div>
      </div>
    </Transition>

    <!-- Phone: menu -->
    <Transition enter-from-class="opacity-0 -translate-y-1" enter-active-class="transition duration-200" leave-to-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150">
      <nav v-if="menuOpen" class="border-t border-blush-100 bg-paper lg:hidden">
        <div class="shell py-3">
          <p class="kicker pt-2 pb-1 text-blush-700">Proizvodi</p>
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="flex items-center justify-between border-b border-blush-100 py-3.5 text-[1.0625rem] font-medium text-ink last:border-0"
          >
            <span>{{ link.label }}</span>
            <span class="text-blush-400" aria-hidden="true">→</span>
          </RouterLink>

          <p class="kicker pt-5 pb-1 text-blush-700">Meva</p>
          <div class="flex flex-wrap gap-x-5 gap-y-2 py-2">
            <RouterLink v-for="link in more" :key="link.label" :to="link.to" class="font-display text-[1.0625rem] italic text-ink/70">{{ link.label }}</RouterLink>
            <RouterLink :to="auth.signedIn ? { name: 'account' } : { name: 'login' }" class="font-display text-[1.0625rem] italic text-ink/70">{{ auth.signedIn ? 'Moj nalog' : 'Prijava' }}</RouterLink>
          </div>
        </div>
      </nav>
    </Transition>
  </header>
</template>

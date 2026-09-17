<script setup>
import logoBlack from '@/assets/brand/logo-black.png'

const SHOP = [
  { label: 'Svi proizvodi', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { category: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { category: 'kosa' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { category: 'setovi' } } },
]

const HELP = [
  { label: 'Česta pitanja', to: { name: 'faq' } },
  { label: 'Dostava', to: { name: 'delivery' } },
  { label: 'Povrat i reklamacije', to: { name: 'returns' } },
  { label: 'Praćenje porudžbine', to: { name: 'track' } },
]

const ACCOUNT = [
  { label: 'Moj nalog', to: { name: 'account' } },
  { label: 'Naša priča', to: { name: 'story' } },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-blush-100 bg-blush-50 text-ink">
    <div class="shell py-12 lg:py-16">
      <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <img :src="logoBlack" alt="Meva Cosmetics" class="h-9 w-auto" />
          <p class="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-mist-600">
            Ručno rađena prirodna kozmetika iz Novog Pazara, od 2010. Ispitano u Institutu za javno zdravlje Vojvodine.
          </p>
          <a
            href="https://www.instagram.com/meva.cosmetics/"
            target="_blank"
            rel="noopener"
            class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-blush-600"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
            @meva.cosmetics
          </a>
        </div>

        <nav>
          <h2 class="text-sm font-bold uppercase tracking-wider text-blush-600">Prodavnica</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in SHOP" :key="link.label">
              <RouterLink :to="link.to" class="text-[0.9375rem] text-mist-600 transition-colors hover:text-blush-600">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </nav>

        <nav>
          <h2 class="text-sm font-bold uppercase tracking-wider text-blush-600">Pomoć</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in HELP" :key="link.label">
              <RouterLink :to="link.to" class="text-[0.9375rem] text-mist-600 transition-colors hover:text-blush-600">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </nav>

        <nav>
          <h2 class="text-sm font-bold uppercase tracking-wider text-blush-600">Nalog</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in ACCOUNT" :key="link.label">
              <RouterLink :to="link.to" class="text-[0.9375rem] text-mist-600 transition-colors hover:text-blush-600">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="mt-12 flex flex-col gap-3 border-t border-blush-200 pt-6 text-sm text-mist-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Meva Kozmetika · Miloša Obilića 20, 36300 Novi Pazar</p>
        <p>© {{ year }} Meva Kozmetika</p>
      </div>
    </div>
  </footer>
</template>

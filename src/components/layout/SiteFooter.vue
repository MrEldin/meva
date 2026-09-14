<script setup>
import logoWhite from '@/assets/brand/logo-white.png'

const year = new Date().getFullYear()

const columns = [
  {
    title: 'Prodavnica',
    links: [
      { label: 'Svi proizvodi', to: { name: 'catalog' } },
      { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
      { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
      { label: 'Setovi', to: { name: 'catalog', query: { tip: 'set' } } },
    ],
  },
  {
    title: 'Pomoć',
    links: [
      { label: 'Dostava i plaćanje', to: { name: 'home', hash: '#dostava' } },
      { label: 'Kontakt', to: { name: 'home', hash: '#kontakt' } },
      { label: 'Prijava', to: { name: 'login' } },
    ],
  },
]
</script>

<template>
  <footer class="bg-ink text-paper">
    <div class="shell py-16 md:py-24">
      <div class="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div>
          <img :src="logoWhite" alt="Meva Cosmetics" class="h-10 w-auto" />
          <p class="mt-6 max-w-xs font-display text-xl leading-relaxed text-paper/70">
            Elegancija i sofisticiranost kreću od prave nege.
          </p>
        </div>

        <div v-for="column in columns" :key="column.title">
          <h3 class="eyebrow text-paper/45">{{ column.title }}</h3>
          <ul class="mt-6 space-y-3.5">
            <li v-for="link in column.links" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-sm font-light text-paper/80 transition-colors duration-300 hover:text-blush-300"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div id="kontakt" class="mt-16 grid gap-8 border-t border-paper/12 pt-10 sm:grid-cols-3">
        <div>
          <p class="eyebrow text-paper/45">Adresa</p>
          <p class="mt-3 text-sm font-light text-paper/80">Miloša Obilića 20<br />36300 Novi Pazar</p>
        </div>
        <div>
          <p class="eyebrow text-paper/45">Dostava</p>
          <p class="mt-3 text-sm font-light text-paper/80">Besplatna, plaćanje pouzećem</p>
        </div>
        <div>
          <p class="eyebrow text-paper/45">Pratite nas</p>
          <a
            href="https://www.instagram.com/meva.cosmetics/"
            target="_blank"
            rel="noopener"
            class="mt-3 inline-flex items-center gap-2 text-sm font-light text-paper/80 transition-colors hover:text-blush-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" class="h-4 w-4">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>
        </div>
      </div>

      <p class="mt-12 text-xs font-light text-paper/35">
        © {{ year }} Meva Cosmetics. Sva prava zadržana.
      </p>
    </div>
  </footer>
</template>

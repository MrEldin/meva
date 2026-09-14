<script setup>
import logoBlack from '@/assets/brand/logo-black.png'

const year = new Date().getFullYear()

const links = [
  { label: 'Prodavnica', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { tip: 'set' } } },
  { label: 'Prijava', to: { name: 'login' } },
]
</script>

<template>
  <footer class="bg-cream text-forest">
    <div class="shell py-10">
      <div id="kontakt" class="grid gap-8 border-t border-forest/15 pt-8 md:grid-cols-3">
        <div>
          <img :src="logoBlack" alt="Meva Cosmetics" class="h-8 w-auto" />
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-forest/65">Prirodna kozmetika, ručno rađena u malim serijama od 2010.</p>
        </div>
        <div class="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p class="eyebrow text-clay-500">Adresa</p>
            <p class="mt-3 leading-relaxed text-forest/75">Miloša Obilića 20<br />36300 Novi Pazar</p>
          </div>
          <div>
            <p class="eyebrow text-clay-500">Dostava</p>
            <p class="mt-3 leading-relaxed text-forest/75">Besplatna u celoj Srbiji.<br />Plaćanje pouzećem.</p>
          </div>
        </div>
        <div class="flex flex-col gap-4 md:items-end">
          <nav class="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
            <RouterLink v-for="link in links" :key="link.label" :to="link.to" class="eyebrow transition-colors hover:text-blush-500">{{ link.label }}</RouterLink>
            <a href="https://www.instagram.com/meva.cosmetics/" target="_blank" rel="noopener" class="eyebrow transition-colors hover:text-blush-500">Instagram</a>
          </nav>
        </div>
      </div>
      <p class="mt-10 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-forest/50">© {{ year }} Meva Kozmetika · Novi Pazar</p>
    </div>
  </footer>
</template>

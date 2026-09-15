<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import client from '@/api/client'
import { track } from '@/lib/tracking'
import { ref } from 'vue'

const year = new Date().getFullYear()

const email = ref('')
const joined = ref(false)
const joining = ref(false)

/** Join the mailing list, tagged with whatever campaign brought them here. */
async function join() {
  if (joining.value) return

  joining.value = true

  const params = new URLSearchParams(window.location.search)

  try {
    await client.post('/newsletter', {
      email: email.value,
      source: 'footer',
      utm_source: params.get('utm_source'),
      utm_campaign: params.get('utm_campaign'),
    })

    joined.value = true
    email.value = ''
    track.subscribe('footer')
  } finally {
    joining.value = false
  }
}

const links = [
  { label: 'Prodavnica', to: { name: 'catalog' } },
  { label: 'Nega kože', to: { name: 'catalog', query: { kategorija: 'preparati-za-lice' } } },
  { label: 'Kosa', to: { name: 'catalog', query: { kategorija: 'kosa' } } },
  { label: 'Setovi', to: { name: 'catalog', query: { tip: 'set' } } },
  { label: 'Prati porudžbinu', to: { name: 'track' } },
  { label: 'Prijava', to: { name: 'login' } },
]
</script>

<template>
  <footer class="bg-cream text-forest">
    <div class="shell py-10">
      <form class="mb-10 flex flex-col gap-4 rounded-[1.5rem] bg-sand p-6 sm:flex-row sm:items-center sm:justify-between" @submit.prevent="join">
        <div>
          <p class="font-display text-2xl">Pismo iz Meve</p>
          <p class="mt-1 text-sm text-forest/60">Saveti za negu i novi preparati. Bez spama.</p>
        </div>
        <div v-if="joined" class="text-sm text-sage-deep">Hvala — javljamo se uskoro.</div>
        <div v-else class="flex w-full gap-2 sm:w-auto">
          <input
            v-model="email"
            type="email"
            required
            placeholder="vasa@adresa.rs"
            class="min-w-0 flex-1 rounded-full border border-forest/15 bg-cream px-5 py-3 text-sm outline-none placeholder:text-forest/40 focus:border-forest/40 sm:w-64"
          />
          <button type="submit" class="pill shrink-0 bg-forest text-cream hover:bg-forest-soft disabled:opacity-50" :disabled="joining">Prijavi se</button>
        </div>
      </form>

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

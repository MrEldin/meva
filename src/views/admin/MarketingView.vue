<script setup>
import client from '@/api/client'
import BarList from '@/components/admin/BarList.vue'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref } from 'vue'

const campaigns = ref([])
const subscribers = ref([])
const subscriberMeta = ref(null)
const loading = ref(true)

// The UTM builder: paste a link, name the campaign, get a taggable address.
const builder = ref({
  url: 'https://meva.life/',
  source: 'instagram',
  medium: 'social',
  campaign: '',
  content: '',
})

const SOURCES = ['instagram', 'facebook', 'google', 'tiktok', 'viber', 'newsletter', 'youtube']
const copied = ref(false)

const taggedUrl = computed(() => {
  try {
    const url = new URL(builder.value.url)
    const set = (key, value) => value && url.searchParams.set(key, value.trim().toLowerCase().replace(/\s+/g, '-'))

    set('utm_source', builder.value.source)
    set('utm_medium', builder.value.medium)
    set('utm_campaign', builder.value.campaign)
    set('utm_content', builder.value.content)

    return url.toString()
  } catch {
    return ''
  }
})

async function copy() {
  await navigator.clipboard.writeText(taggedUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`
const revenueOf = (row) => money(row.revenue)

const feedUrl = `${window.location.origin}/feed/proizvodi.xml`

async function exportSubscribers() {
  const { data } = await client.get('/admin/marketing/subscribers/export', { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = `meva-lista-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  setMeta({ title: 'Marketing' })

  try {
    const [campaignData, subscriberData] = await Promise.all([
      client.get('/admin/marketing/campaigns'),
      client.get('/admin/marketing/subscribers', { params: { per_page: 25 } }),
    ])

    campaigns.value = campaignData.data.data.map((row) => ({ ...row, label: `${row.source} · ${row.type}` }))
    subscribers.value = subscriberData.data.data
    subscriberMeta.value = subscriberData.data.meta
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <header class="border-b border-forest/10 pb-5">
      <p class="eyebrow text-clay-500">Marketing</p>
      <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Alati za kampanje</h1>
    </header>

    <div class="grid gap-5 pt-6 lg:grid-cols-2">
      <!-- UTM builder -->
      <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
        <h2 class="eyebrow text-[0.5625rem] text-forest/50">Napravi link za kampanju</h2>
        <p class="mt-2 text-xs text-forest/55">Linkovi napravljeni ovde se posle vide u analitici, po izvoru i kampanji.</p>

        <div class="mt-4 space-y-3">
          <label class="block">
            <span class="text-xs text-forest/55">Adresa</span>
            <input v-model="builder.url" type="url" class="mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
          </label>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs text-forest/55">Izvor</span>
              <input v-model="builder.source" list="utm-sources" class="mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
              <datalist id="utm-sources"><option v-for="source in SOURCES" :key="source" :value="source" /></datalist>
            </label>
            <label class="block">
              <span class="text-xs text-forest/55">Vrsta</span>
              <input v-model="builder.medium" class="mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
            </label>
            <label class="block">
              <span class="text-xs text-forest/55">Kampanja</span>
              <input v-model="builder.campaign" placeholder="npr. seboreja-jesen" class="mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
            </label>
            <label class="block">
              <span class="text-xs text-forest/55">Oznaka (opciono)</span>
              <input v-model="builder.content" placeholder="npr. story-1" class="mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
            </label>
          </div>

          <div class="rounded-2xl bg-cream p-4">
            <p class="break-all font-mono text-xs text-forest/75">{{ taggedUrl }}</p>
            <button type="button" class="pill mt-3 bg-forest text-cream hover:bg-forest-soft" @click="copy">
              {{ copied ? 'Kopirano ✓' : 'Kopiraj link' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Catalogue feed -->
      <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
        <h2 class="eyebrow text-[0.5625rem] text-forest/50">Katalog za Instagram i Google</h2>
        <p class="mt-2 text-sm leading-relaxed text-forest/70">
          Ovu adresu zalepite u Meta Commerce Manager (Katalog → Dodaj proizvode → Zakazani feed)
          i u Google Merchant Center. Katalog se sam osvežava kad promenite cenu ili opis.
        </p>
        <div class="mt-4 rounded-2xl bg-cream p-4">
          <p class="break-all font-mono text-xs text-forest/75">{{ feedUrl }}</p>
          <a :href="feedUrl" target="_blank" rel="noopener" class="eyebrow mt-3 inline-block text-clay-600 hover:text-clay-700">Otvori feed →</a>
        </div>

        <h3 class="eyebrow mt-6 text-[0.5625rem] text-forest/50">Ostalo što pomaže</h3>
        <ul class="mt-2 space-y-1.5 text-sm text-forest/70">
          <li>· <a href="/sitemap.xml" target="_blank" rel="noopener" class="underline-offset-2 hover:underline">sitemap.xml</a> — pošaljite u Google Search Console</li>
          <li>· Deljenje na WhatsApp i Instagram radi sa slikom i opisom proizvoda</li>
          <li>· Piksel i Google Analytics se uključuju posle pristanka posetioca</li>
        </ul>
      </section>
    </div>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>

    <div v-else class="mt-5 grid gap-5 lg:grid-cols-2">
      <BarList title="Šta donosi novac" :rows="campaigns" :format="revenueOf" empty="Kad krenu kampanje, ovde se vidi šta se isplati." />

      <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <h2 class="eyebrow text-[0.5625rem] text-forest/50">Lista za newsletter ({{ subscriberMeta?.total ?? 0 }})</h2>
          <button v-if="subscribers.length" type="button" class="eyebrow text-[0.5625rem] text-clay-600 hover:text-clay-700" @click="exportSubscribers">CSV</button>
        </div>

        <ul v-if="subscribers.length" class="mt-4 space-y-2 text-sm">
          <li v-for="person in subscribers" :key="person.email" class="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2">
            <span class="min-w-0 truncate">{{ person.email }}</span>
            <span class="shrink-0 text-xs text-forest/45">{{ person.utm_source ?? person.source }}</span>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-forest/50">Još niko nije ostavio e-mail.</p>
      </section>
    </div>
  </div>
</template>

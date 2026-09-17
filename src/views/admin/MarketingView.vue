<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
import client from '@/api/client'
import Breakdown from '@/components/admin/Breakdown.vue'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref } from 'vue'

const campaigns = ref([])
const subscribers = ref([])
const subscriberMeta = ref(null)
const insights = ref(null)
const loading = ref(true)
const tab = ref('due')

/*
 * Four jobs, not one page.
 *
 * Everything here was stacked down a single column -- four figures, a table
 * of customers wide enough to need its own sideways scroll, what sells
 * together, three tools and the mailing list -- so reaching the last of them
 * meant scrolling past all of the others every time. They are separate jobs
 * done on separate days, so they are separate views now, and the four
 * figures stay above them because they are the context for all four.
 */
const VIEWS = [
  { key: 'people', label: 'Koga kontaktirati', note: 'Tri liste izvučene iz istorije kupovina.' },
  { key: 'what', label: 'Šta se prodaje', note: 'Šta ide uz šta, i koja kampanja donosi novac.' },
  { key: 'tools', label: 'Alati', note: 'Linkovi za kampanje, isplativost reklame i katalog feed.' },
  { key: 'list', label: 'Newsletter', note: 'Ko je ostavio adresu i odakle.' },
]

const view = ref('people')

const LISTS = [
  { key: 'due', label: 'Na redu za dopunu', note: 'Poslednju porudžbinu su napravili pre 45–110 dana. Pakovanje im je pri kraju — ovo je trenutak za poruku.' },
  { key: 'winback', label: 'Za vraćanje', note: 'Kupovali su, pa se nisu vratili više od pola godine. Njima ide drugačija poruka: podsetnik i razlog.' },
  { key: 'loyal', label: 'Najverniji', note: 'Tri i više porudžbina. Njima se isplati zahvaliti — i pitati ih za preporuku ili recenziju.' },
]

const money = (minor) => `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(minor / 100)} RSD`
const number = (value) => new Intl.NumberFormat('sr-RS').format(value)

const rows = computed(() => insights.value?.[tab.value] ?? [])

/** The four figures that decide who is written to, and when. */
const summaryTiles = computed(() => {
  const s = insights.value?.summary

  if (!s) return []

  return [
    { label: 'Kupaca ukupno', value: number(s.customers), hint: 'u celoj istoriji' },
    { label: 'Kupilo više puta', value: `${s.repeat_rate}%`, hint: `${number(s.repeat_customers)} kupaca` },
    { label: 'Prosek između porudžbina', value: `${s.average_gap_days} dana`, hint: 'kad ih treba podsetiti' },
    { label: 'Prosečno potrošeno', value: money(s.average_spend), hint: 'po kupcu, ukupno' },
  ]
})
const note = computed(() => LISTS.find((l) => l.key === tab.value)?.note)

// A phone number a person can be reached on, in the two ways this shop's
// customers actually use.
const viber = (phone) => `viber://chat?number=${encodeURIComponent((phone ?? '').replace(/\s/g, ''))}`
const whatsapp = (phone) => `https://wa.me/${(phone ?? '').replace(/[^0-9]/g, '').replace(/^0/, '381')}`

// The UTM builder: paste a link, name the campaign, get a taggable address.
const builder = ref({ url: 'https://meva.life/', source: 'instagram', medium: 'social', campaign: '', content: '' })
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

// What an advert earned against what it cost.
const spend = ref(0)
const campaignRevenue = computed(() => campaigns.value.reduce((total, row) => total + row.revenue, 0))
const roas = computed(() => (spend.value > 0 ? (campaignRevenue.value / 100 / spend.value).toFixed(2) : null))

const feedUrl = `${window.location.origin}/feed/products.xml`

async function download(path, name) {
  const { data } = await client.get(path, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  setMeta({ title: 'Marketing' })

  try {
    const [campaignData, subscriberData, insightData] = await Promise.all([
      client.get('/admin/marketing/campaigns'),
      client.get('/admin/marketing/subscribers', { params: { per_page: 25 } }),
      client.get('/admin/marketing/insights'),
    ])

    campaigns.value = campaignData.data.data.map((row) => ({ ...row, label: `${row.source} · ${row.type}` }))
    subscribers.value = subscriberData.data.data
    subscriberMeta.value = subscriberData.data.meta
    insights.value = insightData.data.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <PageHeader tone="marketing" eyebrow="Marketing" title="Koga danas kontaktirati" note="Sve iz stvarne istorije kupovina — ništa izmišljeno.">
      <template #actions>
        <RouterLink :to="{ name: 'admin.email' }" class="btn btn-primary">Email kampanje</RouterLink>
      </template>
    </PageHeader>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <template v-else>
      <!-- The context for everything below -->
      <div v-if="insights" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="tile in summaryTiles" :key="tile.label" class="stat-tile">
          <p class="label text-forest/50">{{ tile.label }}</p>
          <p class="mt-2 font-display text-[1.75rem] leading-none tabular-nums">{{ tile.value }}</p>
          <p class="mt-2 text-[0.8125rem] text-forest/50">{{ tile.hint }}</p>
        </div>
      </div>

      <!-- Which job -->
      <div class="mt-5 border-b border-forest/10">
        <div class="tabs -mb-px">
          <button
            v-for="item in VIEWS"
            :key="item.key"
            type="button"
            class="shrink-0 border-b-2 px-4 py-3 text-[0.9375rem] font-semibold transition-colors"
            :class="view === item.key ? 'border-clay-600 text-clay-700' : 'border-transparent text-forest/50 hover:text-forest'"
            @click="view = item.key"
          >{{ item.label }}</button>
        </div>
      </div>

      <p class="mt-3 text-[0.875rem] text-forest/55">{{ VIEWS.find((v) => v.key === view)?.note }}</p>

      <!-- ── Who to contact ─────────────────────────────────────────────── -->
      <section v-if="view === 'people' && insights" class="mt-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="segment">
            <button
              v-for="list in LISTS"
              :key="list.key"
              type="button"
              :class="tab === list.key ? 'is-on' : ''"
              @click="tab = list.key"
            >{{ list.label }} ({{ number(insights[`${list.key}_total`] ?? insights[list.key].length) }})</button>
          </div>
          <button type="button" class="btn btn-ghost" @click="download(`/admin/marketing/lists/${tab}`, `meva-${tab}.csv`)">
            Preuzmi CSV
          </button>
        </div>

        <p class="mt-3 max-w-3xl rounded-xl bg-clay-50 px-4 py-3 text-[0.875rem] leading-relaxed text-forest/70">{{ note }}</p>

        <!-- One card per person: no sideways scrolling, and the way to reach
             them is on the same line as the reason to. -->
        <ul v-if="rows.length" class="panel mt-3 divide-y divide-forest/8 overflow-hidden">
          <li v-for="person in rows" :key="person.email" class="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay-100 text-[0.8125rem] font-bold text-clay-700">
              {{ (person.name ?? person.email ?? '?').trim()[0]?.toUpperCase() }}
            </span>

            <div class="min-w-[10rem] flex-1">
              <p class="truncate text-[0.9375rem] font-bold">{{ person.name ?? person.email }}</p>
              <p class="truncate text-[0.8125rem] text-forest/50">{{ person.city ?? person.email }}</p>
            </div>

            <div class="min-w-[12rem] flex-[2]">
              <p class="label text-forest/40">Poslednji put</p>
              <p class="truncate text-[0.875rem] text-forest/70">{{ person.last_products ?? '—' }}</p>
            </div>

            <div class="shrink-0 text-right">
              <p class="text-[0.9375rem] font-bold tabular-nums">{{ person.spent_formatted }}</p>
              <p class="text-[0.75rem] text-forest/45 tabular-nums">{{ person.orders }}× · pre {{ person.days_since }} d</p>
            </div>

            <div class="flex shrink-0 gap-1.5">
              <a v-if="person.phone" :href="viber(person.phone)" class="grid h-9 w-9 place-items-center rounded-full bg-sky text-forest/70 transition-colors hover:bg-forest hover:text-white" title="Viber" aria-label="Viber">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" /></svg>
              </a>
              <a v-if="person.phone" :href="whatsapp(person.phone)" target="_blank" rel="noopener" class="grid h-9 w-9 place-items-center rounded-full bg-sage text-sage-deep transition-colors hover:bg-sage-deep hover:text-white" title="WhatsApp" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.8 20.2 5 16.5a8 8 0 1 1 3 3z" /></svg>
              </a>
              <a v-if="person.email" :href="`mailto:${person.email}`" class="grid h-9 w-9 place-items-center rounded-full bg-wheat text-forest/70 transition-colors hover:bg-forest hover:text-white" title="Mejl" aria-label="Mejl">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7 8 5.5L20 7" /></svg>
              </a>
            </div>
          </li>
        </ul>

        <p v-else class="panel mt-3 px-6 py-14 text-center text-sm text-forest/60">Ova lista je trenutno prazna.</p>

        <p v-if="(insights?.[`${tab}_total`] ?? 0) > rows.length" class="mt-3 text-[0.8125rem] text-forest/55">
          Prikazano {{ rows.length }} od {{ number(insights[`${tab}_total`]) }} — ceo spisak je u CSV-u.
        </p>
      </section>

      <!-- ── What sells ─────────────────────────────────────────────────── -->
      <div v-else-if="view === 'what'" class="mt-4 grid gap-3 lg:grid-cols-2">
        <section v-if="insights?.pairs?.length" class="panel p-4 sm:p-5">
          <h2 class="font-display text-[1.25rem] leading-tight">Šta se kupuje zajedno</h2>
          <p class="mt-0.5 text-[0.8125rem] text-forest/50">Iz stvarnih korpi — gotovi setovi i „ide uz ovo" preporuke.</p>

          <ul class="mt-4 space-y-1.5">
            <li v-for="pair in insights.pairs" :key="pair.first + pair.second" class="flex items-center justify-between gap-3 rounded-xl bg-cream px-3.5 py-2.5 text-[0.875rem]">
              <span class="min-w-0">
                <span class="font-semibold">{{ pair.first }}</span>
                <span class="mx-1.5 text-clay-500">+</span>
                <span class="font-semibold">{{ pair.second }}</span>
              </span>
              <span class="shrink-0 font-bold tabular-nums text-forest/60">{{ number(pair.together) }}×</span>
            </li>
          </ul>
        </section>

        <Breakdown :tabs="[{ key: 'campaigns', label: 'Šta donosi novac', rows: campaigns, metric: 'revenue', unit: 'money', empty: 'Kad krenu kampanje, ovde se vidi šta se isplati.' }]" />
      </div>

      <!-- ── Tools ──────────────────────────────────────────────────────── -->
      <div v-else-if="view === 'tools'" class="mt-4 grid gap-3 lg:grid-cols-2">
        <section class="panel p-4 sm:p-5">
          <h2 class="font-display text-[1.25rem] leading-tight">Link za kampanju</h2>
          <p class="mt-0.5 text-[0.8125rem] text-forest/50">Linkovi napravljeni ovde se posle vide u Pregledu, po izvoru i kampanji.</p>

          <div class="mt-4 space-y-3">
            <label class="block">
              <span class="label text-forest/55">Adresa</span>
              <input v-model="builder.url" type="url" class="field mt-1.5 w-full" />
            </label>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="label text-forest/55">Izvor</span>
                <input v-model="builder.source" list="utm-sources" placeholder="instagram" class="field mt-1.5 w-full" />
                <datalist id="utm-sources"><option v-for="source in SOURCES" :key="source" :value="source" /></datalist>
              </label>
              <label class="block">
                <span class="label text-forest/55">Vrsta</span>
                <input v-model="builder.medium" placeholder="social" class="field mt-1.5 w-full" />
              </label>
              <label class="block">
                <span class="label text-forest/55">Kampanja</span>
                <input v-model="builder.campaign" placeholder="seboreja-jesen" class="field mt-1.5 w-full" />
              </label>
              <label class="block">
                <span class="label text-forest/55">Oznaka</span>
                <input v-model="builder.content" placeholder="story-1" class="field mt-1.5 w-full" />
              </label>
            </div>

            <div class="rounded-xl bg-cream p-4">
              <p class="break-all font-mono text-[0.75rem] text-forest/70">{{ taggedUrl }}</p>
              <button type="button" class="btn btn-primary mt-3" @click="copy">{{ copied ? 'Kopirano ✓' : 'Kopiraj link' }}</button>
            </div>
          </div>
        </section>

        <div class="space-y-3">
          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Da li se reklama isplati</h2>

            <label class="mt-4 block">
              <span class="label text-forest/55">Koliko ste potrošili na reklame</span>
              <span class="relative mt-1.5 block">
                <input v-model.number="spend" type="number" min="0" step="1000" class="field w-full pr-14 tabular-nums" />
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.8125rem] font-semibold text-forest/40">RSD</span>
              </span>
            </label>

            <dl class="mt-4 space-y-2 text-[0.875rem]">
              <div class="flex justify-between"><dt class="text-forest/55">Promet iz kampanja</dt><dd class="font-semibold tabular-nums">{{ money(campaignRevenue) }}</dd></div>
              <div class="flex justify-between"><dt class="text-forest/55">Uloženo</dt><dd class="font-semibold tabular-nums">{{ number(spend) }} RSD</dd></div>
              <div v-if="roas" class="flex justify-between border-t border-forest/10 pt-2">
                <dt class="font-bold">Na svaki dinar</dt>
                <dd class="font-display text-[1.25rem] leading-none tabular-nums">{{ roas }} RSD</dd>
              </div>
            </dl>

            <p v-if="roas" class="mt-3 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold" :class="Number(roas) >= 3 ? 'bg-sage text-sage-deep' : 'bg-clay-100 text-clay-700'">
              {{ Number(roas) >= 3 ? 'Isplati se — vredi povećati ulaganje.' : 'Ispod tri prema jedan; pogledajte koja kampanja vuče naniže.' }}
            </p>
          </section>

          <section class="panel p-4 sm:p-5">
            <h2 class="font-display text-[1.25rem] leading-tight">Katalog za Instagram i Google</h2>
            <p class="mt-1.5 text-[0.875rem] leading-relaxed text-forest/60">
              Zalepite u Meta Commerce Manager (Katalog → Dodaj proizvode → Zakazani feed) i u Google Merchant Center.
              Sam se osvežava kad promenite cenu ili opis.
            </p>
            <div class="mt-3 rounded-xl bg-cream p-4">
              <p class="break-all font-mono text-[0.75rem] text-forest/70">{{ feedUrl }}</p>
              <a :href="feedUrl" target="_blank" rel="noopener" class="mt-3 inline-block text-[0.8125rem] font-bold text-clay-600 hover:text-clay-700">Otvori feed →</a>
            </div>
          </section>
        </div>
      </div>

      <!-- ── The mailing list ───────────────────────────────────────────── -->
      <section v-else-if="view === 'list'" class="panel mt-4 overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-forest/8 p-4 sm:p-5">
          <div>
            <h2 class="font-display text-[1.25rem] leading-tight">Newsletter</h2>
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">{{ subscriberMeta?.total ?? 0 }} adresa ukupno.</p>
          </div>
          <button v-if="subscribers.length" type="button" class="btn btn-ghost" @click="download('/admin/marketing/subscribers/export', 'meva-lista.csv')">
            Preuzmi CSV
          </button>
        </div>

        <ul v-if="subscribers.length" class="divide-y divide-forest/8">
          <li v-for="person in subscribers" :key="person.email" class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <span class="min-w-0 truncate text-[0.875rem]">{{ person.email }}</span>
            <span class="shrink-0 text-[0.75rem] font-semibold text-forest/45">{{ person.utm_source ?? person.source ?? '—' }}</span>
          </li>
        </ul>

        <p v-else class="px-6 py-14 text-center text-sm text-forest/60">Još nema nijedne prijave.</p>
      </section>
    </template>
  </div>
</template>

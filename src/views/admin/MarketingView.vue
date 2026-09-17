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
    <PageHeader tone="marketing" eyebrow="Marketing" title="Koga danas kontaktirati" note="Liste izvučene iz stvarne istorije kupovina.">
      <template #actions>
      <RouterLink :to="{ name: 'admin.email' }" class="btn btn-primary">
        Email kampanje
      </RouterLink>
      </template>
    </PageHeader>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <template v-else>
      <!-- What the history says about repeat business -->
      <div v-if="insights" class="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="tile in summaryTiles" :key="tile.label" class="stat-tile">
          <p class="label text-forest/50">{{ tile.label }}</p>
          <p class="mt-2 font-display text-[1.75rem] leading-none tabular-nums">{{ tile.value }}</p>
          <p class="mt-2 text-[0.8125rem] text-forest/50">{{ tile.hint }}</p>
        </div>
      </div>

      <!-- The three lists -->
      <section v-if="insights" class="mt-5 rounded-[1.5rem] bg-sand p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="segment">
            <button v-for="list in LISTS" :key="list.key" type="button"
              :class="tab === list.key ? 'is-on' : ''"
              @click="tab = list.key">
              {{ list.label }} ({{ number(insights[`${list.key}_total`] ?? insights[list.key].length) }})
            </button>
          </div>
          <button type="button" class="btn btn-ghost"
            @click="download(`/admin/marketing/lists/${tab}`, `meva-${tab}.csv`)">
            Preuzmi CSV
          </button>
        </div>

        <p class="mt-4 max-w-3xl text-sm leading-relaxed text-forest/65">{{ note }}</p>

        <div class="mt-4 panel overflow-x-auto p-2 sm:p-3">
          <table class="desk-table min-w-[46rem]">
            <thead>
              <tr class="text-left">
                <th class="th">Kupac</th>
                <th class="th">Poslednji put kupio</th>
                <th class="th">Pre</th>
                <th class="th">Porudžbina</th>
                <th class="th text-right">Potrošio</th>
                <th class="th text-right">Javi se</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="person in rows" :key="person.email">
                <td>
                  <span class="block max-w-48 truncate font-medium">{{ person.name ?? person.email }}</span>
                  <span class="block max-w-48 truncate text-xs text-forest/60">{{ person.city ?? person.email }}</span>
                </td>
                <td>
                  <span class="block max-w-64 truncate text-forest/70">{{ person.last_products ?? '—' }}</span>
                </td>
                <td class="tabular-nums text-forest/70">{{ person.days_since }} d</td>
                <td class="tabular-nums text-forest/70">{{ person.orders }}</td>
                <td class="text-right tabular-nums">{{ person.spent_formatted }}</td>
                <td>
                  <div class="flex justify-end gap-2">
                    <a v-if="person.phone" :href="viber(person.phone)" class="chip bg-sky text-forest transition-opacity hover:opacity-80" title="Pozovi na Viberu">Viber</a>
                    <a v-if="person.phone" :href="whatsapp(person.phone)" target="_blank" rel="noopener" class="chip bg-sage text-sage-deep transition-opacity hover:opacity-80" title="Piši na WhatsAppu">WhatsApp</a>
                    <a v-if="person.email" :href="`mailto:${person.email}`" class="chip bg-wheat text-forest transition-opacity hover:opacity-80" title="Pošalji mejl">Mejl</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="(insights?.[`${tab}_total`] ?? 0) > rows.length" class="mt-3 text-xs text-forest/60">
            Prikazano {{ rows.length }} od {{ number(insights[`${tab}_total`]) }} — ceo spisak je u CSV-u.
          </p>
          <p v-if="!rows.length" class="py-8 text-center text-sm text-forest/65">Ova lista je trenutno prazna.</p>
        </div>
      </section>

      <!-- What sells together -->
      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <section v-if="insights?.pairs?.length" class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
          <h2 class="label text-forest/65">Šta se kupuje zajedno</h2>
          <p class="mt-2 text-xs text-forest/65">Gotovi setovi i „ide uz ovo" preporuke — iz stvarnih korpi.</p>
          <ul class="mt-4 space-y-2">
            <li v-for="pair in insights.pairs" :key="pair.first + pair.second" class="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2 text-sm">
              <span class="min-w-0"><span class="truncate">{{ pair.first }}</span> <span class="text-forest/58">+</span> <span class="truncate">{{ pair.second }}</span></span>
              <span class="shrink-0 tabular-nums text-forest/65">{{ number(pair.together) }}×</span>
            </li>
          </ul>
        </section>

        <Breakdown :tabs="[{ key: 'campaigns', label: 'Šta donosi novac', rows: campaigns, metric: 'revenue', unit: 'money', empty: 'Kad krenu kampanje, ovde se vidi šta se isplati.' }]" />
      </div>

      <!-- Tools -->
      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
          <h2 class="label text-forest/65">Link za kampanju</h2>
          <p class="mt-2 text-xs text-forest/65">Linkovi napravljeni ovde se posle vide u analitici, po izvoru i kampanji.</p>

          <div class="mt-4 space-y-3">
            <input v-model="builder.url" type="url" class="field w-full" />
            <div class="grid gap-3 sm:grid-cols-2">
              <input v-model="builder.source" list="utm-sources" placeholder="izvor" class="field" />
              <datalist id="utm-sources"><option v-for="source in SOURCES" :key="source" :value="source" /></datalist>
              <input v-model="builder.medium" placeholder="vrsta" class="field" />
              <input v-model="builder.campaign" placeholder="kampanja, npr. seboreja-jesen" class="field" />
              <input v-model="builder.content" placeholder="oznaka, npr. story-1" class="field" />
            </div>
            <div class="rounded-2xl bg-cream p-4">
              <p class="break-all font-mono text-xs text-forest/75">{{ taggedUrl }}</p>
              <button type="button" class="btn btn-primary mt-3" @click="copy">{{ copied ? 'Kopirano ✓' : 'Kopiraj link' }}</button>
            </div>
          </div>
        </section>

        <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
          <h2 class="label text-forest/65">Da li se reklama isplati</h2>
          <label class="mt-3 block">
            <span class="text-xs text-forest/65">Koliko ste potrošili na reklame (RSD)</span>
            <input v-model.number="spend" type="number" min="0" step="1000" class="field mt-1 w-full tabular-nums" />
          </label>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-forest/65">Promet iz kampanja</dt><dd class="tabular-nums">{{ money(campaignRevenue) }}</dd></div>
            <div class="flex justify-between"><dt class="text-forest/65">Uloženo</dt><dd class="tabular-nums">{{ number(spend) }} RSD</dd></div>
            <div v-if="roas" class="flex justify-between border-t border-forest/10 pt-2 text-base font-semibold">
              <dt>Na svaki dinar</dt><dd class="tabular-nums">{{ roas }} RSD</dd>
            </div>
          </dl>
          <p v-if="roas" class="mt-3 text-xs" :class="Number(roas) >= 3 ? 'text-sage-deep' : 'text-clay-600'">
            {{ Number(roas) >= 3 ? 'Isplati se — vredi povećati ulaganje.' : 'Ispod tri prema jedan; pogledajte koja kampanja vuče naniže.' }}
          </p>
        </section>

        <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
          <h2 class="label text-forest/65">Katalog za Instagram i Google</h2>
          <p class="mt-2 text-sm leading-relaxed text-forest/70">
            Zalepite u Meta Commerce Manager (Katalog → Dodaj proizvode → Zakazani feed) i u Google Merchant Center.
            Sam se osvežava kad promenite cenu ili opis.
          </p>
          <div class="mt-4 rounded-2xl bg-cream p-4">
            <p class="break-all font-mono text-xs text-forest/75">{{ feedUrl }}</p>
            <a :href="feedUrl" target="_blank" rel="noopener" class="label mt-3 inline-block text-clay-600 hover:text-clay-700">Otvori feed →</a>
          </div>
        </section>

        <section class="rounded-[1.5rem] bg-sand p-5 sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <h2 class="label text-forest/65">Lista za newsletter ({{ subscriberMeta?.total ?? 0 }})</h2>
            <button v-if="subscribers.length" type="button" class="label text-clay-600 hover:text-clay-700"
              @click="download('/admin/marketing/subscribers/export', 'meva-lista.csv')">CSV</button>
          </div>
          <ul v-if="subscribers.length" class="mt-4 space-y-2 text-sm">
            <li v-for="person in subscribers" :key="person.email" class="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2">
              <span class="min-w-0 truncate">{{ person.email }}</span>
              <span class="shrink-0 text-xs text-forest/60">{{ person.utm_source ?? person.source }}</span>
            </li>
          </ul>
          <p v-else class="mt-4 text-sm text-forest/65">Još niko nije ostavio e-mail.</p>
        </section>
      </div>
    </template>
  </div>
</template>

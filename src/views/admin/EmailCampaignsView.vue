<script setup>
import { library, listCampaigns, createCampaign, deleteCampaign } from '@/api/email'
import KnowledgeBase from '@/components/admin/email/KnowledgeBase.vue'
import { setMeta } from '@/lib/meta'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { VueFinalModal } from 'vue-final-modal'

const router = useRouter()

const campaigns = ref([])
const templates = ref([])
const segments = ref([])
const sizes = ref({})
const loading = ref(true)
const knowledgeOpen = ref(false)
const pickerOpen = ref(false)
const creating = ref(false)
const error = ref(null)

// The two things a new campaign needs before the editor can open.
const chosen = ref(null)
const name = ref('')

const STATUS = {
  draft: { label: 'U pripremi', class: 'bg-wheat/60 text-forest' },
  sending: { label: 'Šalje se', class: 'bg-sky text-forest' },
  sent: { label: 'Poslata', class: 'bg-sage text-forest' },
}

/** Templates grouped by the stage of the customer's life they belong to. */
const stages = computed(() => {
  const groups = new Map()

  templates.value.forEach((template) => {
    if (!groups.has(template.stage)) groups.set(template.stage, [])
    groups.get(template.stage).push(template)
  })

  return [...groups].map(([stage, items]) => ({ stage, items }))
})

const date = (value) =>
  value ? new Intl.DateTimeFormat('sr-Latn-RS', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

const segmentName = (key) => segments.value.find((s) => s.key === key)?.name ?? key

function openPicker() {
  chosen.value = null
  name.value = ''
  error.value = null
  pickerOpen.value = true
}

function choose(template) {
  chosen.value = template
  // A sensible working title, so nobody has to invent one to get started.
  name.value = `${template.name} — ${new Intl.DateTimeFormat('sr-Latn-RS', { month: 'long', year: 'numeric' }).format(new Date())}`
}

/** Create and go straight to the editor; that is the whole point of the flow. */
async function create() {
  if (!chosen.value || !name.value.trim() || creating.value) return

  creating.value = true
  error.value = null

  try {
    const campaign = await createCampaign({ name: name.value.trim(), template: chosen.value.key })
    pickerOpen.value = false
    router.push({ name: 'admin.email.edit', params: { id: campaign.id } })
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Kampanja nije napravljena.'
  } finally {
    creating.value = false
  }
}

async function remove(campaign) {
  if (!confirm(`Obrisati kampanju „${campaign.name}"?`)) return

  await deleteCampaign(campaign.id)
  campaigns.value = campaigns.value.filter((c) => c.id !== campaign.id)
}

onMounted(async () => {
  setMeta({ title: 'Email kampanje' })

  try {
    const [book, list] = await Promise.all([library(), listCampaigns()])

    templates.value = book.templates
    segments.value = book.segments
    sizes.value = book.sizes
    campaigns.value = list.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
      <div>
        <p class="eyebrow text-clay-500">Marketing</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Email kampanje</h1>
        <p class="mt-2 max-w-xl text-sm leading-relaxed text-forest/60">
          Napišite poruku u blokovima, vidite je tačno onako kako će stići, i pošaljite je grupi kojoj znači.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="knowledgeOpen = true">
          <span aria-hidden="true">✦</span> Baza znanja
        </button>
        <button type="button" class="pill bg-forest text-cream hover:bg-forest-soft" @click="openPicker">
          Nova kampanja
        </button>
      </div>
    </header>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>

    <template v-else>
      <!-- Nothing written yet -->
      <div v-if="!campaigns.length" class="mt-8 rounded-[1.5rem] border border-dashed border-forest/20 px-6 py-16 text-center">
        <p class="font-display text-2xl tracking-tight">Još nema nijedne kampanje</p>
        <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-forest/55">
          Počnite od dobrodošlice: to je mejl koji ljudi najviše otvaraju. Ako niste sigurni kako, baza znanja objašnjava sve redom.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" class="pill bg-forest text-cream hover:bg-forest-soft" @click="openPicker">Napravi prvu kampanju</button>
          <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="knowledgeOpen = true">Otvori bazu znanja</button>
        </div>
      </div>

      <ul v-else class="mt-6 space-y-2.5">
        <li v-for="campaign in campaigns" :key="campaign.id">
          <RouterLink
            :to="{ name: 'admin.email.edit', params: { id: campaign.id } }"
            class="group flex flex-wrap items-center gap-4 rounded-[1.25rem] bg-sand px-5 py-4 transition-colors hover:bg-mist-100"
          >
            <span class="h-10 w-1 shrink-0 rounded-full" :style="{ backgroundColor: campaign.accent ?? '#24342C' }" />

            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium">{{ campaign.name }}</span>
              <span class="mt-0.5 block truncate text-[0.8125rem] text-forest/50">
                {{ campaign.subject || 'Bez naslova' }}
              </span>
            </span>

            <span class="hidden text-right text-[0.8125rem] text-forest/55 sm:block">
              <span class="block">{{ campaign.template_name }}</span>
              <span class="block text-forest/40">{{ segmentName(campaign.audience) }}</span>
            </span>

            <span class="hidden text-right text-[0.8125rem] tabular-nums text-forest/55 md:block">
              <span class="block">{{ date(campaign.sent_at ?? campaign.created_at) }}</span>
              <span class="block text-forest/40">{{ campaign.recipients ? `${campaign.recipients} primalaca` : `${campaign.blocks} blokova` }}</span>
            </span>

            <span class="eyebrow shrink-0 rounded-full px-3 py-1.5 text-[0.5rem]" :class="STATUS[campaign.status]?.class">
              {{ STATUS[campaign.status]?.label ?? campaign.status }}
            </span>

            <button
              v-if="campaign.status !== 'sent'"
              type="button"
              class="shrink-0 rounded-full p-2 text-forest/30 transition-colors hover:bg-clay-100 hover:text-clay-600"
              aria-label="Obriši"
              @click.prevent="remove(campaign)"
            >
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 4.5h10M6.5 4.5V3h3v1.5M5 4.5l.5 8h5l.5-8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </RouterLink>
        </li>
      </ul>
    </template>

    <!-- Choose a template, name the campaign, and go -->
    <VueFinalModal
      v-model="pickerOpen"
      class="flex items-center justify-center p-0 sm:p-6"
      content-class="relative flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-cream sm:h-[88vh] sm:rounded-[2rem]"
      overlay-class="bg-forest/55 backdrop-blur-sm"
      content-transition="vfm-fade"
      overlay-transition="vfm-fade"
    >
      <header class="flex items-start justify-between gap-4 border-b border-forest/10 px-6 py-5 sm:px-8">
        <div>
          <p class="eyebrow text-clay-500">Nova kampanja</p>
          <h2 class="mt-1.5 font-display text-2xl tracking-tight sm:text-3xl">Šta želite da pošaljete?</h2>
          <p class="mt-1 text-sm text-forest/55">Šabloni su poređani redom kojim ih kupac sreće.</p>
        </div>
        <button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/15 text-forest/60 transition-colors hover:bg-forest hover:text-cream"
          aria-label="Zatvori" @click="pickerOpen = false">
          <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" /></svg>
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <section v-for="group in stages" :key="group.stage" class="mb-7 last:mb-0">
          <p class="eyebrow text-forest/40">{{ group.stage }}</p>

          <div class="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="template in group.items"
              :key="template.key"
              type="button"
              class="rounded-[1.25rem] border p-4 text-left transition-all duration-300"
              :class="chosen?.key === template.key
                ? 'border-transparent bg-forest text-cream shadow-lg shadow-forest/15'
                : 'border-forest/10 bg-sand hover:border-forest/25'"
              @click="choose(template)"
            >
              <span class="flex items-center gap-2.5">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: template.accent }" />
                <span class="font-display text-lg leading-tight tracking-tight">{{ template.name }}</span>
              </span>
              <span class="mt-2 block text-[0.8125rem] leading-relaxed" :class="chosen?.key === template.key ? 'text-cream/70' : 'text-forest/60'">
                {{ template.summary }}
              </span>
              <span class="mt-2.5 flex items-start gap-1.5 text-[0.75rem] leading-relaxed"
                :class="chosen?.key === template.key ? 'text-cream/55' : 'text-forest/40'">
                <span aria-hidden="true">✦</span>
                <span>{{ template.advice }}</span>
              </span>
              <span class="mt-2.5 block text-[0.6875rem]"
                :class="chosen?.key === template.key ? 'text-cream/45' : 'text-forest/35'">
                Šalje se: {{ segmentName(template.audience) }} ({{ sizes[template.audience] ?? 0 }})
              </span>
            </button>
          </div>
        </section>
      </div>

      <!-- Name it and create -->
      <footer class="border-t border-forest/10 bg-sand px-6 py-4 sm:px-8">
        <div class="flex flex-wrap items-end gap-3">
          <label class="min-w-0 flex-1">
            <span class="eyebrow text-forest/40">Ime kampanje</span>
            <input
              v-model="name"
              type="text"
              :disabled="!chosen"
              :placeholder="chosen ? 'Kako ćete je prepoznati za mesec dana' : 'Prvo izaberite šablon'"
              class="mt-1.5 w-full rounded-full border border-forest/15 bg-cream px-5 py-3 text-sm outline-none transition-colors placeholder:text-forest/30 focus:border-forest/40 disabled:opacity-50"
              @keydown.enter="create"
            />
          </label>
          <button
            type="button"
            class="pill bg-forest px-7 py-3.5 text-cream transition-opacity hover:bg-forest-soft disabled:opacity-40"
            :disabled="!chosen || !name.trim() || creating"
            @click="create"
          >
            {{ creating ? 'Pravim…' : 'Napravi i otvori' }}
          </button>
        </div>
        <p v-if="error" class="mt-2 text-[0.8125rem] text-clay-600">{{ error }}</p>
        <p v-else class="mt-2 text-[0.75rem] text-forest/40">Ime vidite samo vi. Naslov mejla se piše u sledećem koraku.</p>
      </footer>
    </VueFinalModal>

    <KnowledgeBase v-model="knowledgeOpen" />
  </div>
</template>

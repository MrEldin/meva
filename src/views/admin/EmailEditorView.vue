<script setup>
import { audienceFor, getCampaign, library, previewCampaign, saveCampaign, sendCampaign, sendTest } from '@/api/email'
import BlockFields from '@/components/admin/email/BlockFields.vue'
import KnowledgeBase from '@/components/admin/email/KnowledgeBase.vue'
import { setMeta } from '@/lib/meta'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueFinalModal } from 'vue-final-modal'

const route = useRoute()
const router = useRouter()

const campaign = ref(null)
const book = ref({ blocks: [], templates: [], segments: [], sizes: {}, products: [], tokens: [] })
const loading = ref(true)
const html = ref('')
const rendering = ref(false)
const saving = ref(false)
const savedAt = ref(null)
const error = ref(null)
const notice = ref(null)

const selected = ref(null)
const paletteOpen = ref(false)
const knowledgeOpen = ref(false)
const sendOpen = ref(false)
const sending = ref(false)
const testEmail = ref('')
const audience = ref({ count: 0, sample: [] })

const frozen = computed(() => campaign.value?.status === 'sent' || campaign.value?.status === 'sending')

const definitionFor = (type) => book.value.blocks.find((b) => b.type === type) ?? null
const selectedBlock = computed(() => campaign.value?.blocks?.find((b) => b.id === selected.value) ?? null)
const selectedDefinition = computed(() => (selectedBlock.value ? definitionFor(selectedBlock.value.type) : null))

/** The palette, grouped the way the block library orders it. */
const palette = computed(() => {
  const groups = new Map()

  book.value.blocks.forEach((block) => {
    if (!groups.has(block.group)) groups.set(block.group, [])
    groups.get(block.group).push(block)
  })

  return [...groups].map(([group, items]) => ({ group, items }))
})

const preview = ref('desktop')

/*
 * The preview is the message itself: the server renders it with the same code
 * that builds what leaves the envelope. Rendering is debounced so a sentence
 * being typed does not become forty requests.
 */
let timer = null

function schedule() {
  clearTimeout(timer)
  timer = setTimeout(render, 350)
}

async function render() {
  if (!campaign.value) return

  rendering.value = true

  try {
    html.value = await previewCampaign(campaign.value.id, {
      blocks: campaign.value.blocks,
      subject: campaign.value.subject,
      preheader: campaign.value.preheader,
    })
  } finally {
    rendering.value = false
  }
}

/* Saving is quiet and automatic; nobody should lose a paragraph to a closed tab. */
let saveTimer = null

function scheduleSave() {
  if (frozen.value) return

  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 1200)
}

async function save() {
  if (!campaign.value || frozen.value || saving.value) return

  saving.value = true
  error.value = null

  try {
    await saveCampaign(campaign.value.id, {
      name: campaign.value.name,
      subject: campaign.value.subject,
      preheader: campaign.value.preheader,
      audience: campaign.value.audience,
      blocks: campaign.value.blocks,
    })
    savedAt.value = new Date()
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Izmene nisu sačuvane.'
  } finally {
    saving.value = false
  }
}

function touched() {
  schedule()
  scheduleSave()
}

/* Blocks ------------------------------------------------------------------ */

const uid = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

function addBlock(definition, at = null) {
  const block = { ...structuredClone(definition.defaults ?? {}), id: uid(), type: definition.type }
  const index = at ?? campaign.value.blocks.length

  // New blocks land above the footer, which belongs at the bottom.
  const footerAt = campaign.value.blocks.findIndex((b) => b.type === 'footer')
  const where = at !== null ? index : footerAt >= 0 ? footerAt : index

  campaign.value.blocks.splice(where, 0, block)
  selected.value = block.id
  paletteOpen.value = false
  touched()
}

function updateBlock(next) {
  const index = campaign.value.blocks.findIndex((b) => b.id === next.id)

  if (index >= 0) {
    campaign.value.blocks[index] = next
    touched()
  }
}

function removeBlock(id) {
  campaign.value.blocks = campaign.value.blocks.filter((b) => b.id !== id)
  if (selected.value === id) selected.value = null
  touched()
}

function duplicateBlock(id) {
  const index = campaign.value.blocks.findIndex((b) => b.id === id)
  if (index < 0) return

  const copy = { ...structuredClone(campaign.value.blocks[index]), id: uid() }
  campaign.value.blocks.splice(index + 1, 0, copy)
  selected.value = copy.id
  touched()
}

function move(id, by) {
  const index = campaign.value.blocks.findIndex((b) => b.id === id)
  const target = index + by

  if (index < 0 || target < 0 || target >= campaign.value.blocks.length) return

  const blocks = campaign.value.blocks
  ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
  touched()
}

/* Dragging to reorder */
const dragging = ref(null)
const dragOver = ref(null)

function onDrop(id) {
  const from = campaign.value.blocks.findIndex((b) => b.id === dragging.value)
  const to = campaign.value.blocks.findIndex((b) => b.id === id)

  if (from >= 0 && to >= 0 && from !== to) {
    const [block] = campaign.value.blocks.splice(from, 1)
    campaign.value.blocks.splice(to, 0, block)
    touched()
  }

  dragging.value = null
  dragOver.value = null
}

/* Sending ----------------------------------------------------------------- */

async function refreshAudience() {
  if (!campaign.value) return

  audience.value = await audienceFor(campaign.value.id, campaign.value.audience)
}

async function test() {
  notice.value = null
  error.value = null

  try {
    await save()
    const result = await sendTest(campaign.value.id, testEmail.value || undefined)
    notice.value = `Proba poslata na ${result.sent_to}.`
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Proba nije poslata.'
  }
}

async function send() {
  if (sending.value) return

  sending.value = true
  error.value = null

  try {
    await save()
    campaign.value = { ...campaign.value, ...(await sendCampaign(campaign.value.id)) }
    sendOpen.value = false
    notice.value = `Kampanja je poslata na ${campaign.value.recipients} adresa.`
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Slanje nije uspelo.'
  } finally {
    sending.value = false
  }
}

const segmentName = (key) => book.value.segments.find((s) => s.key === key)?.name ?? key
const blockLabel = (type) => definitionFor(type)?.label ?? type

const savedLabel = computed(() => {
  if (saving.value) return 'Čuvam…'
  if (!savedAt.value) return null

  return `Sačuvano u ${new Intl.DateTimeFormat('sr-RS', { hour: '2-digit', minute: '2-digit' }).format(savedAt.value)}`
})

watch(() => campaign.value?.audience, refreshAudience)

onMounted(async () => {
  try {
    const [loaded, loadedBook] = await Promise.all([getCampaign(route.params.id), library()])

    campaign.value = loaded
    book.value = loadedBook
    setMeta({ title: loaded.name })

    await Promise.all([render(), refreshAudience()])
  } catch {
    router.replace({ name: 'admin.email' })
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  clearTimeout(saveTimer)
})
</script>

<template>
  <div>
    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>

    <template v-else-if="campaign">
      <!-- Header: what it is called, and what happens to it -->
      <header class="flex flex-wrap items-start justify-between gap-4 border-b border-forest/10 pb-5">
        <div class="min-w-0 flex-1">
          <RouterLink :to="{ name: 'admin.email' }" class="eyebrow inline-flex items-center gap-1.5 text-forest/40 transition-colors hover:text-clay-600">
            <span aria-hidden="true">←</span> Kampanje
          </RouterLink>
          <input
            v-model="campaign.name"
            type="text"
            :disabled="frozen"
            class="mt-1.5 w-full max-w-xl bg-transparent font-display text-3xl tracking-tight outline-none disabled:opacity-70"
            @input="scheduleSave"
          />
          <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-forest/45">
            <span>{{ campaign.template_name }}</span>
            <span v-if="savedLabel">· {{ savedLabel }}</span>
            <span v-if="frozen" class="eyebrow rounded-full bg-sage px-2.5 py-1 text-[0.5rem] text-forest">Poslata — ne menja se</span>
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="knowledgeOpen = true">
            <span aria-hidden="true">✦</span> Baza znanja
          </button>
          <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" :disabled="frozen" @click="test">
            Pošalji probu
          </button>
          <button type="button" class="pill bg-forest text-cream hover:bg-forest-soft disabled:opacity-40" :disabled="frozen" @click="sendOpen = true">
            Pošalji kampanju
          </button>
        </div>
      </header>

      <p v-if="notice" class="mt-4 rounded-2xl bg-sage/50 px-4 py-3 text-sm">{{ notice }}</p>
      <p v-if="error" class="mt-4 rounded-2xl bg-clay-100 px-4 py-3 text-sm text-clay-700">{{ error }}</p>

      <!-- The subject line, which decides whether any of this gets read -->
      <section class="mt-5 rounded-[1.5rem] bg-sand p-5">
        <div class="grid gap-4 lg:grid-cols-2">
          <label class="block">
            <span class="eyebrow text-forest/40">Naslov mejla</span>
            <input
              v-model="campaign.subject"
              type="text"
              :disabled="frozen"
              maxlength="200"
              placeholder="Trideset do pedeset znakova"
              class="mt-1.5 w-full rounded-full border border-forest/15 bg-cream px-5 py-3 text-sm outline-none transition-colors focus:border-forest/40"
              @input="touched"
            />
            <span class="mt-1 block text-[0.75rem]" :class="(campaign.subject?.length ?? 0) > 52 ? 'text-clay-600' : 'text-forest/40'">
              {{ campaign.subject?.length ?? 0 }} znakova ·
              {{ (campaign.subject?.length ?? 0) > 52 ? 'seći će se na telefonu' : 'staje na telefon' }}
            </span>
          </label>

          <label class="block">
            <span class="eyebrow text-forest/40">Preheader</span>
            <input
              v-model="campaign.preheader"
              type="text"
              :disabled="frozen"
              maxlength="200"
              placeholder="Sivi red pored naslova u sandučetu"
              class="mt-1.5 w-full rounded-full border border-forest/15 bg-cream px-5 py-3 text-sm outline-none transition-colors focus:border-forest/40"
              @input="touched"
            />
            <span class="mt-1 block text-[0.75rem] text-forest/40">Drugi razlog za otvaranje, ne nastavak naslova.</span>
          </label>
        </div>

        <!-- How it looks in the inbox -->
        <div class="mt-4 rounded-2xl bg-cream px-4 py-3">
          <p class="eyebrow text-[0.5rem] text-forest/35">U sandučetu će izgledati ovako</p>
          <div class="mt-2 flex items-baseline gap-2 overflow-hidden">
            <span class="shrink-0 text-sm font-semibold">Meva Kozmetika</span>
            <span class="truncate text-sm">{{ campaign.subject || 'Bez naslova' }}</span>
            <span class="truncate text-sm text-forest/40">— {{ campaign.preheader || 'bez preheadera' }}</span>
          </div>
        </div>
      </section>

      <!-- Tools on the left, the message on the right -->
      <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
        <!-- Tools -->
        <div class="space-y-4">
          <section class="rounded-[1.5rem] bg-sand p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="eyebrow text-forest/40">Blokovi · {{ campaign.blocks.length }}</p>
              <button type="button" class="eyebrow rounded-full bg-forest px-4 py-2 text-[0.5rem] text-cream transition-colors hover:bg-forest-soft disabled:opacity-40"
                :disabled="frozen" @click="paletteOpen = true">
                + Dodaj blok
              </button>
            </div>

            <ul class="mt-3 space-y-1.5">
              <li
                v-for="block in campaign.blocks"
                :key="block.id"
                :draggable="!frozen"
                class="group rounded-2xl border transition-all"
                :class="[
                  selected === block.id ? 'border-transparent bg-forest text-cream' : 'border-forest/10 bg-cream hover:border-forest/25',
                  dragOver === block.id ? 'ring-2 ring-clay-500' : '',
                  dragging === block.id ? 'opacity-40' : '',
                ]"
                @dragstart="dragging = block.id"
                @dragend="dragging = null; dragOver = null"
                @dragover.prevent="dragOver = block.id"
                @drop.prevent="onDrop(block.id)"
              >
                <div class="flex items-center gap-2 px-3 py-2.5">
                  <span class="cursor-grab text-forest/25 group-hover:text-forest/45" :class="selected === block.id ? 'text-cream/40' : ''" aria-hidden="true">⠿</span>

                  <button type="button" class="min-w-0 flex-1 text-left" @click="selected = selected === block.id ? null : block.id">
                    <span class="block truncate text-sm font-medium">{{ blockLabel(block.type) }}</span>
                    <span class="block truncate text-[0.75rem]" :class="selected === block.id ? 'text-cream/55' : 'text-forest/40'">
                      {{ block.heading || block.text || block.quote || block.product_slug || definitionFor(block.type)?.group }}
                    </span>
                  </button>

                  <div class="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                    :class="selected === block.id ? 'opacity-100' : ''">
                    <button type="button" class="rounded-full p-1.5 hover:bg-black/10" aria-label="Gore" :disabled="frozen" @click.stop="move(block.id, -1)">
                      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 12V4M4.5 7.5L8 4l3.5 3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                    <button type="button" class="rounded-full p-1.5 hover:bg-black/10" aria-label="Dole" :disabled="frozen" @click.stop="move(block.id, 1)">
                      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4v8M4.5 8.5L8 12l3.5-3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                    <button type="button" class="rounded-full p-1.5 hover:bg-black/10" aria-label="Umnoži" :disabled="frozen" @click.stop="duplicateBlock(block.id)">
                      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M11 3H4a1 1 0 00-1 1v7" stroke-linecap="round" /></svg>
                    </button>
                    <button type="button" class="rounded-full p-1.5 hover:bg-black/10" aria-label="Obriši" :disabled="frozen" @click.stop="removeBlock(block.id)">
                      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" /></svg>
                    </button>
                  </div>
                </div>

                <!-- The open block's settings, in place -->
                <div v-if="selected === block.id" class="rounded-b-2xl bg-sand px-3.5 pt-3.5 pb-4 text-forest">
                  <p v-if="definitionFor(block.type)?.why" class="mb-3 flex items-start gap-1.5 rounded-2xl bg-wheat/40 px-3 py-2.5 text-[0.75rem] leading-relaxed text-forest/70">
                    <span aria-hidden="true">✦</span>
                    <span>{{ definitionFor(block.type).why }}</span>
                  </p>
                  <BlockFields
                    :block="block"
                    :definition="selectedDefinition"
                    :products="book.products"
                    :tokens="book.tokens"
                    @change="updateBlock"
                  />
                </div>
              </li>
            </ul>

            <p v-if="!campaign.blocks.length" class="py-8 text-center text-sm text-forest/45">
              Nema nijednog bloka. Počnite naslovnom slikom.
            </p>
          </section>

          <!-- Who gets it -->
          <section class="rounded-[1.5rem] bg-sand p-4">
            <p class="eyebrow text-forest/40">Kome se šalje</p>
            <select
              v-model="campaign.audience"
              :disabled="frozen"
              class="mt-2 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-forest/40"
              @change="scheduleSave"
            >
              <option v-for="segment in book.segments" :key="segment.key" :value="segment.key">
                {{ segment.name }} ({{ book.sizes[segment.key] ?? 0 }})
              </option>
            </select>
            <p class="mt-2 text-[0.8125rem] leading-relaxed text-forest/55">
              {{ book.segments.find((s) => s.key === campaign.audience)?.why }}
            </p>
            <p class="mt-2 font-mono text-[0.8125rem] tabular-nums text-forest/45">
              Trenutno {{ audience.count }} primalaca
            </p>
          </section>
        </div>

        <!-- The message -->
        <section class="rounded-[1.5rem] bg-sand p-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3">
            <p class="eyebrow text-forest/40">
              Kako će stići
              <span v-if="rendering" class="ml-1.5 normal-case tracking-normal text-clay-500">osvežavam…</span>
            </p>
            <div class="flex gap-1 rounded-full border border-forest/15 bg-cream p-1">
              <button v-for="mode in ['desktop', 'mobile']" :key="mode" type="button"
                class="eyebrow rounded-full px-4 py-1.5 text-[0.5rem] transition-colors"
                :class="preview === mode ? 'bg-forest text-cream' : 'hover:bg-sage'"
                @click="preview = mode">
                {{ mode === 'desktop' ? 'Računar' : 'Telefon' }}
              </button>
            </div>
          </div>

          <div class="overflow-hidden rounded-[1.25rem] bg-cream">
            <div class="mx-auto transition-[max-width] duration-500 ease-out" :class="preview === 'mobile' ? 'max-w-[400px]' : 'max-w-full'">
              <iframe
                :srcdoc="html"
                title="Pregled mejla"
                sandbox=""
                class="h-[60vh] w-full border-0 lg:h-[calc(100vh-22rem)]"
              />
            </div>
          </div>

          <p class="mt-2.5 text-[0.75rem] leading-relaxed text-forest/40">
            Ovo nije približan prikaz — ovo je isti HTML koji odlazi u sanduče.
          </p>
        </section>
      </div>
    </template>

    <!-- The palette -->
    <VueFinalModal
      v-model="paletteOpen"
      class="flex items-center justify-center p-0 sm:p-6"
      content-class="relative flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-cream sm:max-h-[85vh] sm:rounded-[2rem]"
      overlay-class="bg-forest/55 backdrop-blur-sm"
      content-transition="vfm-fade"
      overlay-transition="vfm-fade"
    >
      <header class="flex items-start justify-between gap-4 border-b border-forest/10 px-6 py-5">
        <div>
          <p class="eyebrow text-clay-500">Blokovi</p>
          <h2 class="mt-1.5 font-display text-2xl tracking-tight">Šta dodajemo u mejl?</h2>
        </div>
        <button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/15 text-forest/60 transition-colors hover:bg-forest hover:text-cream"
          aria-label="Zatvori" @click="paletteOpen = false">
          <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" /></svg>
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <section v-for="group in palette" :key="group.group" class="mb-6 last:mb-0">
          <p class="eyebrow text-forest/40">{{ group.group }}</p>
          <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
            <button
              v-for="definition in group.items"
              :key="definition.type"
              type="button"
              class="rounded-2xl border border-forest/10 bg-sand p-3.5 text-left transition-colors hover:border-forest/30"
              @click="addBlock(definition)"
            >
              <span class="block text-sm font-medium">{{ definition.label }}</span>
              <span class="mt-1 block text-[0.75rem] leading-relaxed text-forest/55">{{ definition.why }}</span>
            </button>
          </div>
        </section>
      </div>
    </VueFinalModal>

    <!-- Confirming a send -->
    <VueFinalModal
      v-model="sendOpen"
      class="flex items-center justify-center p-4"
      content-class="w-full max-w-lg rounded-[1.75rem] bg-cream p-7"
      overlay-class="bg-forest/55 backdrop-blur-sm"
      content-transition="vfm-fade"
      overlay-transition="vfm-fade"
    >
      <p class="eyebrow text-clay-500">Poslednji korak</p>
      <h2 class="mt-2 font-display text-2xl tracking-tight">Poslati kampanju?</h2>

      <dl class="mt-5 space-y-2.5 rounded-2xl bg-sand px-4 py-4 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-forest/50">Naslov</dt>
          <dd class="min-w-0 truncate text-right font-medium">{{ campaign?.subject || '— nema naslova —' }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-forest/50">Publika</dt>
          <dd class="text-right font-medium">{{ segmentName(campaign?.audience) }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-forest/50">Primalaca</dt>
          <dd class="text-right font-medium tabular-nums">{{ audience.count }}</dd>
        </div>
      </dl>

      <label class="mt-4 block">
        <span class="eyebrow text-forest/40">Prvo probajte na svojoj adresi</span>
        <div class="mt-1.5 flex gap-2">
          <input v-model="testEmail" type="email" placeholder="ostavite prazno za svoju adresu"
            class="min-w-0 flex-1 rounded-full border border-forest/15 bg-sand px-4 py-2.5 text-sm outline-none focus:border-forest/40" />
          <button type="button" class="pill border border-forest/20 px-5 py-2.5 hover:bg-forest hover:text-cream" @click="test">Pošalji probu</button>
        </div>
      </label>

      <p class="mt-4 text-[0.8125rem] leading-relaxed text-forest/55">
        Posle slanja kampanja se više ne menja — ostaje zapis o tome šta je tačno otišlo.
      </p>

      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" class="pill border border-forest/20 hover:bg-forest hover:text-cream" @click="sendOpen = false">Odustani</button>
        <button type="button" class="pill bg-clay-500 text-cream transition-colors hover:bg-clay-600 disabled:opacity-40"
          :disabled="sending || !audience.count" @click="send">
          {{ sending ? 'Šaljem…' : `Pošalji na ${audience.count} adresa` }}
        </button>
      </div>
    </VueFinalModal>

    <KnowledgeBase v-model="knowledgeOpen" />
  </div>
</template>

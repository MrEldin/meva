<script setup>
import { ALL_LESSONS, CHAPTERS } from '@/components/admin/email/knowledge'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

const open = defineModel({ type: Boolean, default: false })

/*
 * What has been read is kept in the browser rather than on the server: it is a
 * private note to yourself about where you got to, not a fact about the shop.
 */
const STORE_KEY = 'meva.email.learned'

const learned = ref(new Set(readStore()))
const chapter = ref(CHAPTERS[0].key)
const scroller = ref(null)
const scrolled = ref(0)

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...learned.value]))
  } catch {
    /* A browser that refuses storage still gets a working sheet. */
  }
}

const current = computed(() => CHAPTERS.find((c) => c.key === chapter.value) ?? CHAPTERS[0])
const total = ALL_LESSONS.length
const learnedCount = computed(() => learned.value.size)
const percent = computed(() => Math.round((learnedCount.value / total) * 100))

/** How much of one chapter has been read, 0–1. */
function chapterProgress(key) {
  const lessons = CHAPTERS.find((c) => c.key === key)?.lessons ?? []
  const done = lessons.filter((l) => learned.value.has(l.id)).length

  return lessons.length ? done / lessons.length : 0
}

const chapterDone = (key) => chapterProgress(key) === 1

function toggle(id) {
  learned.value.has(id) ? learned.value.delete(id) : learned.value.add(id)
  learned.value = new Set(learned.value)
  persist()
}

function markChapter() {
  current.value.lessons.forEach((l) => learned.value.add(l.id))
  learned.value = new Set(learned.value)
  persist()
}

function reset() {
  learned.value = new Set()
  persist()
}

/*
 * A lesson counts as read once it has stood on screen for a moment. Marking it
 * the instant it appears would tick off a whole chapter during a fast scroll,
 * which would make the count meaningless.
 */
let observer = null
const timers = new Map()

function observe() {
  observer?.disconnect()
  timers.forEach(clearTimeout)
  timers.clear()

  if (!scroller.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.dataset.lesson

        if (entry.isIntersecting && !learned.value.has(id)) {
          timers.set(
            id,
            setTimeout(() => {
              learned.value.add(id)
              learned.value = new Set(learned.value)
              persist()
            }, 1400),
          )
        } else if (!entry.isIntersecting && timers.has(id)) {
          clearTimeout(timers.get(id))
          timers.delete(id)
        }
      })
    },
    { root: scroller.value, threshold: 0.6 },
  )

  scroller.value.querySelectorAll('[data-lesson]').forEach((el) => observer.observe(el))
}

function onScroll(event) {
  const el = event.target
  const max = el.scrollHeight - el.clientHeight

  scrolled.value = max > 0 ? Math.min(1, el.scrollTop / max) : 1
}

function goTo(key) {
  chapter.value = key
  scrolled.value = 0
  nextTick(() => {
    scroller.value?.scrollTo({ top: 0 })
    observe()
  })
}

const chapterIndex = computed(() => CHAPTERS.findIndex((c) => c.key === chapter.value))
const nextChapter = computed(() => CHAPTERS[chapterIndex.value + 1] ?? null)

watch(open, (isOpen) => {
  if (isOpen) nextTick(observe)
  else observer?.disconnect()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  timers.forEach(clearTimeout)
})

/** Accent classes per chapter, written out so Tailwind keeps them. */
const ACCENTS = {
  sage: { dot: 'bg-sage-deep', soft: 'bg-sage/40', text: 'text-sage-deep', ring: 'stroke-sage-deep' },
  clay: { dot: 'bg-clay-500', soft: 'bg-clay-100', text: 'text-clay-600', ring: 'stroke-clay-500' },
  forest: { dot: 'bg-forest', soft: 'bg-mist-200', text: 'text-forest', ring: 'stroke-forest' },
  blush: { dot: 'bg-blush-500', soft: 'bg-blush-100', text: 'text-blush-600', ring: 'stroke-blush-500' },
}
const accent = computed(() => ACCENTS[current.value.accent] ?? ACCENTS.forest)
</script>

<template>
  <VueFinalModal
    v-model="open"
    class="flex items-center justify-center p-0 sm:p-6"
    content-class="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-cream sm:h-[90vh] sm:rounded-[2rem]"
    overlay-class="bg-forest/55 backdrop-blur-sm"
    :esc-to-close="true"
    content-transition="vfm-fade"
    overlay-transition="vfm-fade"
  >
    <!-- Reading progress for the open chapter, hairline across the top -->
    <div class="absolute inset-x-0 top-0 z-20 h-0.5 bg-forest/10">
      <div class="h-full bg-clay-500 transition-[width] duration-200 ease-out" :style="{ width: `${scrolled * 100}%` }" />
    </div>

    <header class="flex items-start justify-between gap-4 border-b border-forest/10 px-6 py-5 sm:px-8">
      <div class="min-w-0">
        <p class="label text-clay-500">Baza znanja</p>
        <h2 class="mt-1.5 font-display text-2xl leading-tight tracking-tight sm:text-3xl">Email marketing, od A do Ž</h2>
        <p class="mt-1 text-sm text-forest/65">{{ total }} tehnika koje možete primeniti danas.</p>
      </div>

      <div class="flex shrink-0 items-center gap-4">
        <!-- Overall progress, as a ring -->
        <div class="hidden items-center gap-3 sm:flex">
          <svg viewBox="0 0 44 44" class="h-11 w-11 -rotate-90">
            <circle cx="22" cy="22" r="19" fill="none" class="stroke-forest/12" stroke-width="4" />
            <circle
              cx="22" cy="22" r="19" fill="none" stroke-linecap="round" stroke-width="4"
              class="stroke-clay-500 transition-[stroke-dashoffset] duration-700 ease-out"
              :stroke-dasharray="2 * Math.PI * 19"
              :stroke-dashoffset="2 * Math.PI * 19 * (1 - learnedCount / total)"
            />
          </svg>
          <div class="leading-tight">
            <div class="font-mono text-sm font-medium tabular-nums">{{ percent }}%</div>
            <div class="text-xs text-forest/65">{{ learnedCount }} / {{ total }}</div>
          </div>
        </div>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full border border-forest/15 text-forest/60 transition-colors hover:bg-forest hover:text-cream"
          aria-label="Zatvori"
          @click="open = false"
        >
          <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <!-- Chapter rail -->
      <nav data-lenis-prevent class="shrink-0 overflow-x-auto border-b border-forest/10 px-4 py-3 lg:w-72 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-4 lg:py-5">
        <ul class="flex gap-2 lg:flex-col lg:gap-1">
          <li v-for="item in CHAPTERS" :key="item.key" class="shrink-0">
            <button
              type="button"
              class="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors lg:gap-3.5"
              :class="chapter === item.key ? 'bg-forest text-cream' : 'hover:bg-sand'"
              @click="goTo(item.key)"
            >
              <span
                class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs transition-colors"
                :class="chapter === item.key ? 'bg-cream/15 text-cream' : (ACCENTS[item.accent]?.soft ?? 'bg-mist-200') + ' ' + (ACCENTS[item.accent]?.text ?? '')"
              >
                <svg v-if="chapterDone(item.key)" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <template v-else>{{ item.icon }}</template>
              </span>

              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">{{ item.title }}</span>
                <span
                  class="mt-1 block h-0.5 w-full overflow-hidden rounded-full transition-opacity"
                  :class="[
                    chapter === item.key ? 'bg-cream/20' : 'bg-forest/10',
                    chapterProgress(item.key) > 0 || chapter === item.key ? 'opacity-100' : 'opacity-0',
                  ]"
                >
                  <span class="block h-full rounded-full transition-[width] duration-500 ease-out"
                    :class="chapter === item.key ? 'bg-cream' : 'bg-clay-500'"
                    :style="{ width: `${chapterProgress(item.key) * 100}%` }" />
                </span>
              </span>
            </button>
          </li>
        </ul>

        <div class="mt-4 hidden px-3 lg:block">
          <button type="button" class="text-xs text-forest/58 underline underline-offset-4 transition-colors hover:text-clay-600" @click="reset">
            Poništi napredak
          </button>
        </div>
      </nav>

      <!-- Chapter body -->
      <div ref="scroller" data-lenis-prevent class="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-10 sm:py-9" @scroll.passive="onScroll">
        <Transition name="chapter" mode="out-in">
          <div :key="current.key" class="mx-auto max-w-2xl">
            <p class="label" :class="accent.text">Poglavlje {{ chapterIndex + 1 }} / {{ CHAPTERS.length }}</p>
            <h3 class="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl">{{ current.title }}</h3>
            <p class="mt-2 text-base leading-relaxed text-forest/60">{{ current.tagline }}</p>

            <ol class="mt-8 space-y-4">
              <li
                v-for="(lesson, index) in current.lessons"
                :key="lesson.id"
                :data-lesson="lesson.id"
                class="group relative overflow-hidden rounded-[1.5rem] border p-5 transition-all duration-500 sm:p-6"
                :class="learned.has(lesson.id) ? 'border-transparent bg-sand' : 'border-forest/10 bg-cream'"
              >
                <!-- Accent edge, filled once read -->
                <span
                  class="absolute inset-y-0 left-0 w-1 transition-all duration-500"
                  :class="learned.has(lesson.id) ? accent.dot : 'bg-forest/8'"
                />

                <div class="flex items-start gap-4">
                  <button
                    type="button"
                    class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300"
                    :class="learned.has(lesson.id)
 ? `${accent.dot} border-transparent text-cream scale-100`
                      : 'border-forest/20 text-transparent hover:border-forest/40'"
                    :aria-label="learned.has(lesson.id) ? 'Označi kao nepročitano' : 'Označi kao naučeno'"
                    @click="toggle(lesson.id)"
                  >
                    <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline gap-2.5">
                      <span class="font-mono text-xs tabular-nums text-forest/52">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4 class="font-display text-lg leading-snug tracking-tight">{{ lesson.title }}</h4>
                    </div>

                    <p class="mt-2.5 text-[0.9375rem] leading-relaxed text-forest/75">{{ lesson.body }}</p>

                    <div class="mt-4 grid gap-2.5 sm:grid-cols-2">
                      <div class="rounded-2xl bg-cream/70 p-3.5" :class="learned.has(lesson.id) ? 'bg-cream' : 'bg-sand'">
                        <p class="label text-forest/58">Zašto radi</p>
                        <p class="mt-1.5 text-sm leading-relaxed text-forest/65">{{ lesson.why }}</p>
                      </div>
                      <div class="rounded-2xl p-3.5" :class="accent.soft">
                        <p class="label" :class="accent.text">Kako da primenite</p>
                        <p class="mt-1.5 text-sm leading-relaxed text-forest/75">{{ lesson.do }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ol>

            <!-- End of chapter -->
            <div class="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-dashed border-forest/20 px-5 py-5">
              <div>
                <p class="text-sm font-medium">
                  {{ chapterDone(current.key) ? 'Poglavlje pročitano.' : `Pročitano ${current.lessons.filter((l) => learned.has(l.id)).length} od ${current.lessons.length}.` }}
                </p>
                <p class="mt-0.5 text-sm text-forest/65">
                  {{ nextChapter ? `Sledi: ${nextChapter.title}` : 'To je kraj knjige — ostalo je da se primeni.' }}
                </p>
              </div>
              <div class="flex gap-2">
                <button v-if="!chapterDone(current.key)" type="button"
                  class="btn btn-ghost" @click="markChapter">
                  Označi sve
                </button>
                <button v-if="nextChapter" type="button"
                  class="btn btn-primary" @click="goTo(nextChapter.key)">
                  Dalje
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </VueFinalModal>
</template>

<style scoped>
.chapter-enter-active,
.chapter-leave-active {
  transition: opacity 0.28s var(--ease-silk), transform 0.28s var(--ease-silk);
}
.chapter-enter-from {
  opacity: 0;
  transform: translateY(0.75rem);
}
.chapter-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>

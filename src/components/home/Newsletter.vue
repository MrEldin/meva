<script setup>
import client from '@/api/client'
import { ref } from 'vue'

/**
 * The mailing list, asked for once and plainly.
 *
 * What it costs the reader is the thing worth saying first, so the frequency
 * is in the sentence rather than in small print underneath, and the one-line
 * form is the only thing in the panel that is white.
 */
const email = ref('')
const state = ref('idle')

async function join() {
  if (!email.value.trim() || state.value === 'sending') return
  state.value = 'sending'
  try {
    await client.post('/newsletter', { email: email.value.trim(), source: 'home' })
    state.value = 'done'
    email.value = ''
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <section class="shell pb-12 lg:pb-20">
    <div class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-100 via-peach/80 to-blush-200 px-6 py-11 sm:px-10 lg:py-16">
      <!-- Two soft lights, so the panel is not one flat pink rectangle -->
      <div class="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8),transparent_66%)]" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55),transparent_68%)]" aria-hidden="true" />

      <div class="relative mx-auto max-w-xl text-center">
        <span class="inline-flex items-center gap-2 rounded-full bg-paper/70 px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-blush-700 backdrop-blur-sm">
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7 8 5.5L20 7" /></svg>
          Jednom do dvaput mesečno
        </span>

        <h2 class="mt-4 font-display text-[1.75rem] leading-[1.15] text-ink sm:text-[2.25rem]">
          Saveti za negu, <em class="not-italic text-blush-700">bez spama</em>
        </h2>
        <p class="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink/70">
          Šta pomaže kod seboreje i osetljive kože, i kad stigne nešto novo. Odjava je jedan klik, u svakom pismu.
        </p>

        <form class="mx-auto mt-7 max-w-md" @submit.prevent="join">
          <div class="flex flex-col gap-2.5 rounded-full bg-paper p-1.5 shadow-[0_18px_40px_-24px_rgba(142,59,69,0.5)] sm:flex-row sm:gap-0">
            <label class="sr-only" for="newsletter-email">Vaša e-mail adresa</label>
            <input
              id="newsletter-email"
              v-model="email"
              type="email"
              required
              placeholder="Vaša e-mail adresa"
              class="min-w-0 flex-1 rounded-full bg-transparent px-5 py-3 text-[0.9375rem] text-ink outline-none placeholder:text-ink/40"
            />
            <button
              type="submit"
              :disabled="state === 'sending'"
              class="shrink-0 rounded-full bg-blush-600 px-7 py-3 text-[0.9375rem] font-bold text-paper transition-colors hover:bg-blush-700 disabled:opacity-60"
            >
              {{ state === 'sending' ? 'Šaljem…' : 'Prijavi se' }}
            </button>
          </div>
        </form>

        <p v-if="state === 'done'" class="mt-3.5 text-[0.9375rem] font-semibold text-blush-700">Hvala. Javljamo se uskoro.</p>
        <p v-else-if="state === 'error'" class="mt-3.5 text-[0.9375rem] font-semibold text-blush-700">Nešto nije prošlo. Pokušajte ponovo.</p>
      </div>
    </div>
  </section>
</template>

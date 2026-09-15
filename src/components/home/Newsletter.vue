<script setup>
import client from '@/api/client'
import { ref } from 'vue'

/** The mailing list, asked for once, at the end, where it belongs. */
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
  <section class="grain relative overflow-hidden bg-ink text-paper">
    <div class="shell relative py-16 text-center lg:py-24">
      <p class="kicker text-blush-300">07 — Pismo iz Meve</p>
      <h2 class="mx-auto mt-5 max-w-2xl text-[2.25rem] leading-[0.98] text-paper sm:text-[3.25rem]">
        Saveti za negu, <span class="italic text-blush-300">bez spama.</span>
      </h2>
      <p class="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-paper/55">
        Jedan do dva puta mesečno: šta pomaže kod seboreje, psorijaze i osetljive kože, i kad stigne nešto novo.
      </p>

      <form class="mx-auto mt-7 flex max-w-md flex-col gap-2.5 sm:flex-row" @submit.prevent="join">
        <input
          v-model="email"
          type="email"
          required
          placeholder="Vaša e-mail adresa"
          class="min-w-0 flex-1 rounded-full border border-paper/25 bg-transparent px-5 py-3.5 text-[0.9375rem] text-paper outline-none transition-colors placeholder:text-paper/40 focus:border-paper"
        />
        <button
          type="submit"
          class="rounded-full bg-blush-500 px-7 py-3.5 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-blush-400 disabled:opacity-60"
          :disabled="state === 'sending'"
        >
          {{ state === 'sending' ? 'Šaljem…' : 'Prijavi se' }}
        </button>
      </form>

      <p v-if="state === 'done'" class="mt-3 text-sm text-blush-300">Hvala. Javljamo se uskoro.</p>
      <p v-else-if="state === 'error'" class="mt-3 text-sm text-blush-300">Nešto nije prošlo. Pokušajte ponovo.</p>
    </div>
  </section>
</template>

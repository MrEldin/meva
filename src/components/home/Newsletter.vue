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
  <section class="bg-ink text-paper">
    <div class="shell py-12 text-center lg:py-16">
      <h2 class="text-2xl text-paper sm:text-3xl">Saveti za negu, bez spama</h2>
      <p class="mx-auto mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-paper/65">
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

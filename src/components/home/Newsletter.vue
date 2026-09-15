<script setup>
import client from '@/api/client'
import { ref } from 'vue'

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
  <section class="shell pb-12 lg:pb-16">
    <div class="rounded-[1.75rem] bg-blush-100 px-6 py-10 text-center sm:px-10 lg:py-14">
      <h2 class="text-[1.625rem] sm:text-3xl">Saveti za negu, bez spama</h2>
      <p class="mx-auto mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-mist-600">
        Jedan do dva puta mesečno: šta pomaže kod seboreje i osetljive kože, i kad stigne nešto novo.
      </p>

      <form class="mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row" @submit.prevent="join">
        <input v-model="email" type="email" required placeholder="Vaša e-mail adresa"
          class="min-w-0 flex-1 rounded-full border border-blush-200 bg-paper px-5 py-3.5 text-[0.9375rem] outline-none transition-colors placeholder:text-mist-400 focus:border-blush-500" />
        <button type="submit" :disabled="state === 'sending'"
          class="rounded-full bg-blush-500 px-7 py-3.5 text-[0.9375rem] font-bold text-paper transition-colors hover:bg-blush-600 disabled:opacity-60">
          {{ state === 'sending' ? 'Šaljem…' : 'Prijavi se' }}
        </button>
      </form>

      <p v-if="state === 'done'" class="mt-3 text-sm font-medium text-blush-700">Hvala. Javljamo se uskoro.</p>
      <p v-else-if="state === 'error'" class="mt-3 text-sm font-medium text-blush-700">Nešto nije prošlo. Pokušajte ponovo.</p>
    </div>
  </section>
</template>

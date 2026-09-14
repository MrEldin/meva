<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref(null)
const submitting = ref(false)

async function submit() {
  if (submitting.value) return

  submitting.value = true
  error.value = null

  try {
    await auth.login(email.value, password.value)
    router.push(route.query.redirect ?? { name: 'admin' })
  } catch (failure) {
    error.value = failure.response?.status === 401
      ? 'Pogrešan e-mail ili lozinka.'
      : 'Prijava trenutno nije moguća. Pokušajte ponovo.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-[80svh] items-center overflow-hidden py-16">
    <div class="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blush-100/60 blur-3xl" />

    <div class="shell relative">
      <div class="mx-auto max-w-sm">
        <img :src="logoBlack" alt="Meva Cosmetics" class="mx-auto h-9 w-auto" />

        <h1 class="mt-10 text-center font-display text-3xl text-ink">Prijava</h1>
        <p class="mt-3 text-center text-sm font-light text-mist-500">
          Pristup administraciji prodavnice.
        </p>

        <form class="mt-10 space-y-5" @submit.prevent="submit">
          <label class="block">
            <span class="eyebrow text-mist-500">E-mail</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="mt-2 w-full border border-mist-200 bg-paper px-4 py-3.5 text-base font-light text-ink focus:border-ink focus:outline-none"
            />
          </label>

          <label class="block">
            <span class="eyebrow text-mist-500">Lozinka</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-2 w-full border border-mist-200 bg-paper px-4 py-3.5 text-base font-light text-ink focus:border-ink focus:outline-none"
            />
          </label>

          <p v-if="error" class="text-sm text-blush-600">{{ error }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="eyebrow w-full bg-ink py-4 text-paper transition-colors duration-400 hover:bg-blush-500 disabled:opacity-55"
          >
            {{ submitting ? 'Prijavljujem…' : 'Prijavi se' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

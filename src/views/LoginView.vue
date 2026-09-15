<script setup>
import logoBlack from '@/assets/brand/logo-black.png'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref(null)
const submitting = ref(false)

onMounted(() => setMeta({ title: 'Prijava' }))

async function submit() {
  if (submitting.value) return

  submitting.value = true
  error.value = null

  try {
    await auth.login(email.value, password.value)

    // Staff land in the back office; customers land in their own account.
    const fallback = auth.isStaff ? { name: 'admin' } : { name: 'account' }
    router.push(route.query.redirect ?? fallback)
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
    <div class="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-clay-100/60 blur-3xl" />

    <div class="shell relative">
      <div class="mx-auto max-w-sm">
        <img :src="logoBlack" alt="Meva Cosmetics" class="mx-auto h-9 w-auto" />

        <h1 class="mt-10 text-center font-display text-3xl">Prijava</h1>
        <p class="mt-3 text-center text-sm text-forest/60">
          Za kupce i za administraciju prodavnice.
        </p>

        <form class="mt-10 space-y-5" @submit.prevent="submit">
          <label class="block">
            <span class="eyebrow text-[0.5625rem] text-forest/55">E-mail</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3.5 text-base outline-none focus:border-forest/40"
            />
          </label>

          <label class="block">
            <span class="eyebrow text-[0.5625rem] text-forest/55">Lozinka</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3.5 text-base outline-none focus:border-forest/40"
            />
          </label>

          <p v-if="error" class="text-sm text-clay-600">{{ error }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="pill w-full justify-center bg-forest py-4 text-cream transition-colors hover:bg-forest-soft disabled:opacity-55"
          >
            {{ submitting ? 'Prijavljujem…' : 'Prijavi se' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-forest/60">
          Nemate nalog?
          <RouterLink :to="{ name: 'register' }" class="text-clay-600 underline-offset-4 hover:underline">Otvorite ga</RouterLink>
          · <RouterLink :to="{ name: 'track' }" class="text-clay-600 underline-offset-4 hover:underline">pratite porudžbinu</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

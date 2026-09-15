<script setup>
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '' })
const errors = ref({})
const loading = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}

  try {
    await auth.register(form.value)
    router.push({ name: 'account' })
  } catch (error) {
    errors.value = error.response?.data?.errors ?? { general: [error.response?.data?.message ?? 'Registracija nije uspela.'] }
  } finally {
    loading.value = false
  }
}

onMounted(() => setMeta({
  title: 'Otvori nalog',
  description: 'Napravite nalog da pratite svoje porudžbine kod Meva Kozmetike.',
}))
</script>

<template>
  <div class="shell max-w-md py-14 lg:py-24">
    <p class="eyebrow text-clay-500">Nalog</p>
    <h1 class="mt-3 font-display text-4xl tracking-tight">Otvorite nalog</h1>
    <p class="mt-3 text-sm text-forest/65">Da vidite svoje porudžbine i pratite gde su.</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Ime</span>
          <input v-model="form.first_name" required class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        </label>
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Prezime</span>
          <input v-model="form.last_name" required class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        </label>
      </div>

      <label class="block">
        <span class="eyebrow text-[0.5625rem] text-forest/55">E-mail</span>
        <input v-model="form.email" type="email" required autocomplete="email" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        <span v-if="errors.email" class="mt-1 block text-xs text-clay-600">{{ errors.email[0] }}</span>
      </label>

      <label class="block">
        <span class="eyebrow text-[0.5625rem] text-forest/55">Lozinka</span>
        <input v-model="form.password" type="password" required minlength="8" autocomplete="new-password" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        <span v-if="errors.password" class="mt-1 block text-xs text-clay-600">{{ errors.password[0] }}</span>
      </label>

      <label class="block">
        <span class="eyebrow text-[0.5625rem] text-forest/55">Ponovite lozinku</span>
        <input v-model="form.password_confirmation" type="password" required autocomplete="new-password" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
      </label>

      <p v-if="errors.general" class="text-sm text-clay-600">{{ errors.general[0] }}</p>

      <button type="submit" class="pill w-full justify-center bg-blush-500 text-paper hover:bg-blush-500 disabled:opacity-50" :disabled="loading">
        {{ loading ? 'Pravim nalog…' : 'Otvori nalog' }}
      </button>
    </form>

    <p class="mt-6 text-sm text-forest/60">
      Već imate nalog?
      <RouterLink :to="{ name: 'login' }" class="text-clay-600 underline-offset-4 hover:underline">Prijavite se</RouterLink>
    </p>
  </div>
</template>

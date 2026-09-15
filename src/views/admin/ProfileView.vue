<script setup>
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

const auth = useAuthStore()

const form = ref({ first_name: '', last_name: '', email: '' })
const passwords = ref({ current_password: '', password: '', password_confirmation: '' })
const errors = ref({})
const notice = ref('')
const saving = ref(false)

async function save(withPassword) {
  saving.value = true
  errors.value = {}

  const payload = { ...form.value }

  if (withPassword) Object.assign(payload, passwords.value)

  try {
    await auth.updateProfile(payload)
    passwords.value = { current_password: '', password: '', password_confirmation: '' }
    notice.value = 'Sačuvano.'
    setTimeout(() => (notice.value = ''), 3000)
  } catch (error) {
    errors.value = error.response?.data?.errors ?? {}
    if (error.response?.data?.message && !Object.keys(errors.value).length) {
      errors.value = { general: [error.response.data.message] }
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  setMeta({ title: 'Moj nalog' })
  if (!auth.user) await auth.fetchUser()

  form.value = {
    first_name: auth.user?.first_name ?? '',
    last_name: auth.user?.last_name ?? '',
    email: auth.user?.email ?? '',
  }
})
</script>

<template>
  <div class="max-w-2xl">
    <header class="border-b border-forest/10 pb-5">
      <p class="eyebrow text-clay-500">Nalog</p>
      <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Moj nalog</h1>
      <p class="mt-2 text-sm text-forest/60">Uloga: {{ auth.roles.join(', ') || '—' }}</p>
    </header>

    <p v-if="notice" class="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-sage-deep">{{ notice }}</p>
    <p v-if="errors.general" class="mt-4 rounded-2xl bg-clay-100 px-4 py-3 text-sm text-clay-700">{{ errors.general[0] }}</p>

    <form class="mt-6 space-y-5" @submit.prevent="save(false)">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Ime</span>
          <input v-model="form.first_name" type="text" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        </label>
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Prezime</span>
          <input v-model="form.last_name" type="text" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        </label>
      </div>

      <label class="block">
        <span class="eyebrow text-[0.5625rem] text-forest/55">E-mail</span>
        <input v-model="form.email" type="email" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        <span v-if="errors.email" class="mt-1 block text-xs text-clay-600">{{ errors.email[0] }}</span>
      </label>

      <button type="submit" class="pill bg-forest text-cream hover:bg-forest-soft disabled:opacity-50" :disabled="saving">Sačuvaj</button>
    </form>

    <form class="mt-10 space-y-5 border-t border-forest/10 pt-8" @submit.prevent="save(true)">
      <h2 class="eyebrow text-[0.5625rem] text-forest/55">Promena lozinke</h2>

      <label class="block">
        <span class="eyebrow text-[0.5625rem] text-forest/55">Trenutna lozinka</span>
        <input v-model="passwords.current_password" type="password" autocomplete="current-password" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
      </label>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Nova lozinka</span>
          <input v-model="passwords.password" type="password" autocomplete="new-password" minlength="10" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
          <span v-if="errors.password" class="mt-1 block text-xs text-clay-600">{{ errors.password[0] }}</span>
        </label>
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Ponovi novu lozinku</span>
          <input v-model="passwords.password_confirmation" type="password" autocomplete="new-password" class="mt-2 w-full rounded-2xl border border-forest/15 bg-sand px-4 py-3 outline-none focus:border-forest/40" />
        </label>
      </div>

      <button type="submit" class="pill border border-forest/20 hover:bg-forest hover:text-cream disabled:opacity-50" :disabled="saving">Promeni lozinku</button>
    </form>
  </div>
</template>

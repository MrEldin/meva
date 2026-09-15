<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
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
    <PageHeader tone="account" eyebrow="Nalog" title="Moj nalog" :note="`Uloga: ${auth.roles.join(', ') || '—'}`" />

    <p v-if="notice" class="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-sage-deep">{{ notice }}</p>
    <p v-if="errors.general" class="mt-4 rounded-2xl bg-clay-100 px-4 py-3 text-sm text-clay-700">{{ errors.general[0] }}</p>

    <form class="mt-6 space-y-5" @submit.prevent="save(false)">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label text-forest/65">Ime</span>
          <input v-model="form.first_name" type="text" class="field mt-2 w-full" />
        </label>
        <label class="block">
          <span class="label text-forest/65">Prezime</span>
          <input v-model="form.last_name" type="text" class="field mt-2 w-full" />
        </label>
      </div>

      <label class="block">
        <span class="label text-forest/65">E-mail</span>
        <input v-model="form.email" type="email" class="field mt-2 w-full" />
        <span v-if="errors.email" class="mt-1 block text-xs text-clay-600">{{ errors.email[0] }}</span>
      </label>

      <button type="submit" class="btn btn-primary" :disabled="saving">Sačuvaj</button>
    </form>

    <form class="mt-10 space-y-5 border-t border-forest/10 pt-8" @submit.prevent="save(true)">
      <h2 class="label text-forest/65">Promena lozinke</h2>

      <label class="block">
        <span class="label text-forest/65">Trenutna lozinka</span>
        <input v-model="passwords.current_password" type="password" autocomplete="current-password" class="field mt-2 w-full" />
      </label>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label text-forest/65">Nova lozinka</span>
          <input v-model="passwords.password" type="password" autocomplete="new-password" minlength="10" class="field mt-2 w-full" />
          <span v-if="errors.password" class="mt-1 block text-xs text-clay-600">{{ errors.password[0] }}</span>
        </label>
        <label class="block">
          <span class="label text-forest/65">Ponovi novu lozinku</span>
          <input v-model="passwords.password_confirmation" type="password" autocomplete="new-password" class="field mt-2 w-full" />
        </label>
      </div>

      <button type="submit" class="btn btn-ghost" :disabled="saving">Promeni lozinku</button>
    </form>
  </div>
</template>

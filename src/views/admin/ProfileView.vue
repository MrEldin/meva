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
  <div class="max-w-3xl">
    <PageHeader tone="account" eyebrow="Nalog" title="Moj nalog" note="Vaše ime, adresa za prijavu i lozinka." />

    <p v-if="notice" class="mb-4 rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-sage-deep">{{ notice }}</p>
    <p v-if="errors.general" class="mb-4 rounded-xl bg-clay-100 px-4 py-3 text-sm font-semibold text-clay-700">{{ errors.general[0] }}</p>

    <div class="space-y-4">
      <!-- Who you are -->
      <section class="panel p-4 sm:p-6">
        <div class="flex items-center gap-4">
          <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-clay-100 font-display text-[1.25rem] text-clay-700">
            {{ (form.first_name?.[0] ?? '') + (form.last_name?.[0] ?? '') || '·' }}
          </span>
          <div class="min-w-0">
            <h2 class="font-display text-[1.25rem] leading-tight">Podaci</h2>
            <p class="mt-0.5 text-[0.8125rem] text-forest/50">Uloga: {{ auth.roles.join(', ') || '—' }}</p>
          </div>
        </div>

        <form class="mt-5" @submit.prevent="save(false)">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="label text-forest/55">Ime</span>
              <input v-model="form.first_name" type="text" class="field mt-1.5 w-full" />
            </label>
            <label class="block">
              <span class="label text-forest/55">Prezime</span>
              <input v-model="form.last_name" type="text" class="field mt-1.5 w-full" />
            </label>
          </div>

          <label class="mt-4 block">
            <span class="label text-forest/55">E-mail</span>
            <input v-model="form.email" type="email" class="field mt-1.5 w-full" />
            <span class="mt-1 block text-[0.8125rem] text-forest/45">Ovom adresom se prijavljujete.</span>
            <span v-if="errors.email" class="mt-1 block text-xs text-clay-700">{{ errors.email[0] }}</span>
          </label>

          <button type="submit" class="btn btn-primary mt-5" :disabled="saving">
            {{ saving ? 'Čuvanje…' : 'Sačuvaj' }}
          </button>
        </form>
      </section>

      <!-- The password -->
      <section class="panel p-4 sm:p-6">
        <h2 class="font-display text-[1.25rem] leading-tight">Lozinka</h2>
        <p class="mt-0.5 text-[0.8125rem] text-forest/50">Najmanje deset znakova. Trenutnu tražimo da bismo bili sigurni da ste to vi.</p>

        <form class="mt-5" @submit.prevent="save(true)">
          <label class="block sm:max-w-sm">
            <span class="label text-forest/55">Trenutna lozinka</span>
            <input v-model="passwords.current_password" type="password" autocomplete="current-password" class="field mt-1.5 w-full" />
          </label>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="label text-forest/55">Nova lozinka</span>
              <input v-model="passwords.password" type="password" autocomplete="new-password" minlength="10" class="field mt-1.5 w-full" />
              <span v-if="errors.password" class="mt-1 block text-xs text-clay-700">{{ errors.password[0] }}</span>
            </label>
            <label class="block">
              <span class="label text-forest/55">Ponovite novu lozinku</span>
              <input v-model="passwords.password_confirmation" type="password" autocomplete="new-password" class="field mt-1.5 w-full" />
            </label>
          </div>

          <button type="submit" class="btn btn-ghost mt-5" :disabled="saving">Promeni lozinku</button>
        </form>
      </section>
    </div>
  </div>
</template>

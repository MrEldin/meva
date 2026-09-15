<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

const auth = useAuthStore()

// Roles carry a colour so the three columns are told apart before they are read.
const ROLE_WASH = {
  'super-admin': 'tile-team',
  admin: 'tile-overview',
  marketing: 'tile-marketing',
  customer: 'tile-account',
}
const ROLE_DOT = {
  'super-admin': 'bg-desk-team',
  admin: 'bg-desk-overview',
  marketing: 'bg-desk-marketing',
  customer: 'bg-desk-account',
}
const ROLE_TEXT = {
  'super-admin': 'text-desk-team',
  admin: 'text-desk-overview',
  marketing: 'text-desk-marketing',
  customer: 'text-desk-account',
}

const team = ref([])
const roles = ref([])
const permissionLabels = ref({})
const loading = ref(true)
const showing = ref(false)
const errors = ref({})
const notice = ref('')

const blank = () => ({ first_name: '', last_name: '', email: '', password: '', role: 'admin' })
const form = ref(blank())

async function load() {
  loading.value = true

  try {
    const [people, roleList] = await Promise.all([
      client.get('/admin/team'),
      client.get('/admin/team/roles'),
    ])

    team.value = people.data.data
    roles.value = roleList.data.data.filter((role) => role.name !== 'customer')
    permissionLabels.value = roleList.data.meta.permissions
  } finally {
    loading.value = false
  }
}

async function create() {
  errors.value = {}

  try {
    await client.post('/admin/team', form.value)
    form.value = blank()
    showing.value = false
    notice.value = 'Nalog je napravljen.'
    setTimeout(() => (notice.value = ''), 3000)
    await load()
  } catch (error) {
    errors.value = error.response?.data?.errors ?? {}
    if (error.response?.data?.message && !Object.keys(errors.value).length) {
      errors.value = { general: [error.response.data.message] }
    }
  }
}

async function changeRole(member, role) {
  try {
    const { data } = await client.put(`/admin/team/${member.id}`, { role })
    Object.assign(member, data.data)
  } catch (error) {
    notice.value = error.response?.data?.message ?? 'Izmena nije uspela.'
    setTimeout(() => (notice.value = ''), 4000)
  }
}

async function remove(member) {
  if (!window.confirm(`Ukloniti pristup za ${member.email}?`)) return

  try {
    await client.delete(`/admin/team/${member.id}`)
    await load()
  } catch (error) {
    notice.value = error.response?.data?.message ?? 'Brisanje nije uspelo.'
    setTimeout(() => (notice.value = ''), 4000)
  }
}

onMounted(() => {
  setMeta({ title: 'Tim' })
  load()
})
</script>

<template>
  <div>
    <PageHeader tone="team" eyebrow="Pristup" title="Tim" note="Ko sme da vidi i menja šta.">
      <template #actions>
      <button type="button" class="btn btn-primary" @click="showing = !showing">
        {{ showing ? 'Otkaži' : 'Dodaj člana' }}
      </button>
      </template>
    </PageHeader>

    <p v-if="notice" class="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-sage-deep">{{ notice }}</p>

    <form v-if="showing" class="mt-5 rounded-[1.5rem] bg-sand p-5 sm:p-6" @submit.prevent="create">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label text-forest/65">Ime</span>
          <input v-model="form.first_name" type="text" required class="field mt-2 w-full" />
        </label>
        <label class="block">
          <span class="label text-forest/65">Prezime</span>
          <input v-model="form.last_name" type="text" required class="field mt-2 w-full" />
        </label>
        <label class="block">
          <span class="label text-forest/65">E-mail</span>
          <input v-model="form.email" type="email" required class="field mt-2 w-full" />
          <span v-if="errors.email" class="mt-1 block text-xs text-clay-600">{{ errors.email[0] }}</span>
        </label>
        <label class="block">
          <span class="label text-forest/65">Lozinka (bar 10 znakova)</span>
          <input v-model="form.password" type="text" required minlength="10" class="field mt-2 w-full font-mono" />
          <span v-if="errors.password" class="mt-1 block text-xs text-clay-600">{{ errors.password[0] }}</span>
        </label>
      </div>

      <fieldset class="mt-5">
        <span class="label text-forest/65">Uloga</span>
        <div class="mt-2 grid gap-2 sm:grid-cols-3">
          <label v-for="role in roles" :key="role.name" class="cursor-pointer rounded-2xl border p-4 transition-colors"
            :class="form.role === role.name ? 'border-forest bg-cream' : 'border-forest/15 hover:bg-cream'">
            <input v-model="form.role" type="radio" :value="role.name" class="sr-only" />
            <span class="block text-sm font-semibold">{{ role.label }}</span>
            <span class="mt-1 block text-xs text-forest/65">{{ role.permissions.map((p) => permissionLabels[p]).filter(Boolean).join(' · ') || 'bez pristupa' }}</span>
          </label>
        </div>
      </fieldset>

      <p v-if="errors.general" class="mt-4 text-sm text-clay-600">{{ errors.general[0] }}</p>

      <button type="submit" class="btn btn-accent mt-5">Napravi nalog</button>
    </form>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <ul v-else class="mt-5 space-y-3">
      <li v-for="member in team" :key="member.id" class="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-sand p-5">
        <div class="min-w-0">
          <p class="text-sm font-semibold">{{ member.first_name }} {{ member.last_name }}</p>
          <p class="mt-0.5 text-xs text-forest/65">{{ member.email }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select
            :value="member.role"
            class="field field-select field-pill w-full"
            @change="changeRole(member, $event.target.value)"
          >
            <option v-for="role in roles" :key="role.name" :value="role.name">{{ role.label }}</option>
          </select>
          <button v-if="member.id !== auth.user?.id" type="button" class="label text-clay-600 hover:text-clay-700" @click="remove(member)">
            Ukloni
          </button>
        </div>
      </li>
    </ul>

    <section class="mt-8 rounded-[1.5rem] bg-sand p-5 sm:p-6">
      <h2 class="label text-forest/65">Šta koja uloga može</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div v-for="role in roles" :key="role.name" class="rounded-2xl p-4" :class="ROLE_WASH[role.name] ?? 'tile-account'">
          <p class="flex items-center gap-2 text-[0.9375rem] font-semibold">
            <span class="h-2.5 w-2.5 rounded-full" :class="ROLE_DOT[role.name] ?? 'bg-desk-account'" />
            {{ role.label }}
          </p>
          <ul class="mt-2.5 space-y-1.5 text-[0.8125rem] text-forest/70">
            <li v-for="permission in role.permissions" :key="permission" class="flex items-start gap-1.5">
              <svg viewBox="0 0 16 16" class="mt-0.5 h-3 w-3 shrink-0" :class="ROLE_TEXT[role.name] ?? 'text-desk-account'" fill="none" stroke="currentColor" stroke-width="2.4">
                <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ permissionLabels[permission] ?? permission }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

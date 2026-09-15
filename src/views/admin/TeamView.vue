<script setup>
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

const auth = useAuthStore()

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
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-5">
      <div>
        <p class="eyebrow text-clay-500">Pristup</p>
        <h1 class="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Tim</h1>
      </div>
      <button type="button" class="pill bg-forest text-cream hover:bg-forest-soft" @click="showing = !showing">
        {{ showing ? 'Otkaži' : 'Dodaj člana' }}
      </button>
    </header>

    <p v-if="notice" class="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-sage-deep">{{ notice }}</p>

    <form v-if="showing" class="mt-5 rounded-[1.5rem] bg-sand p-5 sm:p-6" @submit.prevent="create">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Ime</span>
          <input v-model="form.first_name" type="text" required class="mt-2 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-3 outline-none focus:border-forest/40" />
        </label>
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Prezime</span>
          <input v-model="form.last_name" type="text" required class="mt-2 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-3 outline-none focus:border-forest/40" />
        </label>
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">E-mail</span>
          <input v-model="form.email" type="email" required class="mt-2 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-3 outline-none focus:border-forest/40" />
          <span v-if="errors.email" class="mt-1 block text-xs text-clay-600">{{ errors.email[0] }}</span>
        </label>
        <label class="block">
          <span class="eyebrow text-[0.5625rem] text-forest/55">Lozinka (bar 10 znakova)</span>
          <input v-model="form.password" type="text" required minlength="10" class="mt-2 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-3 font-mono text-sm outline-none focus:border-forest/40" />
          <span v-if="errors.password" class="mt-1 block text-xs text-clay-600">{{ errors.password[0] }}</span>
        </label>
      </div>

      <fieldset class="mt-5">
        <span class="eyebrow text-[0.5625rem] text-forest/55">Uloga</span>
        <div class="mt-2 grid gap-2 sm:grid-cols-3">
          <label v-for="role in roles" :key="role.name" class="cursor-pointer rounded-2xl border p-4 transition-colors"
            :class="form.role === role.name ? 'border-forest bg-cream' : 'border-forest/15 hover:bg-cream'">
            <input v-model="form.role" type="radio" :value="role.name" class="sr-only" />
            <span class="block text-sm font-semibold">{{ role.label }}</span>
            <span class="mt-1 block text-xs text-forest/55">{{ role.permissions.map((p) => permissionLabels[p]).filter(Boolean).join(' · ') || 'bez pristupa' }}</span>
          </label>
        </div>
      </fieldset>

      <p v-if="errors.general" class="mt-4 text-sm text-clay-600">{{ errors.general[0] }}</p>

      <button type="submit" class="pill mt-5 bg-clay-500 text-cream hover:bg-clay-600">Napravi nalog</button>
    </form>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/50">Učitavanje…</p>

    <ul v-else class="mt-5 space-y-3">
      <li v-for="member in team" :key="member.id" class="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-sand p-5">
        <div class="min-w-0">
          <p class="text-sm font-semibold">{{ member.first_name }} {{ member.last_name }}</p>
          <p class="mt-0.5 text-xs text-forest/55">{{ member.email }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select
            :value="member.role"
            class="rounded-full border border-forest/15 bg-cream px-4 py-2 text-xs outline-none focus:border-forest/40"
            @change="changeRole(member, $event.target.value)"
          >
            <option v-for="role in roles" :key="role.name" :value="role.name">{{ role.label }}</option>
          </select>
          <button v-if="member.id !== auth.user?.id" type="button" class="eyebrow text-[0.5625rem] text-clay-600 hover:text-clay-700" @click="remove(member)">
            Ukloni
          </button>
        </div>
      </li>
    </ul>

    <section class="mt-8 rounded-[1.5rem] bg-sand p-5 sm:p-6">
      <h2 class="eyebrow text-[0.5625rem] text-forest/50">Šta koja uloga može</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <div v-for="role in roles" :key="role.name">
          <p class="text-sm font-semibold">{{ role.label }}</p>
          <ul class="mt-2 space-y-1 text-xs text-forest/60">
            <li v-for="permission in role.permissions" :key="permission">· {{ permissionLabels[permission] ?? permission }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

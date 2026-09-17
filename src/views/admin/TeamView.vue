<script setup>
import PageHeader from '@/components/admin/PageHeader.vue'
import client from '@/api/client'
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

const auth = useAuthStore()

// Roles carry a colour so the three columns are told apart before they are read.
// What each role is for, said in words rather than in a colour.
const ROLE_NOTE = {
  'super-admin': 'Sve, uključujući naloge i prava.',
  admin: 'Svakodnevni rad: porudžbine, katalog, brojke.',
  marketing: 'Kupci, liste i kampanje.',
  customer: 'Samo svoj nalog u prodavnici.',
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
    <PageHeader tone="team" eyebrow="Pristup" title="Tim" note="Ko sme da vidi i menja šta. Ulogu menjate u redu, odmah.">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="showing = !showing">
          {{ showing ? 'Otkaži' : 'Dodaj člana' }}
        </button>
      </template>
    </PageHeader>

    <p v-if="notice" class="mb-4 rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-sage-deep">{{ notice }}</p>

    <!-- Adding someone -->
    <form v-if="showing" class="panel mb-4 p-4 sm:p-6" @submit.prevent="create">
      <h2 class="font-display text-[1.25rem] leading-tight">Novi nalog</h2>
      <p class="mt-0.5 text-[0.8125rem] text-forest/50">Lozinku vidite dok je kucate — pošaljite je osobi i neka je promeni pri prvoj prijavi.</p>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label text-forest/55">Ime</span>
          <input v-model="form.first_name" type="text" required class="field mt-1.5 w-full" />
        </label>
        <label class="block">
          <span class="label text-forest/55">Prezime</span>
          <input v-model="form.last_name" type="text" required class="field mt-1.5 w-full" />
        </label>
        <label class="block">
          <span class="label text-forest/55">E-mail</span>
          <input v-model="form.email" type="email" required class="field mt-1.5 w-full" />
          <span v-if="errors.email" class="mt-1 block text-xs text-clay-700">{{ errors.email[0] }}</span>
        </label>
        <label class="block">
          <span class="label text-forest/55">Lozinka (bar 10 znakova)</span>
          <input v-model="form.password" type="text" required minlength="10" class="field mt-1.5 w-full font-mono" />
          <span v-if="errors.password" class="mt-1 block text-xs text-clay-700">{{ errors.password[0] }}</span>
        </label>
      </div>

      <fieldset class="mt-5">
        <span class="label text-forest/55">Uloga</span>
        <div class="mt-1.5 grid gap-2 sm:grid-cols-3">
          <label
            v-for="role in roles"
            :key="role.name"
            class="cursor-pointer rounded-xl border p-4 transition-colors"
            :class="form.role === role.name ? 'border-clay-500 bg-clay-50' : 'border-forest/10 hover:bg-cream'"
          >
            <input v-model="form.role" type="radio" :value="role.name" class="sr-only" />
            <span class="block text-[0.9375rem] font-bold">{{ role.label }}</span>
            <span class="mt-1 block text-[0.8125rem] leading-snug text-forest/55">{{ ROLE_NOTE[role.name] ?? '' }}</span>
          </label>
        </div>
      </fieldset>

      <p v-if="errors.general" class="mt-4 text-sm font-semibold text-clay-700">{{ errors.general[0] }}</p>

      <button type="submit" class="btn btn-accent mt-5">Napravi nalog</button>
    </form>

    <p v-if="loading" class="py-16 text-center text-sm text-forest/65">Učitavanje…</p>

    <!-- Who has access -->
    <ul v-else class="panel divide-y divide-forest/8 overflow-hidden">
      <li v-for="member in team" :key="member.id" class="flex flex-wrap items-center gap-3 p-4 sm:gap-4">
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-clay-100 text-[0.8125rem] font-bold text-clay-700">
          {{ (member.first_name?.[0] ?? '') + (member.last_name?.[0] ?? '') }}
        </span>

        <div class="min-w-0 flex-1">
          <p class="truncate text-[0.9375rem] font-bold">
            {{ member.first_name }} {{ member.last_name }}
            <span v-if="member.id === auth.user?.id" class="ml-1 text-[0.75rem] font-semibold text-forest/40">(vi)</span>
          </p>
          <p class="mt-0.5 truncate text-[0.8125rem] text-forest/50">{{ member.email }}</p>
        </div>

        <label class="shrink-0">
          <span class="sr-only">Uloga</span>
          <select
            :value="member.role"
            class="field field-select field-pill w-44"
            @change="changeRole(member, $event.target.value)"
          >
            <option v-for="role in roles" :key="role.name" :value="role.name">{{ role.label }}</option>
          </select>
        </label>

        <button
          v-if="member.id !== auth.user?.id"
          type="button"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-forest/35 transition-colors hover:bg-clay-100 hover:text-clay-700"
          aria-label="Ukloni nalog"
          title="Ukloni nalog"
          @click="remove(member)"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 11v6M15 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" /></svg>
        </button>
        <span v-else class="h-9 w-9 shrink-0" aria-hidden="true" />
      </li>
    </ul>

    <!-- What each role may do -->
    <section class="panel mt-4 p-4 sm:p-6">
      <h2 class="font-display text-[1.25rem] leading-tight">Šta koja uloga može</h2>
      <p class="mt-0.5 text-[0.8125rem] text-forest/50">Uloga se bira gore, u redu osobe.</p>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div v-for="role in roles" :key="role.name" class="rounded-xl bg-cream p-4">
          <p class="text-[0.9375rem] font-bold">{{ role.label }}</p>
          <p class="mt-0.5 text-[0.8125rem] leading-snug text-forest/55">{{ ROLE_NOTE[role.name] ?? '' }}</p>

          <ul class="mt-3 space-y-1.5 border-t border-forest/8 pt-3 text-[0.8125rem] text-forest/70">
            <li v-for="permission in role.permissions" :key="permission" class="flex items-start gap-2">
              <svg viewBox="0 0 16 16" class="mt-[3px] h-3 w-3 shrink-0 text-clay-600" fill="none" stroke="currentColor" stroke-width="2.6">
                <path d="M3 8.5l3.2 3.2L13 5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ permissionLabels[permission] ?? permission }}
            </li>
            <li v-if="!role.permissions.length" class="text-forest/40">Bez pristupa administraciji.</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

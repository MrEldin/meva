<script setup>
import client from '@/api/client'
import { money } from '@/lib/money'
import { useCartStore } from '@/stores/cart'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cart = useCartStore()

const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postcode: '',
  note: '',
})

const errors = ref({})
const submitting = ref(false)
const failure = ref(null)

const fields = [
  { key: 'first_name', label: 'Ime', type: 'text', required: true, autocomplete: 'given-name', half: true },
  { key: 'last_name', label: 'Prezime', type: 'text', required: true, autocomplete: 'family-name', half: true },
  { key: 'phone', label: 'Telefon', type: 'tel', required: true, autocomplete: 'tel', hint: 'Kurir vas zove pre dostave.' },
  { key: 'email', label: 'E-mail', type: 'email', required: false, autocomplete: 'email' },
  { key: 'address', label: 'Adresa', type: 'text', required: true, autocomplete: 'street-address' },
  { key: 'city', label: 'Grad', type: 'text', required: true, autocomplete: 'address-level2', half: true },
  { key: 'postcode', label: 'Poštanski broj', type: 'text', required: false, autocomplete: 'postal-code', half: true },
]

async function submit() {
  if (submitting.value || !cart.lines.length) return

  submitting.value = true
  errors.value = {}
  failure.value = null

  try {
    const { data } = await client.post('/shop/orders', {
      lines: cart.lines.map((line) => ({ sku: line.sku, quantity: line.quantity })),
      customer: { ...form },
    })

    cart.clear()
    router.push({ name: 'thankyou', params: { reference: data.data.reference } })
  } catch (error) {
    const response = error.response

    if (response?.status === 422) {
      // Dingo returns a message bag; flatten it to one message per field.
      const bag = response.data?.errors ?? {}
      errors.value = Object.fromEntries(
        Object.entries(bag).map(([key, messages]) => [key.replace('customer.', ''), messages[0]]),
      )
    } else {
      failure.value = 'Porudžbina nije poslata. Pokušajte ponovo za koji trenutak.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="shell py-14 md:py-20">
    <h1 class="font-display text-4xl text-ink md:text-5xl">Poručivanje</h1>

    <div v-if="!cart.lines.length" class="py-20 text-center">
      <p class="font-display text-2xl text-mist-400">Korpa je prazna</p>
      <RouterLink :to="{ name: 'catalog' }" class="eyebrow mt-8 inline-block bg-ink px-9 py-4 text-paper">
        Pogledaj proizvode
      </RouterLink>
    </div>

    <form v-else class="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16" @submit.prevent="submit">
      <div>
        <p class="eyebrow text-blush-500">Podaci za dostavu</p>

        <div class="mt-7 grid gap-5 sm:grid-cols-2">
          <label
            v-for="field in fields"
            :key="field.key"
            :class="field.half ? 'sm:col-span-1' : 'sm:col-span-2'"
          >
            <span class="eyebrow text-mist-500">
              {{ field.label }}<span v-if="field.required" class="text-blush-500"> *</span>
            </span>
            <input
              v-model="form[field.key]"
              :type="field.type"
              :autocomplete="field.autocomplete"
              :aria-invalid="Boolean(errors[field.key])"
              class="mt-2 w-full border bg-paper px-4 py-3.5 text-base font-light text-ink transition-colors focus:outline-none"
              :class="errors[field.key] ? 'border-blush-500' : 'border-mist-200 focus:border-ink'"
            />
            <span v-if="errors[field.key]" class="mt-1.5 block text-xs text-blush-600">{{ errors[field.key] }}</span>
            <span v-else-if="field.hint" class="mt-1.5 block text-xs font-light text-mist-400">{{ field.hint }}</span>
          </label>

          <label class="sm:col-span-2">
            <span class="eyebrow text-mist-500">Napomena</span>
            <textarea
              v-model="form.note"
              rows="3"
              class="mt-2 w-full border border-mist-200 bg-paper px-4 py-3.5 text-base font-light text-ink focus:border-ink focus:outline-none"
            />
          </label>
        </div>

        <div class="mt-8 border border-mist-200 bg-blush-50 p-5">
          <p class="eyebrow text-blush-600">Plaćanje pouzećem</p>
          <p class="mt-2.5 text-sm font-light leading-relaxed text-mist-600">
            Ne plaćate ništa online. Iznos predajete kuriru kada paket stigne na vašu adresu.
          </p>
        </div>
      </div>

      <aside class="lg:sticky lg:top-28 lg:self-start">
        <div class="bg-mist-50 p-7">
          <h2 class="eyebrow text-mist-500">Vaša porudžbina</h2>

          <ul class="mt-6 space-y-4">
            <li v-for="line in cart.lines" :key="line.id" class="flex justify-between gap-4 text-sm font-light">
              <span class="min-w-0 text-mist-600">
                {{ line.name }}
                <span class="text-mist-400">×{{ line.quantity }}</span>
              </span>
              <span class="shrink-0 tabular-nums text-ink">{{ money(line.price * line.quantity) }}</span>
            </li>
          </ul>

          <div class="mt-6 flex justify-between border-t border-mist-200 pt-4 text-sm font-light text-mist-600">
            <span>Dostava</span>
            <span class="text-blush-600">Besplatno</span>
          </div>

          <div class="mt-4 flex items-baseline justify-between border-t border-mist-200 pt-5">
            <span class="eyebrow text-ink">Ukupno</span>
            <span class="font-display text-2xl tabular-nums text-ink">{{ money(cart.subtotal) }}</span>
          </div>

          <p v-if="failure" class="mt-5 text-sm text-blush-600">{{ failure }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="eyebrow mt-6 w-full bg-ink py-4.5 text-paper transition-colors duration-400 hover:bg-blush-500 disabled:opacity-55"
          >
            {{ submitting ? 'Šaljem…' : 'Potvrdi porudžbinu' }}
          </button>
        </div>
      </aside>
    </form>
  </div>
</template>

<script setup>
import { track } from '@/lib/tracking'
import client from '@/api/client'
import { money } from '@/lib/money'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useLoyaltyStore } from '@/stores/loyalty'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const loyalty = useLoyaltyStore()

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

/*
 * A Meva Klub coupon.
 *
 * Checked with the server before the order goes, so the summary can show the
 * discount and the new total; the server checks it again when the order is
 * placed, and that answer is the one that counts.
 */
const couponCode = ref('')
const coupon = ref(null)
const checkingCoupon = ref(false)

const discount = computed(() => Math.min(coupon.value?.value ?? 0, cart.subtotal))
const total = computed(() => cart.subtotal - discount.value)

// 1 point per 100 RSD, times the member's tier once we know it. Only an
// estimate: the points themselves are counted when the parcel is delivered.
const pointsEstimate = computed(() => Math.floor(Math.floor(total.value / 10000) * (loyalty.tier?.multiplier ?? 1)))

async function applyCoupon() {
  if (checkingCoupon.value || !couponCode.value.trim()) return

  checkingCoupon.value = true
  errors.value = { ...errors.value, coupon: null }

  try {
    coupon.value = await loyalty.checkCoupon(couponCode.value)
    couponCode.value = coupon.value.code
  } catch (problem) {
    coupon.value = null
    errors.value = { ...errors.value, coupon: problem.message }
  } finally {
    checkingCoupon.value = false
  }
}

/** The member's own coupons that can still be used, newest first. */
const activeCoupons = computed(() => loyalty.coupons.filter((c) => c.status === 'active'))

function useCoupon(code) {
  couponCode.value = code
  applyCoupon()
}

function removeCoupon() {
  coupon.value = null
  couponCode.value = ''
  errors.value = { ...errors.value, coupon: null }
}

onMounted(() => {
  if (auth.signedIn && !loyalty.loaded) loyalty.load()
})

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

  track.beginCheckout(cart.lines, cart.subtotal)

  submitting.value = true
  errors.value = {}
  failure.value = null

  try {
    const { data } = await client.post('/shop/orders', {
      lines: cart.lines.map((line) => ({ sku: line.sku, quantity: line.quantity })),
      customer: { ...form },
      ...(coupon.value ? { coupon: coupon.value.code } : {}),
    })

    cart.clear()
    track.purchase(data.data.reference, cart.lines, data.data.total ?? cart.subtotal)
    router.push({
      name: 'thankyou',
      params: { reference: data.data.reference },
      query: data.data.points_estimate > 0 ? { points: data.data.points_estimate } : {},
    })
  } catch (error) {
    const response = error.response

    if (response?.status === 422) {
      // Dingo returns a message bag; flatten it to one message per field.
      const bag = response.data?.errors ?? {}
      errors.value = Object.fromEntries(
        Object.entries(bag).map(([key, messages]) => [key.replace('customer.', ''), messages[0]]),
      )

      // A coupon the server turned down no longer takes anything off.
      if (errors.value.coupon) coupon.value = null
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
      <RouterLink :to="{ name: 'catalog' }" class="eyebrow mt-8 inline-block bg-blush-500 px-9 py-4 text-paper">
        Pogledaj proizvode
      </RouterLink>
    </div>

    <form v-else class="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16" @submit.prevent="submit">
      <div>
        <p class="eyebrow text-clay-500">Podaci za dostavu</p>

        <div class="mt-7 grid gap-5 sm:grid-cols-2">
          <label
            v-for="field in fields"
            :key="field.key"
            :class="field.half ? 'sm:col-span-1' : 'sm:col-span-2'"
          >
            <span class="eyebrow text-mist-500">
              {{ field.label }}<span v-if="field.required" class="text-clay-500"> *</span>
            </span>
            <input
              v-model="form[field.key]"
              :type="field.type"
              :autocomplete="field.autocomplete"
              :aria-invalid="Boolean(errors[field.key])"
              class="mt-2 w-full border bg-paper px-4 py-3.5 text-base font-light text-ink transition-colors focus:outline-none"
              :class="errors[field.key] ? 'border-clay-500' : 'border-mist-200 focus:border-ink'"
            />
            <span v-if="errors[field.key]" class="mt-1.5 block text-xs text-clay-600">{{ errors[field.key] }}</span>
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

        <div class="mt-8 border border-mist-200 bg-clay-50 p-5">
          <p class="eyebrow text-clay-600">Plaćanje pouzećem</p>
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
            <span class="text-mist-500">Plaća se kuriru</span>
          </div>

          <div v-if="coupon" class="mt-4 flex justify-between gap-4 text-sm font-light text-blush-600">
            <span class="min-w-0 truncate">Kupon <span class="font-mono">{{ coupon.code }}</span></span>
            <span class="shrink-0 tabular-nums">−{{ money(discount) }}</span>
          </div>

          <div class="mt-4 flex items-baseline justify-between border-t border-mist-200 pt-5">
            <span class="eyebrow text-ink">Ukupno</span>
            <span class="text-right">
              <span v-if="coupon" class="mr-2 text-sm font-light tabular-nums text-mist-400 line-through">{{ money(cart.subtotal) }}</span>
              <span class="font-display text-2xl tabular-nums text-ink">{{ money(total) }}</span>
            </span>
          </div>

          <!-- Meva Klub: a coupon for members, an invitation for everyone else. -->
          <div v-if="auth.signedIn" class="mt-6 border-t border-mist-200 pt-5">
            <label for="coupon" class="eyebrow text-mist-500">Kupon</label>
            <div class="mt-2 flex gap-2">
              <input
                id="coupon"
                v-model="couponCode"
                type="text"
                placeholder="MEVA-XXXX-XXXX"
                autocomplete="off"
                :readonly="Boolean(coupon)"
                :aria-invalid="Boolean(errors.coupon)"
                class="min-w-0 flex-1 border bg-paper px-3 py-2.5 font-mono text-sm uppercase tracking-wider text-ink focus:outline-none"
                :class="errors.coupon ? 'border-clay-500' : 'border-mist-200 focus:border-ink'"
                @keydown.enter.prevent="applyCoupon"
              />
              <button
                v-if="coupon"
                type="button"
                class="eyebrow shrink-0 border border-mist-300 px-4 text-mist-600 transition-colors hover:border-ink hover:text-ink"
                @click="removeCoupon"
              >Ukloni</button>
              <button
                v-else
                type="button"
                :disabled="checkingCoupon || !couponCode.trim()"
                class="eyebrow shrink-0 bg-ink px-4 text-paper transition-colors hover:bg-blush-600 disabled:opacity-45"
                @click="applyCoupon"
              >{{ checkingCoupon ? '…' : 'Primeni' }}</button>
            </div>
            <span v-if="errors.coupon" class="mt-1.5 block text-xs text-clay-600">{{ errors.coupon }}</span>
            <span v-else-if="coupon" class="mt-1.5 block text-xs text-sage-deep">Kupon je primenjen — {{ coupon.value_formatted }} popusta.</span>
            <template v-else>
              <div v-if="activeCoupons.length" class="mt-2.5">
                <p class="text-[0.6875rem] font-semibold uppercase tracking-wider text-mist-400">Vaši kuponi</p>
                <ul class="mt-1.5 flex flex-wrap gap-1.5">
                  <li v-for="c in activeCoupons" :key="c.code">
                    <button
                      type="button"
                      :disabled="checkingCoupon"
                      class="inline-flex items-baseline gap-2 rounded-full border border-blush-200 bg-paper px-3 py-1.5 text-xs transition-colors hover:border-blush-500 hover:bg-blush-50"
                      @click="useCoupon(c.code)"
                    >
                      <span class="font-mono tracking-wider text-ink">{{ c.code }}</span>
                      <span class="font-bold text-blush-600">{{ c.value_formatted }}</span>
                    </button>
                  </li>
                </ul>
              </div>
              <RouterLink v-else :to="{ name: 'loyalty' }" class="mt-1.5 block text-xs font-light text-mist-400 hover:text-blush-600">Vaši kuponi su u Meva Klubu →</RouterLink>
            </template>

            <p v-if="pointsEstimate > 0" class="mt-4 rounded-full bg-blush-50 px-4 py-2 text-center text-xs text-blush-600">
              Za ovu porudžbinu dobijate ~{{ pointsEstimate }} poena
            </p>
          </div>

          <p v-else class="mt-6 border-t border-mist-200 pt-5 text-xs font-light leading-relaxed text-mist-500">
            <RouterLink :to="{ name: 'login', query: { redirect: '/checkout' } }" class="text-blush-600 underline-offset-4 hover:underline">Prijavite se</RouterLink>
            i skupljajte poene — 1 poen na svakih 100 RSD.
          </p>

          <p v-if="failure" class="mt-5 text-sm text-clay-600">{{ failure }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="eyebrow mt-6 w-full bg-blush-500 py-4.5 text-paper transition-colors duration-400 hover:bg-blush-600 disabled:opacity-55"
          >
            {{ submitting ? 'Šaljem…' : 'Potvrdi porudžbinu' }}
          </button>
        </div>
      </aside>
    </form>
  </div>
</template>

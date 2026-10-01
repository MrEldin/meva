<script setup>
import { setMeta } from '@/lib/meta'
import { useAuthStore } from '@/stores/auth'
import { useLoyaltyStore } from '@/stores/loyalty'
import { computed, onMounted, ref } from 'vue'

/**
 * Meva Klub, from the member's side.
 *
 * The card at the top answers the only question most people come here with
 * -- how many points, and how far to the next tier. Everything below is what
 * they can do with them, what they already have, and how it all works.
 */
const auth = useAuthStore()
const loyalty = useLoyaltyStore()

const number = (value) => new Intl.NumberFormat('sr-RS').format(value ?? 0)
const when = (iso) => (iso ? new Date(iso).toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' }) : '')
const factor = (multiplier) => `×${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 2 }).format(multiplier ?? 1)}`

// Shown until the server answers, and as the rules if it never does.
const FALLBACK_TIERS = [
  { key: 'pupoljak', label: 'Pupoljak', at: 0, multiplier: 1 },
  { key: 'cvet', label: 'Cvet', at: 500, multiplier: 1.25 },
  { key: 'ruza', label: 'Ruža', at: 1500, multiplier: 1.5 },
]

const tiers = computed(() => (loyalty.tiers.length ? loyalty.tiers : FALLBACK_TIERS))
const progress = computed(() => Math.min(1, Math.max(0, loyalty.tier?.progress ?? 0)))

const STATUS = {
  active: { label: 'Aktivan', tone: 'bg-sage text-sage-deep' },
  used: { label: 'Iskorišćen', tone: 'bg-mist-100 text-mist-500' },
  expired: { label: 'Istekao', tone: 'bg-clay-100 text-clay-700' },
}

// Coupons that can still be spent first; within each group, newest first.
const coupons = computed(() =>
  [...loyalty.coupons].sort((a, b) => {
    const rank = (coupon) => (coupon.status === 'active' ? 0 : 1)

    return rank(a) - rank(b) || String(b.created_at).localeCompare(String(a.created_at))
  }),
)

const redeeming = ref(null)
const redeemError = ref(null)
const fresh = ref(null)
const copied = ref(null)

async function redeem(reward) {
  if (redeeming.value || !reward.affordable) return

  redeeming.value = reward.key
  redeemError.value = null
  fresh.value = null

  try {
    fresh.value = await loyalty.redeem(reward.key)
  } catch (failure) {
    redeemError.value = failure.message
  } finally {
    redeeming.value = null
  }
}

async function copy(code) {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = code
    setTimeout(() => (copied.value = null), 1800)
  } catch {
    // Without clipboard access the code is still on screen to copy by hand.
  }
}

onMounted(() => {
  setMeta({ title: 'Meva Klub' })

  if (!auth.user) auth.fetchUser()

  loyalty.load()
})
</script>

<template>
  <div class="shell py-14 lg:py-20">
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-forest/15 pb-6">
      <div>
        <RouterLink :to="{ name: 'account' }" class="eyebrow text-clay-500 hover:text-clay-700">← Moj nalog</RouterLink>
        <h1 class="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Meva Klub</h1>
        <p class="mt-2 max-w-xl text-sm text-forest/60">Svaka kupovina se vraća u poenima, a poeni u popustu na sledeću.</p>
      </div>
    </header>

    <p v-if="loyalty.loading && !loyalty.loaded" class="py-16 text-sm text-forest/50">Učitavanje…</p>

    <div v-else-if="loyalty.error && !loyalty.loaded" class="mt-10 rounded-[1.5rem] bg-sand p-8 text-center">
      <p class="text-forest/70">{{ loyalty.error }}</p>
      <button type="button" class="pill mt-5 bg-blush-500 text-paper hover:bg-blush-600" @click="loyalty.load()">Pokušaj ponovo</button>
    </div>

    <template v-else>
      <!-- ── The card ──────────────────────────────────────────────────── -->
      <section class="mt-10 grid gap-6 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-center">
        <div class="relative aspect-[1.586] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blush-200 via-blush-400 to-blush-700 p-6 text-paper shadow-[0_24px_60px_-24px_rgba(142,59,69,0.55)] sm:p-8">
          <!-- Soft light across the card, so it reads as an object and not a box. -->
          <span class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-paper/20 blur-2xl" />
          <span class="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-peach/40 blur-3xl" />

          <div class="relative flex h-full flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="kicker text-paper/80">Meva Klub</p>
                <p class="mt-1 font-display text-2xl italic sm:text-3xl">{{ loyalty.tier?.label ?? 'Pupoljak' }}</p>
              </div>
              <span class="rounded-full bg-paper/20 px-3 py-1.5 text-[0.75rem] font-bold backdrop-blur-sm">{{ factor(loyalty.tier?.multiplier) }} poena</span>
            </div>

            <div>
              <p class="font-display text-5xl leading-none tabular-nums sm:text-6xl">{{ number(loyalty.points) }}</p>
              <p class="kicker mt-2 text-paper/80">poena na raspolaganju</p>
            </div>

            <div>
              <div class="h-1.5 overflow-hidden rounded-full bg-paper/25">
                <div class="h-full rounded-full bg-paper transition-[width] duration-700" :style="{ width: `${progress * 100}%` }" />
              </div>
              <div class="mt-2 flex items-center justify-between gap-4 text-[0.8125rem] text-paper/90">
                <span v-if="loyalty.tier?.next">još {{ number(loyalty.tier.next.points_needed) }} poena do {{ loyalty.tier.next.label }}</span>
                <span v-else>Najviši nivo — hvala što ste uz nas.</span>
                <span class="truncate text-paper/75">{{ auth.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <p v-if="loyalty.pendingPoints > 0" class="rounded-[1.25rem] border border-blush-100 bg-blush-50 p-5 text-sm leading-relaxed text-forest/70">
            <span class="font-bold text-blush-600">+{{ number(loyalty.pendingPoints) }} poena na čekanju.</span>
            Stižu na vaš račun čim paket bude isporučen.
          </p>

          <dl class="grid grid-cols-2 gap-3">
            <div class="rounded-[1.25rem] border border-blush-100 p-5">
              <dt class="eyebrow text-forest/50">Ukupno sakupljeno</dt>
              <dd class="mt-2 font-display text-2xl tabular-nums">{{ number(loyalty.lifetimePoints) }}</dd>
            </div>
            <div class="rounded-[1.25rem] border border-blush-100 p-5">
              <dt class="eyebrow text-forest/50">Aktivni kuponi</dt>
              <dd class="mt-2 font-display text-2xl tabular-nums">{{ loyalty.coupons.filter((c) => c.status === 'active').length }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- ── Rewards ───────────────────────────────────────────────────── -->
      <section class="mt-16">
        <p class="kicker text-clay-500">Nagrade</p>
        <h2 class="mt-2 font-display text-3xl tracking-tight">Zamenite poene za popust</h2>

        <div v-if="fresh" class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-blush-100 p-5 sm:p-6">
          <div>
            <p class="eyebrow text-blush-600">Vaš novi kupon · {{ fresh.value_formatted }}</p>
            <p class="mt-2 font-mono text-xl tracking-wider text-ink sm:text-2xl">{{ fresh.code }}</p>
            <p class="mt-1 text-[0.8125rem] text-forest/60">Važi do {{ when(fresh.expires_at) }}. Unesite ga pri poručivanju.</p>
          </div>
          <button type="button" class="pill bg-blush-500 text-paper hover:bg-blush-600" @click="copy(fresh.code)">
            {{ copied === fresh.code ? 'Kopirano ✓' : 'Kopiraj kod' }}
          </button>
        </div>

        <p v-if="redeemError" class="mt-4 text-sm text-clay-600">{{ redeemError }}</p>

        <ul class="mt-6 grid gap-4 sm:grid-cols-3">
          <li v-for="reward in loyalty.rewards" :key="reward.key" class="flex flex-col rounded-[1.5rem] border border-blush-100 p-6">
            <p class="eyebrow text-forest/50">{{ number(reward.points) }} poena</p>
            <p class="mt-3 font-display text-3xl text-ink">{{ reward.value_formatted }}</p>
            <p class="mt-1 text-sm text-forest/60">{{ reward.label }}</p>

            <button
              type="button"
              class="pill mt-6 justify-center bg-blush-500 text-paper hover:bg-blush-600 disabled:cursor-not-allowed disabled:bg-blush-100 disabled:text-blush-400"
              :disabled="!reward.affordable || Boolean(redeeming)"
              @click="redeem(reward)"
            >
              {{ redeeming === reward.key ? 'Pravim kupon…' : 'Iskoristi' }}
            </button>
            <p v-if="!reward.affordable" class="mt-2 text-center text-[0.75rem] text-forest/45">
              Nedostaje još {{ number(reward.points - loyalty.points) }} poena
            </p>
          </li>
        </ul>
      </section>

      <!-- ── Coupons ───────────────────────────────────────────────────── -->
      <section class="mt-16">
        <p class="kicker text-clay-500">Kuponi</p>
        <h2 class="mt-2 font-display text-3xl tracking-tight">Moji kuponi</h2>

        <p v-if="!coupons.length" class="mt-6 rounded-[1.5rem] bg-sand p-8 text-center text-sm text-forest/65">
          Još nemate kupona. Kad sakupite 200 poena, zamenite ih za prvi popust.
        </p>

        <ul v-else class="mt-6 divide-y divide-blush-100 overflow-hidden rounded-[1.5rem] border border-blush-100">
          <li v-for="coupon in coupons" :key="coupon.code" class="flex flex-wrap items-center gap-x-5 gap-y-2 p-5" :class="coupon.status !== 'active' && 'opacity-70'">
            <span class="font-mono text-base tracking-wider text-ink">{{ coupon.code }}</span>
            <span class="eyebrow rounded-full px-3 py-1.5 text-[0.5rem]" :class="STATUS[coupon.status]?.tone ?? 'bg-mist-100'">{{ STATUS[coupon.status]?.label ?? coupon.status }}</span>
            <span class="ml-auto font-display text-xl tabular-nums">{{ coupon.value_formatted }}</span>
            <span class="w-full text-[0.8125rem] text-forest/55 sm:w-auto">
              <template v-if="coupon.status === 'used'">Iskorišćen {{ when(coupon.used_at) }}</template>
              <template v-else-if="coupon.status === 'expired'">Istekao {{ when(coupon.expires_at) }}</template>
              <template v-else>Važi do {{ when(coupon.expires_at) }}</template>
            </span>
            <button v-if="coupon.status === 'active'" type="button" class="text-[0.8125rem] font-bold text-clay-600 hover:text-clay-700" @click="copy(coupon.code)">
              {{ copied === coupon.code ? 'Kopirano ✓' : 'Kopiraj' }}
            </button>
          </li>
        </ul>
      </section>

      <!-- ── How it works ──────────────────────────────────────────────── -->
      <section class="mt-16 rounded-[1.75rem] bg-blush-50 p-6 sm:p-10">
        <p class="kicker text-clay-500">Pravila</p>
        <h2 class="mt-2 font-display text-3xl tracking-tight">Kako funkcioniše</h2>

        <ol class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <li>
            <p class="font-display text-2xl text-blush-500">01</p>
            <p class="mt-2 text-[0.9375rem] font-bold text-ink">Kupujete</p>
            <p class="mt-1 text-sm leading-relaxed text-forest/65">1 poen na svakih 100 RSD. Poeni su na čekanju dok paket ne stigne, a onda su vaši.</p>
          </li>
          <li>
            <p class="font-display text-2xl text-blush-500">02</p>
            <p class="mt-2 text-[0.9375rem] font-bold text-ink">Dobrodošlica</p>
            <p class="mt-1 text-sm leading-relaxed text-forest/65">Za otvaranje naloga dobijate 100 poena na poklon.</p>
          </li>
          <li>
            <p class="font-display text-2xl text-blush-500">03</p>
            <p class="mt-2 text-[0.9375rem] font-bold text-ink">Rastete</p>
            <p class="mt-1 text-sm leading-relaxed text-forest/65">Što više sakupite ukupno, viši je nivo — i svaka kupovina donosi više poena.</p>
          </li>
          <li>
            <p class="font-display text-2xl text-blush-500">04</p>
            <p class="mt-2 text-[0.9375rem] font-bold text-ink">Trošite</p>
            <p class="mt-1 text-sm leading-relaxed text-forest/65">Poene menjate za kupon MEVA-XXXX-XXXX. Važi 90 dana, jednom, pri poručivanju.</p>
          </li>
        </ol>

        <div class="mt-10 grid gap-4 md:grid-cols-2">
          <div class="rounded-[1.25rem] bg-paper p-5">
            <p class="eyebrow text-forest/50">Nivoi</p>
            <ul class="mt-3 space-y-2 text-sm">
              <li v-for="item in tiers" :key="item.key" class="flex justify-between gap-4" :class="item.key === loyalty.tier?.key && 'font-bold text-blush-600'">
                <span>{{ item.label }} <span class="font-normal text-forest/50">· od {{ number(item.at) }} poena</span></span>
                <span class="tabular-nums">{{ factor(item.multiplier) }} poena</span>
              </li>
            </ul>
          </div>
          <div class="rounded-[1.25rem] bg-paper p-5">
            <p class="eyebrow text-forest/50">Nagrade</p>
            <ul class="mt-3 space-y-2 text-sm">
              <li class="flex justify-between gap-4"><span>200 poena</span><span class="tabular-nums">300 RSD popusta</span></li>
              <li class="flex justify-between gap-4"><span>400 poena</span><span class="tabular-nums">700 RSD popusta</span></li>
              <li class="flex justify-between gap-4"><span>800 poena</span><span class="tabular-nums">1.500 RSD popusta</span></li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ── History ───────────────────────────────────────────────────── -->
      <section class="mt-16">
        <p class="kicker text-clay-500">Istorija</p>
        <h2 class="mt-2 font-display text-3xl tracking-tight">Istorija poena</h2>

        <p v-if="!loyalty.history.length" class="mt-6 text-sm text-forest/55">Još nema promena.</p>

        <ul v-else class="mt-6 divide-y divide-blush-100 border-y border-blush-100">
          <li v-for="entry in loyalty.history" :key="entry.id" class="flex items-center justify-between gap-4 py-4">
            <div class="min-w-0">
              <p class="truncate text-[0.9375rem] text-ink">{{ entry.label }}</p>
              <p class="mt-0.5 text-[0.8125rem] text-forest/50">
                {{ when(entry.created_at) }}<template v-if="entry.order_reference"> · <span class="font-mono">{{ entry.order_reference }}</span></template>
              </p>
            </div>
            <span class="shrink-0 font-display text-xl tabular-nums" :class="entry.points >= 0 ? 'text-sage-deep' : 'text-clay-600'">
              {{ entry.points >= 0 ? '+' : '−' }}{{ number(Math.abs(entry.points)) }}
            </span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

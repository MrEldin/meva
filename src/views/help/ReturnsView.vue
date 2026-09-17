<script setup>
import HelpFooter from '@/components/help/HelpFooter.vue'
import PageHead from '@/components/layout/PageHead.vue'
import { setMeta } from '@/lib/meta'
import { onMounted } from 'vue'

/**
 * Two different things, told apart on purpose.
 *
 * Changing your mind is a withdrawal: fourteen days, no reason owed, the
 * parcel goes back at the buyer's cost and unopened. Something wrong with
 * the order is a complaint: nothing is paid by the buyer at all. People
 * arrive here worried and conflate the two, so the page separates them
 * before it explains either.
 */
const SHORT = [
  { title: '14 dana', text: 'Toliko imate da odustanete od kupovine, bez objašnjenja.', icon: 'clock' },
  { title: 'Greška je naša', text: 'Ako je stiglo oštećeno ili pogrešno, šaljemo novo — o našem trošku.', icon: 'shield' },
  { title: 'Povraćaj u 14 dana', text: 'Novac vraćamo na račun, u roku od 14 dana od prijema robe.', icon: 'cash' },
]

const CLAIM = [
  'Pišite nam u roku od 14 dana od prijema, sa brojem porudžbine i fotografijom ako je nešto vidljivo.',
  'Odgovaramo u roku od 8 dana sa odlukom, kako zakon nalaže.',
  'Ako je reklamacija osnovana, šaljemo zamenu ili vraćamo novac — kako vam više odgovara. Slanje plaćamo mi.',
]

onMounted(() => setMeta({
  title: 'Povrat i reklamacije',
  description: 'Kako vratiti proizvod, rok za odustajanje i šta da radite ako nešto nije u redu sa porudžbinom.',
}))
</script>

<template>
  <div class="bg-paper">
    <PageHead
      title="Povrat i reklamacije"
      note="Ako nešto nije kako treba, javite nam i rešićemo. Ovde piše tačno kako, i ko šta plaća."
      :facts="['14 dana za odustajanje', 'Zamena o našem trošku', 'Odgovor u 8 dana']"
    />

    <div class="shell max-w-4xl py-10 lg:py-16">
      <ul class="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <li v-for="item in SHORT" :key="item.title" class="rounded-[1.5rem] bg-blush-50 p-5 sm:p-6">
          <span class="grid h-11 w-11 place-items-center rounded-full bg-paper text-blush-700" aria-hidden="true">
            <svg v-if="item.icon === 'clock'" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.4 2" /></svg>
            <svg v-else-if="item.icon === 'shield'" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 19 6v6c0 4.2-2.9 7.5-7 8.8-4.1-1.3-7-4.6-7-8.8V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>
            <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></svg>
          </span>
          <h2 class="mt-3.5 font-display text-[1.25rem] leading-tight text-ink">{{ item.title }}</h2>
          <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/70">{{ item.text }}</p>
        </li>
      </ul>

      <!-- The two cases, side by side, because people mix them up -->
      <div class="mt-12 grid gap-4 lg:grid-cols-2">
        <section class="rounded-[1.5rem] bg-paper p-6 ring-1 ring-blush-100 sm:p-7">
          <p class="kicker text-blush-600">Predomislili ste se</p>
          <h2 class="mt-2 font-display text-[1.5rem] leading-tight text-ink">Odustajanje od kupovine</h2>
          <p class="mt-3 text-[0.9375rem] leading-relaxed text-ink/70">
            Po Zakonu o zaštiti potrošača imate pravo da u roku od 14 dana od prijema paketa odustanete od kupovine,
            bez navođenja razloga. Javite nam se sa brojem porudžbine i poslaćemo vam obrazac.
          </p>
          <ul class="mt-4 space-y-2.5 text-[0.9375rem] leading-relaxed text-ink/70">
            <li class="flex gap-2.5"><span class="mt-[0.4375rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blush-400" />Proizvod treba da bude neotvoren i u originalnom pakovanju.</li>
            <li class="flex gap-2.5"><span class="mt-[0.4375rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blush-400" />Otvorenu kozmetiku ne možemo primiti nazad iz higijenskih razloga.</li>
            <li class="flex gap-2.5"><span class="mt-[0.4375rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blush-400" />Troškove vraćanja u ovom slučaju snosi kupac.</li>
          </ul>
        </section>

        <section class="rounded-[1.5rem] bg-blush-50 p-6 sm:p-7">
          <p class="kicker text-blush-600">Nešto nije u redu</p>
          <h2 class="mt-2 font-display text-[1.5rem] leading-tight text-ink">Reklamacija</h2>
          <p class="mt-3 text-[0.9375rem] leading-relaxed text-ink/70">
            Ako je proizvod stigao oštećen, ako ste dobili pogrešnu stvar ili ako sa preparatom nešto nije u redu —
            to je reklamacija, ne povrat, i tu ne plaćate ništa.
          </p>
          <ol class="mt-4 space-y-3">
            <li v-for="(line, i) in CLAIM" :key="i" class="flex gap-3 text-[0.9375rem] leading-relaxed text-ink/70">
              <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blush-600 text-[0.6875rem] font-bold text-paper">{{ i + 1 }}</span>
              {{ line }}
            </li>
          </ol>
        </section>
      </div>

      <section class="mt-4 rounded-[1.5rem] bg-paper p-6 ring-1 ring-blush-100 sm:p-7">
        <h2 class="font-display text-[1.375rem] leading-tight text-ink">Vraćanje novca</h2>
        <p class="mt-2.5 text-[0.9375rem] leading-relaxed text-ink/70">
          Novac vraćamo na tekući račun koji nam pošaljete, najkasnije 14 dana od dana kada roba stigne nazad kod nas.
          Pošto se plaća pouzećem, povraćaj ide isključivo uplatom na račun.
        </p>
        <p class="mt-5 border-t border-blush-100 pt-5 text-[0.9375rem] leading-relaxed text-ink/70">
          <span class="font-semibold text-ink">Kome se javljate:</span><br />
          Meva Kozmetika · Miloša Obilića 20, 36300 Novi Pazar<br />
          <a href="mailto:porudzbine@meva.life" class="font-semibold text-blush-700 underline underline-offset-4 hover:text-blush-600">porudzbine@meva.life</a>
        </p>
      </section>

      <HelpFooter current="returns" />
    </div>
  </div>
</template>

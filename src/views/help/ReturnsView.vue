<script setup>
import PageHead from '@/components/layout/PageHead.vue'
import { setMeta } from '@/lib/meta'
import { onMounted } from 'vue'

onMounted(() => setMeta({
  title: 'Povrat i reklamacije',
  description: 'Kako vratiti proizvod, rok za odustajanje i šta da radite ako nešto nije u redu sa porudžbinom.',
}))
</script>

<template>
  <div>
    <PageHead
      title="Povrat i reklamacije"
      note="Ako nešto nije kako treba, javite nam i rešićemo. Ovde piše tačno kako."
    />

    <div class="shell max-w-3xl py-10 lg:py-14">
      <section class="rounded-2xl bg-blush-50 p-6">
        <h2 class="text-lg font-bold">Ukratko</h2>
        <ul class="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-mist-600">
          <li class="flex gap-2.5"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blush-500" /> Imate 14 dana da odustanete od kupovine, bez objašnjenja.</li>
          <li class="flex gap-2.5"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blush-500" /> Ako je proizvod oštećen ili pogrešan, šaljemo novi o našem trošku.</li>
          <li class="flex gap-2.5"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blush-500" /> Novac vraćamo u roku od 14 dana od prijema robe.</li>
        </ul>
      </section>

      <section class="mt-10">
        <h2 class="text-xl font-bold">Odustajanje od kupovine</h2>
        <p class="mt-3 text-[0.9375rem] leading-relaxed text-mist-600">
          Po Zakonu o zaštiti potrošača imate pravo da u roku od 14 dana od prijema paketa odustanete od kupovine,
          bez navođenja razloga. Javite nam se na <a href="mailto:porudzbine@meva.life" class="font-semibold text-blush-500 underline underline-offset-4">porudzbine@meva.life</a>
          sa brojem porudžbine i poslaćemo vam obrazac.
        </p>
        <p class="mt-3 text-[0.9375rem] leading-relaxed text-mist-600">
          Proizvod treba da bude neotvoren i u originalnom pakovanju. Otvorenu kozmetiku ne možemo primiti nazad
          iz higijenskih razloga, osim ako je u pitanju greška sa naše strane ili reklamacija na kvalitet.
          Troškove vraćanja u slučaju odustajanja snosi kupac.
        </p>
      </section>

      <section class="mt-10">
        <h2 class="text-xl font-bold">Reklamacija</h2>
        <p class="mt-3 text-[0.9375rem] leading-relaxed text-mist-600">
          Ako je proizvod stigao oštećen, ako ste dobili pogrešnu stvar ili ako sa preparatom nešto nije u redu —
          to je reklamacija, ne povrat, i tu ne plaćate ništa.
        </p>
        <ol class="mt-4 space-y-3">
          <li class="flex gap-3 text-[0.9375rem] leading-relaxed text-mist-600">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">1</span>
            Pišite nam u roku od 14 dana od prijema, sa brojem porudžbine i fotografijom ako je nešto vidljivo.
          </li>
          <li class="flex gap-3 text-[0.9375rem] leading-relaxed text-mist-600">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">2</span>
            Odgovaramo u roku od 8 dana sa odlukom, kako zakon nalaže.
          </li>
          <li class="flex gap-3 text-[0.9375rem] leading-relaxed text-mist-600">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">3</span>
            Ako je reklamacija osnovana, šaljemo zamenu ili vraćamo novac — kako vam više odgovara. Slanje plaćamo mi.
          </li>
        </ol>
      </section>

      <section class="mt-10">
        <h2 class="text-xl font-bold">Vraćanje novca</h2>
        <p class="mt-3 text-[0.9375rem] leading-relaxed text-mist-600">
          Novac vraćamo na tekući račun koji nam pošaljete, najkasnije 14 dana od dana kada roba stigne nazad kod nas.
          Pošto se plaća pouzećem, povraćaj ide isključivo uplatom na račun.
        </p>
      </section>

      <section class="mt-10 rounded-2xl border border-mist-200 p-6">
        <h2 class="text-lg font-bold">Kome se javljate</h2>
        <p class="mt-2 text-[0.9375rem] leading-relaxed text-mist-600">
          Meva Kozmetika · Miloša Obilića 20, 36300 Novi Pazar<br />
          <a href="mailto:porudzbine@meva.life" class="font-semibold text-blush-500 underline underline-offset-4">porudzbine@meva.life</a>
        </p>
      </section>
    </div>
  </div>
</template>

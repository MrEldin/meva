<script setup>
import PageHead from '@/components/layout/PageHead.vue'
import { setMeta } from '@/lib/meta'
import { onMounted } from 'vue'

const STEPS = [
  { n: '01', title: 'Poručite', text: 'Bez naloga ako ne želite. Potrebni su ime, adresa i broj telefona.' },
  { n: '02', title: 'Pakujemo', text: 'Svaki paket pakujemo ručno i predajemo kurirskoj službi.' },
  { n: '03', title: 'Kurir zove', text: 'Kurirska služba vas pozove pre isporuke. Paket stiže na adresu.' },
  { n: '04', title: 'Plaćate kuriru', text: 'Pouzećem, kad primite paket. Ništa se ne plaća unapred.' },
]

onMounted(() => setMeta({
  title: 'Dostava',
  description: 'Besplatna dostava u celoj Srbiji, bez minimalnog iznosa; plaćanje pouzećem kuriru.',
}))
</script>

<template>
  <div>
    <PageHead title="Dostava" note="Besplatna u celoj Srbiji, bez minimalnog iznosa. Plaćate kuriru pri preuzimanju." />

    <div class="shell max-w-3xl py-10 lg:py-14">
      <ol class="grid gap-4 sm:grid-cols-2">
        <li v-for="step in STEPS" :key="step.n" class="rounded-2xl border border-mist-200 p-6">
          <span class="font-mono text-sm text-blush-500">{{ step.n }}</span>
          <h2 class="mt-2 text-lg font-bold">{{ step.title }}</h2>
          <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-mist-600">{{ step.text }}</p>
        </li>
      </ol>

      <dl class="mt-10 divide-y divide-mist-200 border-y border-mist-200">
        <div class="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
          <dt class="text-[0.9375rem] font-semibold">Cena dostave</dt>
          <dd class="text-[0.9375rem] text-mist-600">Besplatna, za svaku porudžbinu i za celu Srbiju.</dd>
        </div>
        <div class="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
          <dt class="text-[0.9375rem] font-semibold">Rok isporuke</dt>
          <dd class="text-[0.9375rem] text-mist-600">Zavisi od kurirske službe i vašeg mesta; kurir vas pozove pre isporuke.</dd>
        </div>
        <div class="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
          <dt class="text-[0.9375rem] font-semibold">Plaćanje</dt>
          <dd class="text-[0.9375rem] text-mist-600">Pouzećem — kuriru, kad paket stigne. Ne tražimo ništa unapred.</dd>
        </div>
        <div class="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
          <dt class="text-[0.9375rem] font-semibold">Praćenje</dt>
          <dd class="text-[0.9375rem] text-mist-600">
            Broj porudžbine dobijete odmah. Unesite ga na
            <RouterLink :to="{ name: 'track' }" class="font-semibold text-blush-500 underline underline-offset-4">stranici za praćenje</RouterLink>
            u bilo kom trenutku.
          </dd>
        </div>
        <div class="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
          <dt class="text-[0.9375rem] font-semibold">Inostranstvo</dt>
          <dd class="text-[0.9375rem] text-mist-600">Šaljemo i u Crnu Goru, Bosnu i Hercegovinu i zemlje EU — kupci nam odatle redovno poručuju. Pišite nam pre porudžbine da dogovorimo dostavu.</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

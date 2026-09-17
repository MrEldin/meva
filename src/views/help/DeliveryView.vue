<script setup>
import HelpFooter from '@/components/help/HelpFooter.vue'
import PageHead from '@/components/layout/PageHead.vue'
import { setMeta } from '@/lib/meta'
import { onMounted } from 'vue'

/**
 * How a parcel gets here, and what it costs -- which is nothing.
 *
 * The archive of orders placed through the website -- 5,479 of them -- shows
 * no delivery charge on any but the first day's setup test, every one paid to
 * the courier, and 88 going abroad. The total on this page is larger than
 * that archive because the shop has sold since 2010 through more than the
 * website; the figure is Eldin's. The one thing neither records is how long
 * delivery takes, so this page does not say.
 */
const STEPS = [
  { title: 'Poručite', text: 'Bez naloga, ako ne želite. Potrebni su ime, adresa i broj telefona.', icon: 'cart' },
  { title: 'Pakujemo ručno', text: 'Svaki paket pakujemo sami i predajemo kurirskoj službi.', icon: 'box' },
  { title: 'Kurir vas zove', text: 'Kurirska služba se javi pre isporuke i donosi paket na adresu.', icon: 'phone' },
  { title: 'Plaćate kuriru', text: 'Pouzećem, kad primite paket. Ništa se ne plaća unapred.', icon: 'cash' },
]

const FACTS = [
  ['Cena dostave', 'Besplatna — za svaku porudžbinu, u celoj Srbiji, bez minimalnog iznosa.'],
  ['Plaćanje', 'Pouzećem, kuriru, kad paket stigne. Ne tražimo ništa unapred i ne čuvamo podatke o kartici.'],
  ['Rok isporuke', 'Zavisi od kurirske službe i vašeg mesta. Kurir vas pozove pre isporuke.'],
  ['Inostranstvo', 'Šaljemo i u Crnu Goru, Bosnu i Hercegovinu i zemlje EU — odatle nam redovno poručuju. Pišite nam pre porudžbine da dogovorimo dostavu.'],
]

onMounted(() => setMeta({
  title: 'Dostava',
  description: 'Besplatna dostava u celoj Srbiji, bez minimalnog iznosa; plaćanje pouzećem kuriru.',
}))
</script>

<template>
  <div class="bg-paper">
    <PageHead
      title="Dostava"
      note="Besplatna u celoj Srbiji, bez minimalnog iznosa. Plaćate kuriru kad paket stigne na vrata."
      :facts="['Besplatno u celoj Srbiji', 'Plaćanje pouzećem', 'Bez minimalnog iznosa']"
    />

    <div class="shell max-w-4xl py-10 lg:py-16">
      <!-- What the archive says, in one line -->
      <div class="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <div class="rounded-[1.25rem] bg-blush-50 p-5 text-center">
          <p class="font-display text-[2rem] leading-none text-blush-700">0 RSD</p>
          <p class="mt-2 text-[0.8125rem] font-semibold text-ink/65">dostava, bez obzira na iznos</p>
        </div>
        <div class="rounded-[1.25rem] bg-blush-50 p-5 text-center">
          <p class="font-display text-[2rem] leading-none text-blush-700">90.000+</p>
          <p class="mt-2 text-[0.8125rem] font-semibold text-ink/65">porudžbina poslato od 2010.</p>
        </div>
        <div class="rounded-[1.25rem] bg-blush-50 p-5 text-center">
          <p class="font-display text-[2rem] leading-none text-blush-700">2010.</p>
          <p class="mt-2 text-[0.8125rem] font-semibold text-ink/65">od te godine šaljemo pakete</p>
        </div>
      </div>

      <!-- The journey -->
      <h2 class="mt-12 font-display text-[1.5rem] leading-tight text-ink sm:text-[1.75rem]">Kako ide, korak po korak</h2>

      <ol class="relative mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <span class="pointer-events-none absolute left-0 right-0 top-[1.625rem] hidden h-px bg-gradient-to-r from-peach via-blush-300 to-peach lg:block" aria-hidden="true" />

        <li v-for="(step, i) in STEPS" :key="step.title" class="relative">
          <span class="relative grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full bg-paper text-blush-700 ring-1 ring-blush-200">
            <svg v-if="step.icon === 'cart'" viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16l-1.3 12.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8Z" /><path d="M8.5 7V5.8a3.5 3.5 0 0 1 7 0V7" /></svg>
            <svg v-else-if="step.icon === 'box'" viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5 3.5 16.5z" /><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" /></svg>
            <svg v-else-if="step.icon === 'phone'" viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" /></svg>
            <svg v-else viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></svg>
            <span class="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-blush-600 text-[0.625rem] font-bold text-paper">{{ i + 1 }}</span>
          </span>

          <h3 class="mt-3.5 font-display text-[1.125rem] leading-tight text-ink">{{ step.title }}</h3>
          <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/65">{{ step.text }}</p>
        </li>
      </ol>

      <!-- The detail -->
      <h2 class="mt-12 font-display text-[1.5rem] leading-tight text-ink sm:text-[1.75rem]">Sitna slova, bez sitnih slova</h2>

      <dl class="mt-5 overflow-hidden rounded-[1.5rem] ring-1 ring-blush-100">
        <div
          v-for="([term, text], i) in FACTS"
          :key="term"
          class="grid gap-1 px-5 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-6"
          :class="i % 2 ? 'bg-paper' : 'bg-blush-50/50'"
        >
          <dt class="font-display text-[1.0625rem] text-ink">{{ term }}</dt>
          <dd class="text-[0.9375rem] leading-relaxed text-ink/70">{{ text }}</dd>
        </div>
      </dl>

      <p class="mt-5 flex items-start gap-3 rounded-[1.25rem] bg-blush-50 p-5 text-[0.9375rem] leading-relaxed text-ink/70">
        <svg viewBox="0 0 24 24" class="mt-0.5 h-5 w-5 shrink-0 text-blush-600" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.1" /></svg>
        <span>
          Broj porudžbine dobijete odmah po poručivanju. Unesite ga na
          <RouterLink :to="{ name: 'track' }" class="font-semibold text-blush-700 underline underline-offset-4 hover:text-blush-600">stranici za praćenje</RouterLink>
          u bilo kom trenutku.
        </span>
      </p>

      <HelpFooter current="delivery" />
    </div>
  </div>
</template>

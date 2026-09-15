<script setup>
import PageHead from '@/components/layout/PageHead.vue'
import { setMeta } from '@/lib/meta'
import { onMounted, ref } from 'vue'

/**
 * The questions that actually arrive, answered plainly.
 *
 * Written from what customers ask on the phone and in messages, not from a
 * template, which is why there is nothing here about shipping to Australia.
 */
const GROUPS = [
  {
    title: 'O preparatima',
    items: [
      ['Koliko traje jedno pakovanje?', 'Zavisi od preparata i koliko ga koristite. Šampon od 200 ml traje otprilike dva meseca uz pranje svaki drugi dan. Losion od 100 ml, ako se koristi svake večeri, oko šest nedelja.'],
      ['Kada se vide prvi rezultati?', 'Kod seboreje i peruti obično posle deset do četrnaest dana redovne upotrebe. Kod psorijaze i ekcema sporije, računajte na tri do četiri nedelje. Ako posle mesec dana nema razlike, javite nam se i predložićemo nešto drugo.'],
      ['Mogu li da koristim uz terapiju koju mi je propisao lekar?', 'Naši preparati su kozmetika, ne lek, i ne zamenjuju terapiju. Većina ljudi ih koristi uporedo bez problema, ali ako ste na lokalnoj terapiji za kožu, pitajte svog dermatologa.'],
      ['Ima li sulfata, parabena ili silikona?', 'Nema. Ceo sastav je ispisan punim imenom na svakoj etiketi i na stranici proizvoda, pa možete proveriti sami.'],
      ['Da li je bezbedno u trudnoći?', 'Većina preparata jeste, ali neki sadrže eterična ulja koja se u trudnoći izbegavaju. Napišite nam koji vas zanima i reći ćemo tačno.'],
      ['Kako se čuvaju?', 'Na sobnoj temperaturi, van direktnog sunca. Ne treba ih držati u frižideru. Rok upotrebe i datum proizvodnje su odštampani na pakovanju.'],
    ],
  },
  {
    title: 'O poručivanju',
    items: [
      ['Moram li da otvorim nalog?', 'Ne. Možete poručiti kao gost, potrebni su samo ime, adresa i telefon. Nalog služi ako želite da vidite ranije porudžbine i da ne kucate adresu svaki put.'],
      ['Kako znam da je porudžbina primljena?', 'Odmah posle poručivanja dobijete broj porudžbine na ekranu i na mejl. Taj broj možete uneti na stranici „Praćenje porudžbine" u svakom trenutku.'],
      ['Mogu li da promenim ili otkažem porudžbinu?', 'Dok paket nije predat kuriru, možete. Pozovite nas ili pišite što pre, sa brojem porudžbine.'],
      ['Da li izdajete račun?', 'Da, račun ide u paketu. Ako vam treba račun na firmu, napišite podatke u napomeni pri poručivanju.'],
    ],
  },
]

const open = ref(new Set(['0-0']))

function toggle(key) {
  open.value.has(key) ? open.value.delete(key) : open.value.add(key)
  open.value = new Set(open.value)
}

onMounted(() => {
  setMeta({
    title: 'Česta pitanja',
    description: 'Odgovori na pitanja o preparatima Meva Kozmetike, poručivanju, dostavi i upotrebi.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: GROUPS.flatMap((g) => g.items).map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  })
})
</script>

<template>
  <div>
    <PageHead title="Česta pitanja" note="Ako ne nađete odgovor, pišite nam — javljamo se isti dan." />

    <div class="shell max-w-3xl py-10 lg:py-14">
      <section v-for="(group, gi) in GROUPS" :key="group.title" class="mb-10 last:mb-0">
        <h2 class="text-xl font-bold">{{ group.title }}</h2>

        <ul class="mt-4 divide-y divide-mist-200 border-y border-mist-200">
          <li v-for="(item, ii) in group.items" :key="item[0]">
            <button
              type="button"
              class="flex w-full items-start justify-between gap-4 py-4 text-left"
              :aria-expanded="open.has(`${gi}-${ii}`)"
              @click="toggle(`${gi}-${ii}`)"
            >
              <span class="text-[0.9375rem] font-semibold leading-snug">{{ item[0] }}</span>
              <span
                class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-mist-300 transition-transform duration-300"
                :class="open.has(`${gi}-${ii}`) && 'rotate-45 border-ink bg-ink text-paper'"
              >
                <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10" stroke-linecap="round" /></svg>
              </span>
            </button>

            <p v-if="open.has(`${gi}-${ii}`)" class="pb-5 pr-10 text-[0.9375rem] leading-relaxed text-mist-600">{{ item[1] }}</p>
          </li>
        </ul>
      </section>

      <div class="rounded-2xl bg-shell p-6 text-center">
        <p class="text-[0.9375rem] font-semibold">Niste našli odgovor?</p>
        <p class="mt-1 text-sm text-mist-600">Pišite nam na <a href="mailto:porudzbine@meva.life" class="font-semibold text-blush-500 underline underline-offset-4">porudzbine@meva.life</a></p>
      </div>
    </div>
  </div>
</template>

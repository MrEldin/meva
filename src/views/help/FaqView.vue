<script setup>
import HelpFooter from '@/components/help/HelpFooter.vue'
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
  <div class="bg-paper">
    <PageHead
      title="Česta pitanja"
      note="Ono što nas kupci zaista pitaju, odgovoreno kratko. Ako ne nađete odgovor, pišite nam — javljamo se isti dan."
      :facts="['Bez sulfata i parabena', 'Poručivanje bez naloga', 'Račun ide u paketu']"
    />

    <div class="shell max-w-3xl py-10 lg:py-16">
      <section v-for="(group, gi) in GROUPS" :key="group.title" class="mb-10 last:mb-0">
        <div class="flex items-center gap-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blush-50 text-blush-700" aria-hidden="true">
            <svg v-if="gi === 0" viewBox="0 0 24 24" class="h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v3.5l3 4.5v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8l3-4.5z" /><path d="M6.5 14h11" /></svg>
            <svg v-else viewBox="0 0 24 24" class="h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16l-1.3 12.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8Z" /><path d="M8.5 7V5.8a3.5 3.5 0 0 1 7 0V7" /></svg>
          </span>
          <h2 class="font-display text-[1.375rem] leading-tight text-ink sm:text-[1.5rem]">{{ group.title }}</h2>
        </div>

        <ul class="mt-4 space-y-2.5">
          <li
            v-for="(item, ii) in group.items"
            :key="item[0]"
            class="overflow-hidden rounded-[1.25rem] bg-paper ring-1 transition-colors duration-300"
            :class="open.has(`${gi}-${ii}`) ? 'bg-blush-50/60 ring-blush-200' : 'ring-blush-100'"
          >
            <button
              type="button"
              class="flex w-full items-start justify-between gap-4 p-5 text-left"
              :aria-expanded="open.has(`${gi}-${ii}`)"
              @click="toggle(`${gi}-${ii}`)"
            >
              <span class="text-[0.9375rem] font-semibold leading-snug text-ink sm:text-base">{{ item[0] }}</span>
              <span
                class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-300"
                :class="open.has(`${gi}-${ii}`) ? 'rotate-45 bg-blush-600 text-paper' : 'bg-blush-50 text-blush-700'"
              >
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10" stroke-linecap="round" /></svg>
              </span>
            </button>

            <p v-if="open.has(`${gi}-${ii}`)" class="px-5 pb-5 pr-14 text-[0.9375rem] leading-relaxed text-ink/70">{{ item[1] }}</p>
          </li>
        </ul>
      </section>

      <HelpFooter current="faq" />
    </div>
  </div>
</template>

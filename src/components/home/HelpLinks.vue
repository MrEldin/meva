<script setup>
import SectionHead from '@/components/home/SectionHead.vue'

/** The three things people check before they order, and where they are. */
const LINKS = [
  { to: 'faq', title: 'Česta pitanja', text: 'Koliko traje pakovanje, kada se vide rezultati, ima li sulfata.', icon: 'question' },
  { to: 'delivery', title: 'Dostava', text: 'Besplatno u celoj Srbiji, bez minimalnog iznosa. Plaćate kuriru.', icon: 'van' },
  { to: 'returns', title: 'Povrat i reklamacije', text: '14 dana za odustajanje. Greška sa naše strane — o našem trošku.', icon: 'shield' },
]
</script>

<template>
  <section class="shell py-10 lg:py-16">
    <SectionHead title="Pre nego što poručite" note="Tri stvari koje kupci najčešće provere." />

    <ul class="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
      <li v-for="link in LINKS" :key="link.to">
        <RouterLink
          :to="{ name: link.to }"
          class="group flex h-full flex-col rounded-[1.5rem] bg-paper p-6 ring-1 ring-blush-100 transition-all duration-500 hover:-translate-y-1 hover:ring-blush-300 hover:shadow-[0_24px_50px_-32px_rgba(142,59,69,0.45)]"
        >
          <span class="grid h-12 w-12 place-items-center rounded-full bg-blush-50 text-blush-700 transition-colors duration-500 group-hover:bg-blush-600 group-hover:text-paper" aria-hidden="true">
            <svg v-if="link.icon === 'question'" viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.2-2.6 3.8M12 17.2v.1" /></svg>
            <svg v-else-if="link.icon === 'van'" viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.5h11v9h-11zM13.5 10.5h3.6l3.4 3.2v2.8h-7z" /><circle cx="6" cy="18.3" r="1.5" /><circle cx="17.3" cy="18.3" r="1.5" /></svg>
            <svg v-else viewBox="0 0 24 24" class="h-[1.375rem] w-[1.375rem]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 19 6v6c0 4.2-2.9 7.5-7 8.8-4.1-1.3-7-4.6-7-8.8V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>
          </span>

          <h3 class="mt-4 font-display text-[1.25rem] leading-tight text-ink">{{ link.title }}</h3>
          <p class="mt-1.5 flex-1 text-[0.9375rem] leading-relaxed text-ink/60">{{ link.text }}</p>

          <span class="mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-blush-700">
            Pogledajte
            <svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12.5 6l6 6-6 6" /></svg>
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

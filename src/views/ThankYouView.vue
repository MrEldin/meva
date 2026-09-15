<script setup>
import ShareRow from '@/components/ui/ShareRow.vue'
import { setMeta } from '@/lib/meta'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => setMeta({ title: 'Hvala na porudžbini' }))
</script>

<template>
  <div class="shell flex min-h-[70svh] items-center py-20">
    <div class="mx-auto max-w-lg text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clay-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="h-7 w-7 text-clay-600">
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <h1 class="mt-8 font-display text-4xl text-ink md:text-5xl">Hvala na porudžbini</h1>

      <p class="mt-5 text-base font-light leading-relaxed text-mist-600">
        Vaša porudžbina je primljena pod brojem
        <span class="font-medium text-ink">{{ route.params.reference }}</span>.
        Zvaćemo vas radi potvrde pre nego što paket krene.
      </p>

      <p class="mt-6 text-sm text-forest/60">
        Dokle je stigla? Pratite je na
        <RouterLink :to="{ name: 'track' }" class="text-clay-600 underline-offset-4 hover:underline">stranici za praćenje</RouterLink>
        — treba vam ovaj broj i vaš e-mail.
      </p>

      <ShareRow class="mt-8 justify-center" title="Naručila sam iz Meve" text="Prirodna kozmetika iz Novog Pazara" :url="'https://meva.life/'" label="Preporuči" />

      <p class="mt-6 text-sm font-light text-mist-500">
        Plaćate kuriru pri preuzimanju. Dostava je besplatna.
      </p>

      <RouterLink :to="{ name: 'catalog' }" class="eyebrow mt-10 inline-block border border-ink px-9 py-4 text-ink transition-colors hover:bg-blush-500 hover:text-paper">
        Nastavi kupovinu
      </RouterLink>
    </div>
  </div>
</template>

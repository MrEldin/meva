<script setup>
import Closing from '@/components/home/Closing.vue'
import Finder from '@/components/home/Finder.vue'
import HeroStage from '@/components/home/HeroStage.vue'
import Proof from '@/components/home/Proof.vue'
import Rail from '@/components/home/Rail.vue'
import TrustStrip from '@/components/home/TrustStrip.vue'
import { setMeta } from '@/lib/meta'
import { useCatalogStore } from '@/stores/catalog'
import { onMounted } from 'vue'

const catalog = useCatalogStore()

onMounted(() => {
  catalog.load()
  setMeta({
    description: 'Ručno rađena prirodna kozmetika iz Novog Pazara od 2010. Preparati za seboreju, psorijazu, ekcem, akne i negu kose. Besplatna dostava, plaćanje pouzećem.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Meva Kozmetika',
      description: 'Ručno rađena prirodna kozmetika iz Novog Pazara, od 2010.',
      url: window.location.origin,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Miloša Obilića 20',
        addressLocality: 'Novi Pazar',
        postalCode: '36300',
        addressCountry: 'RS',
      },
      sameAs: ['https://www.instagram.com/meva.cosmetics/'],
    },
  })
})
</script>

<template>
  <div class="bg-cream">
    <HeroStage />
    <TrustStrip />
    <Rail />
    <Finder />
    <Proof />
    <Closing />
  </div>
</template>

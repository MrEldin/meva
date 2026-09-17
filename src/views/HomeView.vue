<script setup>
import LabProof from '@/components/home/LabProof.vue'
import HelpLinks from '@/components/home/HelpLinks.vue'
import Newsletter from '@/components/home/Newsletter.vue'
import Reviews from '@/components/home/Reviews.vue'
import ShopHero from '@/components/home/ShopHero.vue'
import ShopByConcern from '@/components/home/ShopByConcern.vue'
import BestSellers from '@/components/home/BestSellers.vue'
import Promise from '@/components/home/Promise.vue'
import SetAnatomy from '@/components/home/SetAnatomy.vue'
import { setMeta } from '@/lib/meta'
import { useCatalogStore } from '@/stores/catalog'
import { onMounted } from 'vue'

/**
 * The front page is the shop.
 *
 * The client's brief was one sentence long and worth following exactly: a
 * visitor should land on the shop, see plainly what is for sale, and never
 * have to work out where to click to order. So the order here is products,
 * then the reasons to trust them, then the answers to what people ask before
 * they buy. Nothing above the products but one line and one button.
 */
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
  <div class="bg-paper">
    <ShopHero />
    <ShopByConcern />
    <BestSellers />
    <SetAnatomy />
    <LabProof />
    <Promise />
    <Reviews />
    <HelpLinks />
    <Newsletter />
  </div>
</template>

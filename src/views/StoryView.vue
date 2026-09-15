<script setup>
import HeroStage from '@/components/home/HeroStage.vue'
import { setMeta } from '@/lib/meta'
import { useCatalogStore } from '@/stores/catalog'
import { onMounted } from 'vue'

/**
 * The scene, kept — moved rather than thrown away.
 *
 * Seven screens of scrolling WebGL is the best thing on this site and was the
 * wrong front door: someone who came for a shampoo had to scroll through a
 * film to reach one. Here it has a page of its own, linked from the shop, for
 * the visitor who wants to know what is in the bottle and why.
 */
const catalog = useCatalogStore()

onMounted(() => {
  catalog.load()
  setMeta({
    title: 'Naša priča',
    description: 'Kako nastaje Meva: ručno rađeni preparati iz Novog Pazara, sastav i šta rade na koži glave.',
  })
})
</script>

<template>
  <div class="bg-paper">
    <HeroStage />

    <section class="shell py-14 text-center lg:py-20">
      <h2 class="text-2xl sm:text-3xl">Sve što ste videli, možete poručiti</h2>
      <p class="mx-auto mt-3 max-w-lg text-base leading-relaxed text-mist-600">
        Besplatna dostava u celoj Srbiji, plaćate kuriru kad paket stigne.
      </p>
      <RouterLink
        :to="{ name: 'catalog' }"
        class="mt-7 inline-block rounded-full bg-blush-500 px-8 py-4 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-blush-500"
      >
        Pogledaj proizvode
      </RouterLink>
    </section>
  </div>
</template>

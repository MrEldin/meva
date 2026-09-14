<script setup>
import Closing from '@/components/home/Closing.vue'
import Hero from '@/components/home/Hero.vue'
import IntroReveal from '@/components/home/IntroReveal.vue'
import Marquee from '@/components/home/Marquee.vue'
import ProblemSelector from '@/components/home/ProblemSelector.vue'
import Process from '@/components/home/Process.vue'
import Proof from '@/components/home/Proof.vue'
import SetsFeature from '@/components/home/SetsFeature.vue'
import Showcase from '@/components/home/Showcase.vue'
import { useCatalogStore } from '@/stores/catalog'
import { onMounted, ref } from 'vue'

const catalog = useCatalogStore()
const ready = ref(false)

onMounted(() => catalog.load())
</script>

<template>
  <div>
    <IntroReveal @done="ready = true" />
    <Hero :ready="ready" />
    <Marquee />
    <!-- These sections build their motion from product elements, so they mount
         only once the catalogue is in — a GSAP setup over an empty list would
         leave later-rendered panels stacked and unanimated. -->
    <template v-if="catalog.loaded">
      <ProblemSelector />
      <Showcase />
      <Proof />
      <Process />
      <SetsFeature />
    </template>
    <Closing />
  </div>
</template>

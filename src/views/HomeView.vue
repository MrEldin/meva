<script setup>
import Closing from '@/components/home/Closing.vue'
import Finder from '@/components/home/Finder.vue'
import HeroStage from '@/components/home/HeroStage.vue'
import Proof from '@/components/home/Proof.vue'
import Rail from '@/components/home/Rail.vue'
import TrustStrip from '@/components/home/TrustStrip.vue'
import { useCatalogStore } from '@/stores/catalog'
import { onMounted } from 'vue'

const catalog = useCatalogStore()

onMounted(() => catalog.load())
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

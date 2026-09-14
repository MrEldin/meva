<script setup>
import Closing from '@/components/home/Closing.vue'
import Finder from '@/components/home/Finder.vue'
import HeroStage from '@/components/home/HeroStage.vue'
import Proof from '@/components/home/Proof.vue'
import Rail from '@/components/home/Rail.vue'
import { ScrollTrigger } from '@/lib/motion'
import { useCatalogStore } from '@/stores/catalog'
import { useUiStore } from '@/stores/ui'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const catalog = useCatalogStore()
const ui = useUiStore()
const root = ref(null)

let triggers = []

onMounted(() => {
  catalog.load()

  // Tell the header which kind of surface is under it as sections pass. A
  // trigger per section, so it stays in step with the smooth scroller.
  triggers = [...root.value.querySelectorAll('[data-surface]')].map((el) =>
    ScrollTrigger.create({
      trigger: el,
      start: 'top 48px',
      end: 'bottom 48px',
      onToggle: (self) => self.isActive && (ui.surface = el.dataset.surface),
    }),
  )
  ui.surface = 'dark'
})

onBeforeUnmount(() => {
  triggers.forEach((t) => t.kill())
  ui.surface = 'light'
})
</script>

<template>
  <div ref="root" class="bg-ink">
    <HeroStage />
    <Rail />
    <Finder />
    <Proof />
    <Closing />
  </div>
</template>

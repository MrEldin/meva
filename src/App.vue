<script setup>
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// The admin panel is its own world and wears neither the shop header nor footer.
const bare = computed(() => route.meta.bare === true)
const overHero = computed(() => route.meta.overHero === true)
</script>

<template>
  <SiteHeader v-if="!bare" :over-hero="overHero" />

  <main :class="!bare && !overHero && 'pt-[4.5rem] md:pt-[5.5rem]'">
    <RouterView v-slot="{ Component }">
      <Transition
        mode="out-in"
        enter-from-class="opacity-0"
        enter-active-class="transition-opacity duration-400 ease-[var(--ease-silk)]"
        leave-to-class="opacity-0"
        leave-active-class="transition-opacity duration-150"
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <SiteFooter v-if="!bare" />
</template>

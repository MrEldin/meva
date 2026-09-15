<script setup>
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import ConsentBar from '@/components/ui/ConsentBar.vue'
import Cursor from '@/components/ui/Cursor.vue'
import { initSmoothScroll, stopSmoothScroll } from '@/lib/scroll'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const auth = useAuthStore()

// The admin panel is its own world and wears neither the shop header nor footer.
const bare = computed(() => route.meta.bare === true)

/*
 * The admin panel gets the plain browser: the native pointer and native
 * scrolling. A custom cursor there is one more thing between a decision and
 * the click that carries it out, and inertial scrolling swallows the wheel
 * inside dialogs and long tables.
 */
watch(bare, (isAdmin) => (isAdmin ? stopSmoothScroll() : initSmoothScroll()))

onMounted(() => {
  if (!bare.value) initSmoothScroll()
  // A reloaded tab holds a token but knows nothing about whose it is.
  if (auth.signedIn && !auth.user) auth.fetchUser()
})
</script>

<template>
  <Cursor v-if="!bare" />
  <div class="min-h-screen bg-cream text-forest">
    <SiteHeader v-if="!bare" />

    <main>
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
    <ConsentBar />
  </div>
</template>

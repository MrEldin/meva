<script setup>
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import ConsentBar from '@/components/ui/ConsentBar.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const auth = useAuthStore()

// The admin panel is its own world and wears neither the shop header nor footer.
const bare = computed(() => route.meta.bare === true)

/*
 * The browser scrolls, and the browser draws the pointer.
 *
 * Inertial scrolling and a drawn cursor both put something between the
 * visitor and the page. The weighted wheel made every panel that scrolls
 * inside itself -- the search drop-down, most of all -- fight the page for
 * the wheel, and on a phone it could leave the last stretch of the page
 * unreachable. Both are gone.
 */
onMounted(() => {
  // A reloaded tab holds a token but knows nothing about whose it is.
  if (auth.signedIn && !auth.user) auth.fetchUser()
})
</script>

<template>
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

<script setup>
import { consent, denyConsent, grantConsent } from '@/lib/tracking'
</script>

<template>
  <Transition
    enter-from-class="translate-y-full opacity-0"
    enter-active-class="transition-all duration-500 ease-[var(--ease-silk)]"
    leave-to-class="translate-y-full opacity-0"
    leave-active-class="transition-all duration-300"
  >
    <div v-if="!consent" class="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:px-6 sm:pb-6">
      <div class="mx-auto flex max-w-3xl flex-col gap-4 rounded-[1.5rem] bg-forest p-5 text-cream shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p class="text-sm leading-relaxed text-cream/85">
          Koristimo kolačiće da vidimo koje strane ljudi zaista čitaju i šta se prodaje.
          Bez vašeg pristanka ne uključujemo ništa osim onoga što je nužno da sajt radi.
        </p>
        <div class="flex shrink-0 gap-2">
          <button type="button" class="pill border border-cream/30 text-cream hover:bg-cream hover:text-forest" @click="denyConsent">Ne, hvala</button>
          <button type="button" class="pill bg-sage text-forest hover:bg-cream" @click="grantConsent">U redu</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

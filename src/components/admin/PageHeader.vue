<script setup>
/**
 * The top of every page on the desk.
 *
 * Carries the section's colour so the page and the sidebar agree at a glance,
 * and keeps the title, the one-line explanation and the page's actions in one
 * arrangement everywhere.
 */
defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: null },
  note: { type: String, default: null },
  tone: { type: String, default: 'account' },
  back: { type: Object, default: null },
  backLabel: { type: String, default: 'Nazad' },
})

const BAR = {
  overview: 'bg-desk-overview',
  orders: 'bg-desk-orders',
  products: 'bg-desk-products',
  marketing: 'bg-desk-marketing',
  email: 'bg-desk-email',
  team: 'bg-desk-team',
  account: 'bg-desk-account',
}

const TEXT = {
  overview: 'text-desk-overview',
  orders: 'text-desk-orders',
  products: 'text-desk-products',
  marketing: 'text-desk-marketing',
  email: 'text-desk-email',
  team: 'text-desk-team',
  account: 'text-desk-account',
}
</script>

<template>
  <header class="mb-6">
    <RouterLink v-if="back" :to="back" class="label mb-3 flex w-fit items-center gap-1.5 transition-colors hover:text-forest">
      <span aria-hidden="true">←</span> {{ backLabel }}
    </RouterLink>

    <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div class="flex min-w-0 gap-4">
        <span class="mt-1 h-12 w-1.5 shrink-0 rounded-full" :class="BAR[tone]" />
        <div class="min-w-0">
          <p v-if="eyebrow" class="label" :class="TEXT[tone]">{{ eyebrow }}</p>
          <h1 class="mt-1 font-display text-[1.75rem] leading-tight tracking-tight sm:text-4xl">
            <slot name="title">{{ title }}</slot>
          </h1>
          <p v-if="note" class="mt-2 max-w-2xl text-sm leading-relaxed text-forest/65">{{ note }}</p>
        </div>
      </div>

      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * The head of a section: a number, a label, a title and one way onward.
 *
 * Repeated everywhere so the page reads as a sequence of chapters rather than
 * a pile of blocks. The number is what makes it feel edited.
 */
defineProps({
  number: { type: String, required: true },
  kicker: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String, default: null },
  to: { type: Object, default: null },
  link: { type: String, default: null },
  dark: { type: Boolean, default: false },
})
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-5" :class="dark ? 'border-paper/15' : 'border-ink/10'">
    <div class="min-w-0">
      <p class="kicker flex items-center gap-3" :class="dark ? 'text-paper/45' : 'text-blush-500'">
        <span>{{ number }}</span>
        <span class="h-px w-8" :class="dark ? 'bg-paper/25' : 'bg-blush-300'" />
        <span>{{ kicker }}</span>
      </p>
      <h2 class="mt-3 text-[2rem] leading-none sm:text-[2.75rem]" :class="dark && 'text-paper'">{{ title }}</h2>
      <p v-if="note" class="mt-2.5 max-w-lg text-[0.9375rem] leading-relaxed" :class="dark ? 'text-paper/55' : 'text-mist-500'">{{ note }}</p>
    </div>

    <RouterLink
      v-if="to && link"
      :to="to"
      class="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold"
      :class="dark ? 'text-paper' : 'text-ink'"
    >
      {{ link }}
      <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </RouterLink>
  </header>
</template>

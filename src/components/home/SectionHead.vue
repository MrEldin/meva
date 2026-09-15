<script setup>
/**
 * The head of a section: a title, a line of explanation, and one way onward.
 *
 * No numbering and no rules. The brief asked for clear and uncluttered, and
 * furniture that exists only to look designed is clutter.
 */
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: null },
  to: { type: Object, default: null },
  link: { type: String, default: null },
  dark: { type: Boolean, default: false },
})
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
    <div class="min-w-0">
      <h2 class="text-[1.625rem] sm:text-3xl" :class="dark && 'text-paper'">{{ title }}</h2>
      <p v-if="note" class="mt-1.5 max-w-lg text-[0.875rem] leading-relaxed" :class="dark ? 'text-paper/55' : 'text-mist-500'">{{ note }}</p>
    </div>

    <RouterLink
      v-if="to && link"
      :to="to"
      class="shrink-0 text-[0.875rem] font-bold text-blush-500 underline-offset-4 hover:underline"
      :class="dark && 'text-blush-300'"
    >
      {{ link }} →
    </RouterLink>
  </header>
</template>

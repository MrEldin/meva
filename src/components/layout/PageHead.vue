<script setup>
/**
 * The top of a reading page.
 *
 * The film's pink at the very top, fading into the paper the text sits on, so
 * a page like Dostava opens in the same colour the shop does instead of on a
 * grey band. A crumb back to the shop, the title, one line under it, and --
 * where the page has them -- the two or three facts worth knowing before
 * reading anything at all.
 */
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: null },
  /** Short verified facts, shown as chips under the title. */
  facts: { type: Array, default: () => [] },
})
</script>

<template>
  <header class="relative overflow-hidden border-b border-blush-100 bg-gradient-to-b from-peach via-blush-50 to-paper">
    <div class="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75),transparent_65%)]" aria-hidden="true" />

    <div class="shell relative py-10 lg:py-14">
      <nav class="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-blush-700/80" aria-label="Putanja">
        <RouterLink :to="{ name: 'home' }" class="transition-colors hover:text-blush-700">Početna</RouterLink>
        <span aria-hidden="true">·</span>
        <span class="text-ink/55">{{ title }}</span>
      </nav>

      <h1 class="mt-3 max-w-3xl font-display text-[2rem] leading-[1.1] text-ink sm:text-[2.75rem]">{{ title }}</h1>
      <p v-if="note" class="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-ink/70">{{ note }}</p>

      <ul v-if="facts.length" class="mt-6 flex flex-wrap gap-2">
        <li
          v-for="fact in facts"
          :key="fact"
          class="flex items-center gap-2 rounded-full bg-paper/80 px-3.5 py-2 text-[0.8125rem] font-semibold text-ink/75 ring-1 ring-paper/90 backdrop-blur-sm"
        >
          <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0 text-blush-600" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3.2L13 5" /></svg>
          {{ fact }}
        </li>
      </ul>
    </div>
  </header>
</template>

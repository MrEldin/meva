<script setup>
/** The top of a reading page: one title, one line, nothing else. */
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: null },
})
</script>

<template>
  <header class="border-b border-mist-200 bg-shell">
    <div class="shell py-10 lg:py-14">
      <h1 class="text-3xl sm:text-4xl">{{ title }}</h1>
      <p v-if="note" class="mt-3 max-w-2xl text-base leading-relaxed text-mist-600">{{ note }}</p>
    </div>
  </header>
</template>

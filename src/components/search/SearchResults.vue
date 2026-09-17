<script setup>
/**
 * What the search found, grouped the way it was asked.
 *
 * Four kinds of answer in the order they are worth to someone typing: the
 * preparations themselves, the shelf they sit on, what a customer said, then
 * the page that answers the question.
 *
 * On a wide screen the panel is the width of the page, so the preparations
 * take a column of their own and the other three stack beside them rather
 * than pushing everything into one long list nobody scrolls. On a phone it is
 * that one column. The row under the arrow keys is marked in both.
 */
defineProps({
  groups: { type: Object, required: true },
  flat: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  term: { type: String, default: '' },
  highlighted: { type: Number, default: -1 },
  destination: { type: Function, required: true },
  /** Two columns, for the panel that spans the page. */
  wide: { type: Boolean, default: false },
})

defineEmits(['choose'])

const indexOf = (flat, kind, item) =>
  flat.findIndex((hit) => hit.kind === kind && hit.item.id === item.id)
</script>

<template>
  <div>
    <p v-if="loading && !flat.length" class="px-5 py-8 text-sm text-ink/50">Tražim…</p>

    <p v-else-if="empty" class="px-5 py-8 text-[0.9375rem] text-ink/65">
      Ništa za „{{ term }}”. Pokušajte drugu reč — na primer
      <em class="not-italic font-semibold text-blush-700">seboreja</em>,
      <em class="not-italic font-semibold text-blush-700">perut</em> ili
      <em class="not-italic font-semibold text-blush-700">krema</em>.
    </p>

    <template v-else>
      <div :class="wide ? 'grid gap-x-10 gap-y-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]' : ''">
        <!-- Preparations -->
        <section v-if="groups.products.length">
          <p class="kicker px-2 pb-2 text-blush-600">Proizvodi</p>
          <div :class="wide ? 'grid gap-1 sm:grid-cols-2' : ''">
            <RouterLink
              v-for="item in groups.products"
              :key="`p-${item.id}`"
              :to="destination({ kind: 'product', item })"
              class="flex items-center gap-3 rounded-xl p-2 transition-colors"
              :class="indexOf(flat, 'product', item) === highlighted ? 'bg-blush-100' : 'hover:bg-blush-50'"
              @click="$emit('choose')"
            >
              <span class="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-blush-50">
                <img v-if="item.image" :src="item.image" alt="" loading="lazy" class="h-full w-full object-contain p-1" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[0.9375rem] font-semibold leading-snug text-ink">{{ item.name }}</span>
                <span v-if="item.price" class="mt-0.5 block text-[0.875rem] font-bold text-blush-700">{{ item.price }}</span>
              </span>
            </RouterLink>
          </div>
        </section>

        <div :class="wide ? 'space-y-6' : ''">
          <!-- Shelves -->
          <section v-if="groups.collections.length" :class="wide ? '' : 'mt-5 border-t border-blush-100 pt-3'">
            <p class="kicker px-2 pb-1 text-blush-600">Kategorije</p>
            <RouterLink
              v-for="item in groups.collections"
              :key="`c-${item.id}`"
              :to="destination({ kind: 'collection', item })"
              class="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors"
              :class="indexOf(flat, 'collection', item) === highlighted ? 'bg-blush-100' : 'hover:bg-blush-50'"
              @click="$emit('choose')"
            >
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-50 text-blush-700" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
              </span>
              <span class="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold text-ink">Sve za: {{ item.name }}</span>
              <span class="shrink-0 text-[0.8125rem] text-ink/45">{{ item.count }}</span>
            </RouterLink>
          </section>

          <!-- What customers wrote -->
          <section v-if="groups.reviews.length" :class="wide ? '' : 'mt-5 border-t border-blush-100 pt-3'">
            <p class="kicker px-2 pb-1 text-blush-600">Recenzije</p>
            <RouterLink
              v-for="item in groups.reviews"
              :key="`r-${item.id}`"
              :to="destination({ kind: 'review', item })"
              class="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors"
              :class="indexOf(flat, 'review', item) === highlighted ? 'bg-blush-100' : 'hover:bg-blush-50'"
              @click="$emit('choose')"
            >
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-50 font-display text-[1.125rem] leading-none text-blush-400" aria-hidden="true">&ldquo;</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[0.9375rem] text-ink/80">{{ item.body }}</span>
                <span class="block truncate text-[0.8125rem] text-ink/45">
                  {{ item.name }}<template v-if="item.product_name"> · {{ item.product_name }}</template>
                </span>
              </span>
            </RouterLink>
          </section>

          <!-- Answers -->
          <section v-if="groups.pages.length" :class="wide ? '' : 'mt-5 border-t border-blush-100 pt-3'">
            <p class="kicker px-2 pb-1 text-blush-600">Odgovori</p>
            <RouterLink
              v-for="item in groups.pages"
              :key="`g-${item.id}`"
              :to="destination({ kind: 'page', item })"
              class="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors"
              :class="indexOf(flat, 'page', item) === highlighted ? 'bg-blush-100' : 'hover:bg-blush-50'"
              @click="$emit('choose')"
            >
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-50 text-blush-700" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.2-2.6 3.8M12 17.2v.1" /></svg>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[0.9375rem] font-semibold text-ink">{{ item.title }}</span>
                <span class="block truncate text-[0.8125rem] text-ink/50">{{ item.answer }}</span>
              </span>
              <span class="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink/35">{{ item.page }}</span>
            </RouterLink>
          </section>
        </div>
      </div>

      <RouterLink
        v-if="term.trim()"
        :to="{ name: 'catalog', query: { q: term.trim() } }"
        class="mt-5 flex items-center justify-between rounded-xl bg-blush-50 px-4 py-3 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-blush-700 transition-colors hover:bg-blush-100"
        @click="$emit('choose')"
      >
        <span>Svi rezultati za „{{ term.trim() }}”</span>
        <span aria-hidden="true">→</span>
      </RouterLink>
    </template>
  </div>
</template>

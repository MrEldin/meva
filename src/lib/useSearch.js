import client from '@/api/client'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

/**
 * The shop's search, as one thing both search boxes share.
 *
 * The API answers four groups at once -- preparations, the shelves they sit
 * on, what customers wrote, and the pages that answer a question -- so this
 * keeps them apart and flattens them into one list for the arrow keys, which
 * have to walk the drop-down as though it were a single column.
 *
 * Typing is debounced, and an answer that arrives after a newer one has been
 * asked for is thrown away: on a slow phone they do not come back in order.
 */
export function useSearch() {
  const router = useRouter()

  const term = ref('')
  const groups = ref({ products: [], collections: [], reviews: [], pages: [] })
  const loading = ref(false)
  const asked = ref(false)
  const highlighted = ref(-1)

  let timer = null
  let latest = 0

  const PAGE_ROUTES = { faq: 'faq', delivery: 'delivery', returns: 'returns', story: 'story' }

  /** Every hit in the order it is drawn, so one index can walk the lot. */
  const flat = computed(() => [
    ...groups.value.products.map((item) => ({ kind: 'product', item })),
    ...groups.value.collections.map((item) => ({ kind: 'collection', item })),
    ...groups.value.reviews.map((item) => ({ kind: 'review', item })),
    ...groups.value.pages.map((item) => ({ kind: 'page', item })),
  ])

  const empty = computed(() => asked.value && !loading.value && flat.value.length === 0)

  /** Where a hit takes you when it is chosen. */
  function destination({ kind, item }) {
    if (kind === 'product') return { name: 'product', params: { slug: item.slug } }
    if (kind === 'collection') return { name: 'catalog', query: { category: item.slug } }
    if (kind === 'review') {
      return item.product_slug
        ? { name: 'product', params: { slug: item.product_slug } }
        : { name: 'catalog' }
    }

    return { name: PAGE_ROUTES[item.route] ?? 'faq' }
  }

  async function run(value) {
    const mine = ++latest

    if (value.trim().length < 2) {
      groups.value = { products: [], collections: [], reviews: [], pages: [] }
      asked.value = false
      loading.value = false

      return
    }

    loading.value = true

    try {
      const { data } = await client.get('/shop/search', { params: { q: value.trim() } })

      if (mine !== latest) return

      groups.value = data.data
      asked.value = true
    } catch {
      if (mine === latest) groups.value = { products: [], collections: [], reviews: [], pages: [] }
    } finally {
      if (mine === latest) loading.value = false
    }
  }

  watch(term, (value) => {
    highlighted.value = -1
    clearTimeout(timer)
    timer = setTimeout(() => run(value), 160)
  })

  function move(step) {
    const total = flat.value.length
    if (!total) return

    highlighted.value = (highlighted.value + step + total + 1) % (total + 1) - 1
    if (highlighted.value < -1) highlighted.value = total - 1
  }

  /** Enter: the highlighted hit, or the whole catalogue filtered by the words. */
  function submit() {
    const chosen = flat.value[highlighted.value]

    if (chosen) {
      router.push(destination(chosen))
    } else if (term.value.trim()) {
      router.push({ name: 'catalog', query: { q: term.value.trim() } })
    }
  }

  function reset() {
    term.value = ''
    groups.value = { products: [], collections: [], reviews: [], pages: [] }
    asked.value = false
    highlighted.value = -1
    clearTimeout(timer)
  }

  return { term, groups, flat, loading, asked, empty, highlighted, destination, move, submit, reset }
}

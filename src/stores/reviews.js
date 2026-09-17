import client from '@/api/client'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * What customers wrote, from the database rather than a file in this bundle.
 *
 * The API lists the ones attached to a product first, so the order it returns
 * is the order they should be shown in.
 */
export const useReviewStore = defineStore('reviews', () => {
  const items = ref([])
  const loading = ref(false)
  const loaded = ref(false)

  async function load() {
    if (loaded.value || loading.value) return

    loading.value = true

    try {
      const { data } = await client.get('/shop/reviews', { params: { per_page: 24 } })
      items.value = data.data
      loaded.value = true
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return { items, loading, loaded, load }
})

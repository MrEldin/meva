import client from '@/api/client'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * The catalogue, fetched once and shared.
 *
 * The shop has 68 published products, so the whole listing fits comfortably in
 * memory; fetching it once keeps navigation between category filters instant.
 */
export const useCatalogStore = defineStore('catalog', () => {
  const products = ref([])
  const collections = ref([])
  const loading = ref(false)
  const loaded = ref(false)

  async function load() {
    if (loaded.value || loading.value) return

    loading.value = true

    try {
      const [productsResponse, collectionsResponse] = await Promise.all([
        client.get('/shop/products', { params: { per_page: 100 } }),
        client.get('/shop/collections'),
      ])

      products.value = productsResponse.data.data
      collections.value = collectionsResponse.data.data
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function find(slug) {
    const { data } = await client.get(`/shop/products/${slug}`, {
      params: { include: 'description,images,set' },
    })

    return data.data
  }

  return { products, collections, loading, loaded, load, find }
})

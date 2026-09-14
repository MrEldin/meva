import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'meva.cart'

/**
 * The cart lives in the browser.
 *
 * Everything is cash on delivery and checkout is a single form, so there is no
 * reason to keep a server-side cart alive between visits -- the order is
 * created in one request when the customer confirms.
 */
export const useCartStore = defineStore('cart', () => {
  const lines = ref(read())

  const count = computed(() => lines.value.reduce((total, line) => total + line.quantity, 0))
  const subtotal = computed(() => lines.value.reduce((total, line) => total + line.price * line.quantity, 0))

  watch(lines, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // A private window with storage disabled must not break the cart.
    }
  }, { deep: true })

  function read() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  }

  function add(product, quantity = 1) {
    const existing = lines.value.find((line) => line.id === product.id)

    if (existing) {
      existing.quantity += quantity

      return
    }

    lines.value.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price?.minor ?? 0,
      quantity,
    })
  }

  function setQuantity(id, quantity) {
    const line = lines.value.find((item) => item.id === id)

    if (!line) return

    if (quantity <= 0) {
      remove(id)

      return
    }

    line.quantity = quantity
  }

  function remove(id) {
    lines.value = lines.value.filter((line) => line.id !== id)
  }

  function clear() {
    lines.value = []
  }

  return { lines, count, subtotal, add, setQuantity, remove, clear }
})

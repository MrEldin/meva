import client from '@/api/client'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Meva Klub: the signed-in customer's points, tier, rewards and coupons.
 *
 * The server does all the arithmetic -- what is affordable, how far the next
 * tier is, which coupons are still good -- so this only mirrors what it says
 * and reloads after anything that changes the balance.
 */
export const useLoyaltyStore = defineStore('loyalty', () => {
  const points = ref(0)
  const pendingPoints = ref(0)
  const lifetimePoints = ref(0)
  const tier = ref(null)
  const tiers = ref([])
  const rewards = ref([])
  const coupons = ref([])
  const history = ref([])

  const loaded = ref(false)
  const loading = ref(false)
  const error = ref(null)

  function fill(data) {
    points.value = data.points ?? 0
    pendingPoints.value = data.pending_points ?? 0
    lifetimePoints.value = data.lifetime_points ?? 0
    tier.value = data.tier ?? null
    tiers.value = data.tiers ?? []
    rewards.value = data.rewards ?? []
    coupons.value = data.coupons ?? []
    history.value = data.history ?? []
    loaded.value = true
  }

  async function load() {
    loading.value = true
    error.value = null

    try {
      const { data } = await client.get('/account/loyalty')
      fill(data.data)
    } catch (failure) {
      error.value = failure.response?.data?.message ?? 'Meva Klub trenutno nije dostupan.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Trade points for a coupon. Returns the new coupon; a 422 (not enough
   * points) is rethrown with the server's message so the page can show it.
   */
  async function redeem(key) {
    try {
      const { data } = await client.post('/account/loyalty/redeem', { reward: key })

      // The balance, the affordable flags and the coupon list all moved.
      points.value = data.data.points ?? points.value
      await load()

      return data.data.coupon
    } catch (failure) {
      const body = failure.response?.data
      throw new Error(body?.errors?.reward?.[0] ?? body?.message ?? 'Nagrada trenutno ne može da se iskoristi.')
    }
  }

  /**
   * Ask whether a coupon code is good for this account before the order is
   * sent. Resolves to {code, value, value_formatted, valid}; a bad code
   * rejects with the server's reason.
   */
  async function checkCoupon(code) {
    try {
      const { data } = await client.post('/account/loyalty/coupon', { code: code.trim().toUpperCase() })

      return data.data
    } catch (failure) {
      const body = failure.response?.data
      throw new Error(body?.errors?.coupon?.[0] ?? body?.message ?? 'Kupon trenutno ne može da se proveri.')
    }
  }

  return {
    points, pendingPoints, lifetimePoints, tier, tiers, rewards, coupons, history,
    loaded, loading, error,
    load, redeem, checkCoupon,
  }
})

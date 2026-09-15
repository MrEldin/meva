import client from '@/api/client'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_KEY = 'meva.token'

/**
 * Who is signed in, and what they are allowed to do.
 *
 * The token lives in localStorage so a reload does not sign anyone out; the
 * roles and permissions that come back with it decide which parts of the back
 * office are even offered.
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(null)
  const loading = ref(false)

  // The route guard and the app shell both ask who is signed in, often at the
  // same moment; they must share one request rather than race, or whichever
  // asked second carries on with nothing.
  let pending = null

  const signedIn = computed(() => Boolean(token.value))
  const permissions = computed(() => user.value?.permissions ?? [])
  const roles = computed(() => user.value?.roles ?? [])
  const isStaff = computed(() => permissions.value.length > 0)
  const name = computed(() =>
    user.value ? [user.value.first_name, user.value.last_name].filter(Boolean).join(' ') : '',
  )

  /** Whether the signed-in user holds a permission. */
  function can(permission) {
    return permissions.value.includes(permission)
  }

  function remember(data) {
    token.value = data.access_token
    localStorage.setItem(TOKEN_KEY, data.access_token)

    if (data.user) user.value = data.user

    return data
  }

  async function login(email, password) {
    return remember((await client.post('/login', { email, password })).data)
  }

  async function register(payload) {
    return remember((await client.post('/account/register', payload)).data)
  }

  /**
   * Load the signed-in user. Called once on boot so a reloaded tab knows what
   * it may show before the first guarded route resolves.
   */
  function fetchUser() {
    if (!token.value) return Promise.resolve(null)
    if (user.value) return Promise.resolve(user.value)
    if (pending) return pending

    loading.value = true

    pending = client
      .get('/auth/user')
      .then(({ data }) => {
        user.value = data.data

        return user.value
      })
      .catch(() => {
        logout()

        return null
      })
      .finally(() => {
        loading.value = false
        pending = null
      })

    return pending
  }

  async function updateProfile(payload) {
    const { data } = await client.put('/auth/profile', payload)
    user.value = data.data

    return user.value
  }

  function logout() {
    pending = null
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token, user, loading, signedIn, permissions, roles, isStaff, name,
    can, login, register, fetchUser, updateProfile, logout,
  }
})

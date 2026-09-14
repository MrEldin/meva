import client from '@/api/client'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('meva.token'))
  const user = ref(null)

  const signedIn = computed(() => Boolean(token.value))

  async function login(email, password) {
    const { data } = await client.post('/login', { email, password })

    token.value = data.access_token
    localStorage.setItem('meva.token', data.access_token)

    return data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('meva.token')
  }

  return { token, user, signedIn, login, logout }
})

import '@/assets/css/app.css'

import { reveal } from '@/directives/reveal'
import { initTracking } from '@/lib/tracking'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/App.vue'

// Measurement only starts if this visitor has already agreed to it.
initTracking()

createApp(App)
  .use(createPinia())
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')

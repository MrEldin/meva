import '@/assets/css/app.css'
import 'vue-final-modal/style.css'

import { reveal } from '@/directives/reveal'
import { initTracking } from '@/lib/tracking'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVfm } from 'vue-final-modal'

import App from '@/App.vue'

// Measurement only starts if this visitor has already agreed to it.
initTracking()

createApp(App)
  .use(createPinia())
  .use(createVfm())
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')

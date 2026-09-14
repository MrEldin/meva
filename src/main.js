import '@/assets/css/app.css'

import { reveal } from '@/directives/reveal'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/App.vue'

createApp(App)
  .use(createPinia())
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')

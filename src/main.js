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

// The router decides where a page opens -- the top, or a saved position on
// the way back. Left to itself the browser also restores a scroll offset on
// reload, and reloading the front page would drop the visitor halfway down
// it rather than at the beginning.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

createApp(App)
  .use(createPinia())
  .use(createVfm())
  .use(router)
  .directive('reveal', reveal)
  .mount('#app')

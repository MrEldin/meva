import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: {} },
  { path: '/proizvodi', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  { path: '/proizvod/:slug', name: 'product', component: () => import('@/views/ProductView.vue') },
  { path: '/korpa', name: 'cart', component: () => import('@/views/CartView.vue') },
  { path: '/porucivanje', name: 'checkout', component: () => import('@/views/CheckoutView.vue') },
  { path: '/hvala/:reference', name: 'thankyou', component: () => import('@/views/ThankYouView.vue') },
  { path: '/prijava', name: 'login', component: () => import('@/views/LoginView.vue') },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: true, bare: true },
  },
  { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('@/views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 96 }

    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('meva.token')) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router

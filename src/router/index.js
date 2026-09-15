import { pageView } from '@/lib/tracking'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/proizvodi', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  { path: '/prica', name: 'story', component: () => import('@/views/StoryView.vue') },
  { path: '/cesta-pitanja', name: 'faq', component: () => import('@/views/help/FaqView.vue') },
  { path: '/dostava', name: 'delivery', component: () => import('@/views/help/DeliveryView.vue') },
  { path: '/reklamacije', name: 'returns', component: () => import('@/views/help/ReturnsView.vue') },
  { path: '/proizvod/:slug', name: 'product', component: () => import('@/views/ProductView.vue') },
  { path: '/korpa', name: 'cart', component: () => import('@/views/CartView.vue') },
  { path: '/porucivanje', name: 'checkout', component: () => import('@/views/CheckoutView.vue') },
  { path: '/hvala/:reference', name: 'thankyou', component: () => import('@/views/ThankYouView.vue') },
  { path: '/prijava', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/registracija', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/pracenje', name: 'track', component: () => import('@/views/account/TrackView.vue') },
  {
    path: '/nalog',
    name: 'account',
    component: () => import('@/views/account/AccountView.vue'),
    meta: { requiresAuth: true },
  },

  // The back office. Every child names the permission it needs, so someone who
  // may only read the numbers never sees a link they cannot open.
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, bare: true },
    children: [
      { path: '', name: 'admin', redirect: { name: 'admin.overview' } },
      { path: 'pregled', name: 'admin.overview', component: () => import('@/views/admin/OverviewView.vue'), meta: { permission: 'analytics.view' } },
      { path: 'porudzbine', name: 'admin.orders', component: () => import('@/views/admin/OrdersView.vue'), meta: { permission: 'orders.view' } },
      { path: 'porudzbine/:id', name: 'admin.order', component: () => import('@/views/admin/OrderView.vue'), meta: { permission: 'orders.view' } },
      { path: 'proizvodi', name: 'admin.products', component: () => import('@/views/admin/ProductsView.vue'), meta: { permission: 'products.view' } },
      { path: 'proizvodi/:id', name: 'admin.product', component: () => import('@/views/admin/ProductEditView.vue'), meta: { permission: 'products.manage' } },
      { path: 'marketing', name: 'admin.marketing', component: () => import('@/views/admin/MarketingView.vue'), meta: { permission: 'marketing.manage' } },
      { path: 'marketing/email', name: 'admin.email', component: () => import('@/views/admin/EmailCampaignsView.vue'), meta: { permission: 'marketing.manage' } },
      { path: 'marketing/email/:id', name: 'admin.email.edit', component: () => import('@/views/admin/EmailEditorView.vue'), meta: { permission: 'marketing.manage' } },
      { path: 'tim', name: 'admin.team', component: () => import('@/views/admin/TeamView.vue'), meta: { permission: 'users.manage' } },
      { path: 'nalog', name: 'admin.profile', component: () => import('@/views/admin/ProfileView.vue') },
    ],
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

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!to.meta.requiresAuth && !to.matched.some((record) => record.meta.requiresAuth)) return true

  if (!auth.signedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // The token is all the browser keeps; who it belongs to has to be asked for.
  if (!auth.user) await auth.fetchUser()

  if (!auth.signedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const permission = to.meta.permission

  if (permission && !auth.can(permission)) {
    // Send them somewhere they are allowed to be rather than to a dead end.
    const fallback = [
      ['analytics.view', 'admin.overview'],
      ['orders.view', 'admin.orders'],
      ['products.view', 'admin.products'],
      ['marketing.manage', 'admin.marketing'],
    ].find(([needed]) => auth.can(needed))

    return { name: fallback ? fallback[1] : 'account' }
  }

  return true
})

router.afterEach((to) => {
  // Reported after the view has had a chance to set the title.
  requestAnimationFrame(() => pageView(to.fullPath, document.title))
})

export default router

import { pageView } from '@/lib/tracking'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/products', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  { path: '/story', name: 'story', component: () => import('@/views/StoryView.vue') },
  { path: '/faq', name: 'faq', component: () => import('@/views/help/FaqView.vue') },
  { path: '/delivery', name: 'delivery', component: () => import('@/views/help/DeliveryView.vue') },
  { path: '/returns', name: 'returns', component: () => import('@/views/help/ReturnsView.vue') },
  { path: '/product/:slug', name: 'product', component: () => import('@/views/ProductView.vue') },
  { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue') },
  { path: '/thank-you/:reference', name: 'thankyou', component: () => import('@/views/ThankYouView.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/track', name: 'track', component: () => import('@/views/account/TrackView.vue') },
  {
    path: '/account',
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
      { path: 'overview', name: 'admin.overview', component: () => import('@/views/admin/OverviewView.vue'), meta: { permission: 'analytics.view' } },
      { path: 'orders', name: 'admin.orders', component: () => import('@/views/admin/OrdersView.vue'), meta: { permission: 'orders.view' } },
      { path: 'orders/:id', name: 'admin.order', component: () => import('@/views/admin/OrderView.vue'), meta: { permission: 'orders.view' } },
      { path: 'products', name: 'admin.products', component: () => import('@/views/admin/ProductsView.vue'), meta: { permission: 'products.view' } },
      { path: 'products/:id', name: 'admin.product', component: () => import('@/views/admin/ProductEditView.vue'), meta: { permission: 'products.manage' } },
      { path: 'reviews', name: 'admin.reviews', component: () => import('@/views/admin/ReviewsView.vue'), meta: { permission: 'products.manage' } },
      { path: 'marketing', name: 'admin.marketing', component: () => import('@/views/admin/MarketingView.vue'), meta: { permission: 'marketing.manage' } },
      { path: 'marketing/email', name: 'admin.email', component: () => import('@/views/admin/EmailCampaignsView.vue'), meta: { permission: 'marketing.manage' } },
      { path: 'marketing/email/:id', name: 'admin.email.edit', component: () => import('@/views/admin/EmailEditorView.vue'), meta: { permission: 'marketing.manage' } },
      { path: 'team', name: 'admin.team', component: () => import('@/views/admin/TeamView.vue'), meta: { permission: 'users.manage' } },
      { path: 'profile', name: 'admin.profile', component: () => import('@/views/admin/ProfileView.vue') },
    ],
  },

  /*
   * The addresses this shop used to live at.
   *
   * Every path here was Serbian, which made the route table read like two
   * languages at once. They are English now -- but these are also the links
   * Google has indexed and the ones customers have sent each other, so each
   * old path still resolves and sends the visitor on to the new one. The
   * search engine follows it, and nothing anyone has already shared breaks.
   */
  ...[
    ['/proizvodi', '/products'],
    ['/prica', '/story'],
    ['/cesta-pitanja', '/faq'],
    ['/dostava', '/delivery'],
    ['/reklamacije', '/returns'],
    ['/korpa', '/cart'],
    ['/porucivanje', '/checkout'],
    ['/prijava', '/login'],
    ['/registracija', '/register'],
    ['/pracenje', '/track'],
    ['/nalog', '/account'],
  ].map(([from, to]) => ({ path: from, redirect: (route) => ({ path: to, query: route.query }) })),

  { path: '/proizvod/:slug', redirect: (route) => ({ path: `/product/${route.params.slug}` }) },
  { path: '/hvala/:reference', redirect: (route) => ({ path: `/thank-you/${route.params.reference}` }) },

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

/*
 * A page whose chunk is no longer on the server.
 *
 * Every view is a lazy import under a hashed name, so a deploy renames all of
 * them. A tab opened before that deploy still holds the old index and asks for
 * a file that has been replaced; the navigation then fails silently and the
 * click looks broken. The server keeps the previous build's chunks for a
 * fortnight, and for anything older than that this loads the page properly
 * instead -- once, so a genuinely broken route cannot loop.
 */
router.onError((error, to) => {
  const missing = /dynamically imported module|Importing a module script failed|error loading/i

  if (!missing.test(String(error?.message ?? '')) || !to?.fullPath) return
  if (sessionStorage.getItem('reloaded-for') === to.fullPath) return

  sessionStorage.setItem('reloaded-for', to.fullPath)
  window.location.assign(to.fullPath)
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

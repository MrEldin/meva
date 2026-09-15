import { ref } from 'vue'

const CONSENT_KEY = 'meva.consent'

const GA_ID = import.meta.env.VITE_GA_ID
const PIXEL_ID = import.meta.env.VITE_PIXEL_ID

export const consent = ref(read())

function read() {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

/**
 * Google Analytics and the Meta pixel, loaded only once someone has agreed to
 * them -- measurement that runs before consent is measurement a shop can be
 * fined for. Both IDs come from the build environment, so a missing ID simply
 * means that tool is switched off.
 */
export function initTracking() {
  if (consent.value !== 'granted') return

  if (GA_ID && !window.gtag) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { send_page_view: false })
  }

  if (PIXEL_ID && !window.fbq) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', PIXEL_ID)
  }
}

export function grantConsent() {
  consent.value = 'granted'
  try { localStorage.setItem(CONSENT_KEY, 'granted') } catch { /* private window */ }
  initTracking()
  pageView(window.location.pathname, document.title)
}

export function denyConsent() {
  consent.value = 'denied'
  try { localStorage.setItem(CONSENT_KEY, 'denied') } catch { /* private window */ }
}

export function pageView(path, title) {
  window.gtag?.('event', 'page_view', { page_path: path, page_title: title })
  window.fbq?.('track', 'PageView')
}

/**
 * The events a shop actually reports on: what people looked at, what they put
 * in the basket, and what they bought.
 */
export const track = {
  viewProduct(product) {
    const value = (product?.price?.minor ?? 0) / 100
    window.gtag?.('event', 'view_item', {
      currency: 'RSD',
      value,
      items: [{ item_id: product?.sku, item_name: product?.name, price: value }],
    })
    window.fbq?.('track', 'ViewContent', {
      content_ids: [product?.sku],
      content_name: product?.name,
      content_type: 'product',
      value,
      currency: 'RSD',
    })
  },

  addToCart(product, quantity = 1) {
    const value = ((product?.price?.minor ?? 0) / 100) * quantity
    window.gtag?.('event', 'add_to_cart', {
      currency: 'RSD',
      value,
      items: [{ item_id: product?.sku, item_name: product?.name, quantity, price: value / quantity }],
    })
    window.fbq?.('track', 'AddToCart', {
      content_ids: [product?.sku],
      content_name: product?.name,
      content_type: 'product',
      value,
      currency: 'RSD',
    })
  },

  beginCheckout(lines, total) {
    const value = total / 100
    window.gtag?.('event', 'begin_checkout', {
      currency: 'RSD',
      value,
      items: lines.map((line) => ({ item_id: line.sku, item_name: line.name, quantity: line.quantity })),
    })
    window.fbq?.('track', 'InitiateCheckout', { value, currency: 'RSD', num_items: lines.length })
  },

  purchase(reference, lines, total) {
    const value = total / 100
    window.gtag?.('event', 'purchase', {
      transaction_id: reference,
      currency: 'RSD',
      value,
      items: lines.map((line) => ({ item_id: line.sku, item_name: line.name, quantity: line.quantity })),
    })
    window.fbq?.('track', 'Purchase', { value, currency: 'RSD', contents: lines.map((l) => ({ id: l.sku, quantity: l.quantity })) })
  },

  subscribe(source) {
    window.gtag?.('event', 'sign_up', { method: source })
    window.fbq?.('track', 'Lead', { content_name: source })
  },

  share(channel, what) {
    window.gtag?.('event', 'share', { method: channel, content_type: 'product', item_id: what })
  },
}

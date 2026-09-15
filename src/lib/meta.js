const SITE = 'Meva Kozmetika'
const DEFAULT_IMAGE = '/og-image.jpg'

function tag(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement(attributes.rel ? 'link' : 'meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value))
}

/**
 * Describe the current page to browsers, messengers and assistants.
 *
 * Crawlers are served a server-rendered page by nginx, so these tags are for
 * the people and tools that do run the app: the tab title, the share sheet on
 * a phone, and anything reading the live document.
 */
export function setMeta({ title, description, image, url, type = 'website', schema } = {}) {
  const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — prirodna nega kože i kose`
  const canonical = url ?? window.location.href.split('?')[0]
  const picture = image ?? new URL(DEFAULT_IMAGE, window.location.origin).href

  document.title = fullTitle

  if (description) {
    tag('meta[name="description"]', { name: 'description', content: description })
    tag('meta[property="og:description"]', { property: 'og:description', content: description })
    tag('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  }

  tag('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE })
  tag('meta[property="og:locale"]', { property: 'og:locale', content: 'sr_RS' })
  tag('meta[property="og:type"]', { property: 'og:type', content: type })
  tag('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
  tag('meta[property="og:url"]', { property: 'og:url', content: canonical })
  tag('meta[property="og:image"]', { property: 'og:image', content: picture })
  tag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  tag('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
  tag('meta[name="twitter:image"]', { name: 'twitter:image', content: picture })
  tag('link[rel="canonical"]', { rel: 'canonical', href: canonical })

  setSchema(schema)
}

/** Structured data, so a search result or an assistant quotes the shop correctly. */
export function setSchema(schema) {
  const id = 'meva-schema'
  document.getElementById(id)?.remove()

  if (!schema) return

  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

/**
 * How much scene this machine can actually carry.
 *
 * The first version of this asked the browser how many cores it had, which
 * says nothing useful: an Intel MacBook reports eight and then renders this
 * room at twelve frames a second, because the work here is almost all fill
 * rate and its graphics share the memory bus with everything else.
 *
 * So two things decide the quality now. The graphics card names itself, which
 * separates "Apple M2" from "Intel Iris Plus" far better than a core count
 * ever could -- and then the scene watches its own frame times and steps down
 * if it was wrong. The second part matters more: it is the only thing that
 * works on a machine nobody tested.
 *
 * The order things are given up in is deliberate, cheapest loss first:
 *
 *   glow   -- about a dozen full-screen passes, and the least missed
 *   mirror -- draws the whole room a second time
 *   pixels -- every pixel costs twice at two, and at this size it barely shows
 *   detail -- 128 segments around a bottle 300 pixels tall is 96 wasted
 *   shadow -- real shadows go last; the contact shadows under the bottles stay
 *
 * The bottles, the light, the label, the powder and the demonstration on the
 * skin are the same at every level. Nothing that tells the story is on this
 * list.
 */

/** The levels, in the order they are stepped down through. */
export const LEVELS = ['high', 'medium', 'low', 'minimal']

const SETTINGS = {
  high: {
    pixelRatio: 2,
    antialias: false,
    bloom: true,
    mirror: 1024,
    shadows: true,
    shadowMap: 2048,
    shadowRadius: 5,
    petals: 80,
    particleScale: 1,
    detail: 1,
    fps: 0,
  },
  medium: {
    pixelRatio: 1.5,
    antialias: false,
    bloom: false,
    mirror: 512,
    shadows: true,
    shadowMap: 1024,
    shadowRadius: 3,
    petals: 48,
    particleScale: 0.6,
    detail: 0.5,
    fps: 60,
  },
  low: {
    pixelRatio: 1.3,
    antialias: false,
    bloom: false,
    mirror: 0,
    shadows: true,
    shadowMap: 512,
    shadowRadius: 2,
    petals: 26,
    particleScale: 0.38,
    detail: 0.35,
    fps: 30,
  },
  minimal: {
    pixelRatio: 1.1,
    antialias: false,
    bloom: false,
    mirror: 0,
    // No shadow pass at all: that is a second draw of every object, every
    // frame. The painted contact shadows under the bottles stay, so they are
    // still standing on something.
    shadows: false,
    shadowMap: 512,
    shadowRadius: 1,
    petals: 16,
    particleScale: 0.25,
    detail: 0.28,
    fps: 30,
  },
}

/**
 * What the graphics card calls itself, lower-cased, or null.
 *
 * Browsers have been narrowing this for fingerprinting reasons, so it is a
 * hint rather than an answer -- which is why nothing depends on it alone.
 */
function rendererName() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')

    if (!gl) return null

    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)

    gl.getExtension('WEBGL_lose_context')?.loseContext()

    return typeof name === 'string' ? name.toLowerCase() : null
  } catch {
    return null
  }
}

/** A card with memory of its own, that can afford the room twice over. */
function isFastGpu(name) {
  if (!name) return false

  // Apple silicon, and desktop cards from either maker.
  if (/apple m\d/.test(name)) return true
  if (/(geforce|quadro|rtx|gtx)/.test(name)) return true
  if (/radeon (rx|pro)/.test(name)) return true

  return false
}

/** Graphics sharing the processor's memory: every Intel laptop, and most cheap ones. */
function isIntegratedGpu(name) {
  if (!name) return false

  return /(intel|iris|uhd graphics|hd graphics|mesa|llvmpipe|swiftshader|microsoft basic)/.test(name)
}

/**
 * Where to start. The scene will correct this downwards if it was optimistic.
 */
export function detectTier() {
  if (typeof window === 'undefined') return 'medium'

  const forced = new URLSearchParams(location.search).get('quality')
  if (forced && SETTINGS[forced]) return forced

  const name = rendererName()
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 1024px)').matches
  const memory = navigator.deviceMemory ?? 4

  // A phone or tablet, whatever it says about itself.
  if (coarse || narrow) {
    return memory <= 3 || (navigator.hardwareConcurrency ?? 4) <= 4 ? 'minimal' : 'low'
  }

  // A laptop or desktop. Only a card with its own memory gets everything;
  // integrated graphics start two steps down, because that is where they end
  // up anyway once the scene has measured itself.
  if (isFastGpu(name)) return 'high'
  if (isIntegratedGpu(name)) return 'low'

  // Unknown card: start in the middle rather than guess high. Being wrong
  // upwards costs a visitor several seconds of stutter; being wrong downwards
  // costs a reflection nobody was looking for.
  return 'medium'
}

/** The settings for a level. */
export function settingsFor(tier) {
  return { tier, ...SETTINGS[tier] }
}

/** The level below this one, or null at the bottom. */
export function nextLevelDown(tier) {
  const at = LEVELS.indexOf(tier)

  return at >= 0 && at < LEVELS.length - 1 ? LEVELS[at + 1] : null
}

/** Whether a level was asked for by hand, in which case leave it alone. */
export function isForced() {
  if (typeof location === 'undefined') return false

  const forced = new URLSearchParams(location.search).get('quality')

  return Boolean(forced && SETTINGS[forced])
}

export function qualitySettings(tier = detectTier()) {
  return settingsFor(tier)
}

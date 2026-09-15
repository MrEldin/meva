/**
 * How much scene this device can actually carry.
 *
 * The stage draws the room three times a frame: once into the floor's mirror,
 * once for the scene, and once more through the bloom pass. A desktop GPU does
 * not notice; a phone does, and the result is a beautiful scene at twelve
 * frames a second, which is worse than a simpler one at thirty.
 *
 * So the settings are chosen from what the device tells us about itself, and
 * the parts that cost most are the first to go: the mirrored floor, then the
 * bloom, then resolution. The shapes, the light and the materials -- what the
 * scene actually looks like -- are the same at every tier.
 */

/** Read the device once; the answer cannot change mid-visit. */
export function detectTier() {
  if (typeof window === 'undefined') return 'high'

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 1024px)').matches
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = navigator.deviceMemory ?? 4

  // A desktop with a pointer and room to draw in gets everything.
  if (!coarse && !narrow) return cores <= 4 && memory <= 4 ? 'medium' : 'high'

  // Phones and tablets. An older or smaller one drops another step: a phone
  // reporting four cores or less is roughly an iPhone 8 or a mid-range
  // Android, and neither can afford the mirror.
  if (cores <= 4 || memory <= 3) return 'low'

  return 'medium'
}

const SETTINGS = {
  high: {
    pixelRatio: 2,
    antialias: true,
    bloom: true,
    mirror: 1024,
    shadowMap: 2048,
    shadowRadius: 6,
    petals: 85,
    particleScale: 1,
    // Uncapped: the browser's own rhythm, usually sixty or a hundred and twenty.
    fps: 0,
  },
  medium: {
    pixelRatio: 1.6,
    antialias: false,
    bloom: true,
    mirror: 512,
    shadowMap: 1024,
    shadowRadius: 4,
    petals: 52,
    particleScale: 0.65,
    fps: 60,
  },
  low: {
    // A phone's third pixel buys almost nothing at this distance and costs a
    // third of the frame.
    pixelRatio: 1.35,
    antialias: false,
    // No bloom and no mirror: together they are two of the three full draws.
    bloom: false,
    mirror: 0,
    shadowMap: 512,
    shadowRadius: 2,
    petals: 26,
    particleScale: 0.4,
    // Thirty, steadily. A scene that holds thirty reads as smooth; one that
    // swings between fifty and eighteen reads as broken.
    fps: 30,
  },
}

/**
 * The settings for a tier, with an override for testing: ?quality=low.
 */
export function qualitySettings(tier = detectTier()) {
  const forced = typeof location !== 'undefined' && new URLSearchParams(location.search).get('quality')

  if (forced && SETTINGS[forced]) {
    return { tier: forced, ...SETTINGS[forced] }
  }

  return { tier, ...SETTINGS[tier] }
}

import * as THREE from 'three'

const INK = '#141414'
const BLUSH = '#d48b9c'
const PAPER = '#f9f9f8'

/**
 * Draw a Meva label as one texture that wraps the bottle.
 *
 * Reading round the real label: on the front, "N°" and the number top-left
 * with "WE CARE / LOTION" top-right, the hand-written word in powder pink,
 * the product name in tracked caps over a pink rule with "natural" at its
 * end, "cosmetics" small, and the MEVA word-mark across the whole front with
 * a black band through its feet. A thin vertical rule separates the front
 * from the back panel, which carries the description, composition and
 * directions in small text, with "Proizvedeno u Srbiji" set vertically.
 *
 * Texture columns (share of width): front 0.03–0.45, rule at 0.47, back
 * 0.50–0.88, the rest white. `FRONT_CENTRE` is what faces the camera at rest
 * and `BACK_CENTRE` what faces it when the bottle is turned round.
 */
export const FRONT_CENTRE = 0.24
export const BACK_CENTRE = 0.69

export function createLabelTexture(spec, { width = 4096, height = 1400 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16

  draw(canvas, spec)

  loadFonts().then(() => {
    draw(canvas, spec)
    texture.needsUpdate = true
  })

  return texture
}

let fontsPromise

function loadFonts() {
  fontsPromise ??= Promise.all([
    document.fonts.load('900 100px "Playfair Display"'),
    document.fonts.load('500 100px "Jost"'),
    document.fonts.load('400 100px "Jost"'),
    document.fonts.load('400 100px "Sacramento"'),
  ]).catch(() => {})

  return fontsPromise
}

function draw(canvas, spec) {
  const {
    number = '15+',
    script = 'hair',
    care = 'WE CARE',
    kind = 'LOTION',
    name = 'LOSION',
    ritual = '',
    handle = '@mevakozmetika',
    numberColor = INK,
    bands = 1,
    frame = false,
    back = null,
  } = spec

  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  drawFront(ctx, W, H, { number, script, care, kind, name, ritual, handle, numberColor, bands, frame })

  // Divider between front and back
  ctx.fillStyle = INK
  ctx.fillRect(W * 0.47, H * 0.1, 3, H * 0.8)

  if (back) drawBack(ctx, W, H, back)
}

function drawFront(ctx, W, H, o) {
  const x0 = W * 0.03
  const x1 = W * 0.45
  const fw = x1 - x0
  const left = x0 + fw * 0.05
  const right = x1 - fw * 0.05
  const inner = right - left

  if (o.frame) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    ctx.strokeRect(x0, H * 0.08, fw, H * 0.84)
  }

  // N° and the number, top left
  ctx.fillStyle = o.numberColor
  ctx.font = `900 ${H * 0.095}px "Playfair Display", serif`
  ctx.fillText('N', left, H * 0.26)
  const nWidth = ctx.measureText('N').width
  ctx.font = `700 ${H * 0.042}px "Playfair Display", serif`
  ctx.fillText('o', left + nWidth + H * 0.004, H * 0.205)
  ctx.font = `900 ${H * 0.14}px "Playfair Display", serif`
  ctx.fillText(o.number, left + nWidth + H * 0.045, H * 0.26)

  // "WE CARE / LOTION", top right, tracked caps
  if (o.care) {
    ctx.fillStyle = INK
    ctx.font = `500 ${H * 0.042}px "Jost", sans-serif`
    drawTrackedRight(ctx, o.care, right, H * 0.19, H * 0.012)
    ctx.font = `400 ${H * 0.038}px "Jost", sans-serif`
    drawTrackedRight(ctx, o.kind, right, H * 0.25, H * 0.012)
  }

  // Hand-written word in powder pink, right
  if (o.script) {
    ctx.fillStyle = BLUSH
    ctx.font = `400 ${H * 0.14}px "Sacramento", cursive`
    ctx.textAlign = 'right'
    ctx.fillText(o.script, right, H * 0.42)
    ctx.textAlign = 'left'
  }

  // Product name, tracked caps, up to two lines
  ctx.fillStyle = INK
  ctx.font = `500 ${H * 0.044}px "Jost", sans-serif`
  const nameWidth = o.script ? inner * 0.62 : inner
  const lines = wrapTracked(ctx, o.name.toUpperCase(), nameWidth, H * 0.005)
  const nameTop = H * 0.4
  lines.forEach((line, i) => drawTracked(ctx, line, left, nameTop + i * H * 0.06, H * 0.005))
  const nameBottom = nameTop + (lines.length - 1) * H * 0.06

  // "natural", tiny pink script, at the rule's end
  ctx.fillStyle = BLUSH
  ctx.font = `400 ${H * 0.05}px "Sacramento", cursive`
  ctx.textAlign = 'right'
  ctx.fillText('natural', right, nameBottom + H * 0.028)
  ctx.textAlign = 'left'

  // Pink rule
  const ruleY = nameBottom + H * 0.04
  ctx.fillStyle = BLUSH
  ctx.fillRect(left, ruleY, inner, 4)

  if (o.ritual) {
    ctx.fillStyle = INK
    ctx.font = `400 ${H * 0.032}px "Jost", sans-serif`
    drawTracked(ctx, o.ritual.toUpperCase(), left, ruleY + H * 0.06, H * 0.01)
  }

  // "cosmetics", tracked lowercase, right-aligned over the word-mark
  ctx.fillStyle = INK
  ctx.font = `400 ${H * 0.036}px "Jost", sans-serif`
  drawTrackedRight(ctx, 'cosmetics', right, H * 0.63, H * 0.014)

  // MEVA across the front; a black band cuts its feet.
  const baseline = H * 0.885
  ctx.font = `900 ${H * 0.3}px "Playfair Display", serif`
  const markWidth = ctx.measureText('MEVA').width
  const markSize = Math.min(H * 0.3, (H * 0.3 * inner) / markWidth)
  ctx.font = `900 ${markSize}px "Playfair Display", serif`
  const markX = right - ctx.measureText('MEVA').width

  ctx.fillStyle = INK
  ctx.fillText('MEVA', markX, baseline)

  const bandH = H * 0.055
  const bandY = baseline - bandH * 0.75
  ctx.fillRect(x0, bandY, fw, bandH)

  ctx.save()
  ctx.beginPath()
  ctx.rect(x0, bandY, fw, bandH)
  ctx.clip()
  ctx.fillStyle = PAPER
  ctx.fillText('MEVA', markX, baseline)
  ctx.restore()

  if (o.bands > 1) {
    ctx.fillStyle = INK
    ctx.fillRect(x0, H * 0.955, fw, H * 0.02)
  }

  ctx.fillStyle = INK
  ctx.font = `400 ${H * 0.024}px "Jost", sans-serif`
  ctx.fillText(o.handle, left, H * 0.94)
}

function drawBack(ctx, W, H, back) {
  const x0 = W * 0.5
  const x1 = W * 0.88
  const left = x0 + (x1 - x0) * 0.04
  const right = x1 - (x1 - x0) * 0.14 // leaves room for the vertical line
  const width = right - left
  let y = H * 0.16

  const paragraph = (text, size, weight = 400, gap = 1.45, color = INK) => {
    ctx.fillStyle = color
    ctx.font = `${weight} ${size}px "Jost", sans-serif`
    for (const line of wrapPlain(ctx, text, width)) {
      ctx.fillText(line, left, y)
      y += size * gap
    }
  }

  if (back.title) {
    ctx.fillStyle = INK
    ctx.font = `500 ${H * 0.036}px "Jost", sans-serif`
    drawTracked(ctx, back.title.toUpperCase(), left, y, H * 0.01)
    y += H * 0.07
  }

  if (back.description) {
    paragraph(back.description, H * 0.028)
    y += H * 0.03
  }

  if (back.ingredients?.length) {
    paragraph('Sastav / Ingredients:', H * 0.028, 500, 1.6)
    paragraph(back.ingredients.join(', ') + '.', H * 0.026, 400, 1.5)
    y += H * 0.03
  }

  if (back.usage) {
    paragraph('Način upotrebe:', H * 0.028, 500, 1.6)
    paragraph(back.usage, H * 0.026)
    y += H * 0.03
  }

  // Volume and maker, bottom
  ctx.fillStyle = INK
  ctx.font = `500 ${H * 0.05}px "Jost", sans-serif`
  ctx.fillText(back.volume ?? '', left, H * 0.9)
  ctx.font = `400 ${H * 0.024}px "Jost", sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('Meva Kozmetika · Novi Pazar', right, H * 0.9)
  ctx.textAlign = 'left'

  // "PROIZVEDENO U SRBIJI", vertical, at the panel's far edge
  ctx.save()
  ctx.translate(x1 - (x1 - x0) * 0.05, H * 0.85)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = INK
  ctx.font = `500 ${H * 0.03}px "Jost", sans-serif`
  drawTracked(ctx, 'PROIZVEDENO U SRBIJI', 0, 0, H * 0.012)
  ctx.restore()
}

function drawTracked(ctx, text, x, y, tracking) {
  let cursor = x
  for (const char of text) {
    ctx.fillText(char, cursor, y)
    cursor += ctx.measureText(char).width + tracking
  }
}

function trackedWidth(ctx, text, tracking) {
  const chars = [...text]
  return chars.reduce((w, c) => w + ctx.measureText(c).width, 0) + tracking * (chars.length - 1)
}

function drawTrackedRight(ctx, text, xRight, y, tracking) {
  drawTracked(ctx, text, xRight - trackedWidth(ctx, text, tracking), y, tracking)
}

function wrapTracked(ctx, text, maxWidth, tracking) {
  return wrapBy(text, (s) => trackedWidth(ctx, s, tracking), maxWidth, 2)
}

function wrapPlain(ctx, text, maxWidth) {
  return wrapBy(text, (s) => ctx.measureText(s).width, maxWidth, 30)
}

function wrapBy(text, measure, maxWidth, maxLines) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (measure(test) > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, maxLines)
}

/** A soft radial shadow, used as a contact shadow under each bottle. */
export function createShadowTexture(size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(0,0,0,0.6)')
  gradient.addColorStop(0.4, 'rgba(0,0,0,0.25)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/** A soft round sprite for the floating particles. */
export function createSpriteTexture(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * The floor's fade: the card's forest green, thinning to nothing under the products,
 * so the mirror beneath shows only close to their feet. Drawn in sRGB and
 * left un-tone-mapped so its edges match the page exactly.
 */
export function createFloorFadeTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(36,52,44,0.45)')
  gradient.addColorStop(0.35, 'rgba(36,52,44,0.8)')
  gradient.addColorStop(0.75, 'rgba(36,52,44,1)')
  gradient.addColorStop(1, 'rgba(36,52,44,1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

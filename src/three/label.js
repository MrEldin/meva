import * as THREE from 'three'

const INK = '#141414'
const BLUSH = '#d48b9c'
const PAPER = '#f8f8f7'

/**
 * Draw a Meva label as a texture.
 *
 * The real labels are pure typography — a numbered "N°" top-left, a thin
 * vertical rule, a hand-written word in powder pink, the product name in
 * tracked caps over a pink line, "cosmetics" small, and the MEVA word-mark
 * set so large it runs off the label's edge, its feet cut by a black band —
 * so a canvas in the site's fonts reproduces them faithfully. The texture
 * wraps most of the bottle; the design sits on the front and the back is
 * quiet white.
 */
export function createLabelTexture(spec, { width = 2048, height = 1400 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8

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
    name = 'LOSION',
    ritual = '',
    handle = '@mevakozmetika',
    numberColor = INK,
    bands = 1,
    front = 0.5, // share of the wrap the design occupies
  } = spec

  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const x0 = W * 0.05 // left margin of the design
  const fw = W * front // design width
  const edge = x0 + fw // where the design is cut off, like the label's edge

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  ctx.textBaseline = 'alphabetic'

  // N° and the number, top left
  ctx.fillStyle = numberColor
  ctx.font = `900 ${H * 0.075}px "Playfair Display", serif`
  ctx.fillText('N', x0, H * 0.235)
  const nWidth = ctx.measureText('N').width
  ctx.font = `700 ${H * 0.036}px "Playfair Display", serif`
  ctx.fillText('o', x0 + nWidth + H * 0.004, H * 0.19)
  ctx.font = `900 ${H * 0.105}px "Playfair Display", serif`
  ctx.fillText(number, x0 + nWidth + H * 0.04, H * 0.235)

  // Thin vertical rule
  ctx.fillStyle = INK
  ctx.fillRect(edge - fw * 0.12, H * 0.13, 2.5, H * 0.16)

  // Hand-written word in powder pink, right of the name
  ctx.fillStyle = BLUSH
  ctx.font = `400 ${H * 0.115}px "Sacramento", cursive`
  ctx.fillText(script, edge - fw * 0.42, H * 0.41)

  // Product name, tracked caps
  ctx.fillStyle = INK
  ctx.font = `500 ${H * 0.03}px "Jost", sans-serif`
  drawTracked(ctx, name.toUpperCase(), x0, H * 0.425, H * 0.004, edge - x0 - fw * 0.02)

  // Pink rule
  ctx.fillStyle = BLUSH
  ctx.fillRect(x0 - W * 0.02, H * 0.45, edge - x0 + W * 0.04, 3)

  if (ritual) {
    ctx.fillStyle = INK
    ctx.font = `400 ${H * 0.026}px "Jost", sans-serif`
    drawTracked(ctx, ritual.toUpperCase(), x0, H * 0.5, H * 0.007)
  }

  // "cosmetics", small, over the word-mark's right half
  ctx.fillStyle = INK
  ctx.font = `400 ${H * 0.03}px "Jost", sans-serif`
  drawTracked(ctx, 'cosmetics', edge - fw * 0.36, H * 0.6, H * 0.01)

  // MEVA — huge, black, running off the edge; a black band cuts its feet.
  const markSize = H * 0.36
  const markX = x0 + fw * 0.22
  const baseline = H * 0.86
  ctx.font = `900 ${markSize}px "Playfair Display", serif`

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, edge, H)
  ctx.clip()
  ctx.fillStyle = INK
  ctx.fillText('MEVA', markX, baseline)
  ctx.restore()

  const bandY = baseline - H * 0.045
  const bandH = H * 0.06
  ctx.fillStyle = INK
  ctx.fillRect(0, bandY, edge, bandH)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, bandY, edge, bandH)
  ctx.clip()
  ctx.fillStyle = PAPER
  ctx.fillText('MEVA', markX, baseline)
  ctx.restore()

  if (bands > 1) {
    ctx.fillStyle = INK
    ctx.fillRect(0, H * 0.945, edge, H * 0.022)
  }

  // Instagram handle, tiny, under the band
  ctx.fillStyle = INK
  ctx.font = `400 ${H * 0.018}px "Jost", sans-serif`
  ctx.fillText(handle, x0, H * 0.92)
}

function drawTracked(ctx, text, x, y, tracking, maxWidth = Infinity) {
  let cursor = x

  for (const char of text) {
    const w = ctx.measureText(char).width
    if (cursor + w > x + maxWidth) break
    ctx.fillText(char, cursor, y)
    cursor += w + tracking
  }
}

/**
 * A soft radial shadow, used as a contact shadow under each bottle.
 */
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

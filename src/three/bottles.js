import * as THREE from 'three'

import { BACK_CENTRE, createLabelTexture, createShadowTexture, FRONT_CENTRE } from './label'
import { createRoughnessTexture } from './studio'

const TAU = Math.PI * 2
const WRAP = 0.86 // share of the circumference the label covers

/** Turn a bottle by this much to bring the back panel to the camera. */
export const BACK_ROTATION = -(BACK_CENTRE - FRONT_CENTRE) * TAU * WRAP

// Shared materials, so every bottle in the scene catches the light the same way.
const roughness = createRoughnessTexture()

const plastic = new THREE.MeshPhysicalMaterial({
  color: 0xf4f3f1,
  roughness: 0.42,
  roughnessMap: roughness,
  metalness: 0,
  clearcoat: 0.5,
  clearcoatRoughness: 0.28,
  sheen: 0.35,
  sheenRoughness: 0.6,
  sheenColor: new THREE.Color(0xfff4ee),
  envMapIntensity: 1.0,
})

// The dark seam where a cap meets its bottle.
const seam = new THREE.MeshStandardMaterial({ color: 0x8a8580, roughness: 0.7 })

// Frosted polypropylene flip cap: milky, a touch greyer than the body.
const frosted = new THREE.MeshPhysicalMaterial({
  color: 0xe9e9e7,
  roughness: 0.6,
  roughnessMap: roughness,
  clearcoat: 0.25,
  clearcoatRoughness: 0.5,
  sheen: 0.5,
  sheenRoughness: 0.8,
  sheenColor: new THREE.Color(0xffffff),
  envMapIntensity: 0.8,
})

const black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.5 })

const amber = new THREE.MeshPhysicalMaterial({
  color: 0x7a3d10,
  roughness: 0.12,
  transmission: 0.35,
  thickness: 0.6,
  ior: 1.5,
  clearcoat: 0.6,
})

let shadowTexture

/**
 * A lathe profile for a plastic bottle body: rounded base, straight wall,
 * soft rounded shoulder into a short neck. Points are [radius, height].
 */
function bodyGeometry(r, h, neck = 0.3) {
  const pts = []
  const push = (x, y) => pts.push(new THREE.Vector2(x, y))

  push(0, 0)
  // Rounded base edge
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2)
    push(r - 0.06 + Math.sin(a) * 0.06, 0.06 - Math.cos(a) * 0.06)
  }
  push(r, h - 0.34)
  // Rounded shoulder: quarter ellipse from the wall to the neck
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2)
    push(r * neck + (r - r * neck) * Math.cos(a), h - 0.34 + Math.sin(a) * 0.34)
  }
  push(r * neck, h + 0.04)
  push(r * neck * 0.8, h + 0.04)
  push(0, h + 0.04)

  return new THREE.LatheGeometry(pts, 128)
}

/** Flip-top cap: a bevelled cylinder with a hinge lip at the back. */
function flipCap(r, h) {
  const group = new THREE.Group()
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(r, 0), new THREE.Vector2(r, h * 0.55)]
  // Groove where the lid hinges
  pts.push(new THREE.Vector2(r - 0.012, h * 0.58), new THREE.Vector2(r - 0.012, h * 0.62), new THREE.Vector2(r, h * 0.65))
  pts.push(new THREE.Vector2(r, h - 0.06))
  // Rounded top edge
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    pts.push(new THREE.Vector2(r - 0.06 + Math.cos(a) * 0.06, h - 0.06 + Math.sin(a) * 0.06))
  }
  pts.push(new THREE.Vector2(0, h))
  group.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 96), frosted))

  // Dark seam at the foot of the cap
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.98, 0.008, 8, 64), seam)
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  // Thumb lip at the front, where the cap flips open
  const lip = new THREE.Mesh(new THREE.BoxGeometry(r * 0.55, h * 0.14, 0.05), frosted)
  lip.position.set(0, h * 0.84, r - 0.01)
  group.add(lip)

  return group
}

/** A screw cap with vertical ribs, as on the oil. */
function ribbedCap(r, h, ribs = 36) {
  const geometry = new THREE.CylinderGeometry(r, r, h, ribs * 2, 1, false)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const radius = Math.hypot(x, z)
    if (radius < r * 0.5) continue
    const angle = Math.atan2(z, x)
    const k = Math.round((angle / (Math.PI * 2)) * ribs * 2) % 2 === 0 ? 1 : 0.955
    pos.setX(i, Math.cos(angle) * r * k)
    pos.setZ(i, Math.sin(angle) * r * k)
  }
  geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, plastic)
}

function labelMesh(r, y, h, spec, wrap = WRAP) {
  const length = TAU * wrap
  // The front of the design faces the camera at rotation 0.
  const geometry = new THREE.CylinderGeometry(r, r, h, 192, 1, true, -FRONT_CENTRE * length, length)
  const material = new THREE.MeshStandardMaterial({
    map: createLabelTexture(spec),
    roughness: 0.55,
    metalness: 0,
    envMapIntensity: 0.6,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = y

  return mesh
}

function contactShadow(radius) {
  shadowTexture ??= createShadowTexture()

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 4.6, radius * 4.6),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.9 }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.002
  mesh.renderOrder = -1

  return mesh
}

/**
 * Every bottle is a Group whose origin is the centre of its body, with a
 * `.height` so the stage can place it on the floor and frame it.
 */
function finish(group, height, cap = null) {
  group.userData.height = height
  group.userData.cap = cap
  group.children.forEach((child) => (child.position.y -= height / 2))
  group.traverse((o) => {
    if (o.isMesh && o.material !== undefined && !o.material.map?.isCanvasTexture) o.castShadow = true
    if (o.isMesh && o.geometry?.type === 'PlaneGeometry') o.castShadow = false // contact shadows
  })

  return group
}

/** 100 ml lotion bottle with a frosted flip cap — the house's N°15+. */
export function lotionBottle(spec = {}) {
  const r = 0.36
  const h = 1.66
  const group = new THREE.Group()

  group.add(new THREE.Mesh(bodyGeometry(r, h, 0.3), plastic))

  const cap = flipCap(r * 0.36, 0.34)
  cap.position.y = h + 0.03
  group.add(cap)

  group.add(labelMesh(r + 0.003, h * 0.47, h * 0.72, {
    number: '15+',
    script: 'hair',
    care: 'WE CARE',
    kind: 'LOTION',
    name: 'Losion za seboreični dermatitis',
    back: {
      title: 'Losion za seboreični dermatitis',
      description: 'Za kožu glave sklonu seboreji, peruti i masnom temenu. Deluje umirujuće, regenerišuće i antibakterijski.',
      ingredients: ['Lavandula angustifolia (hidrolat lavande)', 'Rosa damascena (hidrolat ruže)', 'Triticum vulgare (proteini pšenice)', 'Niacinamide (vitamin B3)', 'Melaleuca alternifolia (ulje čajevca)', 'Camellia sinensis (ekstrakt zelenog čaja)', 'Salicylic Acid (salicilna kiselina)'],
      usage: 'Naneti uveče direktno na kožu glave i ne ispirati. Preporučuje se redovna upotreba.',
      volume: '100 ml ℮',
    },
    ...spec,
  }))
  group.add(contactShadow(r))

  return finish(group, h + 0.37, cap)
}

/** 200 ml shampoo, taller, with a low flip cap and two black bands. */
export function shampooBottle(spec = {}) {
  const r = 0.42
  const h = 2.3
  const group = new THREE.Group()

  group.add(new THREE.Mesh(bodyGeometry(r, h, 0.4), plastic))

  const cap = flipCap(r * 0.42, 0.26)
  cap.position.y = h + 0.03
  group.add(cap)

  group.add(labelMesh(r + 0.003, h * 0.45, h * 0.78, {
    number: '10',
    script: 'hair',
    care: 'WE CARE',
    kind: 'SHAMPOO',
    name: 'Šampon za kosu',
    bands: 2,
    back: {
      title: 'Šampon za kosu',
      description: 'Čisti bez sulfata i silikona, jača strukturu vlasi i podstiče rast.',
      ingredients: ['Cocamidopropyl Betaine', 'Aqua', 'Ricinus Communis Seed Oil', 'Olea Europaea', 'Triticum Vulgare Germ Oil', 'Prunus Amygdalus Dulcis', 'Dexpanthenol', 'Tocopherol', 'Citrus Limon', 'Melaleuca Alternifolia', 'Cymbopogon Martini Oil', 'Glycerol', 'Mangifera Indica'],
      usage: 'Naneti na mokru kosu, nežno masirati kožu glave kružnim pokretima, isprati.',
      volume: '200 ml ℮',
    },
    ...spec,
  }))
  group.add(contactShadow(r))

  return finish(group, h + 0.3, cap)
}

/** 50 ml oil with a ribbed screw cap and dropper tip. */
export function oilBottle(spec = {}) {
  const r = 0.3
  const h = 1.05
  const group = new THREE.Group()

  group.add(new THREE.Mesh(bodyGeometry(r, h, 0.62), plastic))

  const cap = ribbedCap(r * 0.66, 0.3)
  cap.position.y = h + 0.17
  group.add(cap)

  const capSeam = new THREE.Mesh(new THREE.TorusGeometry(r * 0.64, 0.007, 8, 64), seam)
  capSeam.rotation.x = Math.PI / 2
  capSeam.position.y = h + 0.02
  group.add(capSeam)

  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, r * 0.45, 0.26, 48), plastic)
  tip.position.y = h + 0.45
  group.add(tip)

  group.add(labelMesh(r + 0.003, h * 0.48, h * 0.66, {
    number: '8',
    script: 'hair & lashes',
    care: 'WE CARE',
    kind: 'OIL',
    name: 'Ulje za seboreju',
    back: {
      title: 'Ulje za seboreju',
      ingredients: ['Prunus amygdalus dulcis', 'Glycerinum', 'Acidum salicylicum', 'Melaleuca alternifolia', 'Citrus limon'],
      usage: 'Naneti na teme dva sata pre pranja kose, dva puta nedeljno.',
      volume: '50 ml ℮',
    },
    ...spec,
  }))
  group.add(contactShadow(r))

  return finish(group, h + 0.58)
}

/** 50 ml cream jar with a flat lid. */
export function creamJar(spec = {}) {
  const r = 0.44
  const h = 0.58
  const group = new THREE.Group()

  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.97, h, 96), plastic)
  body.position.y = h / 2
  group.add(body)

  const lidPts = [new THREE.Vector2(0, 0), new THREE.Vector2(r * 1.015, 0), new THREE.Vector2(r * 1.015, 0.24)]
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    lidPts.push(new THREE.Vector2(r * 1.015 - 0.06 + Math.cos(a) * 0.06, 0.24 + Math.sin(a) * 0.06))
  }
  lidPts.push(new THREE.Vector2(0, 0.3))
  const lid = new THREE.Mesh(new THREE.LatheGeometry(lidPts, 96), frosted)
  lid.position.y = h + 0.01
  group.add(lid)

  const gap = new THREE.Mesh(new THREE.TorusGeometry(r * 0.99, 0.009, 8, 96), seam)
  gap.rotation.x = Math.PI / 2
  gap.position.y = h
  group.add(gap)

  group.add(labelMesh(r + 0.003, h * 0.5, h * 0.82, {
    number: '4',
    script: '',
    care: 'SKIN CARE',
    kind: 'RITUAL',
    name: 'Krema za seboreju — dan',
    numberColor: '#d48b9c',
    frame: true,
    back: {
      title: 'Dnevna krema za seboreju',
      ingredients: ['Aqua', 'Glycerin', 'Cetearyl Olivate', 'Sorbitan Olivate', 'Prunus Amygdalus Dulcis Oil', 'Helianthus Annuus Seed Oil', 'Simmondsia Chinensis Seed Oil', 'Calendula Officinalis Flower Oil', 'Allantoin', 'Panthenol', 'Tocopherol', 'Salicylic Acid'],
      usage: 'Naneti ujutru na čistu kožu lica.',
      volume: '50 ml ℮',
    },
    ...spec,
  }))
  group.add(contactShadow(r))

  return finish(group, h + 0.31)
}

/** 30 ml amber glass serum with a black dropper. */
export function serumBottle(spec = {}) {
  const r = 0.3
  const h = 1.0
  const group = new THREE.Group()

  group.add(new THREE.Mesh(bodyGeometry(r, h, 0.5), amber))

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.56, r * 0.56, 0.3, 48), black)
  collar.position.y = h + 0.17
  group.add(collar)

  const bulb = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.3, 0.3, 8, 24), black)
  bulb.position.y = h + 0.55
  group.add(bulb)

  group.add(labelMesh(r + 0.003, h * 0.42, h * 0.6, { number: 'B3', script: '', care: 'SKIN CARE', kind: 'RITUAL', name: 'Retinol + B3 serum', numberColor: '#d48b9c', ...spec }))
  group.add(contactShadow(r))

  return finish(group, h + 0.7)
}

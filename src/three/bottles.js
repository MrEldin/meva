import * as THREE from 'three'

import { BACK_CENTRE, createLabelTexture, createShadowTexture, FRONT_CENTRE } from './label'

const TAU = Math.PI * 2
const WRAP = 0.86 // share of the circumference the label covers

/** Turn a bottle by this much to bring the back panel to the camera. */
export const BACK_ROTATION = -(BACK_CENTRE - FRONT_CENTRE) * TAU * WRAP

// Shared materials, so every bottle in the scene catches the light the same way.
const plastic = new THREE.MeshPhysicalMaterial({
  color: 0xf4f3f1,
  roughness: 0.34,
  metalness: 0,
  clearcoat: 0.55,
  clearcoatRoughness: 0.22,
  envMapIntensity: 1.1,
})

// Frosted polypropylene flip cap: milky, a touch greyer than the body.
const frosted = new THREE.MeshPhysicalMaterial({
  color: 0xe6e6e6,
  roughness: 0.55,
  clearcoat: 0.3,
  clearcoatRoughness: 0.4,
  envMapIntensity: 0.9,
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
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r, 0),
    new THREE.Vector2(r, h - 0.05),
    new THREE.Vector2(r - 0.03, h - 0.01),
    new THREE.Vector2(r - 0.08, h),
    new THREE.Vector2(0, h),
  ]
  group.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 96), frosted))

  // Thumb lip at the front, where the cap flips open
  const lip = new THREE.Mesh(new THREE.BoxGeometry(r * 0.55, h * 0.16, 0.05), frosted)
  lip.position.set(0, h * 0.82, r - 0.01)
  group.add(lip)

  return group
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
function finish(group, height) {
  group.userData.height = height
  group.children.forEach((child) => (child.position.y -= height / 2))

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

  return finish(group, h + 0.37)
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

  return finish(group, h + 0.3)
}

/** 50 ml oil with a ribbed screw cap and dropper tip. */
export function oilBottle(spec = {}) {
  const r = 0.3
  const h = 1.05
  const group = new THREE.Group()

  group.add(new THREE.Mesh(bodyGeometry(r, h, 0.62), plastic))

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.66, r * 0.66, 0.3, 48), plastic)
  cap.position.y = h + 0.17
  group.add(cap)

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

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.015, r * 1.015, 0.3, 96), frosted)
  lid.position.y = h + 0.16
  group.add(lid)

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

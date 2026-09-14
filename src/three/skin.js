import * as THREE from 'three'

const UP = new THREE.Vector3(0, 1, 0)
const FWD = new THREE.Vector3(0, 0, 1)
const clamp01 = (v) => Math.max(0, Math.min(1, v))

/**
 * A patch of scalp, for showing what the lotion does: a gently domed piece
 * of skin with pores, fine hair growing in one direction, a mottled bloom
 * of redness and a scatter of flakes. Once the drop lands, a glossy film
 * spreads out from the centre along the curve; the flakes lift away as it
 * reaches them and the redness calms.
 *
 * Everything animates from `state`: flakes (1 present → 0 gone), redness
 * (1 → 0), film (0 → 1), drop (0 at the bottle's mouth → 1 on the skin).
 */
export function createSkinPatch() {
  const group = new THREE.Group()

  // Geometry of the dome: a cap of a large sphere, sitting on a short wall.
  const RIM = 0.78 // cap radius on the floor plane
  const SPHERE = 2.4 // radius of the sphere the cap is cut from
  const THETA = Math.asin(RIM / SPHERE)
  const WALL = 0.14 // height of the skin's side
  const CENTRE_Y = WALL - SPHERE * Math.cos(THETA) // sphere centre, below the floor
  const TOP = CENTRE_Y + SPHERE
  const surfaceY = (r) => CENTRE_Y + Math.sqrt(SPHERE * SPHERE - r * r)
  const normalAt = (x, z) => new THREE.Vector3(x, surfaceY(Math.hypot(x, z)) - CENTRE_Y, z).normalize()

  const skinMaterial = new THREE.MeshPhysicalMaterial({
    map: createSkinTexture(),
    bumpMap: createPoreTexture(),
    bumpScale: 0.006,
    roughness: 0.78,
    sheen: 0.25,
    sheenRoughness: 0.9,
    sheenColor: new THREE.Color(0xffd9c8),
    envMapIntensity: 0.28,
  })

  const dome = new THREE.Mesh(new THREE.SphereGeometry(SPHERE, 128, 48, 0, Math.PI * 2, 0, THETA), skinMaterial)
  dome.position.y = CENTRE_Y
  dome.castShadow = true
  dome.receiveShadow = true
  group.add(dome)

  const wall = new THREE.Mesh(new THREE.CylinderGeometry(RIM, RIM * 0.985, WALL, 128, 1, true), skinMaterial)
  wall.position.y = WALL / 2
  wall.castShadow = true
  group.add(wall)

  const rim = new THREE.Mesh(new THREE.TorusGeometry(RIM - 0.008, 0.018, 12, 128), skinMaterial)
  rim.rotation.x = Math.PI / 2
  rim.position.y = WALL
  group.add(rim)

  const bottom = new THREE.Mesh(new THREE.CircleGeometry(RIM, 64), skinMaterial)
  bottom.rotation.x = -Math.PI / 2
  bottom.position.y = 0.001
  group.add(bottom)

  // Redness: a mottled overlay following the dome, a hair above the skin.
  const redness = new THREE.Mesh(
    new THREE.SphereGeometry(SPHERE + 0.0025, 96, 32, 0, Math.PI * 2, 0, THETA * 0.96),
    new THREE.MeshBasicMaterial({ map: createRednessTexture(), transparent: true, opacity: 0, depthWrite: false }),
  )
  redness.position.y = CENTRE_Y
  group.add(redness)

  // Film: glossy and translucent; it grows outward from the pole by moving
  // an alpha threshold across a radial alpha map.
  const filmMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf6ece6,
    roughness: 0.12,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.4,
    alphaMap: createRadialAlphaTexture(),
    alphaTest: 1,
    depthWrite: false,
    envMapIntensity: 0.8,
  })
  const film = new THREE.Mesh(new THREE.SphereGeometry(SPHERE + 0.006, 96, 32, 0, Math.PI * 2, 0, THETA * 0.97), filmMaterial)
  film.position.y = CENTRE_Y
  film.visible = false
  group.add(film)

  // Hairs: fine tapered shafts growing out of the dome, all leaning one way
  // with a little scatter, as hair does.
  const HAIRS = 170
  const hairGeometry = new THREE.CylinderGeometry(0.0016, 0.0042, 1, 5)
  hairGeometry.translate(0, 0.5, 0)
  const hairs = new THREE.InstancedMesh(hairGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }), HAIRS)
  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  const lean = new THREE.Quaternion()
  const hairColours = [0x3a2b23, 0x2e211b, 0x4a3529, 0x261a15]
  const hairBase = []
  for (let i = 0; i < HAIRS; i++) {
    const r = Math.sqrt(Math.random()) * RIM * 0.9
    const a = Math.random() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    hairBase.push({ reach: r / (RIM * 0.9), colour: new THREE.Color(hairColours[i % hairColours.length]) })
    dummy.position.set(x, surfaceY(r) - 0.01, z)
    dummy.quaternion.setFromUnitVectors(UP, normalAt(x, z))
    // Grow towards −x with scatter.
    lean.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.5, 0, 0.55 + (Math.random() - 0.5) * 0.5))
    dummy.quaternion.multiply(lean)
    const length = 0.2 + Math.random() * 0.16
    dummy.scale.set(1, length, 1)
    dummy.updateMatrix()
    hairs.setMatrixAt(i, dummy.matrix)
    hairs.setColorAt(i, color.setHex(hairColours[i % hairColours.length]))
  }
  hairs.castShadow = true
  group.add(hairs)
  const wetColour = new THREE.Color(0x120c09)
  let lastWet = -1

  // A ripple where the stream meets the skin.
  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1, 64),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
  )
  ripple.rotation.x = -Math.PI / 2
  ripple.position.y = TOP + 0.004
  ripple.visible = false
  group.add(ripple)

  // Flakes: irregular little scales, pale and dry, lying on the skin.
  const FLAKES = 120
  const flakes = new THREE.InstancedMesh(
    createFlakeGeometry(),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, envMapIntensity: 0.15, side: THREE.DoubleSide }),
    FLAKES,
  )
  const flakeColours = [0xe9dcc4, 0xdccbb0, 0xf1e8d6, 0xd8c6a6]
  const base = []
  for (let i = 0; i < FLAKES; i++) {
    const r = Math.sqrt(Math.random()) * RIM * 0.9
    const a = Math.random() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const n = normalAt(x, z)
    const q = new THREE.Quaternion().setFromUnitVectors(FWD, n)
    q.multiply(new THREE.Quaternion().setFromAxisAngle(FWD, Math.random() * Math.PI * 2))
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7, 0)))
    base.push({ x, z, y: surfaceY(r) + 0.004 + Math.random() * 0.02, n, q, s: 0.55 + Math.random() * 0.9, seed: Math.random() * 10, reach: r / (RIM * 0.9) })
    flakes.setColorAt(i, color.setHex(flakeColours[i % flakeColours.length]))
  }
  group.add(flakes)

  // The pour: a thin stream from the bottle's mouth with a bead at its tip.
  const lotion = new THREE.MeshPhysicalMaterial({ color: 0xf6ece6, roughness: 0.15, clearcoat: 0.6, transparent: true, opacity: 0.92, envMapIntensity: 0.7 })
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 24), lotion)
  drop.visible = false
  group.add(drop)
  const streamGeometry = new THREE.CylinderGeometry(0.016, 0.022, 1, 12, 1, true)
  streamGeometry.translate(0, -0.5, 0) // hangs down from its origin
  const stream = new THREE.Mesh(streamGeometry, lotion)
  stream.visible = false
  group.add(stream)
  const landing = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const tmpQ = new THREE.Quaternion()
  const tmpE = new THREE.Euler()

  /**
   * Apply the animation state. `from` is the drop's start in the patch's
   * local space (the bottle's mouth), so the fall lands at the pole.
   */
  group.userData.apply = (state, t, from) => {
    redness.material.opacity = state.redness * 0.9

    film.visible = state.film > 0.005
    filmMaterial.alphaTest = filmMaterial.opacity * (1 - Math.min(0.999, state.film))

    // Hair darkens and clumps as the lotion wets it.
    if (Math.abs(state.film - lastWet) > 0.004) {
      lastWet = state.film
      for (let i = 0; i < hairBase.length; i++) {
        const h = hairBase[i]
        const wet = clamp01((state.film * 1.05 - h.reach) * 4)
        hairs.setColorAt(i, color.copy(h.colour).lerp(wetColour, wet * 0.65))
      }
      hairs.instanceColor.needsUpdate = true
    }

    // Ripple: rings out from the landing while the film is young.
    const young = clamp01(state.film / 0.28)
    ripple.visible = state.film > 0.005 && young < 1
    if (ripple.visible) {
      ripple.scale.setScalar(0.06 + young * 0.32)
      ripple.material.opacity = (1 - young) * 0.55
    }

    // Flakes shrink, twist and lift off along the surface normal as the film reaches them.
    for (let i = 0; i < base.length; i++) {
      const b = base[i]
      const reached = clamp01((state.film * 1.05 - b.reach) * 4)
      const gone = Math.max(reached, clamp01(1 - state.flakes)) * clamp01(1 - state.flakes + reached)
      const lift = gone * (0.16 + Math.sin(b.seed) * 0.05)
      dummy.position.set(b.x + b.n.x * lift + gone * Math.sin(b.seed * 3) * 0.08, b.y + b.n.y * lift, b.z + b.n.z * lift + gone * Math.cos(b.seed * 3) * 0.08)
      tmpQ.copy(b.q).multiply(tmpQ.setFromEuler(tmpE.set(gone * 2.2, gone * 1.4, 0)))
      dummy.quaternion.copy(b.q).multiply(tmpQ.setFromEuler(tmpE.set(gone * 2.2 * Math.sin(b.seed), gone * 1.6, 0)))
      dummy.scale.setScalar(Math.max(0.0001, b.s * (1 - gone)))
      dummy.updateMatrix()
      flakes.setMatrixAt(i, dummy.matrix)
    }
    flakes.instanceMatrix.needsUpdate = true

    // The pour: the stream reaches down from the mouth as `drop` advances, a
    // bead leading it; once it lands it keeps flowing while the film spreads,
    // then thins away.
    // It flows only while the bottle is actually tipped; lift the bottle and it stops.
    const d = state.drop
    const flowing = state.pour > 0.85 && d > 0.02 && state.film < 0.8
    stream.visible = drop.visible = flowing && !!from
    if (stream.visible) {
      landing.set(0, TOP + 0.01, 0)
      dir.subVectors(landing, from)
      const length = dir.length()
      const reach = Math.min(1, d * 1.05)
      const thin = 1 - clamp01((state.film - 0.35) / 0.45)
      stream.position.copy(from)
      stream.quaternion.setFromUnitVectors(UP, dir.clone().normalize().negate())
      stream.scale.set(thin, length * reach, thin)
      drop.position.copy(from).addScaledVector(dir, reach)
      const squash = clamp01((d - 0.9) / 0.1)
      drop.scale.set((1 + squash * 1.6) * thin, (1 + (1 - squash) * 0.5 - squash * 0.7) * thin, (1 + squash * 1.6) * thin)
    }
  }
  group.userData.top = TOP

  return group
}

/** An irregular seven-sided scale, a little curled. */
function createFlakeGeometry() {
  const shape = new THREE.Shape()
  const n = 7
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = 0.028 * (0.75 + Math.random() * 0.5)
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r * 0.8
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
  }
  shape.closePath()
  const geometry = new THREE.ShapeGeometry(shape, 2)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setZ(i, (pos.getX(i) ** 2 + pos.getY(i) ** 2) * 6)
  geometry.computeVertexNormals()
  return geometry
}

function createSkinTexture(size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#c9957c'
  ctx.fillRect(0, 0, size, size)
  // Mottling: many faint blotches in warmer and cooler skin tones.
  for (let i = 0; i < 900; i++) {
    const r = 6 + Math.random() * 40
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    const warm = Math.random() > 0.5
    g.addColorStop(0, warm ? 'rgba(180,110,95,0.2)' : 'rgba(225,180,160,0.18)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.save()
    ctx.translate(Math.random() * size, Math.random() * size)
    ctx.fillStyle = g
    ctx.fillRect(-r, -r, r * 2, r * 2)
    ctx.restore()
  }
  // Pores: tiny darker specks.
  ctx.fillStyle = 'rgba(150,90,80,0.22)'
  for (let i = 0; i < 9000; i++) {
    const r = 0.6 + Math.random() * 1.4
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 1)
  return texture
}

function createPoreTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 6000; i++) {
    const r = 0.8 + Math.random() * 2
    ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 2)
  return texture
}

/** Redness on the cap's UV: v runs pole → rim. Mottled, denser near the pole. */
function createRednessTexture(size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size / 2
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 700; i++) {
    const v = Math.pow(Math.random(), 1.6) // more towards the pole (v = 0)
    const u = Math.random()
    const r = 8 + Math.random() * 46
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    const a = 0.08 + Math.random() * 0.22
    g.addColorStop(0, `rgba(178,48,48,${a})`)
    g.addColorStop(0.6, `rgba(178,48,48,${a * 0.5})`)
    g.addColorStop(1, 'rgba(178,48,48,0)')
    ctx.save()
    ctx.translate(u * canvas.width, v * canvas.height)
    ctx.scale(1, 0.6)
    ctx.fillStyle = g
    ctx.fillRect(-r, -r, r * 2, r * 2)
    ctx.restore()
  }
  // Fade out towards the rim.
  const fade = ctx.createLinearGradient(0, 0, 0, canvas.height)
  fade.addColorStop(0.55, 'rgba(0,0,0,0)')
  fade.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Alpha 1 at the pole falling to 0 at the rim, so an alpha threshold grows the film outward. */
function createRadialAlphaTexture(size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(1, '#000000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, size)
  return new THREE.CanvasTexture(canvas)
}

import * as THREE from 'three'

/**
 * A patch of scalp, for showing what the lotion does: a soft disc of skin
 * with hairs, a scatter of flakes, a bloom of redness, and — once the drop
 * lands — a milky film that spreads while the flakes lift away and the
 * redness calms.
 *
 * Everything animates from `state`: flakes (1 present → 0 gone), redness
 * (1 → 0), film (0 → 1), drop (0 at the bottle's mouth → 1 on the skin).
 */
export function createSkinPatch() {
  const group = new THREE.Group()
  const R = 0.78
  const H = 0.24

  // Skin: a disc with a rounded top edge.
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(R, 0), new THREE.Vector2(R, H - 0.1)]
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2)
    pts.push(new THREE.Vector2(R - 0.1 + Math.cos(a) * 0.1, H - 0.1 + Math.sin(a) * 0.1))
  }
  pts.push(new THREE.Vector2(0, H))
  const skin = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xdcb49c,
      roughness: 0.78,
      sheen: 0.3,
      sheenRoughness: 0.9,
      sheenColor: new THREE.Color(0xffd6c4),
      envMapIntensity: 0.45,
    }),
  )
  skin.castShadow = true
  skin.receiveShadow = true
  group.add(skin)

  // Redness: blotches painted on a disc a hair above the skin.
  const redness = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.97, 96),
    new THREE.MeshBasicMaterial({ map: createRednessTexture(), transparent: true, opacity: 0, depthWrite: false }),
  )
  redness.rotation.x = -Math.PI / 2
  redness.position.y = H + 0.002
  group.add(redness)

  // Film: the lotion, milky and translucent, spreading from the drop's landing.
  const film = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.9, 96),
    new THREE.MeshPhysicalMaterial({ color: 0xf3e6de, roughness: 0.4, transparent: true, opacity: 0, depthWrite: false, clearcoat: 0.25, envMapIntensity: 0.4 }),
  )
  film.rotation.x = -Math.PI / 2
  film.position.y = H + 0.006
  film.scale.setScalar(0.001)
  group.add(film)

  // Hairs: thin dark shafts, leaning every which way.
  const hairGeometry = new THREE.CylinderGeometry(0.0035, 0.005, 0.26, 6)
  hairGeometry.translate(0, 0.13, 0)
  const hairs = new THREE.InstancedMesh(hairGeometry, new THREE.MeshStandardMaterial({ color: 0x3b2a22, roughness: 0.7 }), 70)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < 70; i++) {
    const r = Math.sqrt(Math.random()) * R * 0.85
    const a = Math.random() * Math.PI * 2
    dummy.position.set(Math.cos(a) * r, H - 0.01, Math.sin(a) * r)
    dummy.rotation.set((Math.random() - 0.5) * 0.7, Math.random() * Math.PI, (Math.random() - 0.5) * 0.7)
    dummy.scale.setScalar(0.7 + Math.random() * 0.6)
    dummy.updateMatrix()
    hairs.setMatrixAt(i, dummy.matrix)
  }
  hairs.castShadow = true
  group.add(hairs)

  // Flakes: small irregular scales, pale yellow-white, resting on the skin.
  const flakeGeometry = new THREE.CircleGeometry(0.03, 6)
  const flakes = new THREE.InstancedMesh(flakeGeometry, new THREE.MeshStandardMaterial({ color: 0xd8ccb0, roughness: 1, envMapIntensity: 0.2, side: THREE.DoubleSide }), 110)
  const base = []
  for (let i = 0; i < 110; i++) {
    const r = Math.sqrt(Math.random()) * R * 0.88
    const a = Math.random() * Math.PI * 2
    base.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      y: H + 0.004 + Math.random() * 0.02,
      rot: Math.random() * Math.PI,
      tilt: (Math.random() - 0.5) * 0.6,
      s: 0.6 + Math.random() * 0.9,
      seed: Math.random() * 10,
    })
  }
  group.add(flakes)

  // The drop, and where it lands.
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 24, 24),
    new THREE.MeshPhysicalMaterial({ color: 0xeee6df, roughness: 0.3, clearcoat: 0.4, envMapIntensity: 0.6 }),
  )
  drop.visible = false
  group.add(drop)

  group.userData = { skin, redness, film, flakes, base, drop, dummy, top: H }

  /**
   * Apply the animation state. `from` is the drop's start in the patch's
   * local space (the bottle's mouth), so the fall lands at the centre.
   */
  group.userData.apply = (state, t, from) => {
    const { redness, film, flakes, base, drop, dummy, top } = group.userData

    redness.material.opacity = state.redness * 0.85
    film.scale.setScalar(Math.max(0.001, state.film))
    film.material.opacity = Math.min(1, state.film * 1.5) * 0.24

    // Flakes shrink and lift off as the film reaches them.
    for (let i = 0; i < base.length; i++) {
      const b = base[i]
      const reach = Math.hypot(b.x, b.z) / (R * 0.9) // 0 centre … 1 rim
      const gone = clamp01((state.film - reach) * 3) * (1 - state.flakes) + (1 - state.flakes) * clamp01(state.film - 0.9)
      const lift = gone * (0.22 + Math.sin(b.seed) * 0.06)
      const scale = b.s * (1 - gone)
      dummy.position.set(b.x + gone * Math.sin(b.seed) * 0.2, b.y + lift, b.z + gone * Math.cos(b.seed) * 0.2)
      dummy.rotation.set(-Math.PI / 2 + b.tilt + gone * 2.5, 0, b.rot + gone * 1.5)
      dummy.scale.setScalar(Math.max(0.0001, scale))
      dummy.updateMatrix()
      flakes.setMatrixAt(i, dummy.matrix)
    }
    flakes.instanceMatrix.needsUpdate = true

    // The drop falls, stretches, and flattens on landing.
    const d = state.drop
    drop.visible = d > 0.001 && d < 0.999
    if (drop.visible && from) {
      const fall = d * d // gravity
      drop.position.set(from.x * (1 - fall), from.y + (top + 0.05 - from.y) * fall, from.z * (1 - fall))
      const squash = clamp01((d - 0.85) / 0.15)
      drop.scale.set(1 + squash * 1.6, 1 + (1 - squash) * 0.35 - squash * 0.7, 1 + squash * 1.6)
    }
  }

  return group
}

const clamp01 = (v) => Math.max(0, Math.min(1, v))

function createRednessTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  // A few soft blotches, denser towards the centre.
  const blots = [[0.5, 0.5, 0.36, 0.7], [0.36, 0.42, 0.22, 0.6], [0.63, 0.58, 0.24, 0.6], [0.55, 0.32, 0.17, 0.5], [0.42, 0.66, 0.16, 0.5]]
  for (const [x, y, r, a] of blots) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
    g.addColorStop(0, `rgba(196,74,70,${a})`)
    g.addColorStop(0.6, `rgba(196,74,70,${a * 0.5})`)
    g.addColorStop(1, 'rgba(196,74,70,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

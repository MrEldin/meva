import * as THREE from 'three'
import { Reflector } from 'three/addons/objects/Reflector.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

import { gsap } from '@/lib/motion'

import { creamJar, lotionBottle, oilBottle, shampooBottle } from './bottles'
import { createFloorFadeTexture, createSpriteTexture } from './label'
import { createBackdrop, createPetals } from './backdrop'
import { createSkinPatch } from './skin'
import { createStudioScene } from './studio'

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const BLUSH = 0xe5b6c6
const PINK = 0xb3617e
const CLAY = 0xc56d59
const ROSE = 0xf2d7e0

export const defaultState = {
  rotation: -0.7, // hero bottle spin, radians
  tilt: 0, // hero bottle lean, radians
  offsetX: 0, // where the hero stands, left/right of centre (desktop only)
  cameraZ: 7.2,
  cameraY: 0.1,
  lookY: 0,
  spread: 0, // 0 = set hidden below the floor, 1 = lined up beside the hero
  lift: 0, // hero rises in from below on load
  glow: 0.6, // rim light strength
  particles: 0, // floating powder, 0..1
  scan: 0, // scan ring position along the bottle, 0 = base, 1 = cap
  scanAlpha: 0, // scan ring visibility
  leaders: 0, // ingredient leader lines visibility
  sweep: 0, // key light slides across the bottle: −1 left … +1 right
  sway: 1, // how much the hero rocks in place
  lookX: 0, // extra look-at offset, in the products' own units
  // The demonstration: a patch of scalp beside the bottle
  skinLift: 0, // patch rises through the floor
  pour: 0, // bottle leans over the patch
  drop: 0, // the drop's fall, mouth → skin
  film: 0, // lotion spreading over the skin
  flakes: 1, // flakes present → gone
  redness: 1, // redness present → calmed
}

/**
 * The hero stage: one hero bottle under studio light, joined by the rest of
 * its set as the visitor scrolls, with ingredient leaders fixed to the label
 * so they turn with the bottle, a scan ring, and a drift of powder-pink
 * particles.
 *
 * Everything the page animates lives in `state`; GSAP tweens the numbers and
 * the render loop reads them. The visitor's pointer moves the key light and
 * can grab the bottle to spin it, with inertia, on top of whatever rotation
 * the scroll has given it.
 */
export class Stage {
  /** Targets, tweened by the page. */
  state = { ...defaultState }
  /** What is actually rendered: eases towards `state` every frame. */
  view = { ...defaultState }

  pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  drag = { active: false, lastX: 0, velocity: 0, offset: 0 }
  visible = true
  started = performance.now()

  /** Points on the hero label the ingredient leaders start from. */
  anchors = {
    lavanda: { angle: -0.55, y: 0.5 },
    niacinamid: { angle: 0.5, y: 0.25 },
    salicilna: { angle: -0.45, y: -0.15 },
    cajevac: { angle: 0.4, y: -0.5 },
  }

  constructor(canvas) {
    this.canvas = canvas

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setClearColor(0x121c17, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 80)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(createStudioScene(), 0.04).texture
    this.scene.environmentIntensity = 0.85
    pmrem.dispose()

    this.buildLights()
    this.buildProducts()
    this.buildFloor()
    this.buildRoom()
    this.buildComposer()
    this.buildLeaders()
    this.buildScan()
    this.buildParticles()

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas.parentElement)
    this.resize()

    this.bindPointer()
    this.tick = this.tick.bind(this)
    gsap.ticker.add(this.tick)
  }

  buildLights() {
    this.key = new THREE.DirectionalLight(0xffffff, 1.5)
    this.key.position.set(3, 3.5, 4)
    this.key.castShadow = true
    this.key.shadow.mapSize.set(2048, 2048)
    this.key.shadow.camera.near = 1
    this.key.shadow.camera.far = 20
    this.key.shadow.camera.left = this.key.shadow.camera.bottom = -5
    this.key.shadow.camera.right = this.key.shadow.camera.top = 5
    this.key.shadow.radius = 6
    this.key.shadow.bias = -0.0005
    this.scene.add(this.key)

    // Soft top light, the studio softbox that gives white plastic its gradient.
    this.top = new THREE.DirectionalLight(0xffffff, 0.9)
    this.top.position.set(-1, 6, 1)
    this.scene.add(this.top)

    this.rim = new THREE.DirectionalLight(PINK, 1.6)
    this.rim.position.set(-3.5, 2, -3)
    this.scene.add(this.rim)

    this.fill = new THREE.DirectionalLight(0xffffff, 0.25)
    this.fill.position.set(-3, -1, 3)
    this.scene.add(this.fill)

    // A pink pool of light on the floor behind the products.
    this.pool = new THREE.PointLight(PINK, 12, 8, 2)
    this.pool.position.set(0, -0.6, -2.4)
    this.scene.add(this.pool)
  }

  buildProducts() {
    this.products = new THREE.Group()
    this.scene.add(this.products)
    this.floorY = -1.02

    this.hero = lotionBottle()
    this.hero.rotation.order = 'ZXY'
    this.products.add(this.hero)

    // The set: a line beside the hero on wide screens; on phones two rows,
    // the tall pair behind and the small pair in front.
    this.set = [
      { mesh: shampooBottle(), x: -1.7, rotation: 0.12, cx: -0.5, cz: -0.75 },
      { mesh: oilBottle(), x: 1.55, rotation: -0.12, cx: -1.0, cz: 0.65 },
      { mesh: creamJar(), x: 3.0, rotation: -0.1, cx: 1.0, cz: 0.65 },
    ]
    this.heroCompact = new THREE.Vector3(0.55, 0, -0.75)

    this.set.forEach(({ mesh }) => this.products.add(mesh))
  }

  /**
   * A dark glass floor: a mirror under the products, faded to ink so only
   * their feet reflect, the way a studio's black acrylic sheet does.
   */
  buildFloor() {
    // The sheet reaches only a little behind the products, so its far edge
    // stays below the word-mark behind them, and far enough towards the
    // camera that its near edge never shows however far the camera backs off.
    const sheet = [20, 16]
    const sheetZ = 5 // spans z −3 … 13; the products stand at z 0
    const centreV = 0.5 + sheetZ / sheet[1]

    this.mirror = new Reflector(new THREE.PlaneGeometry(...sheet), {
      clipBias: 0.003,
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x8a8a8a,
    })
    this.mirror.rotation.x = -Math.PI / 2
    this.mirror.position.set(0, this.floorY - 0.003, sheetZ)
    this.scene.add(this.mirror)

    if (import.meta.env.DEV && new URLSearchParams(location.search).has('nomirror')) this.mirror.visible = false

    const fade = new THREE.MeshBasicMaterial({ map: createFloorFadeTexture(512, centreV), transparent: true, depthWrite: false })
    fade.toneMapped = false
    this.floorFade = new THREE.Mesh(new THREE.PlaneGeometry(...sheet), fade)
    this.floorFade.rotation.x = -Math.PI / 2
    this.floorFade.position.set(0, this.floorY - 0.001, sheetZ)
    this.scene.add(this.floorFade)

    // Soft shadows from the key light fall on this invisible sheet.
    this.shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(...sheet),
      new THREE.ShadowMaterial({ opacity: 0.35, color: 0x000000 }),
    )
    this.shadowCatcher.rotation.x = -Math.PI / 2
    this.shadowCatcher.position.set(0, this.floorY + 0.0005, sheetZ)
    this.shadowCatcher.receiveShadow = true
    this.scene.add(this.shadowCatcher)
  }

  /** The room: a breathing backdrop and dried petals strewn on the floor. */
  buildRoom() {
    this.backdrop = createBackdrop()
    this.scene.add(this.backdrop)

    // The scalp patch stands to the bottle's right, below the floor until called.
    this.skin = createSkinPatch()
    this.skinAt = new THREE.Vector3(1.8, 0, 0.3)
    this.products.add(this.skin)

    // Petals avoid the spots where the bottles stand.
    this.petals = createPetals(85, this.floorY, [[0, 0.65], [-1.7, 0.7], [1.55, 0.55], [3.0, 0.7], [1.75, 1.15]])
    this.products.add(this.petals)
  }

  /** Bloom for the highlights, orbs and ring; the output pass tone-maps. */
  buildComposer() {
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.1, 0.3, 1.05)
    this.composer.addPass(this.bloom)
    this.composer.addPass(new OutputPass())
  }

  /**
   * Ingredient leaders: a line from a point on the label straight out from
   * the bottle, ending in a dot. Children of the hero, so they turn with it.
   */
  buildLeaders() {
    this.leaders = {}
    const r = 0.365
    const reach = 1.0

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    const dotMaterial = new THREE.MeshBasicMaterial({ color: BLUSH, transparent: true, opacity: 0 })

    Object.entries(this.anchors).forEach(([name, { angle, y }]) => {
      const start = new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r)
      const end = new THREE.Vector3(Math.sin(angle) * reach, y + 0.12, Math.cos(angle) * reach)

      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), lineMaterial.clone())
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), dotMaterial.clone())
      dot.position.copy(start)
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), dotMaterial.clone())
      tip.position.copy(end)

      this.hero.add(line, dot, tip)
      this.leaders[name] = { start, end, line, dot, tip, normal: new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)) }
    })
  }

  /** A thin ring of pink light that sweeps the bottle while its ingredients are read. */
  buildScan() {
    this.scan = new THREE.Group()

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.005, 8, 96),
      new THREE.MeshBasicMaterial({ color: BLUSH, transparent: true, opacity: 0 }),
    )
    ring.rotation.x = Math.PI / 2

    this.scan.add(ring)
    this.scan.userData = { ring }
    this.products.add(this.scan)
  }

  /**
   * Powder: a slow drift of powder-pink spheres around the products — a fine
   * layer, and a few large soft ones close to the camera for depth.
   */
  buildParticles() {
    const sprite = createSpriteTexture()
    const make = (count, size, color, opacity, depth) => {
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 9
        positions[i * 3 + 1] = -1.4 + Math.random() * 4.2
        positions[i * 3 + 2] = depth[0] + Math.random() * (depth[1] - depth[0])
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({ color, size, map: sprite, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true }),
      )
      points.userData = { base: positions.slice(), opacity }
      this.scene.add(points)
      return points
    }

    this.particleLayers = [
      make(150, 0.14, ROSE, 0.7, [-3.5, 1.5]),
      make(28, 0.42, PINK, 0.3, [1.8, 4.2]),
    ]
  }

  /**
   * Screen position (px, relative to the canvas) of a named leader's tip, and
   * how squarely its point on the label faces the camera (1 = head on,
   * ≤ 0 = behind the bottle).
   */
  project(name) {
    const leader = this.leaders[name]
    const world = this.hero.localToWorld(leader.end.clone())
    const normal = leader.normal.clone().applyQuaternion(this.hero.getWorldQuaternion(new THREE.Quaternion()))
    const toCamera = this.camera.position.clone().sub(world).normalize()
    const facing = normal.dot(toCamera)

    const ndc = world.project(this.camera)
    const { width, height } = this.size

    return { x: (ndc.x * 0.5 + 0.5) * width, y: (-ndc.y * 0.5 + 0.5) * height, facing }
  }

  bindPointer() {
    const el = this.canvas

    this.onMove = (e) => {
      const rect = el.getBoundingClientRect()
      this.pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.pointer.ty = ((e.clientY - rect.top) / rect.height) * 2 - 1

      if (this.drag.active) {
        const dx = e.clientX - this.drag.lastX
        this.drag.lastX = e.clientX
        this.drag.velocity = dx * 0.012
        this.drag.offset += this.drag.velocity
      }
    }

    this.onDown = (e) => {
      this.drag.active = true
      this.drag.lastX = e.clientX
      this.drag.velocity = 0
      el.setPointerCapture?.(e.pointerId)
    }

    this.onUp = () => (this.drag.active = false)

    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('pointerleave', this.onUp)
  }

  resize() {
    const parent = this.canvas.parentElement
    const width = parent.clientWidth
    const height = parent.clientHeight

    if (!width || !height) return

    this.size = { width, height }
    this.compact = width < 1024
    this.renderer.setSize(width, height, false)
    this.composer?.setSize(width, height)
    this.composer?.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  /** Jump the rendered state to the targets (used by the screenshot harness). */
  settle() {
    Object.assign(this.view, this.state)
  }

  tick(_time, deltaMs = 16) {
    if (!this.visible) return

    const t = (performance.now() - this.started) / 1000

    // Ease the rendered state towards the targets, so scroll-scrubbed jumps
    // land softly. Time-based, so it settles the same at any frame rate;
    // snaps when close, so nothing drifts forever.
    const k = 1 - Math.exp(-Math.min(deltaMs, 100) / 1000 * 9)
    for (const key in this.state) {
      const target = this.state[key]
      const current = this.view[key]
      const next = current + (target - current) * k
      this.view[key] = Math.abs(target - next) < 0.0005 ? target : next
    }
    const s = this.view

    // Pointer eases in; the key light and a slight lean follow it.
    this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 0.06)
    this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 0.06)
    this.key.position.set(3 + this.pointer.x * 2.2 + s.sweep * 6, 3.5 - this.pointer.y * 1.4, 4)
    this.rim.intensity = s.glow * 2.6
    this.pool.intensity = s.glow * 20

    // Drag inertia.
    if (!this.drag.active) {
      this.drag.velocity *= 0.94
      this.drag.offset += this.drag.velocity
    }

    // On phones the bottle is smaller and sits high, leaving the lower third to the copy.
    const scale = this.compact ? 0.66 : 1
    this.products.scale.setScalar(scale)
    this.products.position.x = this.compact ? 0 : s.offsetX
    // ...and rises further the closer the camera comes, staying clear of the copy.
    this.products.position.y = this.compact ? 0.9 + Math.max(0, 7.2 - s.cameraZ) * 0.12 : 0

    // Hero bottle.
    const float = 0 // bottles stand on the floor; nothing hovers
    const heroY = this.floorY + this.hero.userData.height / 2
    this.hero.position.x = s.pour * 0.9 + (this.compact ? s.spread * this.heroCompact.x : 0)
    this.hero.position.z = this.compact ? s.spread * this.heroCompact.z : 0
    this.hero.position.y = heroY + float + (1 - s.lift) * -3.2 + s.pour * 0.05
    // The hero rocks gently in place, so the light keeps moving over it.
    const sway = Math.sin(t * 0.45) * 0.07 * s.sway
    this.hero.rotation.y = s.rotation + this.drag.offset + this.pointer.x * 0.08 + sway
    this.hero.rotation.z = s.tilt
    this.hero.rotation.x = this.pointer.y * 0.04

    // Leaders fade with how squarely their point on the label faces the camera.
    const heroQuat = this.hero.getWorldQuaternion(new THREE.Quaternion())
    Object.values(this.leaders).forEach(({ line, dot, tip, normal, start }) => {
      const world = this.hero.localToWorld(start.clone())
      const facing = normal.clone().applyQuaternion(heroQuat).dot(this.camera.position.clone().sub(world).normalize())
      const alpha = clamp01(facing * 1.6) * s.leaders
      line.material.opacity = alpha * 0.6
      dot.material.opacity = alpha
      tip.material.opacity = alpha
      line.visible = dot.visible = tip.visible = alpha > 0.01
    })

    this.floorFade.position.x = this.mirror.position.x = this.shadowCatcher.position.x = this.products.position.x + (this.compact ? 0 : s.spread * 0.65)

    // Scan ring, sweeping the hero from base to cap.
    const { ring } = this.scan.userData
    this.scan.position.set(this.hero.position.x, this.floorY + 0.05 + s.scan * (this.hero.userData.height - 0.1) + float, 0)
    ring.material.opacity = s.scanAlpha * 0.9
    this.scan.visible = s.scanAlpha > 0.01

    // The scalp patch rises, then plays the demonstration.
    this.skin.position.set(this.skinAt.x, this.floorY - 1.2 * (1 - s.skinLift), this.skinAt.z)
    this.skin.visible = s.skinLift > 0.01
    if (this.skin.visible) {
      // The bottle's mouth, in the patch's local space, is where the drop starts.
      const mouth = this.hero.localToWorld(new THREE.Vector3(0, this.hero.userData.height / 2 + 0.02, 0))
      this.skin.worldToLocal(mouth)
      this.skin.userData.apply(s, t, mouth)
    }

    // The set rises through the floor into an even line beside the hero.
    this.set.forEach(({ mesh, x, rotation, cx, cz }, i) => {
      const eased = s.spread * s.spread * (3 - 2 * s.spread)
      mesh.position.set(
        this.compact ? cx : x,
        this.floorY + mesh.userData.height / 2 - (1 - eased) * (mesh.userData.height + 1.4),
        this.compact ? cz : 0,
      )
      mesh.rotation.y = rotation + this.drag.offset * 0.3 + (1 - eased) * 1.4
      mesh.visible = s.spread > 0.01
    })

    // Particles drift, and follow the pointer a little for depth.
    this.particleLayers.forEach((layer, l) => {
      const pos = layer.geometry.attributes.position
      const base = layer.userData.base
      const parallax = (l + 1) * 0.25
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3]
        const by = base[i * 3 + 1]
        const bz = base[i * 3 + 2]
        pos.setXYZ(i, bx + Math.sin(t * 0.25 + by * 2.1) * 0.25 + this.pointer.x * parallax, by + Math.sin(t * 0.4 + bx * 1.3) * 0.18 - this.pointer.y * parallax * 0.4, bz)
      }
      pos.needsUpdate = true
      layer.material.opacity = s.particles * layer.userData.opacity
      layer.visible = s.particles > 0.01
    })

    // Camera. When the set is out, back off far enough for the whole line-up
    // to fit whatever shape the viewport is, and look at its middle.
    const baseZ = s.cameraZ * (this.compact ? 1.3 : 1)
    const halfWidth = this.compact ? 1.2 : 3.25
    const fitZ = halfWidth / (Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect)
    const cameraZ = baseZ + s.spread * Math.max(0, fitZ - baseZ)
    // Phones look down on the two rows so they read as two rows.
    const cameraY = s.cameraY - this.pointer.y * 0.08 + (this.compact ? s.spread * 1.6 : 0)
    this.camera.position.set(this.pointer.x * 0.12, cameraY, cameraZ)
    const lineCentre = 0
    const lookX = (this.compact ? 0 : s.offsetX * 0.5) * (1 - s.spread) + lineCentre * s.spread + s.lookX * scale + (this.compact ? 0 : 0)
    this.camera.lookAt(lookX, s.lookY + (this.compact ? 0.4 - s.spread * 0.75 : 0), 0)

    this.backdrop.material.uniforms.uTime.value = t
    this.backdrop.material.uniforms.uPointer.value.set(this.pointer.x, this.pointer.y)

    this.composer.render()
  }

  dispose() {
    gsap.ticker.remove(this.tick)
    this.resizeObserver.disconnect()

    const el = this.canvas
    el.removeEventListener('pointermove', this.onMove)
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
    el.removeEventListener('pointerleave', this.onUp)

    this.scene.traverse((o) => {
      o.geometry?.dispose()
      if (o.material) {
        o.material.map?.dispose()
        o.material.dispose()
      }
    })
    this.composer.dispose()
    this.renderer.dispose()
  }
}

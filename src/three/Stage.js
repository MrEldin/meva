import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { Reflector } from 'three/addons/objects/Reflector.js'

import { gsap } from '@/lib/motion'

import { creamJar, lotionBottle, oilBottle, shampooBottle } from './bottles'
import { createFloorFadeTexture, createSpriteTexture } from './label'

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const BLUSH = 0xe5b6c6

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
  state = { ...defaultState }

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

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.6
    pmrem.dispose()

    this.buildLights()
    this.buildProducts()
    this.buildFloor()
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
    this.key = new THREE.DirectionalLight(0xffffff, 2.6)
    this.key.position.set(3, 3.5, 4)
    this.scene.add(this.key)

    // Soft top light, the studio softbox that gives white plastic its gradient.
    this.top = new THREE.DirectionalLight(0xffffff, 0.9)
    this.top.position.set(-1, 6, 1)
    this.scene.add(this.top)

    this.rim = new THREE.DirectionalLight(0xb3617e, 1.6)
    this.rim.position.set(-3.5, 2, -3)
    this.scene.add(this.rim)

    this.fill = new THREE.DirectionalLight(0xffffff, 0.25)
    this.fill.position.set(-3, -1, 3)
    this.scene.add(this.fill)

    // A pink pool of light on the floor behind the products.
    this.pool = new THREE.PointLight(0xb3617e, 12, 8, 2)
    this.pool.position.set(0, -0.6, -2.4)
    this.scene.add(this.pool)
  }

  buildProducts() {
    this.products = new THREE.Group()
    this.scene.add(this.products)
    this.floorY = -1.02

    this.hero = lotionBottle()
    this.products.add(this.hero)

    // The set, lined up on the floor at even intervals around the hero.
    this.set = [
      { mesh: shampooBottle(), x: -1.7, rotation: 0.12 },
      { mesh: oilBottle(), x: 1.55, rotation: -0.12 },
      { mesh: creamJar(), x: 3.0, rotation: -0.1 },
    ]

    this.set.forEach(({ mesh }) => this.products.add(mesh))
  }

  /**
   * A dark glass floor: a mirror under the products, faded to ink so only
   * their feet reflect, the way a studio's black acrylic sheet does.
   */
  buildFloor() {
    // The sheet reaches only a little behind the products, so its far edge —
    // which is the page's own ink — stays below the word-mark behind them.
    const sheet = [16, 9]
    const sheetZ = 1.5

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

    const fade = new THREE.MeshBasicMaterial({ map: createFloorFadeTexture(), transparent: true, depthWrite: false })
    fade.toneMapped = false
    this.floorFade = new THREE.Mesh(new THREE.PlaneGeometry(...sheet), fade)
    this.floorFade.rotation.x = -Math.PI / 2
    this.floorFade.position.set(0, this.floorY - 0.001, sheetZ)
    this.scene.add(this.floorFade)
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
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), dotMaterial.clone())
      dot.position.copy(start)
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), dotMaterial.clone())
      tip.position.copy(end)

      this.hero.add(line, dot, tip)
      this.leaders[name] = { start, end, line, dot, tip, normal: new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)) }
    })
  }

  /** A thin ring of pink light that sweeps the bottle while its ingredients are read. */
  buildScan() {
    this.scan = new THREE.Group()

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.006, 8, 96),
      new THREE.MeshBasicMaterial({ color: BLUSH, transparent: true, opacity: 0 }),
    )
    ring.rotation.x = Math.PI / 2

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.36, 0.7, 96),
      new THREE.MeshBasicMaterial({ color: 0xb3617e, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    )
    halo.rotation.x = Math.PI / 2

    this.scan.add(ring, halo)
    this.scan.userData = { ring, halo }
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
      make(150, 0.14, 0xcf8ba4, 0.85, [-3.5, 1.5]),
      make(28, 0.42, 0xb3617e, 0.35, [1.8, 4.2]),
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
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  tick() {
    if (!this.visible) return

    const t = (performance.now() - this.started) / 1000
    const s = this.state

    // Pointer eases in; the key light and a slight lean follow it.
    this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 0.06)
    this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 0.06)
    this.key.position.set(3 + this.pointer.x * 2.2, 3.5 - this.pointer.y * 1.4, 4)
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
    const float = Math.sin(t * 1.1) * 0.035
    const heroY = this.floorY + this.hero.userData.height / 2
    this.hero.position.y = heroY + float + (1 - s.lift) * -3.2
    this.hero.rotation.y = s.rotation + this.drag.offset + this.pointer.x * 0.08
    this.hero.rotation.z = s.tilt
    this.hero.rotation.x = this.pointer.y * 0.04

    // Leaders fade with how squarely their point on the label faces the camera.
    const heroQuat = this.hero.getWorldQuaternion(new THREE.Quaternion())
    Object.values(this.leaders).forEach(({ line, dot, tip, normal, start }) => {
      const world = this.hero.localToWorld(start.clone())
      const facing = normal.clone().applyQuaternion(heroQuat).dot(this.camera.position.clone().sub(world).normalize())
      const alpha = clamp01(facing * 1.6) * s.leaders
      line.material.opacity = alpha * 0.55
      dot.material.opacity = alpha
      tip.material.opacity = alpha
      line.visible = dot.visible = tip.visible = alpha > 0.01
    })

    this.floorFade.position.x = this.mirror.position.x = this.products.position.x + (this.compact ? 0 : s.spread * 0.65)

    // Scan ring, sweeping the hero from base to cap.
    const { ring, halo } = this.scan.userData
    this.scan.position.set(this.hero.position.x, this.floorY + 0.05 + s.scan * (this.hero.userData.height - 0.1) + float, 0)
    ring.material.opacity = s.scanAlpha
    halo.material.opacity = s.scanAlpha * 0.12
    this.scan.visible = s.scanAlpha > 0.01

    // The set rises through the floor into an even line beside the hero.
    this.set.forEach(({ mesh, x, rotation }, i) => {
      const eased = s.spread * s.spread * (3 - 2 * s.spread)
      mesh.position.set(
        x,
        this.floorY + mesh.userData.height / 2 + Math.sin(t * 1.1 + i) * 0.02 - (1 - eased) * (mesh.userData.height + 1.4),
        0,
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

    // Camera; phones frame the set from further back and centre on the line-up.
    const cameraZ = s.cameraZ * (this.compact ? 1.3 : 1) + (this.compact ? s.spread * 5 : 0)
    this.camera.position.set(this.pointer.x * 0.12, s.cameraY - this.pointer.y * 0.08, cameraZ)
    const lookX = this.compact ? s.spread * 0.45 : s.offsetX * 0.5 + s.spread * 0.9
    this.camera.lookAt(lookX, s.lookY + (this.compact ? 0.4 : 0), 0)

    this.renderer.render(this.scene, this.camera)
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
    this.renderer.dispose()
  }
}

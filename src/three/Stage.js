import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

import { gsap } from '@/lib/motion'

import { creamJar, lotionBottle, oilBottle, shampooBottle } from './bottles'

const lerp = (a, b, t) => a + (b - a) * t

/**
 * The hero stage: one hero bottle under studio light, joined by the rest of
 * its set as the visitor scrolls.
 *
 * Everything the page animates lives in `state`; GSAP tweens the numbers and
 * the render loop reads them. The visitor's pointer moves the key light and
 * can grab the bottle to spin it, with inertia, on top of whatever rotation
 * the scroll has given it.
 */
export const defaultState = {
  rotation: -0.7, // hero bottle spin, radians
  tilt: 0, // hero bottle lean, radians
  offsetX: 0, // where the hero stands, left/right of centre (desktop only)
  cameraZ: 7.2,
  cameraY: 0.1,
  lookY: 0,
  spread: 0, // 0 = set hidden behind the hero, 1 = arranged around it
  lift: 0, // hero rises in from below on load
  glow: 0.6, // rim light strength
}

export class Stage {
  state = { ...defaultState }

  pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  drag = { active: false, lastX: 0, velocity: 0, offset: 0 }
  visible = true
  started = performance.now()

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

    this.hero = lotionBottle()
    this.products.add(this.hero)

    // The set: placed on the floor, hidden behind the hero until spread.
    this.set = [
      { mesh: shampooBottle(), at: new THREE.Vector3(-1.55, 0, -0.35), rotation: 0.3 },
      { mesh: oilBottle(), at: new THREE.Vector3(1.15, 0, 0.35), rotation: -0.35 },
      { mesh: creamJar(), at: new THREE.Vector3(2.1, 0, -0.5), rotation: -0.2 },
    ]

    this.set.forEach(({ mesh }) => {
      mesh.traverse((o) => {
        if (!o.material) return
        o.material = o.material.clone()
        o.material.userData.baseOpacity = o.material.opacity
        o.material.userData.alwaysTransparent = o.material.transparent
      })
      this.products.add(mesh)
    })

    this.floorY = -1.02
  }

  /** Points on the hero bottle the page anchors ingredient callouts to. */
  anchors = {
    lavanda: new THREE.Vector3(-0.32, 0.55, 0.24),
    niacinamid: new THREE.Vector3(0.36, 0.28, 0.18),
    salicilna: new THREE.Vector3(-0.38, -0.08, 0.14),
    cajevac: new THREE.Vector3(0.3, -0.5, 0.27),
  }

  /**
   * Screen position (px, relative to the canvas) of a named anchor, and how
   * squarely it faces the camera (1 = head on, ≤ 0 = behind the bottle).
   */
  project(name) {
    const local = this.anchors[name]
    const world = this.hero.localToWorld(local.clone())
    const normal = local.clone().setY(0).normalize().applyQuaternion(this.hero.quaternion)
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

    // Hero bottle.
    const float = Math.sin(t * 1.1) * 0.035
    // On phones the bottle is smaller and sits high, leaving the lower third to the copy.
    const scale = this.compact ? 0.66 : 1
    this.products.scale.setScalar(scale)
    this.products.position.x = this.compact ? 0 : s.offsetX
    this.products.position.y = this.compact ? 0.55 : 0
    this.hero.position.y = this.floorY + this.hero.userData.height / 2 + float + (1 - s.lift) * -3.2
    this.hero.rotation.y = s.rotation + this.drag.offset + this.pointer.x * 0.08
    this.hero.rotation.z = s.tilt
    this.hero.rotation.x = this.pointer.y * 0.04

    // The set rises through the floor and fans out around the hero.
    this.set.forEach(({ mesh, at, rotation }, i) => {
      const spread = s.spread
      const target = this.compact ? at.clone().multiplyScalar(0.72) : at
      const eased = spread * spread * (3 - 2 * spread)
      mesh.position.set(
        target.x * eased,
        this.floorY + mesh.userData.height / 2 + Math.sin(t * 1.1 + i) * 0.02 - (1 - eased) * (mesh.userData.height + 1.2),
        -1.2 + (target.z + 1.2) * eased,
      )
      mesh.rotation.y = rotation + s.rotation * 0.25 + this.drag.offset * 0.3 + (1 - eased) * 1.2
      mesh.visible = spread > 0.01
    })

    // Camera.
    this.camera.position.set(this.pointer.x * 0.12, s.cameraY - this.pointer.y * 0.08, s.cameraZ)
    this.camera.lookAt(0, s.lookY, 0)

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

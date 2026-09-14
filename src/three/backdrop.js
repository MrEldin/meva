import * as THREE from 'three'

/**
 * The room behind the products: a slow-moving field of forest greens with a
 * warm light leaking in from the upper right, painted by a noise shader so
 * the background breathes instead of sitting flat.
 */
export function createBackdrop() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uBase: { value: new THREE.Color(0x2c4036) },
      uDeep: { value: new THREE.Color(0x1a2a22) },
      uWarm: { value: new THREE.Color(0xc56d59) },
      uPink: { value: new THREE.Color(0xb3617e) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec3 uBase, uDeep, uWarm, uPink;

      // Value noise with smooth interpolation, layered into fbm.
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        float t = uTime * 0.03;
        // Slow silk: two drifting noise fields folded into one another.
        float n1 = fbm(uv * 2.2 + vec2(t, -t * 0.7));
        float n2 = fbm(uv * 3.1 - vec2(t * 0.6, t * 0.4) + n1 * 0.6);
        float silk = smoothstep(0.25, 0.85, n2);

        vec3 col = mix(uDeep, uBase, 0.35 + silk * 0.85);

        // A warm light leaking from the upper right, following the pointer a little.
        vec2 lightPos = vec2(0.82 + uPointer.x * 0.06, 0.78 - uPointer.y * 0.05);
        float d = distance(uv * vec2(1.6, 1.0), lightPos * vec2(1.6, 1.0));
        col += uWarm * 0.07 * exp(-d * d * 4.0) * (0.7 + 0.3 * n1);

        // Pink pooled low behind the products.
        float pool = exp(-pow((uv.x - 0.5) * 2.2, 2.0)) * exp(-pow((uv.y - 0.08) * 3.5, 2.0));
        col += uPink * 0.1 * pool;

        // Darker towards the edges, like a room's corners.
        float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5, 0.45)) * 1.6);
        col *= mix(0.8, 1.0, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthWrite: false,
  })

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), material)
  mesh.position.set(0, 4, -14)
  mesh.renderOrder = -10

  return mesh
}

/**
 * Dried petals, as scattered around the bottles in the product photographs:
 * small curved leaves in dusty rose, mauve and faded green, strewn on the
 * floor around the products.
 */
export function createPetals(count = 140, floorY = -1, avoid = []) {
  const geometry = new THREE.PlaneGeometry(0.09, 0.15, 3, 4)
  // A gentle curl along the length.
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const x = pos.getX(i)
    pos.setZ(i, (y * y) * 0.9 + Math.abs(x) * 0.25)
  }
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    map: createPetalTexture(),
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.3,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.4,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  const palette = [0xa8737f, 0xb98a94, 0x8c5f6b, 0x9a8a78, 0x6f7a60, 0xc09aa2]

  let placed = 0
  let guard = 0
  while (placed < count && guard++ < count * 20) {
    const r = 0.7 + Math.pow(Math.random(), 0.7) * 3.6
    const a = Math.random() * Math.PI * 2
    const x = Math.cos(a) * r * 1.35
    const z = Math.sin(a) * r * 0.55 + 0.4
    if (avoid.some(([ax, ar]) => Math.hypot(x - ax, z) < ar)) continue

    dummy.position.set(x, floorY + 0.004 + Math.random() * 0.01, z)
    dummy.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.5, 0, Math.random() * Math.PI * 2)
    const s = 0.45 + Math.random() * 0.7
    dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s)
    dummy.updateMatrix()
    mesh.setMatrixAt(placed, dummy.matrix)
    mesh.setColorAt(placed, color.setHex(palette[Math.floor(Math.random() * palette.length)]))
    placed++
  }
  mesh.count = placed
  mesh.instanceMatrix.needsUpdate = true
  mesh.instanceColor.needsUpdate = true
  mesh.castShadow = true

  return mesh
}

function createPetalTexture(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Leaf shape: soft ellipse with a darker rim and a faint mid-rib.
  ctx.clearRect(0, 0, size, size)
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.5)
  g.addColorStop(0, 'rgba(225,215,215,1)')
  g.addColorStop(0.7, 'rgba(200,185,188,1)')
  g.addColorStop(1, 'rgba(130,100,105,1)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(size / 2, size / 2, size * 0.32, size * 0.48, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(120,90,95,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(size / 2, size * 0.08)
  ctx.lineTo(size / 2, size * 0.92)
  ctx.stroke()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

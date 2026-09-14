import * as THREE from 'three'

/**
 * A photographer's studio, for reflections: a dark room with one large
 * softbox overhead, a tall strip light to each side and a warm fill low
 * behind the camera. Baked to an environment map, it gives white plastic
 * its long, soft highlights.
 */
export function createStudioScene() {
  const scene = new THREE.Scene()

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(14, 10, 14),
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.02, 0.025, 0.022), side: THREE.BackSide }),
  )
  scene.add(room)

  const light = (w, h, intensity, x, y, z, rx, ry, rz, tint = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity), side: THREE.DoubleSide }),
    )
    mesh.position.set(x, y, z)
    mesh.rotation.set(rx, ry, rz)
    scene.add(mesh)
  }

  // Overhead softbox, slightly forward
  light(5, 3, 6, 0, 4.8, 1.5, Math.PI / 2, 0, 0)
  // Key strip, camera right
  light(1.2, 6, 5, 5.5, 1, 2.5, 0, -Math.PI / 2.6, 0)
  // Rim strip, camera left and behind, faintly pink
  light(0.8, 6, 3.5, -5.5, 1.5, -2, 0, Math.PI / 2.4, 0, [1, 0.8, 0.86])
  // Low warm fill behind the camera
  light(6, 1.5, 1.2, 0, -1, 6.5, 0, Math.PI, 0, [1, 0.95, 0.9])

  return scene
}

/**
 * Fine surface noise, used as a roughness map so plastic is not uniformly
 * glossy — moulded HDPE has a faint orange-peel texture.
 */
export function createRoughnessTexture(size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 200 + Math.random() * 55
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 6)
  return texture
}

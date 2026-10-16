import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * The glass devices.
 *
 * Five small pieces of hardware (a sampler, a cassette, a player, a knob and a
 * record), modelled in three.js and drawn into ordinary 2D canvases, so the
 * page can fly them, pin them and dock them with the transforms it already
 * uses for everything else.
 *
 * ## Why this replaced the CSS solids
 *
 * The CSS devices were six rectangles placed in space. Each face had its own
 * border and its own radius, so a tumbling device showed its sides as separate
 * slabs that did not meet the front: nothing fused. A real model is one rounded
 * solid, so its edge is continuous, and it can be lit: the gloss and the frost
 * come from a clearcoat on a rough physical material under a small
 * environment, which is how the Contact controller's pads and the Skills
 * controller read as glass, taken off the CSS and rebuilt in 3D.
 *
 * ## Why it is built like this
 *
 * - **One renderer for everything.** A WebGL context per device would be a
 *   dozen contexts and a dozen environment maps. There is one off-screen
 *   renderer and one environment; each device owns a scene, renders into the
 *   shared surface, and copies the result into its own canvas with
 *   `drawImage`. The copy has to happen in the same task as the render, which
 *   is why the render loop does both together and never separates them.
 * - **Render on demand.** A device is drawn only when it is on screen and its
 *   pose has changed. A page at rest draws nothing.
 * - **No transmission pass.** Real transmission needs the opaque scene behind
 *   it, and there is none: the canvas is transparent and the page is the
 *   background. The glass is a translucent clearcoated shell (back faces, then
 *   front faces, so a closed convex shell sorts correctly) over opaque inner
 *   parts that show through it: the pads, the screen, the reels.
 * - **A dark rim.** On cream paper a cream glass shell has no edge. A slightly
 *   larger back-face shell in near-black gives every device a contour on any
 *   ground.
 * - **It can fail.** No WebGL, a lost context, a failed import: `attachGlass`
 *   resolves to `null` and the CSS device it replaced is still in the DOM. The
 *   component only hides the fallback once a first frame is on the canvas.
 *
 * Units: one unit is 50 CSS px at scale 1, so the sampler's 2.08 x 1.56 body is
 * the same 104 x 78 the CSS device was, and every transform the page already
 * applies still means what it meant.
 */

import {
  registerGlass,
  unregisterGlass,
  type GlassHandle,
  type GlassKind,
  type GlassPose,
} from './glass-registry'

export type { GlassHandle, GlassKind, GlassPose }

/** The canvas's backing size. Its CSS size is 208 x 156 (4.16 x 3.12 units). */
export const GLASS_CANVAS = { width: 512, height: 384 } as const

const ORANGE = new THREE.Color('#ff5a1f')
const DEG = Math.PI / 180

/** Looks, in one place, because they are tuned by eye and not derivable. */
const LOOK = {
  shellOpacity: 0.46,
  backOpacity: 0.3,
  rimOpacity: 0.5,
  roughness: 0.34,
  envIntensity: 1.25,
  exposure: 1.05,
} as const

let shared: {
  renderer: THREE.WebGLRenderer
  env: THREE.Texture
} | null = null
let sharedFailed = false

function getShared() {
  if (shared) return shared
  if (sharedFailed) return null
  try {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(1)
    renderer.setSize(GLASS_CANVAS.width, GLASS_CANVAS.height, false)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = LOOK.exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      sharedFailed = true
      shared = null
    })

    shared = { renderer, env }
    return shared
  } catch {
    sharedFailed = true
    return null
  }
}

/* ── Materials ───────────────────────────────────────────── */

function shellMaterials() {
  const front = new THREE.MeshPhysicalMaterial({
    color: 0xf3efe6,
    transparent: true,
    opacity: LOOK.shellOpacity,
    roughness: LOOK.roughness,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    envMapIntensity: LOOK.envIntensity,
    ior: 1.45,
    depthWrite: false,
  })
  const back = new THREE.MeshPhysicalMaterial({
    color: 0xd9d3c6,
    transparent: true,
    opacity: LOOK.backOpacity,
    roughness: 0.5,
    side: THREE.BackSide,
    envMapIntensity: 0.6,
    depthWrite: false,
  })
  const rim = new THREE.MeshBasicMaterial({
    color: 0x1b1c1a,
    transparent: true,
    opacity: LOOK.rimOpacity,
    side: THREE.BackSide,
    depthWrite: false,
  })
  return { front, back, rim }
}

const inner = (color: number, roughness = 0.6) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 })

const emissive = (color: number, intensity: number) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.5,
  })

/**
 * A translucent rounded shell with a dark rim: three meshes of one geometry.
 * Draw order is explicit so the rim is behind the back faces, which are behind
 * the front faces, which are behind nothing.
 */
function glassShell(
  geometry: THREE.BufferGeometry,
  scaleRim = 1.025,
): THREE.Group {
  const { front, back, rim } = shellMaterials()
  const group = new THREE.Group()

  const rimMesh = new THREE.Mesh(geometry, rim)
  rimMesh.scale.setScalar(scaleRim)
  rimMesh.renderOrder = 1
  const backMesh = new THREE.Mesh(geometry, back)
  backMesh.renderOrder = 2
  const frontMesh = new THREE.Mesh(geometry, front)
  frontMesh.renderOrder = 4

  group.add(rimMesh, backMesh, frontMesh)
  return group
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  radius = 0.03,
) {
  return new THREE.Mesh(
    new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, d / 2 - 0.001)),
    material,
  )
}

/* ── Models ──────────────────────────────────────────────── */

type Model = {
  root: THREE.Group
  update: (p: number, spin: number) => void
  dispose: () => void
}

function buildSampler(): Model {
  const root = new THREE.Group()
  const w = 2.08
  const h = 1.56
  const d = 0.44

  root.add(glassShell(new RoundedBoxGeometry(w, h, d, 6, 0.16)))

  // The chassis the glass sits over: opaque, a little smaller than the shell.
  root.add(box(w - 0.14, h - 0.14, d - 0.16, inner(0xcfc9bc), 0.12))

  const z = d / 2 - 0.02

  const lcd = box(0.92, 0.3, 0.05, emissive(0xf0c7ae, 0.35), 0.03)
  lcd.position.set(-0.36, 0.5, z)
  root.add(lcd)

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.1, 40),
    new THREE.MeshStandardMaterial({
      color: 0xdedbd4,
      metalness: 1,
      roughness: 0.28,
    }),
  )
  knob.rotation.x = Math.PI / 2
  knob.position.set(0.72, 0.5, z + 0.02)
  root.add(knob)

  const pads: { material: THREE.MeshStandardMaterial; accent: boolean }[] = []
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const index = row * 4 + col
      const accent = [0, 5, 10, 15].includes(index)
      const material = new THREE.MeshStandardMaterial({
        color: 0x2a2e2b,
        emissive: ORANGE,
        emissiveIntensity: 0,
        roughness: 0.28,
      })
      const pad = box(0.38, 0.19, 0.07, material, 0.035)
      pad.position.set(-0.66 + col * 0.44, 0.1 - row * 0.25, z)
      root.add(pad)
      pads.push({ material, accent })
    }
  }

  return {
    root,
    update: (p) => {
      pads.forEach(({ material, accent }, index) => {
        const lit = THREE.MathUtils.clamp(p * 22 - index, 0, 1)
        const level = Math.max(lit, accent ? 0.55 : 0)
        material.emissiveIntensity = level * 1.4
      })
    },
    dispose: () => disposeTree(root),
  }
}

function buildCassette(): Model {
  const root = new THREE.Group()
  const w = 1.92
  const h = 1.2
  const d = 0.26

  root.add(glassShell(new RoundedBoxGeometry(w, h, d, 6, 0.12)))
  root.add(box(w - 0.12, h - 0.12, d - 0.1, inner(0xcfc9bc), 0.1))

  const z = d / 2 - 0.02
  const label = box(1.5, 0.36, 0.03, emissive(0xf0c7ae, 0.3), 0.03)
  label.position.set(0, 0.32, z)
  root.add(label)

  const slot = box(1.12, 0.5, 0.03, inner(0x1d1f1e, 0.25), 0.22)
  slot.position.set(0, -0.2, z)
  root.add(slot)

  const reels: THREE.Group[] = []
  for (const x of [-0.34, 0.34]) {
    const reel = new THREE.Group()
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.04, 36),
      inner(0x2c2e2d, 0.4),
    )
    hub.rotation.x = Math.PI / 2
    reel.add(hub)
    for (let spoke = 0; spoke < 3; spoke += 1) {
      const bar = box(0.035, 0.28, 0.045, inner(0xe7e2d8, 0.5), 0.015)
      bar.rotation.z = (spoke * Math.PI) / 3
      reel.add(bar)
    }
    reel.position.set(x, -0.2, z + 0.03)
    root.add(reel)
    reels.push(reel)
  }

  return {
    root,
    update: (_p, spin) => {
      reels.forEach((reel, index) => {
        reel.rotation.z = -spin * DEG * (index === 0 ? 1 : 0.8)
      })
    },
    dispose: () => disposeTree(root),
  }
}

function buildPlayer(): Model {
  const root = new THREE.Group()
  const w = 1.16
  const h = 1.84
  const d = 0.26

  root.add(glassShell(new RoundedBoxGeometry(w, h, d, 6, 0.14)))
  root.add(box(w - 0.12, h - 0.12, d - 0.1, inner(0xcfc9bc), 0.12))

  const z = d / 2 - 0.02
  const screen = box(0.86, 0.74, 0.03, emissive(0xf0c7ae, 0.35), 0.05)
  screen.position.set(0, 0.5, z)
  root.add(screen)
  ;[
    { y: 0.7, w: 0.6, color: 0x4b4f4c },
    { y: 0.56, w: 0.44, color: 0x4b4f4c },
    { y: 0.4, w: 0.3, color: 0xff5a1f },
  ].forEach((line) => {
    const bar = box(line.w, 0.035, 0.02, inner(line.color, 0.5), 0.01)
    bar.position.set(-(0.6 - line.w) / 2 - 0.02, line.y - 0.02, z + 0.025)
    root.add(bar)
  })

  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.06, 18, 48),
    inner(0xe7e2d8, 0.35),
  )
  wheel.position.set(0, -0.5, z)
  root.add(wheel)
  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.05, 32),
    emissive(0xff5a1f, 0.55),
  )
  center.rotation.x = Math.PI / 2
  center.position.set(0, -0.5, z + 0.01)
  root.add(center)

  return {
    root,
    update: () => {},
    dispose: () => disposeTree(root),
  }
}

function buildKnob(): Model {
  const root = new THREE.Group()
  const profile = [
    [0, -0.24],
    [0.44, -0.24],
    [0.5, -0.18],
    [0.5, 0.18],
    [0.44, 0.24],
    [0, 0.24],
  ].map(([x, y]) => new THREE.Vector2(x, y))

  const shell = glassShell(new THREE.LatheGeometry(profile, 72))
  const body = new THREE.Group()
  body.add(shell)

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.46, 48),
    new THREE.MeshStandardMaterial({
      color: 0xdedbd4,
      metalness: 1,
      roughness: 0.3,
    }),
  )
  body.add(core)

  const tick = box(0.06, 0.3, 0.03, emissive(0xff5a1f, 0.8), 0.015)
  tick.rotation.x = Math.PI / 2
  tick.position.set(0, 0.245, -0.14)
  body.add(tick)

  // The lathe's axis is Y; the knob faces the viewer along Z.
  body.rotation.x = Math.PI / 2
  root.add(body)

  return {
    root,
    update: (_p, spin) => {
      body.rotation.y = spin * DEG * 0.35
    },
    dispose: () => disposeTree(root),
  }
}

function grooveTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#141416'
    ctx.fillRect(0, 0, size, size)
    for (let r = 40; r < size / 2; r += 3) {
      ctx.strokeStyle = r % 6 === 0 ? '#1f1f23' : '#101012'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    // A broad sheen, so the record reads as lacquer and not as a flat disc.
    const sheen = ctx.createConicGradient(0.4, size / 2, size / 2)
    sheen.addColorStop(0, 'rgba(255,255,255,0)')
    sheen.addColorStop(0.08, 'rgba(255,255,255,0.12)')
    sheen.addColorStop(0.16, 'rgba(255,255,255,0)')
    sheen.addColorStop(0.55, 'rgba(255,255,255,0)')
    sheen.addColorStop(0.62, 'rgba(255,255,255,0.09)')
    sheen.addColorStop(0.7, 'rgba(255,255,255,0)')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function buildVinyl(): Model {
  const root = new THREE.Group()
  const disc = new THREE.Group()

  const side = new THREE.MeshStandardMaterial({
    color: 0x121214,
    roughness: 0.4,
  })
  const top = new THREE.MeshPhysicalMaterial({
    map: grooveTexture(),
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.1,
  })
  const vinyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.05, 96),
    [side, top, top],
  )
  disc.add(vinyl)

  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.31, 0.31, 0.056, 64),
    emissive(0xff5a1f, 0.25),
  )
  disc.add(label)

  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.06, 24),
    inner(0xe7e2d8, 0.4),
  )
  disc.add(hole)

  // A frosted ring around the rim, so the record has the same glass edge as
  // everything else in the set.
  const ring = glassShell(new THREE.TorusGeometry(0.95, 0.045, 16, 96), 1.05)
  ring.rotation.x = Math.PI / 2
  disc.add(ring)

  disc.rotation.x = Math.PI / 2
  root.add(disc)

  return {
    root,
    update: (_p, spin) => {
      // The disc's own axis is Y once laid flat; spin about it.
      vinyl.rotation.y = -spin * DEG
      label.rotation.y = -spin * DEG
    },
    dispose: () => {
      top.map?.dispose()
      disposeTree(root)
    },
  }
}

function disposeTree(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    mesh.geometry?.dispose()
    const material = mesh.material
    if (Array.isArray(material)) material.forEach((m) => m.dispose())
    else material?.dispose()
  })
}

const BUILDERS: Record<GlassKind, () => Model> = {
  sampler: buildSampler,
  cassette: buildCassette,
  player: buildPlayer,
  knob: buildKnob,
  vinyl: buildVinyl,
}

/** The orientation a device rests in when nothing has posed it. */
const REST: Record<GlassKind, GlassPose> = {
  sampler: { rx: -14, ry: 20, rz: 0 },
  cassette: { rx: -14, ry: 20, rz: 0 },
  player: { rx: -10, ry: 22, rz: 0 },
  knob: { rx: 24, ry: 16, rz: 0, p: 0.5 },
  vinyl: { rx: 52, ry: 14, rz: 0, spin: 40 },
}

/* ── Controllers and the render loop ─────────────────────── */

type Controller = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  model: Model
  /** What is drawn now. It eases toward `target` rather than jumping to it. */
  pose: Pose
  target: Pose
  /** False until the first pose arrives, which is taken as it is, not eased to. */
  posed: boolean
  moving: boolean
  dirty: boolean
  visible: boolean
  /** True when the caller has faded the host out. Not drawn while it is. */
  hidden: boolean
}

/** The numbers that are eased. `alpha` is not one of them — it is a flag. */
type Pose = Required<Omit<GlassPose, 'alpha'>>

const controllers = new Set<Controller>()
let frame = 0

/**
 * The most devices drawn in one animation frame. The rest wait their turn.
 *
 * "Their turn" is the whole point: this used to walk `controllers` from the
 * front every frame, so once more devices were live than the budget allowed,
 * the same first few were drawn over and over and every device after them was
 * never drawn at all. The About hit that exactly — six flying devices sit in
 * the stage behind the chapters, and once they had faded to nothing they were
 * still first in the set, still `visible`, still dirty, and still eating all
 * six slots. The three chapter devices were added last and drew **zero** frames
 * across a full scroll of all three chapters, which is what "the device is
 * static" was. `cursor` rotates the starting point so the budget is shared.
 */
const BUDGET = 6

/** Where the next frame starts in `controllers`. */
let cursor = 0

/**
 * How fast a pose eases toward its target, per second. The scroll hooks hand
 * over a new target every tick; drawing the target directly would turn every
 * step of the scroll into a step of the device. Easing with a time constant of
 * about 60ms makes the device a low-pass filter of the scroll, so it moves in
 * one continuous motion however unevenly the page is being scrolled, at the
 * price of a lag too short to read as one.
 */
const EASE_RATE = 16

let lastTime = 0

function schedule() {
  if (frame || typeof window === 'undefined') return
  frame = window.requestAnimationFrame((now) => {
    frame = 0
    const dt = Math.min(
      0.05,
      Math.max(0.001, (now - (lastTime || now - 16)) / 1000),
    )
    lastTime = now

    const resources = getShared()
    if (!resources) return

    const all = [...controllers]
    const count = all.length
    let drawn = 0
    let again = false
    /** Where the budget ran out, so the next frame resumes there. */
    let stopAt = -1

    for (let i = 0; i < count; i += 1) {
      const index = (cursor + i) % count
      const controller = all[index]
      if (!controller.visible || controller.hidden) continue
      if (controller.moving) {
        step(controller, dt)
        again = again || controller.moving
      }
      if (!controller.dirty) continue
      if (drawn >= BUDGET) {
        again = true
        stopAt = index
        break
      }
      draw(controller, resources)
      drawn += 1
    }

    if (count > 0) cursor = stopAt >= 0 ? stopAt : (cursor + drawn) % count
    if (again) schedule()
    else lastTime = 0
  })
}

const FIELDS = ['rx', 'ry', 'rz', 'p', 'spin'] as const
const EPSILON = { rx: 0.05, ry: 0.05, rz: 0.05, p: 0.001, spin: 0.1 } as const

function step(controller: Controller, dt: number) {
  const k = 1 - Math.exp(-dt * EASE_RATE)
  let settled = true
  for (const field of FIELDS) {
    const delta = controller.target[field] - controller.pose[field]
    if (Math.abs(delta) <= EPSILON[field]) {
      controller.pose[field] = controller.target[field]
    } else {
      controller.pose[field] += delta * k
      settled = false
    }
  }
  controller.dirty = true
  if (settled) controller.moving = false
}

function draw(
  controller: Controller,
  resources: NonNullable<ReturnType<typeof getShared>>,
) {
  const { pose, model, scene, camera, ctx, canvas } = controller
  controller.dirty = false

  // CSS and three.js disagree on which way is up: x and z turn the other way.
  model.root.rotation.set(-pose.rx * DEG, pose.ry * DEG, -pose.rz * DEG, 'XYZ')
  model.update(pose.p, pose.spin)

  resources.renderer.render(scene, camera)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(resources.renderer.domElement, 0, 0)
  canvas.dataset.glassDrawn = 'true'
}

export async function attachGlass(
  canvas: HTMLCanvasElement,
  kind: GlassKind,
): Promise<GlassHandle | null> {
  const resources = getShared()
  const ctx = canvas.getContext('2d')
  if (!resources || !ctx) return null

  try {
    canvas.width = GLASS_CANVAS.width
    canvas.height = GLASS_CANVAS.height

    const scene = new THREE.Scene()
    scene.environment = resources.env

    // Visible height at the origin is 3.12 units, the canvas's 156 CSS px at
    // 50 px per unit. A narrow lens keeps the perspective gentle.
    const fov = 20
    const camera = new THREE.PerspectiveCamera(
      fov,
      GLASS_CANVAS.width / GLASS_CANVAS.height,
      0.1,
      40,
    )
    camera.position.set(0, 0, 3.12 / 2 / Math.tan((fov / 2) * DEG))

    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(-2.4, 3.2, 4)
    const fill = new THREE.DirectionalLight(0xffe9d6, 0.5)
    fill.position.set(3, -1.5, 2)
    scene.add(key, fill)

    const model = BUILDERS[kind]()
    scene.add(model.root)

    const rest = REST[kind]
    const controller: Controller = {
      canvas,
      ctx,
      scene,
      camera,
      model,
      pose: {
        rx: rest.rx,
        ry: rest.ry,
        rz: rest.rz,
        p: rest.p ?? 0,
        spin: rest.spin ?? 0,
      },
      target: {
        rx: rest.rx,
        ry: rest.ry,
        rz: rest.rz,
        p: rest.p ?? 0,
        spin: rest.spin ?? 0,
      },
      posed: false,
      moving: false,
      dirty: true,
      visible: true,
      hidden: false,
    }
    controllers.add(controller)

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                controller.visible = entry.isIntersecting
                if (entry.isIntersecting) {
                  controller.dirty = true
                  schedule()
                }
              }
            },
            { rootMargin: '240px' },
          )
    observer?.observe(canvas)

    const handle: GlassHandle = {
      setPose: (next) => {
        const merged = {
          rx: next.rx,
          ry: next.ry,
          rz: next.rz,
          p: next.p ?? controller.target.p,
          spin: next.spin ?? controller.target.spin,
        }
        // A fully faded device is not worth a draw, and the budget is the
        // scarcest thing here — see BUDGET. Below a thousandth of an opacity
        // there is nothing on screen to draw for.
        const hidden = (next.alpha ?? 1) <= 0.001
        // A target that moved less than a tenth of a degree is not worth a draw.
        const same =
          hidden === controller.hidden &&
          Math.abs(merged.rx - controller.target.rx) < 0.1 &&
          Math.abs(merged.ry - controller.target.ry) < 0.1 &&
          Math.abs(merged.rz - controller.target.rz) < 0.1 &&
          Math.abs(merged.p - controller.target.p) < 0.002 &&
          Math.abs(merged.spin - controller.target.spin) < 0.2
        if (same && controller.posed) return
        controller.target = merged
        controller.hidden = hidden
        if (!controller.posed) {
          // The first pose is where the device starts, not somewhere to ease to
          // from its resting orientation.
          controller.pose = { ...merged }
          controller.posed = true
          controller.dirty = true
        } else {
          controller.moving = true
        }
        schedule()
      },
      dispose: () => {
        observer?.disconnect()
        controllers.delete(controller)
        model.dispose()
        unregisterGlass(canvas)
      },
    }
    registerGlass(canvas, handle)

    // Draw the first frame now, so the caller can hide the fallback knowing
    // there is something on the canvas to take its place.
    draw(controller, resources)
    return handle
  } catch {
    return null
  }
}

/**
 * Compile every device's shaders ahead of the first one scrolling into view.
 *
 * The first draw of a device is the expensive one: the environment map is
 * generated and the physical materials compile their programs, which on a
 * mid-range machine is long enough to be seen as a stall at exactly the moment
 * the chapters begin. This does that work when the page is idle and a screen or
 * two away, on a scene that is never drawn. It keeps the models alive: a
 * compiled program is released when the last material using it is disposed, so
 * disposing them would throw the work away.
 */
let warmed: Promise<void> | null = null
const warmScene = new THREE.Scene()

export function warmGlass(): Promise<void> {
  if (warmed) return warmed
  warmed = (async () => {
    const resources = getShared()
    if (!resources) return
    warmScene.environment = resources.env
    const camera = new THREE.PerspectiveCamera(20, 4 / 3, 0.1, 40)
    camera.position.set(0, 0, 8.85)
    warmScene.add(new THREE.DirectionalLight(0xffffff, 1.6))
    for (const kind of Object.keys(BUILDERS) as GlassKind[]) {
      warmScene.add(BUILDERS[kind]().root)
    }
    try {
      await resources.renderer.compileAsync(warmScene, camera)
    } catch {
      // The first real draw compiles instead. Nothing is lost but the head start.
    }
  })()
  return warmed
}

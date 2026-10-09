'use client'

/* eslint-disable react-hooks/immutability -- This module is a render loop, not
   render logic. React Three Fiber's `useFrame` contract is to mutate the
   camera, the instance buffers and plain refs every frame; the React Compiler
   rule forbids exactly that by design. There is no React state in the loop to
   be unsafe about, and the mutations are the feature. */

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

import {
  CALM_ZONE,
  FOG,
  PAD_GRID_DESKTOP,
  PAD_GRID_MOBILE,
  PORTRAIT_FOV_SCALE,
  bootGlow,
  buildPadLayout,
  calmFactor,
  cameraAt,
  cameraRoll,
  clamp01,
  finaleWave,
  lerp,
  lockInBlend,
  lockInStepLit,
  padTilt,
  planLockIn,
  pressAt,
  rippleAt,
  waveHeight,
} from './pad-field-math'
import { beatPulse, type PadAudio } from './pad-voices'
import { CONTACT_PAD_COLORS } from '../../../constants'

/**
 * The pad sea.
 *
 * Five `InstancedMesh` for the whole field — the glass tile, its coloured
 * bottom lip, the lip's bloom, the corner pip, and the deck it all sits on —
 * so the per-frame cost is matrix maths rather than render state. Everything
 * derived from scroll progress and the clock lives in `pad-field-math`; this
 * file only turns those numbers into matrices.
 *
 * The pads are the Contact controller's pads, taken off the CSS and rebuilt in
 * 3D against measurements rather than impressions:
 *
 *   border-radius 11px on a 137px key       -> 8% corner radius
 *   137 x 135, flat with a 5px bottom edge  -> square, 0.10 tall
 *   radial white at 18% / 5%                -> one hard key light in the env map
 *   linear pad-colour over #242a26          -> instance colour, not a texture
 *   5px bottom border in the pad colour     -> the lip mesh, full width
 *   7px pip at the top-right                -> the pip mesh
 *
 * The gloss is a clearcoat on a low-roughness `MeshPhysicalMaterial`, lit by a
 * small procedural environment. There is no transmission pass: per-instance
 * depth sorting does not exist, and five hundred translucent pads would fight
 * over their draw order.
 *
 * The camera walks a keyframed path (high angle, swell, dive between the pads,
 * plan view, lock-in) instead of a fixed rig, because the handoff to About only
 * reads if the field has visibly stopped moving by the time the section ends.
 */

const PAD_SIZE = 0.86
/** 137x135 at a 5px bottom edge is a flat tile; at 0.17 the pads read as cushions. */
const PAD_HEIGHT = 0.1
/** 11 / 137, from the Contact key. */
const PAD_RADIUS = 0.069
/** The pad-colour lip across the bottom of the front face, as the key has. */
const LIP_HEIGHT = 0.034
const LIP_DEPTH = 0.028
/** The 7px pip at the key's top-right corner, scaled to this pad. */
const PIP_SIZE = 0.062
/** Deck tiles are slightly wider than the pitch so the field has no holes. */
const DECK_SIZE = 1.04

const PAD_BASE = new THREE.Color('#242a26')
const LED_DARK = new THREE.Color('#101315')
/**
 * The single colour the field boots in. A device powers on in one colour; the
 * Contact bank is what it becomes once it is up.
 */
const BOOT_COLOR = new THREE.Color('#ff6a2a')
/**
 * How much of the Contact colour survives into the pad body.
 *
 * The CSS mixes the colour 50% with white over #242a26. That is the target, but
 * it is dialled back a little here: five hundred pads at full mix read as a
 * candy mosaic rather than as a deck. The point of the round trip is that the
 * body is *tinted glass*, not that it is as saturated as sixteen keys.
 */
const TINT_STRENGTH = 0.46

const RIPPLE_LIMIT = 3
const HIT_LIMIT = 6

export type Mutable<T> = { current: T }

export type PadFieldProps = {
  /** Hero scroll progress, 0..1, written by the ScrollTrigger bridge. */
  progress: Mutable<number>
  /** 0..1 scroll-speed energy. Choppier water while the page is moving. */
  energy: Mutable<number>
  compact: boolean
  audio: PadAudio
  onPadHit?: (index: number) => void
}

type Ripple = { x: number; z: number; born: number; strength: number }
type Hit = { x: number; z: number; born: number }

export function PadField({
  progress,
  energy,
  compact,
  audio,
  onPadHit,
}: PadFieldProps) {
  const { camera, size, gl, scene } = useThree()

  const grid = compact ? PAD_GRID_MOBILE : PAD_GRID_DESKTOP
  const layout = useMemo(() => buildPadLayout(grid), [grid])
  const lockIn = useMemo(() => planLockIn(layout), [layout])
  const count = layout.length

  const deckRef = useRef<THREE.InstancedMesh>(null)
  const padRef = useRef<THREE.InstancedMesh>(null)
  const lipRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const pipRef = useRef<THREE.InstancedMesh>(null)

  /* --- geometry + materials, built once, disposed on unmount ------------ */
  const {
    deckGeometry,
    padGeometry,
    ledGeometry,
    pipGeometry,
    glowGeometry,
    padMaterial,
    deckMaterial,
    ledMaterial,
    pipMaterial,
    glowMaterial,
    glowTexture,
    shadowTexture,
  } = useMemo(() => {
    // Segments 2, not 3: the Contact key has a hard edge with an 11px break,
    // and a third bevel segment rounds it back into a cushion.
    const padGeometry = new RoundedBoxGeometry(
      PAD_SIZE,
      PAD_HEIGHT,
      PAD_SIZE,
      2,
      PAD_RADIUS,
    )
    // The coloured bottom lip: full width, as the key's 5px bottom border is.
    const ledGeometry = new RoundedBoxGeometry(
      PAD_SIZE * 0.88,
      LIP_HEIGHT,
      LIP_DEPTH,
      2,
      0.012,
    )
    const pipGeometry = new RoundedBoxGeometry(
      PIP_SIZE,
      PIP_SIZE * 0.34,
      PIP_SIZE,
      2,
      0.012,
    )
    const glowGeometry = new THREE.PlaneGeometry(PAD_SIZE * 0.9, PAD_SIZE * 0.9)
    glowGeometry.rotateX(-Math.PI / 2)

    // The deck. Flat, slightly wider than the pitch so the tiles overlap, with
    // a baked contact shadow: dark under the pad, lighter at the tile's edges
    // where it meets its neighbours. That single texture is both the "no holes
    // in the field" fix and the shadow that grounds each pad — one mesh rather
    // than a floor plus a shadow pass per pad.
    const deckGeometry = new THREE.PlaneGeometry(DECK_SIZE, DECK_SIZE)
    deckGeometry.rotateX(-Math.PI / 2)

    const padMaterial = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      // The Contact recipe in material terms. The CSS rake is a hard-edged
      // radial at 18% / 5%; the env map's key light sits in the same corner, so
      // the gloss only needs to be sharp enough to keep it defined.
      roughness: 0.17,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      reflectivity: 0.6,
      // No `sheen`. It is a third BRDF term across every pad pixel and it
      // contributes almost nothing the clearcoat has not already said; at
      // ~450 pads filling the frame it is pure fill cost.
      envMapIntensity: 1.3,
    })
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: makeShadowTexture(),
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.25,
    })
    // The lip and the pip are the only things allowed to look like light;
    // keeping them un-tonemapped is what stops them washing out to grey.
    const ledMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      toneMapped: false,
    })
    const pipMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      toneMapped: false,
    })
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      map: makeGlowTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })

    return {
      deckGeometry,
      padGeometry,
      ledGeometry,
      pipGeometry,
      glowGeometry,
      padMaterial,
      deckMaterial,
      ledMaterial,
      pipMaterial,
      glowMaterial,
      glowTexture: glowMaterial.map,
      shadowTexture: deckMaterial.map,
    }
  }, [])

  useEffect(
    () => () => {
      deckGeometry.dispose()
      padGeometry.dispose()
      ledGeometry.dispose()
      pipGeometry.dispose()
      glowGeometry.dispose()
      padMaterial.dispose()
      deckMaterial.dispose()
      ledMaterial.dispose()
      pipMaterial.dispose()
      glowMaterial.dispose()
      glowTexture?.dispose()
      shadowTexture?.dispose()
    },
    [
      deckGeometry,
      padGeometry,
      ledGeometry,
      pipGeometry,
      glowGeometry,
      padMaterial,
      deckMaterial,
      ledMaterial,
      pipMaterial,
      glowMaterial,
      glowTexture,
      shadowTexture,
    ],
  )

  /* --- the room the glass reflects --------------------------------------- */
  useEffect(() => {
    // A clearcoat is invisible without something to reflect. A 256x128 canvas
    // gradient run through PMREM gives the pads a sky, a warm horizon and one
    // soft key light — enough for the specular rake the Contact pads have, with
    // no HDRI to download and no `<Environment>` to pull in drei for.
    const generator = new THREE.PMREMGenerator(gl)
    const source = makeEnvironmentTexture()
    const target = generator.fromEquirectangular(source)

    scene.environment = target.texture
    source.dispose()
    generator.dispose()

    return () => {
      scene.environment = null
      target.dispose()
    }
  }, [gl, scene])

  /* --- per-instance scratch state --------------------------------------- */
  const scratch = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      euler: new THREE.Euler(),
      offset: new THREE.Vector3(),
      color: new THREE.Color(),
      tint: new THREE.Color(),
      slotOf: new Int16Array(count).fill(-1),
    }),
    [count],
  )

  /** The Contact bank, as three.js colours, indexed by pad. */
  const palette = useMemo(
    () =>
      CONTACT_PAD_COLORS.map((hex) => {
        // Body tint: the pad colour held back toward the deck's base, which is
        // the CSS `color-mix(pad-color 50%, … )` recipe read darker.
        const tint = new THREE.Color(hex)
        const full = tint.clone()
        tint.lerp(PAD_BASE, 1 - TINT_STRENGTH)
        return { tint, full }
      }),
    [],
  )

  const ripplesRef = useRef<Ripple[]>([])
  const hitsRef = useRef<Hit[]>([])
  const timeRef = useRef(0)
  const cameraTarget = useRef(new THREE.Vector3(...cameraAt(0).position))
  /**
   * The pose's look-at point and the point the camera is actually aiming at.
   * Kept apart so the gaze can be damped at the same rate as the body; aiming
   * straight at the keyframe made the dive snap its gaze at the boundary while
   * the position eased.
   *
   * Seeded to the rest pose so the first frame doesn't aim from the origin.
   */
  const lookTarget = useRef(new THREE.Vector3(...cameraAt(0).lookAt))
  const cameraLookAt = useRef(new THREE.Vector3(...cameraAt(0).lookAt))

  // Which pads become the 8x3 step grid, and which slot each one takes.
  useEffect(() => {
    scratch.slotOf.fill(-1)
    lockIn.order.forEach((padIndex, slot) => {
      scratch.slotOf[padIndex] = slot
    })
  }, [lockIn, scratch])

  /* --- first paint of the buffers --------------------------------------- */
  useLayoutEffect(() => {
    const meshes = [
      deckRef.current,
      padRef.current,
      lipRef.current,
      glowRef.current,
      pipRef.current,
    ]
    if (meshes.some((mesh) => !mesh)) return

    for (const mesh of meshes) {
      mesh!.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh!.frustumCulled = false
    }

    const { dummy } = scratch
    layout.forEach((pad) => {
      dummy.position.set(pad.x, 0, pad.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      for (const mesh of meshes) mesh!.setMatrixAt(pad.index, dummy.matrix)
      deckRef.current!.setColorAt(pad.index, new THREE.Color('#ffffff'))
      padRef.current!.setColorAt(pad.index, BOOT_COLOR)
      lipRef.current!.setColorAt(pad.index, LED_DARK)
      glowRef.current!.setColorAt(pad.index, new THREE.Color(0, 0, 0))
      pipRef.current!.setColorAt(pad.index, LED_DARK)
    })
    for (const mesh of meshes) {
      mesh!.instanceMatrix.needsUpdate = true
      if (mesh!.instanceColor) mesh!.instanceColor.needsUpdate = true
    }
  }, [layout, scratch, count, palette])

  const pushRipple = (x: number, z: number, strength: number) => {
    const ripples = ripplesRef.current
    ripples.push({ x, z, born: timeRef.current, strength })
    if (ripples.length > RIPPLE_LIMIT) ripples.shift()
  }

  /**
   * The only pointer handler on the field. There is deliberately no
   * pointer-move handler: moving the cursor across the sea does nothing, which
   * is what "turn off the interactive cursor" means here. A strike still rings
   * the water and still plays its voice.
   */
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    const index = event.instanceId
    if (index === undefined) return
    // Left button (or any touch) only: a right-click on the hero should not
    // make a noise.
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const pad = layout[index]
    if (!pad) return

    hitsRef.current.push({ x: pad.x, z: pad.z, born: timeRef.current })
    if (hitsRef.current.length > HIT_LIMIT) hitsRef.current.shift()
    pushRipple(pad.x, pad.z, 1)

    // `unlock` runs inside a real gesture, which is the only place an
    // AudioContext is allowed to start.
    audio.unlock()
    audio.play(index)
    onPadHit?.(index)
  }

  /* --- the frame -------------------------------------------------------- */
  useFrame((state, rawDelta) => {
    const deckMesh = deckRef.current
    const padMesh = padRef.current
    const ledMesh = lipRef.current
    const glowMesh = glowRef.current
    const pipMesh = pipRef.current
    if (!deckMesh || !padMesh || !ledMesh || !glowMesh || !pipMesh) return

    // Clamped so a tab that was backgrounded cannot teleport the field. The
    // ceiling is deliberately loose: Motion clamps its own frames to 40ms, and
    // at 1/20 the boot sequence on a slow device ran at a fraction of real
    // time — the name was still rolling in four seconds after load.
    const delta = Math.min(rawDelta, 0.25)
    timeRef.current += delta
    const time = timeRef.current

    const p = clamp01(progress.current)
    const chop = clamp01(energy.current)
    const lock = lockInBlend(p)
    const pose = cameraAt(p)

    /* camera: keyframed pose, damped so a scrub never snaps */
    const aspect = size.height > 0 ? size.width / size.height : 1.6
    const portrait = aspect < 1
    // The same pose that shows a rolling field in landscape crops to three
    // columns in portrait. Rather than pull the camera back into the fog, the
    // portrait rig gets a wider lens and a slightly higher eye, which keeps the
    // field filling the frame instead of leaving the top third empty.
    const frame = portrait ? 1.04 : 1
    const lift = portrait ? 1.28 : 1
    const fov = pose.fov * (portrait ? PORTRAIT_FOV_SCALE : 1)

    cameraTarget.current.set(
      pose.position[0] * frame,
      pose.position[1] * frame * lift,
      pose.position[2] * frame,
    )
    const follow = 1 - Math.exp(-delta * 9)
    camera.position.lerp(cameraTarget.current, follow)
    lookTarget.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
    cameraLookAt.current.lerp(lookTarget.current, follow)
    camera.lookAt(cameraLookAt.current)
    // The banking roll: only during the dive (true 3D, so lock-in is level).
    // Seeded off `progress.current` (Authoritative truth), not time — so a
    // scrub and a free scroll agree on which way is up.
    camera.rotation.z = cameraRoll(p)

    const perspective = camera as THREE.PerspectiveCamera
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov = fov
      perspective.updateProjectionMatrix()
    }

    /* drop finished ripples and hits before the per-pad pass */
    const ripples = ripplesRef.current
    while (ripples.length && time - ripples[0].born > 1.2) ripples.shift()
    const hits = hitsRef.current
    while (hits.length && time - hits[0].born > 1.5) hits.shift()

    const audioOn = audio.isEnabled()
    const startedAt = audio.startedAt()
    const beat =
      audioOn && startedAt !== null
        ? beatPulse(window.performance.now() - startedAt)
        : 1

    const { dummy, euler, offset, slotOf } = scratch
    const amplitude = pose.amplitude
    // Palette reveal is now immediate (see pad-field-math.ts), so every pad
    // carries its bank colour from the first lit frame — no monochrome hold.

    // Portrait sees further down the field, so its fog has to reach further too
    // or the far edge would appear inside the frame.
    const fog = state.scene.fog
    if (fog instanceof THREE.Fog) {
      const wanted = portrait ? FOG.farPortrait : FOG.far
      if (fog.far !== wanted) fog.far = wanted
    }

    for (let index = 0; index < count; index += 1) {
      const pad = layout[index]
      const slot = slotOf[index]
      const isSurvivor = slot >= 0

      /* --- surface ------------------------------------------------------ */
      const calm = calmFactor(
        pad.x,
        pad.z,
        CALM_ZONE,
        portrait ? CALM_ZONE.centreZPortrait : CALM_ZONE.centreZ,
      )
      let height =
        waveHeight(pad.x, pad.z, time, { amplitude, chop }) *
        lerp(CALM_ZONE.dip, 1, calm)

      // Finale wave: a slow swell for 70..98% of the hero, so the last
      // stretch isn't a static grid on dead water. 0.55 world units at peak —
      // enough to feel alive and visible, not enough to drown the step grid.
      // Scaled by (1 - lock) per-pad so the survivors settle flat as they
      // snap into the grid.
      const finale = finaleWave(p)
      height += finale * 0.55 * Math.sin(time * 1.4 + (pad.x + pad.z) * 0.35)

      let ringBoost = 0
      for (const ripple of ripples) {
        const age = time - ripple.born
        const distance = Math.hypot(pad.x - ripple.x, pad.z - ripple.z)
        const ring = rippleAt(distance, age, { strength: ripple.strength })
        height += ring * (1 - lock)
        ringBoost = Math.max(
          ringBoost,
          ring / ripple.strength + finale * 0.8 * (1 - lock),
        )
      }

      /* --- struck pads, and the neighbours that dip with them ----------- */
      let press = 0
      for (const hit of hits) {
        const age = time - hit.born
        const distanceSq =
          (hit.x - pad.x) * (hit.x - pad.x) + (hit.z - pad.z) * (hit.z - pad.z)
        const local = pressAt(age) * Math.exp(-distanceSq * 5)
        if (Math.abs(local) > Math.abs(press)) press = local
      }
      height -= press * 0.12

      const baseY = height
      const tilt = padTilt(pad.x, pad.z, time, {
        amplitude: amplitude * lerp(CALM_ZONE.dip, 1, calm),
        chop,
      })
      let tiltX = tilt.tiltX * (1 - lock)
      let tiltZ = tilt.tiltZ * (1 - lock)

      /* --- lock-in: the middle 24 form the step grid, the rest go dark --- */
      let x = pad.x
      let z = pad.z
      let y = baseY
      let scale = 1

      if (lock > 0) {
        if (isSurvivor) {
          const target = lockIn.targets.get(index)!
          x = lerp(pad.x, target.x, lock)
          z = lerp(pad.z, target.z, lock)
          y = lerp(baseY, 0, lock)
          tiltX = lerp(tiltX, 0, lock)
          tiltZ = lerp(tiltZ, 0, lock)
        } else {
          // Fade, do not vanish. Deleting the other 300 pads would leave the
          // last third of the hero as empty background; going dark and small
          // keeps the surface running off every edge while the step grid is the
          // only thing still lit.
          y = lerp(baseY, 0, lock)
          tiltX = lerp(tiltX, 0, lock)
          tiltZ = lerp(tiltZ, 0, lock)
          scale = lerp(1, 0.6, lock)
        }
      }

      const pressScale = 1 - 0.3 * press

      /* --- deck tile ----------------------------------------------------
         Flat, at the pad's base, slightly wider than the pitch. Its baked
         texture is dark under the pad and lighter at the tile's edges, so the
         field is a continuous surface with a contact shadow under every key
         instead of a grid of tiles floating over the background. */
      euler.set(tiltX, 0, tiltZ)
      dummy.position.set(x, y - PAD_HEIGHT * 0.5 - 0.002, z)
      dummy.rotation.copy(euler)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      deckMesh.setMatrixAt(index, dummy.matrix)

      /* --- the pad ------------------------------------------------------ */
      dummy.position.set(x, y, z)
      dummy.rotation.copy(euler)
      dummy.scale.set(scale, scale * pressScale, scale)
      dummy.updateMatrix()
      padMesh.setMatrixAt(index, dummy.matrix)

      /* --- body tint: the Contact bank, dimmed at the centre and at handoff */
      const { tint, full } = palette[index % palette.length]
      // Slight per-pad variation keeps hundreds of identical boxes from
      // looking like a spreadsheet. A clearcoat reflection ignores instance
      // colour, so the handoff also shrinks the pad — fading alone left the
      // unlit rows reading as a second, dimmer copy of the step grid.
      const variance = 0.94 + ((index * 37) % 13) * 0.01
      // Colorful from the first frame. `tint` IS the bank colour, already
      // mixed toward the deck base — there is no separate boot colour to fade
      // *from*, so the row sweep alone reads the power-on. Previously the body
      // multiplied by 0.3 and lerped toward the same colour, which held the
      // whole field near-black until the reveal finished.
      scratch.tint.copy(tint)
      scratch.color
        .copy(scratch.tint)
        .multiplyScalar(
          variance *
            lerp(CALM_ZONE.body, 1, calm) *
            lerp(1, 0.08, isSurvivor ? 0 : lock),
        )
      padMesh.setColorAt(index, scratch.color)

      /* --- lit value: the boot sweep, ripples, strikes, the step grid ---- */
      let led = bootGlow(pad.row, time)
      led *= lerp(CALM_ZONE.led, 1, calm)
      led = Math.max(led, ringBoost * 0.9 * (1 - lock))
      led += Math.max(0, press) * 0.6

      if (audioOn) led *= 0.74 + 0.26 * beat

      if (lock > 0) {
        const stepCol = isSurvivor ? slot % 8 : 0
        const stepRow = isSurvivor ? Math.floor(slot / 8) : 0
        const lit = isSurvivor && lockInStepLit(stepCol, stepRow)
        led = lerp(led, lit ? 1 : 0.03, lock)
      }
      led = clamp01(led)

      /* --- the coloured lip across the bottom of the front face ---------
         The key's 5px bottom border. Full width, in the pad's own colour at
         full strength — this is what makes a dark glass tile read as one of
         the controller's keys rather than as a grey box. */
      euler.set(tiltX, 0, tiltZ)
      offset
        .set(0, -PAD_HEIGHT * 0.24, PAD_SIZE * 0.5 - LIP_DEPTH * 0.4)
        .applyEuler(euler)
      dummy.position.set(x + offset.x, y + offset.y, z + offset.z)
      dummy.rotation.copy(euler)
      dummy.scale.set(scale, scale * pressScale, scale)
      dummy.updateMatrix()
      ledMesh.setMatrixAt(index, dummy.matrix)

      // Colorful from the first lit frame — the lip *is* the pad's bank colour.
      scratch.tint.copy(full)
      scratch.color.copy(LED_DARK).lerp(scratch.tint, led)
      ledMesh.setColorAt(index, scratch.color)

      /* --- bloom -------------------------------------------------------- */
      offset
        .set(0, -PAD_HEIGHT * 0.24, PAD_SIZE * 0.5 + 0.012)
        .applyEuler(euler)
      dummy.position.set(x + offset.x, y + offset.y, z + offset.z)
      dummy.rotation.copy(euler)
      dummy.scale.set(scale * (1 + led * 0.4), scale, scale * (1 + led * 0.4))
      dummy.updateMatrix()
      glowMesh.setMatrixAt(index, dummy.matrix)

      scratch.color.copy(scratch.tint).multiplyScalar(led * 0.8)
      glowMesh.setColorAt(index, scratch.color)

      /* --- the corner pip, the key's 7px indicator ---------------------- */
      offset
        .set(PAD_SIZE * 0.32, PAD_HEIGHT * 0.5, -PAD_SIZE * 0.32)
        .applyEuler(euler)
      dummy.position.set(x + offset.x, y + offset.y, z + offset.z)
      dummy.rotation.copy(euler)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      pipMesh.setMatrixAt(index, dummy.matrix)

      // Dim grey at rest, the pad's colour when the pad is actually lit.
      scratch.color.copy(LED_DARK).lerp(scratch.tint, clamp01(led * 1.6))
      pipMesh.setColorAt(index, scratch.color)
    }

    for (const mesh of [deckMesh, padMesh, ledMesh, glowMesh, pipMesh]) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      {/* The key light, dim enough that the lips and the clearcoat highlights
          are the brightest things on the field. */}
      <ambientLight intensity={0.4} color="#c9d4d8" />
      <directionalLight
        position={[4.5, 9, 5.5]}
        intensity={0.85}
        color="#fff0dc"
      />
      {/* The horizon. Same value as the stage floor, and tuned so the field
          reaches full fog before its own far edge — the surface dissolves into
          the background rather than ending on a line at the top of the screen. */}
      <fog attach="fog" args={['#171917', FOG.near, FOG.far]} />

      <instancedMesh
        ref={deckRef}
        args={[deckGeometry, deckMaterial, count]}
        raycast={() => null}
      />
      <instancedMesh
        ref={padRef}
        args={[padGeometry, padMaterial, count]}
        onPointerDown={handlePointerDown}
      />
      <instancedMesh
        ref={lipRef}
        args={[ledGeometry, ledMaterial, count]}
        raycast={() => null}
      />
      <instancedMesh
        ref={glowRef}
        args={[glowGeometry, glowMaterial, count]}
        raycast={() => null}
      />
      <instancedMesh
        ref={pipRef}
        args={[pipGeometry, pipMaterial, count]}
        raycast={() => null}
      />
    </group>
  )
}

/**
 * The deck tile's baked shadow.
 *
 * Near-black at the centre, where the pad sits, easing out to the deck's own
 * value at the tile's edges. Because the tiles abut, that reads as a continuous
 * dark deck with a soft contact shadow under every key — the field looks solid
 * instead of like a grid of tiles with the background showing through the gaps,
 * and the shadow is baked once rather than rendered per pad.
 */
function makeShadowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1b2124'
  ctx.fillRect(0, 0, size, size)

  const shadow = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.18,
    size / 2,
    size / 2,
    size * 0.52,
  )
  shadow.addColorStop(0, 'rgba(3,4,5,1)')
  shadow.addColorStop(0.72, 'rgba(6,8,9,0.85)')
  shadow.addColorStop(1, 'rgba(27,33,36,0)')

  ctx.fillStyle = shadow
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * A soft radial dot, drawn once into a canvas. Cheaper and steadier than a
 * post-processing bloom pass, which would cost a full-screen render target for
 * a highlight that only ever sits on a 4cm LED.
 */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(0.62, 'rgba(255,255,255,0.12)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * The room, as a 256x128 equirectangular gradient: cool overhead, a warm band
 * at the horizon, dark ground, one soft key light up and to the left. It never
 * ships, it never 404s, and it is what gives the pads' clearcoat a direction to
 * catch — run through `PMREMGenerator` before it reaches a material.
 */
function makeEnvironmentTexture(): THREE.CanvasTexture {
  const width = 256
  const height = 128
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const room = ctx.createLinearGradient(0, 0, 0, height)
  room.addColorStop(0, '#1b2227')
  room.addColorStop(0.4, '#3a444b')
  room.addColorStop(0.5, '#8d7c5e')
  room.addColorStop(0.57, '#2c3338')
  room.addColorStop(1, '#0a0c0c')
  ctx.fillStyle = room
  ctx.fillRect(0, 0, width, height)

  const key = ctx.createRadialGradient(
    width * 0.24,
    height * 0.3,
    0,
    width * 0.24,
    height * 0.3,
    width * 0.42,
  )
  key.addColorStop(0, 'rgba(255,246,232,0.95)')
  key.addColorStop(0.35, 'rgba(255,238,214,0.34)')
  key.addColorStop(1, 'rgba(255,238,214,0)')
  ctx.fillStyle = key
  ctx.fillRect(0, 0, width, height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

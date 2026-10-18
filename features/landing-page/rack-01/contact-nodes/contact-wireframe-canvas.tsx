'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { Shape } from './contact-orbit'

const SHAPES: readonly Shape[] = [
  'neutral',
  'icosahedron',
  'torus',
  'octahedron',
]

/** A resting tilt per primitive, so the turn never looks like a flat spin. */
const REST_TILT: Record<Shape, number> = {
  neutral: 0.42,
  icosahedron: 0.18,
  torus: 1.16,
  octahedron: 0.34,
}

/**
 * The wireframe backdrop.
 *
 * All four primitives are built once and kept alive. Changing category does
 * not swap geometry — the active primitive scales up from 0.72 while the
 * others fade and shrink — which is a crossfade the GPU can do without a
 * hitch. One material per primitive, one colour target shared by all of them,
 * so a category change also eases the line colour across.
 */
export default function ContactWireframeCanvas({
  shape,
  color,
  paused,
}: {
  shape: Shape
  color: string
  paused: boolean
}) {
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 42, position: [0, 0, 5.4] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <WireframeScene shape={shape} color={color} />
    </Canvas>
  )
}

function WireframeScene({ shape, color }: { shape: Shape; color: string }) {
  const groups = useRef<Partial<Record<Shape, THREE.Group>>>({})
  const pointer = useRef({ x: 0, y: 0 })
  const target = useRef(new THREE.Color(color))

  const geometries = useMemo(
    () => ({
      neutral: new THREE.WireframeGeometry(
        new THREE.DodecahedronGeometry(1.38, 0),
      ),
      icosahedron: new THREE.WireframeGeometry(
        new THREE.IcosahedronGeometry(1.56, 0),
      ),
      torus: new THREE.WireframeGeometry(
        new THREE.TorusGeometry(1.06, 0.47, 6, 21),
      ),
      octahedron: new THREE.WireframeGeometry(
        new THREE.OctahedronGeometry(1.55, 0),
      ),
    }),
    [],
  )

  const materials = useMemo(
    () =>
      Object.fromEntries(
        SHAPES.map((key) => [
          key,
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
        ]),
      ) as Record<Shape, THREE.LineBasicMaterial>,
    // `color` is intentionally not a dependency: the live colour is eased in
    // `target` below. Rebuilding materials on every filter change would flash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    target.current.set(color)
  }, [color])

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(
    () => () => {
      SHAPES.forEach((key) => {
        geometries[key].dispose()
        materials[key].dispose()
      })
    },
    [geometries, materials],
  )

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05)
    SHAPES.forEach((key) => {
      const group = groups.current[key]
      const material = materials[key]
      if (!group || !material) return

      const active = key === shape
      const scale = THREE.MathUtils.damp(
        group.scale.x,
        active ? 1 : 0.72,
        7,
        dt,
      )

      group.scale.setScalar(scale)
      material.opacity = THREE.MathUtils.damp(
        material.opacity,
        active ? 0.64 : 0,
        6,
        dt,
      )
      material.color.lerp(target.current, 1 - Math.exp(-6 * dt))
      group.rotation.y += dt * (active ? 0.2 : 0.07)
      group.rotation.x = THREE.MathUtils.damp(
        group.rotation.x,
        REST_TILT[key] + pointer.current.y * 0.16,
        2.4,
        dt,
      )
      group.rotation.z = THREE.MathUtils.damp(
        group.rotation.z,
        pointer.current.x * -0.06,
        1.8,
        dt,
      )
    })
  })

  return (
    <>
      {SHAPES.map((key) => (
        <group
          key={key}
          ref={(node) => {
            if (node) groups.current[key] = node
          }}
          rotation={[REST_TILT[key], 0, 0]}
          scale={0.72}
        >
          <lineSegments geometry={geometries[key]} material={materials[key]} />
        </group>
      ))}
    </>
  )
}

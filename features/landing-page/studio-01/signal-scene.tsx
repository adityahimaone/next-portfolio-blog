'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import styles from './studio.module.css'

/**
 * The hero's one object: a chrome ring with a waveform cut into its orbit.
 *
 * It is built from primitives rather than a loaded model, for two reasons. It
 * has to ship without a network round-trip on the first screen, and every bar
 * on it is derived from a written array, so the sculpture has a readable shape
 * instead of a random one. The bars ring the outside like a level meter bent
 * into a circle; the two inner rings are the record and its run-out groove.
 *
 * Nothing here decides page layout. The canvas is a positioned square inside
 * the hero's right column and the scene is the only thing it paints.
 */

const BAR_COUNT = 56
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

function waveform(count: number): readonly number[] {
  return Array.from({ length: count }, (_, i) => {
    const slow = Math.sin((i / count) * Math.PI * 4.5)
    const fast = Math.sin(i * 1.7 + 0.6)
    const envelope = 0.35 + 0.65 * Math.abs(slow)
    return 0.16 + 0.84 * envelope * (0.55 + 0.45 * Math.abs(fast))
  })
}

const WAVE = waveform(BAR_COUNT)

function useDustPositions(count: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 1.7 + ((i * GOLDEN) % 1) * 0.5
      const angle = i * GOLDEN * 3
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius
      positions[i * 3 + 2] = ((i % 7) - 3) * 0.11
    }
    return positions
  }, [count])
}

function SignalSculpture({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null)
  const bars = useRef<THREE.InstancedMesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const dust = useRef<THREE.Points>(null)
  const energy = useRef(0)
  const scroll = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const dustPositions = useDustPositions(150)

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const target = active ? 1 : 0
    energy.current += (target - energy.current) * Math.min(1, delta * 2.5)
    scroll.current +=
      ((typeof window === 'undefined'
        ? 0
        : Math.min(1, window.scrollY / Math.max(1, window.innerHeight))) -
        scroll.current) *
      Math.min(1, delta * 3)

    if (group.current) {
      const tiltX = state.pointer.y * 0.16
      const tiltY = state.pointer.x * 0.22
      group.current.rotation.x +=
        (0.06 + tiltX + scroll.current * 0.52 - group.current.rotation.x) *
        Math.min(1, delta * 2.2)
      group.current.rotation.y +=
        (tiltY + scroll.current * 0.75 - group.current.rotation.y) *
        Math.min(1, delta * 2.2)
      group.current.rotation.z = Math.sin(time * 0.17) * 0.045
      group.current.position.y =
        Math.sin(time * 0.6) * 0.045 - scroll.current * 0.12
    }

    if (bars.current) {
      const pulse = 1 + energy.current * 0.55
      for (let i = 0; i < BAR_COUNT; i++) {
        const angle = (i / BAR_COUNT) * Math.PI * 2
        const live =
          0.55 +
          0.45 *
            Math.sin(time * (1.2 + energy.current * 2.4) + i * 0.72) *
            Math.cos(time * 0.4 + i * 0.13)
        const height =
          (0.2 + WAVE[i] * 0.62 * (0.82 + live * 0.32)) * pulse * 0.46
        const radius = 1.84 + height * 0.5
        dummy.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0,
        )
        dummy.rotation.set(0, 0, angle - Math.PI / 2)
        dummy.scale.set(1, height * 2, 1)
        dummy.updateMatrix()
        bars.current.setMatrixAt(i, dummy.matrix)
      }
      bars.current.instanceMatrix.needsUpdate = true
    }

    if (inner.current) {
      inner.current.rotation.z = -time * 0.12
    }

    if (dust.current) {
      dust.current.rotation.z = time * 0.035
      dust.current.rotation.x = Math.sin(time * 0.1) * 0.14
    }
  })

  return (
    <group ref={group} scale={0.94}>
      <mesh>
        <torusGeometry args={[1.42, 0.052, 40, 180]} />
        <meshStandardMaterial
          color="#ded7c8"
          metalness={0.92}
          roughness={0.2}
          emissive="#6b4a2e"
          emissiveIntensity={0.16}
        />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[1.62, 0.011, 12, 180]} />
        <meshStandardMaterial
          color="#d8551f"
          metalness={0.35}
          roughness={0.32}
          emissive="#d8551f"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh ref={inner} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[1.11, 0.008, 10, 180]} />
        <meshStandardMaterial
          color="#a69d8d"
          metalness={0.8}
          roughness={0.28}
        />
      </mesh>

      {/* The record face: a dark disc set just behind the chrome ring. It gives
          the sculpture a centre and catches the orange rim light. */}
      <mesh position={[0, 0, -0.06]}>
        <circleGeometry args={[1.1, 96]} />
        <meshStandardMaterial
          color="#171714"
          metalness={0.55}
          roughness={0.42}
        />
      </mesh>

      <mesh position={[0, 0, -0.045]}>
        <ringGeometry args={[1.12, 1.135, 96]} />
        <meshBasicMaterial color="#d8551f" transparent opacity={0.55} />
      </mesh>

      {/* The spindle. */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 20]} />
        <meshStandardMaterial color="#d8551f" metalness={0.4} roughness={0.3} />
      </mesh>

      <instancedMesh ref={bars} args={[undefined, undefined, BAR_COUNT]}>
        <boxGeometry args={[0.016, 1, 0.016]} />
        <meshStandardMaterial
          color="#e5dece"
          metalness={0.72}
          roughness={0.26}
          emissive="#d8551f"
          emissiveIntensity={0.08}
        />
      </instancedMesh>

      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#d8551f"
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export default function SignalScene({ active }: { active: boolean }) {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.sceneRings} />
      <div className={styles.sceneShadow} />
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 5.9], fov: 38 }}
        fallback={<div className={styles.sceneFallback} />}
      >
        <ambientLight intensity={1.1} color="#efe6d2" />
        <directionalLight
          position={[4, 5, 6]}
          intensity={2.7}
          color="#fff8e9"
        />
        <directionalLight
          position={[-5, -1, 4]}
          intensity={1.15}
          color="#ff8a4c"
        />
        <pointLight
          position={[-2.4, -2.6, 3.4]}
          intensity={14}
          distance={9}
          color="#d8551f"
        />
        <pointLight
          position={[2.8, -2, 2.8]}
          intensity={9}
          distance={8}
          color="#c8d4d6"
        />
        <SignalSculpture active={active} />
      </Canvas>
    </div>
  )
}

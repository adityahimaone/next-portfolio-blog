'use client'

import { Canvas } from '@react-three/fiber'

import { PadField, type Mutable } from './pad-field'
import type { PadAudio } from './pad-voices'

/**
 * The WebGL half of the pad sea, split into its own module so `next/dynamic`
 * can keep three.js out of the first load entirely.
 *
 * `frameloop` is the off-screen pause: `never` stops the render loop without
 * unmounting the scene, so scrolling past the hero costs nothing and coming
 * back is instant.
 *
 * There is no pointer-move prop here: the field does not react to the cursor
 * travelling across it. The only pointer handler is a strike, inside the scene.
 */
export default function PadSeaCanvas({
  progress,
  energy,
  compact,
  active,
  audio,
  onPadHit,
  onReady,
}: {
  progress: Mutable<number>
  energy: Mutable<number>
  compact: boolean
  active: boolean
  audio: PadAudio
  onPadHit?: (index: number) => void
  onReady: () => void
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.1, far: 60, position: [0, 5.6, 8.8] }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={() => {
        // Two frames: one to build the scene, one to draw it. The fallback grid
        // only hands over once something has actually been painted underneath.
        requestAnimationFrame(() => requestAnimationFrame(() => onReady()))
      }}
    >
      <PadField
        progress={progress}
        energy={energy}
        compact={compact}
        audio={audio}
        onPadHit={onPadHit}
      />
    </Canvas>
  )
}

'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Edges } from '@react-three/drei'
import * as THREE from 'three'

function Cartridge() {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Main cartridge body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 3, 0.5]} />
          <meshStandardMaterial color="#E10600" roughness={0.4} metalness={0.1} />
          <Edges color="#0A0A0A" lineWidth={2} />
        </mesh>

        {/* Top notch (cartridge connector area) */}
        <mesh position={[0, 1.7, 0]}>
          <boxGeometry args={[2.0, 0.4, 0.5]} />
          <meshStandardMaterial color="#8A0400" roughness={0.6} />
          <Edges color="#0A0A0A" lineWidth={1.5} />
        </mesh>

        {/* Label area (white) */}
        <mesh position={[0, -0.3, 0.26]}>
          <boxGeometry args={[2.0, 1.5, 0.05]} />
          <meshStandardMaterial color="#F5F5F2" roughness={0.8} />
          <Edges color="#0A0A0A" lineWidth={1} />
        </mesh>

        {/* Pixel face on label — eyes */}
        <mesh position={[-0.4, 0.1, 0.32]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshStandardMaterial color="#0A0A0A" />
        </mesh>
        <mesh position={[0.4, 0.1, 0.32]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshStandardMaterial color="#0A0A0A" />
        </mesh>

        {/* Pixel face — mouth */}
        <mesh position={[0, -0.4, 0.32]}>
          <boxGeometry args={[0.6, 0.15, 0.02]} />
          <meshStandardMaterial color="#0A0A0A" />
        </mesh>

        {/* Bottom contact pins (hint) */}
        <mesh position={[0, -1.6, 0]}>
          <boxGeometry args={[2.2, 0.2, 0.4]} />
          <meshStandardMaterial color="#2A2A2D" metalness={0.8} roughness={0.2} />
          <Edges color="#0A0A0A" lineWidth={1} />
        </mesh>

        {/* Glow when hovered */}
        {hovered && (
          <pointLight position={[0, 0, 2]} color="#E10600" intensity={2} distance={5} />
        )}
      </group>
    </Float>
  )
}

export function Mascot3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#E10600" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#F5F5F2" />

      <Cartridge />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        rotateSpeed={0.5}
      />
    </Canvas>
  )
}

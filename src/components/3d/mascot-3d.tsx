'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box } from '@react-three/drei'

export function Mascot3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      className="h-64 w-64"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box args={[1, 1, 1]} rotation={[0.5, 0.5, 0]}>
        <meshStandardMaterial color="#E10600" />
      </Box>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}

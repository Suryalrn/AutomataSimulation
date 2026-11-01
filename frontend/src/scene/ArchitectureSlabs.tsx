import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useSceneStore } from '../state/sceneStore'
import { ARCHITECTURE_SLABS } from '../data/sampleAutomaton'

// Deterministic data packets flowing downward through the stack
const PACKETS = [
  { id: 0, x: -1.2, z: 0.3, speed: 1.1, offset: 0.0 },
  { id: 1, x: 0.8, z: -0.4, speed: 1.4, offset: 0.65 },
  { id: 2, x: -0.5, z: 0.2, speed: 0.9, offset: 1.3 },
  { id: 3, x: 1.1, z: 0.4, speed: 1.25, offset: 1.95 },
  { id: 4, x: -1.0, z: -0.2, speed: 1.05, offset: 2.6 },
  { id: 5, x: 0.3, z: 0.1, speed: 1.35, offset: 3.25 },
  { id: 6, x: 1.4, z: -0.3, speed: 1.15, offset: 3.9 },
]

export default function ArchitectureSlabs() {
  const sceneIndex = useSceneStore((s) => s.sceneIndex)
  const architectureSlabSpread = useSceneStore((s) => s.architectureSlabSpread)

  const groupRef = useRef<THREE.Group>(null)
  const packetGroupRef = useRef<THREE.Group>(null)

  // Gate: Mounted and visible ONLY in section 06 (Under the Hood).
  // Completely removed from the render list outside section 6.
  const isVisible = sceneIndex === 6

  useFrame((state) => {
    if (!isVisible || !packetGroupRef.current) return
    const time = state.clock.getElapsedTime()
    packetGroupRef.current.children.forEach((child, idx) => {
      const p = PACKETS[idx]
      if (!p) return
      const progress = ((time * p.speed + p.offset) % 4.5) - 2.25
      child.position.set(p.x, -progress, p.z)
    })
  })

  if (!isVisible) {
    return null
  }

  // Positioned on the left (x = -1.6) so it never intersects the copy card on the right
  return (
    <group ref={groupRef} position={[-1.6, 0.2, 0.5]}>
      {/* 3 Translucent Stacked Slabs */}
      {ARCHITECTURE_SLABS.map((slab) => {
        // Base stacked position is y = 0. Spread expands top slab up (+Y) and bottom slab down (-Y)
        const spreadY = slab.y * architectureSlabSpread

        return (
          <group key={slab.id} position={[0, spreadY, 0]}>
            {/* Slab Glass Mesh */}
            <mesh>
              <boxGeometry args={[4.8, 0.32, 2.2]} />
              <meshStandardMaterial
                color="#0E1218"
                emissive={slab.color}
                emissiveIntensity={0.2}
                roughness={0.15}
                metalness={0.7}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Glowing Emissive Edge Outline */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(4.82, 0.33, 2.22)]} />
              <lineBasicMaterial color={slab.color} transparent opacity={0.65} />
            </lineSegments>

            {/* Slab 3D Label (Visible only in section 6) */}
            <Html
              position={[-2.2, 0.42, 1.1]}
              distanceFactor={14}
              className="pointer-events-none select-none font-sans"
            >
              <div className="rounded-xl border border-[#1C2430] bg-[#07090D]/95 p-3 backdrop-blur-md shadow-2xl min-w-[220px]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: slab.color }}
                  />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8ECF2]">
                    {slab.title}
                  </h4>
                </div>
                <p className="mt-1 text-[10px] text-[#7C8696] font-mono">
                  {slab.subtitle}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {slab.details.map((detail, dIdx) => (
                    <span
                      key={dIdx}
                      className="rounded bg-[#1C2430]/70 px-1.5 py-0.5 text-[8.5px] font-mono text-[#7C8696]"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </Html>
          </group>
        )
      })}

      {/* Flowing Data Packets */}
      <group ref={packetGroupRef}>
        {PACKETS.map((p) => (
          <mesh key={p.id}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#5CF2C0" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

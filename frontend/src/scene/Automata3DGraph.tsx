import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useSceneStore } from '../state/sceneStore'
import {
  NFA_3D_NODES,
  SAMPLE_NFA,
  SAMPLE_DFA,
} from '../data/sampleAutomaton'

// Helper to compute quadratic bezier point
function getQuadraticBezierPoint(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number,
): THREE.Vector3 {
  const oneMinusT = 1 - t
  return new THREE.Vector3(
    oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
    oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z,
  )
}

export default function Automata3DGraph() {
  const sceneIndex = useSceneStore((s) => s.sceneIndex)
  const problemSplitProgress = useSceneStore((s) => s.problemSplitProgress)
  const closureHaloProgress = useSceneStore((s) => s.closureHaloProgress)
  const subsetMergeProgress = useSceneStore((s) => s.subsetMergeProgress)
  const simulationProgress = useSceneStore((s) => s.simulationProgress)

  // References for animated tokens & halos
  const ghostToken1Ref = useRef<THREE.Mesh>(null)
  const ghostToken2Ref = useRef<THREE.Mesh>(null)
  const simTokenRef = useRef<THREE.Mesh>(null)
  const acceptBurstRingRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)

  // Positions mapped for NFA
  const nfaNodeMap = useMemo(() => {
    const map = new Map<number, THREE.Vector3>()
    NFA_3D_NODES.forEach((n) => {
      map.set(n.stateNum, new THREE.Vector3(...n.position))
    })
    return map
  }, [])

  // Positions mapped for DFA
  const dfaNodeMap = useMemo(() => {
    const map = new Map<string, THREE.Vector3>()
    SAMPLE_DFA.nodes.forEach((n) => {
      map.set(n.id, new THREE.Vector3(...n.position))
    })
    return map
  }, [])

  // In scenes 0 to 2, NFA is 100% active. In scene 3, it merges into DFA. In 4+, DFA is active.
  const isDfaActive = sceneIndex >= 4
  const isArchitectureScene = sceneIndex === 6
  const graphOpacity = isArchitectureScene ? 0.15 : 1.0

  useFrame((state) => {
    const clockTime = state.clock.getElapsedTime()

    // 1. Problem Scene (Section 1): Ghost token split on symbol '0' from q2
    if (ghostToken1Ref.current && ghostToken2Ref.current) {
      const q2Pos = nfaNodeMap.get(2) ?? new THREE.Vector3(-1.8, -1.8, 0.5)
      const q4Pos = nfaNodeMap.get(4) ?? new THREE.Vector3(4.2, -0.2, 0.4)

      // Ghost 1 travels branch: q2 -> q4
      const midPoint = new THREE.Vector3().addVectors(q2Pos, q4Pos).multiplyScalar(0.5)
      midPoint.y += 0.8 // slight curve
      const p1 = getQuadraticBezierPoint(q2Pos, midPoint, q4Pos, problemSplitProgress)
      ghostToken1Ref.current.position.copy(p1)

      // Ghost 2 travels self loop on q2: loops around q2
      const angle = problemSplitProgress * Math.PI * 2
      const loopRadius = 0.65
      ghostToken2Ref.current.position.set(
        q2Pos.x + Math.cos(angle) * loopRadius,
        q2Pos.y + Math.sin(angle) * loopRadius - 0.4,
        q2Pos.z + Math.sin(angle * 2) * 0.1,
      )

      // Visibility based on scene
      const showGhost = sceneIndex === 1 && problemSplitProgress > 0.02
      ghostToken1Ref.current.visible = showGhost
      ghostToken2Ref.current.visible = showGhost
    }

    // 2. Epsilon-Closure Scene (Section 2): Halo expansion around {q0, q1, q2}
    if (haloRef.current) {
      if (sceneIndex === 2) {
        haloRef.current.visible = true
        const scale = THREE.MathUtils.lerp(0.2, 2.7, closureHaloProgress)
        haloRef.current.scale.set(scale, scale, scale)
        const mat = haloRef.current.material as THREE.MeshStandardMaterial
        if (mat) {
          mat.opacity = THREE.MathUtils.lerp(0.0, 0.22, closureHaloProgress)
        }
      } else {
        haloRef.current.visible = false
      }
    }

    // 3. String Simulation Scene (Section 5): Token travelling DFA on input "01"
    if (simTokenRef.current) {
      if (sceneIndex === 5) {
        simTokenRef.current.visible = true
        const startPos = dfaNodeMap.get('D_012') ?? new THREE.Vector3(-4.5, 0.5, 0)
        const midPos = dfaNodeMap.get('D_124') ?? new THREE.Vector3(-0.6, -1.6, 0.3)
        const acceptPos = dfaNodeMap.get('D_4') ?? new THREE.Vector3(3.8, 0.2, 0.1)

        if (simulationProgress <= 0.5) {
          // Segment 1: D_012 -> D_124 on '0'
          const segProgress = simulationProgress / 0.5
          const ctrl = new THREE.Vector3().addVectors(startPos, midPos).multiplyScalar(0.5)
          ctrl.y -= 0.6
          const pos = getQuadraticBezierPoint(startPos, ctrl, midPos, segProgress)
          simTokenRef.current.position.copy(pos)
        } else {
          // Segment 2: D_124 -> D_4 on '1'
          const segProgress = (simulationProgress - 0.5) / 0.5
          const ctrl = new THREE.Vector3().addVectors(midPos, acceptPos).multiplyScalar(0.5)
          ctrl.y += 0.4
          const pos = getQuadraticBezierPoint(midPos, ctrl, acceptPos, segProgress)
          simTokenRef.current.position.copy(pos)
        }

        // Accept Burst Ring on reaching final state
        if (acceptBurstRingRef.current) {
          if (simulationProgress > 0.85) {
            acceptBurstRingRef.current.visible = true
            const burstProgress = (simulationProgress - 0.85) / 0.15
            const ringScale = THREE.MathUtils.lerp(0.8, 2.4, burstProgress)
            acceptBurstRingRef.current.scale.set(ringScale, ringScale, ringScale)
            const ringMat = acceptBurstRingRef.current.material as THREE.MeshBasicMaterial
            if (ringMat) {
              ringMat.opacity = Math.max(0, 1 - burstProgress)
            }
            acceptBurstRingRef.current.position.copy(acceptPos)
          } else {
            acceptBurstRingRef.current.visible = false
          }
        }
      } else {
        simTokenRef.current.visible = false
        if (acceptBurstRingRef.current) acceptBurstRingRef.current.visible = false
      }
    }

    // Gentle pulse on epsilon edges in Hero scene
    if (sceneIndex === 0) {
      const pulse = (Math.sin(clockTime * 3) + 1) * 0.5
      state.scene.traverse((obj) => {
        if (obj.name === 'epsilon-edge') {
          const line = obj as THREE.Line
          const mat = line.material as THREE.LineBasicMaterial
          if (mat) {
            mat.opacity = 0.5 + pulse * 0.5
          }
        }
      })
    }
  })

  return (
    <group>
      {/* 1. NFA NODES & EDGES (Rendered during scenes 0, 1, 2, 3) */}
      {!isDfaActive && (
        <group>
          {NFA_3D_NODES.map((node) => {
            // Interpolate position during Subset Construction merge (Scene 3)
            const initialPos = new THREE.Vector3(...node.position)
            const targetPos = node.dfaTargetPos
              ? new THREE.Vector3(...node.dfaTargetPos)
              : initialPos

            const currentPos = new THREE.Vector3().lerpVectors(
              initialPos,
              targetPos,
              sceneIndex === 3 ? subsetMergeProgress : 0,
            )

            // During merge, nodes scale into cluster
            const nodeScale =
              sceneIndex === 3
                ? THREE.MathUtils.lerp(1.0, 0.45, subsetMergeProgress)
                : 1.0

            return (
              <group
                key={node.id}
                position={[currentPos.x, currentPos.y, currentPos.z]}
                scale={[nodeScale, nodeScale, nodeScale]}
              >
                {/* Glossy Spherical Node with Emissive Rim */}
                <mesh>
                  <sphereGeometry args={[0.38, 32, 32]} />
                  <meshStandardMaterial
                    color={node.isStart ? '#6AA7FF' : node.isAccept ? '#5CF2C0' : '#1C2430'}
                    roughness={0.15}
                    metalness={0.85}
                    emissive={node.isStart ? '#6AA7FF' : node.isAccept ? '#5CF2C0' : '#0E1218'}
                    emissiveIntensity={0.35}
                    transparent
                    opacity={graphOpacity}
                  />
                </mesh>

                {/* Double ring for Accepting states */}
                {node.isAccept && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.52, 0.025, 16, 64]} />
                    <meshBasicMaterial color="#5CF2C0" transparent opacity={0.9 * graphOpacity} />
                  </mesh>
                )}

                {/* State Label in JetBrains Mono */}
                <Html
                  center
                  distanceFactor={15}
                  className="pointer-events-none select-none font-mono text-xs font-semibold text-[#E8ECF2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  <span className="rounded bg-[#07090D]/85 px-1.5 py-0.5 border border-[#1C2430]">
                    {node.label}
                  </span>
                </Html>
              </group>
            )
          })}

          {/* NFA Transitions / Edges */}
          {SAMPLE_NFA.transitions.map((trans, idx) => {
            const pFrom = nfaNodeMap.get(trans.from)
            const pTo = nfaNodeMap.get(trans.to)
            if (!pFrom || !pTo) return null

            const isSelf = trans.from === trans.to
            const isEps = trans.isEpsilon

            // Curve control point
            const mid = new THREE.Vector3().addVectors(pFrom, pTo).multiplyScalar(0.5)
            if (isSelf) {
              mid.y += 0.85
              mid.x += 0.3
            } else {
              mid.y += isEps ? 0.45 : -0.25
            }

            const curvePoints = []
            const segments = 24
            for (let i = 0; i <= segments; i++) {
              const t = i / segments
              curvePoints.push(getQuadraticBezierPoint(pFrom, mid, pTo, t))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)

            return (
              <group key={`nfa-edge-${idx}`}>
                <primitive
                  object={
                    new THREE.Line(
                      geometry,
                      new THREE.LineBasicMaterial({
                        color: isEps ? '#FFB547' : '#6AA7FF',
                        linewidth: isEps ? 2 : 1,
                        transparent: true,
                        opacity: (isEps ? 0.85 : 0.45) * graphOpacity,
                      }),
                    )
                  }
                  name={isEps ? 'epsilon-edge' : 'nfa-edge'}
                />

                {/* Edge Symbol Label */}
                <Html
                  position={[mid.x, mid.y + 0.15, mid.z]}
                  center
                  distanceFactor={15}
                  className="pointer-events-none select-none font-mono text-[10px] font-bold"
                >
                  <span
                    className={`rounded px-1 py-0.2 ${
                      isEps
                        ? 'bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/40'
                        : 'bg-[#0E1218]/80 text-[#6AA7FF] border border-[#1C2430]'
                    }`}
                  >
                    {isEps ? 'ε' : trans.symbol}
                  </span>
                </Html>
              </group>
            )
          })}
        </group>
      )}

      {/* 2. DFA NODES & EDGES (Rendered during scenes 3, 4, 5, 6, 7, 8) */}
      {(isDfaActive || sceneIndex === 3) && (
        <group>
          {SAMPLE_DFA.nodes.map((node) => {
            const dfaOpacity = sceneIndex === 3 ? subsetMergeProgress : 1.0
            const isTrap = node.id === 'D_trap'

            return (
              <group key={node.id} position={node.position}>
                {/* DFA Super-Node */}
                <mesh>
                  <sphereGeometry args={[isTrap ? 0.32 : 0.46, 32, 32]} />
                  <meshStandardMaterial
                    color={
                      isTrap
                        ? '#FF5C7A'
                        : node.isAccept
                          ? '#5CF2C0'
                          : node.isStart
                            ? '#6AA7FF'
                            : '#273445'
                    }
                    roughness={0.2}
                    metalness={0.8}
                    emissive={isTrap ? '#FF5C7A' : node.isAccept ? '#5CF2C0' : '#1C2430'}
                    emissiveIntensity={isTrap ? 0.15 : node.isAccept ? 0.45 : 0.25}
                    transparent
                    opacity={dfaOpacity * (isTrap ? 0.45 : 1.0) * graphOpacity}
                  />
                </mesh>

                {/* Double ring for Accepting DFA states */}
                {node.isAccept && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.62, 0.03, 16, 64]} />
                    <meshBasicMaterial
                      color="#5CF2C0"
                      transparent
                      opacity={0.9 * dfaOpacity * graphOpacity}
                    />
                  </mesh>
                )}

                {/* Set-Label in JetBrains Mono */}
                <Html
                  center
                  distanceFactor={15}
                  className="pointer-events-none select-none font-mono text-xs font-bold text-[#E8ECF2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                >
                  <span
                    className={`rounded px-2 py-0.5 border ${
                      isTrap
                        ? 'bg-[#FF5C7A]/15 text-[#FF5C7A] border-[#FF5C7A]/30'
                        : node.isAccept
                          ? 'bg-[#5CF2C0]/15 text-[#5CF2C0] border-[#5CF2C0]/30'
                          : 'bg-[#0E1218]/90 text-[#E8ECF2] border-[#1C2430]'
                    }`}
                  >
                    {node.label}
                  </span>
                </Html>
              </group>
            )
          })}

          {/* DFA Transitions */}
          {SAMPLE_DFA.transitions.map((trans, idx) => {
            const pFrom = dfaNodeMap.get(trans.from)
            const pTo = dfaNodeMap.get(trans.to)
            if (!pFrom || !pTo) return null

            const isSelf = trans.from === trans.to
            const mid = new THREE.Vector3().addVectors(pFrom, pTo).multiplyScalar(0.5)
            if (isSelf) {
              mid.y += 0.85
              mid.x += 0.3
            } else {
              mid.y += 0.3
            }

            const curvePoints = []
            const segments = 24
            for (let i = 0; i <= segments; i++) {
              const t = i / segments
              curvePoints.push(getQuadraticBezierPoint(pFrom, mid, pTo, t))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
            const edgeOpacity =
              (sceneIndex === 3 ? subsetMergeProgress : 1.0) * (trans.to === 'D_trap' ? 0.35 : 0.75) * graphOpacity

            return (
              <group key={`dfa-edge-${idx}`}>
                <primitive
                  object={
                    new THREE.Line(
                      geometry,
                      new THREE.LineBasicMaterial({
                        color: trans.to === 'D_trap' ? '#7C8696' : '#6AA7FF',
                        linewidth: 1.5,
                        transparent: true,
                        opacity: edgeOpacity,
                      }),
                    )
                  }
                />
                <Html
                  position={[mid.x, mid.y + 0.15, mid.z]}
                  center
                  distanceFactor={15}
                  className="pointer-events-none select-none font-mono text-[10px] font-semibold text-[#6AA7FF]"
                >
                  <span className="rounded bg-[#07090D]/90 px-1 py-0.2 border border-[#1C2430]">
                    {trans.symbol}
                  </span>
                </Html>
              </group>
            )
          })}
        </group>
      )}

      {/* 3. SCENE 1 PROBLEM: Two Ghost Tokens on state q2 branch */}
      <mesh ref={ghostToken1Ref} visible={false}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FFB547" />
      </mesh>
      <mesh ref={ghostToken2Ref} visible={false}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FFB547" />
      </mesh>

      {/* 4. SCENE 2 EPSILON-CLOSURE: Translucent Halo Shell around {q0, q1, q2} */}
      <mesh ref={haloRef} position={[-2.4, 0.1, 0.1]} visible={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#FFB547"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.18}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. SCENE 5 SIMULATION: Scrubbed Token & Accept Burst Ring */}
      <mesh ref={simTokenRef} visible={false}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color="#5CF2C0"
          emissive="#5CF2C0"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={acceptBurstRingRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[1, 0.04, 16, 64]} />
        <meshBasicMaterial color="#5CF2C0" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

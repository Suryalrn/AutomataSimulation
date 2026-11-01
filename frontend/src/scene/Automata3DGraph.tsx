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

// Helper to compute quadratic bezier point with optional out vector for zero-alloc
function getQuadraticBezierPoint(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number,
  out: THREE.Vector3 = new THREE.Vector3(),
): THREE.Vector3 {
  const oneMinusT = 1 - t
  return out.set(
    oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
    oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z,
  )
}

// Compute tangent vector for arrowhead orientation
function getQuadraticBezierTangent(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number,
  out: THREE.Vector3 = new THREE.Vector3(),
): THREE.Vector3 {
  return out
    .set(
      2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
      2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
      2 * (1 - t) * (p1.z - p0.z) + 2 * t * (p2.z - p1.z),
    )
    .normalize()
}

export default function Automata3DGraph() {
  const sceneIndex = useSceneStore((s) => s.sceneIndex)
  const problemSplitProgress = useSceneStore((s) => s.problemSplitProgress)
  const closureHaloProgress = useSceneStore((s) => s.closureHaloProgress)
  const subsetMergeProgress = useSceneStore((s) => s.subsetMergeProgress)
  const simulationProgress = useSceneStore((s) => s.simulationProgress)

  // References for animated tokens & halos
  const ghostToken1Ref = useRef<THREE.Mesh>(null)
  const ghostToken1TrailRef = useRef<THREE.Mesh>(null)
  const ghostToken2Ref = useRef<THREE.Mesh>(null)
  const ghostToken2TrailRef = useRef<THREE.Mesh>(null)
  const simTokenRef = useRef<THREE.Mesh>(null)
  const simTokenTrailRef = useRef<THREE.Mesh>(null)
  const acceptBurstRingRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const graphGroupRef = useRef<THREE.Group>(null)

  // Reusable scratch vectors to avoid per-frame allocations
  const scratchSimPos = useRef(new THREE.Vector3())
  const scratchCtrl = useRef(new THREE.Vector3())
  const scratchMid = useRef(new THREE.Vector3())

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

  // Precompute static NFA edge curves, geometries, and arrow orientations once
  const nfaEdgeData = useMemo(() => {
    return SAMPLE_NFA.transitions
      .map((trans) => {
        const pFrom = nfaNodeMap.get(trans.from)
        const pTo = nfaNodeMap.get(trans.to)
        if (!pFrom || !pTo) return null

        const isSelf = trans.from === trans.to
        const isEps = trans.isEpsilon

        const mid = new THREE.Vector3().addVectors(pFrom, pTo).multiplyScalar(0.5)
        if (isSelf) {
          mid.y += 0.85
          mid.x += 0.3
        } else {
          mid.y += isEps ? 0.45 : -0.25
        }

        const curvePoints: THREE.Vector3[] = []
        const segments = 24
        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          curvePoints.push(getQuadraticBezierPoint(pFrom, mid, pTo, t))
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)

        const endTangent = getQuadraticBezierTangent(pFrom, mid, pTo, 0.92)
        const arrowPos = getQuadraticBezierPoint(pFrom, mid, pTo, 0.94)
        const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          endTangent,
        )

        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: isEps ? '#FFB547' : '#6AA7FF',
            linewidth: 1,
            transparent: true,
            opacity: 0.8,
          }),
        )

        return {
          trans,
          line,
          geometry,
          mid,
          arrowPos,
          arrowQuat,
          isSelf,
          isEps,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
  }, [nfaNodeMap])

  // Precompute static DFA edge curves, geometries, and arrow orientations once
  const dfaEdgeData = useMemo(() => {
    return SAMPLE_DFA.transitions
      .map((trans) => {
        const pFrom = dfaNodeMap.get(trans.from)
        const pTo = dfaNodeMap.get(trans.to)
        if (!pFrom || !pTo) return null

        const isSelf = trans.from === trans.to
        const isTrapEdge = trans.to === 'D_trap'
        const mid = new THREE.Vector3().addVectors(pFrom, pTo).multiplyScalar(0.5)

        if (isSelf) {
          mid.y += trans.from === 'D_trap' ? -0.8 : 0.85
          mid.x += 0.35
        } else {
          mid.y += trans.symbol === '0' ? 0.35 : -0.35
        }

        const curvePoints: THREE.Vector3[] = []
        const segments = 24
        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          curvePoints.push(getQuadraticBezierPoint(pFrom, mid, pTo, t))
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)

        const endTangent = getQuadraticBezierTangent(pFrom, mid, pTo, 0.92)
        const arrowPos = getQuadraticBezierPoint(pFrom, mid, pTo, 0.94)
        const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          endTangent,
        )

        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: isTrapEdge ? '#7C8696' : '#6AA7FF',
            linewidth: 1,
            transparent: true,
            opacity: 0.8,
          }),
        )

        return {
          trans,
          line,
          geometry,
          mid,
          arrowPos,
          arrowQuat,
          isSelf,
          isTrapEdge,
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
  }, [dfaNodeMap])

  // Determine scene layout and safe zone offsets
  const isDfaActive = sceneIndex >= 4
  const isCenteredScene = sceneIndex === 0 || sceneIndex === 7 || sceneIndex === 8
  const isLeftCopyScene = sceneIndex === 4 || sceneIndex === 5
  const isRightCopyScene = sceneIndex === 1 || sceneIndex === 2 || sceneIndex === 3 || sceneIndex === 6

  // Fade graph to <= 12% in centered scenes (Hero, Features, CTA) so text is 100% readable
  const graphOpacity = isCenteredScene ? 0.12 : sceneIndex === 6 ? 0.15 : 1.0

  useFrame((state, delta) => {
    const clockTime = state.clock.getElapsedTime()

    // 1. Text-safe zone horizontal & depth offset
    if (graphGroupRef.current) {
      let targetX = 0
      let targetZ = 0
      let targetScale = 1.0

      if (isRightCopyScene) {
        targetX = -1.1 // Shift 3D graph to the left
      } else if (isLeftCopyScene) {
        targetX = 1.3 // Shift 3D graph to the right
      } else if (isCenteredScene) {
        targetZ = -3.5 // Push back into depth
        targetScale = 0.85
      }

      graphGroupRef.current.position.x = THREE.MathUtils.damp(
        graphGroupRef.current.position.x,
        targetX,
        5.0,
        delta,
      )
      graphGroupRef.current.position.z = THREE.MathUtils.damp(
        graphGroupRef.current.position.z,
        targetZ,
        5.0,
        delta,
      )
      graphGroupRef.current.scale.setScalar(
        THREE.MathUtils.damp(graphGroupRef.current.scale.x, targetScale, 5.0, delta),
      )
    }

    // 2. Section 1 (The Problem): Two Ghost Tokens splitting on symbol '0' from q2
    if (ghostToken1Ref.current && ghostToken2Ref.current) {
      const q2Pos = nfaNodeMap.get(2) ?? new THREE.Vector3(-1.8, -1.8, 0.5)
      const q4Pos = nfaNodeMap.get(4) ?? new THREE.Vector3(4.2, -0.2, 0.4)

      // Ghost 1: branches along q2 -> q4
      const midPoint = scratchMid.current.addVectors(q2Pos, q4Pos).multiplyScalar(0.5)
      midPoint.y += 0.85
      const p1 = getQuadraticBezierPoint(q2Pos, midPoint, q4Pos, problemSplitProgress)
      ghostToken1Ref.current.position.copy(p1)

      // Ghost 1 trail (slightly delayed)
      if (ghostToken1TrailRef.current) {
        const trailT = Math.max(0, problemSplitProgress - 0.08)
        const pTrail = getQuadraticBezierPoint(q2Pos, midPoint, q4Pos, trailT)
        ghostToken1TrailRef.current.position.copy(pTrail)
      }

      // Ghost 2: branches along self-loop on q2
      const angle = problemSplitProgress * Math.PI * 2
      const loopRadius = 0.65
      ghostToken2Ref.current.position.set(
        q2Pos.x + Math.cos(angle) * loopRadius,
        q2Pos.y + Math.sin(angle) * loopRadius - 0.4,
        q2Pos.z + Math.sin(angle * 2) * 0.1,
      )

      if (ghostToken2TrailRef.current) {
        const trailAngle = Math.max(0, (problemSplitProgress - 0.06) * Math.PI * 2)
        ghostToken2TrailRef.current.position.set(
          q2Pos.x + Math.cos(trailAngle) * loopRadius,
          q2Pos.y + Math.sin(trailAngle) * loopRadius - 0.4,
          q2Pos.z + Math.sin(trailAngle * 2) * 0.1,
        )
      }

      const showGhost = sceneIndex === 1 && problemSplitProgress > 0.02
      ghostToken1Ref.current.visible = showGhost
      ghostToken2Ref.current.visible = showGhost
      if (ghostToken1TrailRef.current) ghostToken1TrailRef.current.visible = showGhost
      if (ghostToken2TrailRef.current) ghostToken2TrailRef.current.visible = showGhost
    }

    // 3. Section 2 (ε-Closure): Expanding Halo around {q0, q1, q2} centered at [-2.6, 0.13, 0.05]
    if (haloRef.current) {
      if (sceneIndex === 2) {
        haloRef.current.visible = true
        // Scales smoothly to 2.65 to cleanly encapsulate q0, q1, q2 and leave q3, q4 outside
        const scale = THREE.MathUtils.lerp(0.3, 2.65, closureHaloProgress)
        haloRef.current.scale.set(scale, scale, scale)
        const mat = haloRef.current.material as THREE.MeshStandardMaterial
        if (mat) {
          mat.opacity = THREE.MathUtils.lerp(0.0, 0.22, closureHaloProgress)
        }
      } else {
        haloRef.current.visible = false
      }
    }

    // 4. Section 5 (String Simulation): Token travelling DFA on input "0011"
    if (simTokenRef.current) {
      if (sceneIndex === 5) {
        simTokenRef.current.visible = true
        if (simTokenTrailRef.current) simTokenTrailRef.current.visible = true

        const pos012 = dfaNodeMap.get('D_012') ?? new THREE.Vector3(-4.5, 0.5, 0)
        const pos124 = dfaNodeMap.get('D_124') ?? new THREE.Vector3(-0.6, -1.6, 0.3)
        const pos3 = dfaNodeMap.get('D_3') ?? new THREE.Vector3(-0.6, 2.0, -0.3)
        const pos4 = dfaNodeMap.get('D_4') ?? new THREE.Vector3(3.8, 0.2, 0.1)

        const p = simulationProgress

        const currentSimPos = scratchSimPos.current

        if (p < 0.25) {
          // Segment 1: D_012 -> D_124 on '0'
          const t1 = p / 0.25
          const ctrl = scratchCtrl.current.addVectors(pos012, pos124).multiplyScalar(0.5)
          ctrl.y -= 0.6
          const pt = getQuadraticBezierPoint(pos012, ctrl, pos124, t1)
          currentSimPos.copy(pt)
        } else if (p < 0.5) {
          // Segment 2: Self-loop on D_124 on '0'
          const t2 = (p - 0.25) / 0.25
          const angle = t2 * Math.PI * 2
          currentSimPos.set(
            pos124.x + Math.cos(angle) * 0.55,
            pos124.y + Math.sin(angle) * 0.55 - 0.35,
            pos124.z + Math.sin(angle * 2) * 0.1,
          )
        } else if (p < 0.75) {
          // Segment 3: D_124 -> D_3 on '1'
          const t3 = (p - 0.5) / 0.25
          const ctrl = scratchCtrl.current.addVectors(pos124, pos3).multiplyScalar(0.5)
          ctrl.x += 0.8
          const pt = getQuadraticBezierPoint(pos124, ctrl, pos3, t3)
          currentSimPos.copy(pt)
        } else {
          // Segment 4: D_3 -> D_4 on '1' with deceleration before accept settle
          const t4Raw = (p - 0.75) / 0.25
          // Anticipation and smooth deceleration
          const t4 = Math.min(1, t4Raw < 0.7 ? (t4Raw / 0.7) * 0.82 : 0.82 + ((t4Raw - 0.7) / 0.3) * 0.18)
          const ctrl = scratchCtrl.current.addVectors(pos3, pos4).multiplyScalar(0.5)
          ctrl.y += 0.5
          const pt = getQuadraticBezierPoint(pos3, ctrl, pos4, t4)
          currentSimPos.copy(pt)
        }

        simTokenRef.current.position.copy(currentSimPos)

        if (simTokenTrailRef.current) {
          simTokenTrailRef.current.position.lerp(currentSimPos, 0.4)
        }

        // Accept Burst Ring on reaching final accepting state D_4
        if (acceptBurstRingRef.current) {
          if (p > 0.9) {
            acceptBurstRingRef.current.visible = true
            const burstProgress = (p - 0.9) / 0.1
            const ringScale = THREE.MathUtils.lerp(0.8, 2.5, burstProgress)
            acceptBurstRingRef.current.scale.set(ringScale, ringScale, ringScale)
            const ringMat = acceptBurstRingRef.current.material as THREE.MeshBasicMaterial
            if (ringMat) {
              ringMat.opacity = Math.max(0, 1 - burstProgress)
            }
            acceptBurstRingRef.current.position.copy(pos4)
          } else {
            acceptBurstRingRef.current.visible = false
          }
        }
      } else {
        simTokenRef.current.visible = false
        if (simTokenTrailRef.current) simTokenTrailRef.current.visible = false
        if (acceptBurstRingRef.current) acceptBurstRingRef.current.visible = false
      }
    }

    // 5. Idle ambient pulse on ε-edges in Hero
    if (sceneIndex === 0) {
      const pulse = (Math.sin(clockTime * 2.5) + 1) * 0.5
      state.scene.traverse((obj) => {
        if (obj.name === 'epsilon-edge') {
          const line = obj as THREE.Line
          const mat = line.material as THREE.LineBasicMaterial
          if (mat) {
            mat.opacity = 0.45 + pulse * 0.45
          }
        }
      })
    }
  })

  return (
    <group ref={graphGroupRef}>
      {/* 1. NFA NODES & EDGES (Rendered during scenes 0, 1, 2, 3) */}
      {!isDfaActive && (
        <group>
          {NFA_3D_NODES.map((node) => {
            const initialPos = new THREE.Vector3(...node.position)
            const targetPos = node.dfaTargetPos ? new THREE.Vector3(...node.dfaTargetPos) : initialPos

            const currentPos = new THREE.Vector3().lerpVectors(
              initialPos,
              targetPos,
              sceneIndex === 3 ? subsetMergeProgress : 0,
            )

            const nodeScale =
              sceneIndex === 3 ? THREE.MathUtils.lerp(1.0, 0.45, subsetMergeProgress) : 1.0

            const nfaLabelOpacity =
              sceneIndex === 3 ? Math.max(0, 1 - subsetMergeProgress * 2) : 1.0

            const isQ2Highlighted = sceneIndex === 1 && node.stateNum === 2

            return (
              <group
                key={node.id}
                position={[currentPos.x, currentPos.y, currentPos.z]}
                scale={[nodeScale, nodeScale, nodeScale]}
              >
                {/* Node Core Disc */}
                <mesh>
                  <sphereGeometry args={[0.38, 32, 32]} />
                  <meshStandardMaterial
                    color={
                      isQ2Highlighted
                        ? '#FFB547'
                        : node.isStart
                          ? '#6AA7FF'
                          : node.isAccept
                            ? '#5CF2C0'
                            : '#1C2430'
                    }
                    roughness={0.15}
                    metalness={0.85}
                    emissive={
                      isQ2Highlighted
                        ? '#FFB547'
                        : node.isStart
                          ? '#6AA7FF'
                          : node.isAccept
                            ? '#5CF2C0'
                            : '#0E1218'
                    }
                    emissiveIntensity={isQ2Highlighted ? 0.8 : 0.35}
                    transparent
                    opacity={graphOpacity}
                  />
                </mesh>

                {/* Thin Emissive Specular Outer Rim */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.39, 0.012, 16, 48]} />
                  <meshBasicMaterial
                    color={
                      isQ2Highlighted
                        ? '#FFB547'
                        : node.isStart
                          ? '#6AA7FF'
                          : node.isAccept
                            ? '#5CF2C0'
                            : '#6682A3'
                    }
                    transparent
                    opacity={0.85 * graphOpacity}
                  />
                </mesh>

                {/* Double Ring for Accepting states */}
                {node.isAccept && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.52, 0.022, 16, 64]} />
                    <meshBasicMaterial color="#5CF2C0" transparent opacity={0.9 * graphOpacity} />
                  </mesh>
                )}

                {/* State Label: White-space nowrap pill, never wraps */}
                <Html
                  center
                  distanceFactor={15}
                  style={{
                    opacity: nfaLabelOpacity * graphOpacity,
                    transition: 'opacity 0.15s ease-out',
                  }}
                  className="pointer-events-none select-none"
                >
                  <span className="whitespace-nowrap rounded-md border border-[#1C2430] bg-[#07090D]/90 px-2 py-0.5 font-mono text-xs font-semibold text-[#E8ECF2] shadow-xl">
                    {node.label}
                  </span>
                </Html>
              </group>
            )
          })}

          {/* NFA Transitions / Edges */}
          {nfaEdgeData.map((edge, idx) => {
            const { trans, line, mid, arrowPos, arrowQuat, isEps } = edge
            const isQ2Branch = sceneIndex === 1 && trans.from === 2

            const edgeColor = isQ2Branch
              ? '#FFB547'
              : isEps
                ? '#FFB547'
                : '#6AA7FF'

            const mat = line.material as THREE.LineBasicMaterial
            mat.color.set(edgeColor)
            mat.opacity = (isQ2Branch ? 1.0 : isEps ? 0.9 : 0.5) * graphOpacity

            return (
              <group key={`nfa-edge-${idx}`}>
                <primitive object={line} />

                {/* Instanced Arrowhead Cone */}
                <mesh position={arrowPos} quaternion={arrowQuat}>
                  <coneGeometry args={[0.07, 0.16, 12]} />
                  <meshBasicMaterial color={edgeColor} transparent opacity={0.9 * graphOpacity} />
                </mesh>

                {/* Edge Symbol Label Chip (Offset along normal so never overlapping nodes) */}
                <Html
                  position={[mid.x, mid.y + 0.18, mid.z]}
                  center
                  distanceFactor={15}
                  className="pointer-events-none select-none"
                >
                  <span
                    className={`whitespace-nowrap rounded px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                      isEps
                        ? 'bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/40 shadow-[0_0_8px_rgba(255,181,71,0.3)]'
                        : 'bg-[#07090D]/90 text-[#6AA7FF] border border-[#1C2430]'
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
            const dfaLabelOpacity =
              sceneIndex === 3 ? Math.max(0, (subsetMergeProgress - 0.4) * 2) : 1.0

            return (
              <group key={node.id} position={node.position}>
                {/* DFA Super-Node (Slightly larger, radius 0.44) */}
                <mesh>
                  <sphereGeometry args={[isTrap ? 0.32 : 0.44, 32, 32]} />
                  <meshStandardMaterial
                    color={
                      isTrap
                        ? '#FF5C7A'
                        : node.isAccept
                          ? '#5CF2C0'
                          : node.isStart
                            ? '#6AA7FF'
                            : '#2F3E52'
                    }
                    roughness={0.2}
                    metalness={0.8}
                    emissive={isTrap ? '#FF5C7A' : node.isAccept ? '#5CF2C0' : '#1C2836'}
                    emissiveIntensity={isTrap ? 0.2 : node.isAccept ? 0.45 : 0.3}
                    transparent
                    opacity={dfaOpacity * (isTrap ? 0.5 : 1.0) * graphOpacity}
                  />
                </mesh>

                {/* Precision Outer Rim */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[isTrap ? 0.33 : 0.45, 0.014, 16, 48]} />
                  <meshBasicMaterial
                    color={
                      isTrap
                        ? '#FF5C7A'
                        : node.isAccept
                          ? '#5CF2C0'
                          : node.isStart
                            ? '#6AA7FF'
                            : '#6682A3'
                    }
                    transparent
                    opacity={0.8 * dfaOpacity * graphOpacity}
                  />
                </mesh>

                {/* Double ring for Accepting DFA states */}
                {node.isAccept && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.58, 0.024, 16, 64]} />
                    <meshBasicMaterial
                      color="#5CF2C0"
                      transparent
                      opacity={0.9 * dfaOpacity * graphOpacity}
                    />
                  </mesh>
                )}

                {/* Dead state dashed outer indicator */}
                {isTrap && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.42, 0.012, 12, 32]} />
                    <meshBasicMaterial color="#FF5C7A" transparent opacity={0.4 * dfaOpacity * graphOpacity} />
                  </mesh>
                )}

                {/* Set-Label in JetBrains Mono: White-space nowrap, auto-sizes to text */}
                <Html
                  center
                  distanceFactor={15}
                  style={{
                    opacity: dfaLabelOpacity * graphOpacity,
                    transition: 'opacity 0.15s ease-out',
                  }}
                  className="pointer-events-none select-none"
                >
                  <span
                    className={`whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] font-bold border shadow-xl ${
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

          {/* DFA Transitions (Exactly 10 transitions, one outgoing per symbol) */}
          {dfaEdgeData.map((edge, idx) => {
            const { trans, line, mid, arrowPos, arrowQuat, isTrapEdge } = edge

            const edgeColor = isTrapEdge ? '#7C8696' : '#6AA7FF'
            const edgeOpacity =
              (sceneIndex === 3 ? subsetMergeProgress : 1.0) * (isTrapEdge ? 0.4 : 0.8) * graphOpacity

            const mat = line.material as THREE.LineBasicMaterial
            mat.color.set(edgeColor)
            mat.opacity = edgeOpacity

            return (
              <group key={`dfa-edge-${idx}`}>
                <primitive object={line} />

                {/* Instanced Arrowhead Cone */}
                <mesh position={arrowPos} quaternion={arrowQuat}>
                  <coneGeometry args={[0.07, 0.16, 12]} />
                  <meshBasicMaterial color={edgeColor} transparent opacity={edgeOpacity} />
                </mesh>

                {/* Edge Symbol Label Chip */}
                <Html
                  position={[mid.x, mid.y + 0.16, mid.z]}
                  center
                  distanceFactor={15}
                  className="pointer-events-none select-none"
                >
                  <span className="whitespace-nowrap rounded bg-[#07090D]/95 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-[#6AA7FF] border border-[#1C2430]">
                    {trans.symbol}
                  </span>
                </Html>
              </group>
            )
          })}
        </group>
      )}

      {/* 3. SECTION 1: Ghost Tokens (Small emissive amber orbs, 25% of node radius ~0.095) */}
      <mesh ref={ghostToken1Ref} visible={false}>
        <sphereGeometry args={[0.095, 20, 20]} />
        <meshStandardMaterial
          color="#FFB547"
          emissive="#FFB547"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={ghostToken1TrailRef} visible={false}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshBasicMaterial color="#FFB547" transparent opacity={0.4} />
      </mesh>

      <mesh ref={ghostToken2Ref} visible={false}>
        <sphereGeometry args={[0.095, 20, 20]} />
        <meshStandardMaterial
          color="#FFB547"
          emissive="#FFB547"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={ghostToken2TrailRef} visible={false}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshBasicMaterial color="#FFB547" transparent opacity={0.4} />
      </mesh>

      {/* 4. SECTION 2: Translucent Amber Halo Shell centered at [-2.6, 0.13, 0.05] encasing {q0, q1, q2} */}
      <mesh ref={haloRef} position={[-2.6, 0.13, 0.05]} visible={false}>
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

      {/* 5. SECTION 5: Scrubbed Simulation Token & Burst Ring */}
      <mesh ref={simTokenRef} visible={false}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial
          color="#5CF2C0"
          emissive="#5CF2C0"
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={simTokenTrailRef} visible={false}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color="#5CF2C0" transparent opacity={0.45} />
      </mesh>

      <mesh ref={acceptBurstRingRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[1, 0.035, 16, 64]} />
        <meshBasicMaterial color="#5CF2C0" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

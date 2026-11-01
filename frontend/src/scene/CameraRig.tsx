import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useSceneStore } from '../state/sceneStore'

interface CameraRigProps {
  isReducedMotion: boolean
}

type Waypoint = {
  pos: [number, number, number]
  target: [number, number, number]
}

const SECTION_WAYPOINTS: Record<number, Waypoint> = {
  0: { pos: [0, 0.1, 11.2], target: [0, 0, 0] }, // Hero: central wide framing
  1: { pos: [0.8, -1.2, 4.8], target: [-1.8, -1.8, 0.5] }, // Problem: focused on q2 with right offset
  2: { pos: [0.6, 0.1, 7.2], target: [-2.6, 0.13, 0.05] }, // Epsilon-Closure: focused on halo {q0, q1, q2}
  3: { pos: [0.8, 0.0, 8.8], target: [-0.8, 0.0, 0.0] }, // Subset: merging nodes
  4: { pos: [-0.8, -0.2, 9.8], target: [0.8, -0.2, 0.0] }, // DFA: complete graph framed on right
  5: { pos: [-0.6, 0.0, 8.6], target: [1.2, 0.0, 0.0] }, // Simulation: token traversal
  6: { pos: [0.8, 0.4, 8.4], target: [-1.6, 0.2, 0.5] }, // Architecture: slabs on left
  7: { pos: [0, 0, 13.0], target: [0, 0, 0] }, // Features grid: distant ambient
  8: { pos: [0, 0.2, 12.5], target: [0, 0, 0] }, // CTA & footer: calm drift
}

export default function CameraRig({ isReducedMotion }: CameraRigProps) {
  const { camera } = useThree()
  const sceneIndex = useSceneStore((s) => s.sceneIndex)
  const sceneProgress = useSceneStore((s) => s.sceneProgress)
  const mousePos = useSceneStore((s) => s.mousePos)

  const currentPos = useRef(new THREE.Vector3(0, 0.1, 11.2))
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0))
  const scratchTargetPos = useRef(new THREE.Vector3())
  const scratchTargetLookAt = useRef(new THREE.Vector3())
  const idleAngle = useRef(0)

  useFrame((_, delta) => {
    // If user prefers reduced motion, set static fixed camera without scrubbed pans/zooms
    if (isReducedMotion) {
      camera.position.set(0, 0.1, 11.2)
      camera.lookAt(0, 0, 0)
      return
    }

    const fromWp = SECTION_WAYPOINTS[sceneIndex] ?? SECTION_WAYPOINTS[0]
    const nextIdx = Math.min(8, sceneIndex + 1)
    const toWp = SECTION_WAYPOINTS[nextIdx] ?? fromWp

    // Cinematic Inspection Plateau:
    // First 70% of each chapter stays stably framed on the subject.
    // Last 30% glides smoothly into the next chapter's staging.
    let transitionFactor = 0
    if (sceneProgress > 0.7) {
      const u = (sceneProgress - 0.7) / 0.3
      transitionFactor = u * u * (3 - 2 * u) // smoothstep
    }

    const targetPos = scratchTargetPos.current.set(
      THREE.MathUtils.lerp(fromWp.pos[0], toWp.pos[0], transitionFactor),
      THREE.MathUtils.lerp(fromWp.pos[1], toWp.pos[1], transitionFactor),
      THREE.MathUtils.lerp(fromWp.pos[2], toWp.pos[2], transitionFactor),
    )

    const targetLookAt = scratchTargetLookAt.current.set(
      THREE.MathUtils.lerp(fromWp.target[0], toWp.target[0], transitionFactor),
      THREE.MathUtils.lerp(fromWp.target[1], toWp.target[1], transitionFactor),
      THREE.MathUtils.lerp(fromWp.target[2], toWp.target[2], transitionFactor),
    )

    // Gentle idle orbit in Hero or CTA (< 0.05 rad/s budget)
    if (sceneIndex === 0 || sceneIndex === 8) {
      idleAngle.current += delta * 0.03
      const orbitRadiusX = Math.sin(idleAngle.current) * 0.3
      const orbitRadiusY = Math.cos(idleAngle.current * 0.7) * 0.15
      targetPos.x += orbitRadiusX
      targetPos.y += orbitRadiusY
    }

    // Mouse parallax on camera (max ±4° -> ~0.069 rad)
    const parallaxX = mousePos[0] * 0.35
    const parallaxY = -mousePos[1] * 0.25
    targetPos.x += parallaxX
    targetPos.y += parallaxY

    // Deterministic, smooth lerp
    const lerpSpeed = 1 - Math.exp(-7.0 * delta)
    currentPos.current.lerp(targetPos, lerpSpeed)
    currentTarget.current.lerp(targetLookAt, lerpSpeed)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}

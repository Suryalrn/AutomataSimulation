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
  0: { pos: [0, 0.1, 11.2], target: [0, 0, 0] }, // Hero
  1: { pos: [-0.6, -1.2, 5.4], target: [-1.4, -1.5, 0.4] }, // Problem: zoom on q2
  2: { pos: [-2.2, 0.2, 7.6], target: [-2.2, 0.2, 0] }, // Epsilon-Closure: halo around {q0, q1, q2}
  3: { pos: [0, 0, 9.8], target: [0, 0, 0] }, // Subset: merging nodes
  4: { pos: [0.5, -0.3, 10.8], target: [0.2, -0.2, 0] }, // DFA: full complete graph
  5: { pos: [0.6, -0.2, 8.8], target: [0.5, 0, 0] }, // Simulation: token traversal
  6: { pos: [0, 0.8, 9.4], target: [0, 0, 0] }, // Architecture slabs
  7: { pos: [0, 0, 12.0], target: [0, 0, 0] }, // Features grid
  8: { pos: [0, 0.2, 11.4], target: [0, 0, 0] }, // CTA & footer
}

export default function CameraRig({ isReducedMotion }: CameraRigProps) {
  const { camera } = useThree()
  const sceneIndex = useSceneStore((s) => s.sceneIndex)
  const sceneProgress = useSceneStore((s) => s.sceneProgress)
  const mousePos = useSceneStore((s) => s.mousePos)

  const currentPos = useRef(new THREE.Vector3(0, 0, 11))
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0))
  const idleAngle = useRef(0)

  useFrame((_, delta) => {
    // If user prefers reduced motion, set fixed camera without scrubbed pans/zooms
    if (isReducedMotion) {
      camera.position.set(0, 0, 11)
      camera.lookAt(0, 0, 0)
      return
    }

    // Determine current and next waypoint based on active scene index
    const fromWp = SECTION_WAYPOINTS[sceneIndex] ?? SECTION_WAYPOINTS[0]
    const nextIdx = Math.min(8, sceneIndex + 1)
    const toWp = SECTION_WAYPOINTS[nextIdx] ?? fromWp

    // Smoothly interpolate waypoint positions with linear scroll scrub
    const targetPos = new THREE.Vector3(
      THREE.MathUtils.lerp(fromWp.pos[0], toWp.pos[0], sceneProgress),
      THREE.MathUtils.lerp(fromWp.pos[1], toWp.pos[1], sceneProgress),
      THREE.MathUtils.lerp(fromWp.pos[2], toWp.pos[2], sceneProgress),
    )

    const targetLookAt = new THREE.Vector3(
      THREE.MathUtils.lerp(fromWp.target[0], toWp.target[0], sceneProgress),
      THREE.MathUtils.lerp(fromWp.target[1], toWp.target[1], sceneProgress),
      THREE.MathUtils.lerp(fromWp.target[2], toWp.target[2], sceneProgress),
    )

    // Gentle idle orbit in Hero or CTA (< 0.05 rad/s budget)
    if (sceneIndex === 0 || sceneIndex === 8) {
      idleAngle.current += delta * 0.035
      const orbitRadiusX = Math.sin(idleAngle.current) * 0.4
      const orbitRadiusY = Math.cos(idleAngle.current * 0.7) * 0.2
      targetPos.x += orbitRadiusX
      targetPos.y += orbitRadiusY
    }

    // Mouse parallax on camera (budget: max ±4° -> ~0.069 rad)
    const parallaxX = mousePos[0] * 0.45
    const parallaxY = -mousePos[1] * 0.35
    targetPos.x += parallaxX
    targetPos.y += parallaxY

    // Deterministic, smooth lerp
    const lerpSpeed = 1 - Math.exp(-6.5 * delta)
    currentPos.current.lerp(targetPos, lerpSpeed)
    currentTarget.current.lerp(targetLookAt, lerpSpeed)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}

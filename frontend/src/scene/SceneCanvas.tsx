import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CameraRig from './CameraRig'
import Automata3DGraph from './Automata3DGraph'
import ArchitectureSlabs from './ArchitectureSlabs'
import { useSceneStore } from '../state/sceneStore'

export default function SceneCanvas() {
  const isReducedMotion = useSceneStore((s) => s.isReducedMotion)
  const isWebGLSupported = useSceneStore((s) => s.isWebGLSupported)
  const setWebGLSupported = useSceneStore((s) => s.setWebGLSupported)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check viewport width for mobile breakpoint
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isWebGLSupported) {
    return null
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#07090D]">
      <Canvas
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 11], fov: 42, near: 0.1, far: 50 }}
        gl={{
          antialias: !isMobile,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#07090D', 1)
        }}
        onError={() => {
          setWebGLSupported(false)
        }}
      >
        {/* Soft Scientific Instrument Fog for Depth */}
        <fog attach="fog" args={['#07090D', 8, 26]} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 8, 8]} intensity={1.2} color="#FFFFFF" />
        <pointLight position={[-6, -4, 4]} intensity={0.8} color="#6AA7FF" />
        <pointLight position={[6, 4, -4]} intensity={0.6} color="#5CF2C0" />

        <CameraRig isReducedMotion={isReducedMotion} />

        <Suspense fallback={null}>
          <Automata3DGraph />
          <ArchitectureSlabs />

          {/* Subtle Bloom Effect (disabled on low-end mobile devices) */}
          {!isMobile && (
            <EffectComposer multisampling={0}>
              <Bloom
                luminanceThreshold={0.65}
                intensity={0.35}
                radius={0.5}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}


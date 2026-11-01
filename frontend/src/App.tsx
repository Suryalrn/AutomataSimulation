import { useEffect, lazy, Suspense } from 'react'
import NFAEditor from './NFAEditor'
import StoryContainer from './sections/StoryContainer'
import WebGLFallback from './sections/WebGLFallback'
import { useSceneStore } from './state/sceneStore'

// Code-split 3D canvas so text-first hero paints instantly
const SceneCanvas = lazy(() => import('./scene/SceneCanvas'))

export default function App() {
  const isAppOpen = useSceneStore((s) => s.isAppOpen)
  const setAppOpen = useSceneStore((s) => s.setAppOpen)
  const isWebGLSupported = useSceneStore((s) => s.isWebGLSupported)

  // Listen to hash change, e.g. #editor, #app, #story
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#editor' || window.location.hash === '#app') {
        setAppOpen(true)
      } else if (window.location.hash === '#story' || window.location.hash === '') {
        // stay in 3D story mode
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [setAppOpen])

  if (isAppOpen) {
    return (
      <div className="relative min-h-screen bg-[#09090b] text-zinc-100">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800 bg-[#0e0e11]/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAppOpen(false)
                window.location.hash = ''
              }}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
            >
              ← Back to 3D Story
            </button>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-xs text-[#5CF2C0]">AutomataLab Studio</span>
          </div>
          <span className="font-mono text-xs text-zinc-400">ε-NFA to DFA Engine</span>
        </header>

        <NFAEditor
          onBack={() => {
            setAppOpen(false)
            window.location.hash = ''
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-[#07090D] text-[#E8ECF2] overflow-x-hidden">
      {/* 1. Persistent fixed 3D Canvas behind the DOM (lazy-loaded with fallback) */}
      <Suspense fallback={null}>
        <SceneCanvas />
      </Suspense>

      {/* 2. Static SVG Fallback when WebGL is unsupported */}
      {!isWebGLSupported && <WebGLFallback />}

      {/* 3. Subtle Film Grain & Vignette Overlays for Scientific Instrument Aesthetic */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      {/* 4. DOM Story Container with Scrubbed Panels & Editorial Typography */}
      <StoryContainer
        onLaunchApp={() => {
          setAppOpen(true)
          window.location.hash = '#editor'
        }}
      />
    </div>
  )
}

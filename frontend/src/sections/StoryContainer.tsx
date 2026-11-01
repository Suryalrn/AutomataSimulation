import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import HeroSection from './HeroSection'
import ProblemSection from './ProblemSection'
import ClosureSection from './ClosureSection'
import SubsetSection from './SubsetSection'
import DfaSection from './DfaSection'
import SimulationSection from './SimulationSection'
import ArchitectureSection from './ArchitectureSection'
import FeaturesSection from './FeaturesSection'
import CtaFooterSection from './CtaFooterSection'

import { useSceneStore, type StoryScene } from '../state/sceneStore'

gsap.registerPlugin(ScrollTrigger)

// Configurable App URL constant
export const APP_URL = '#editor'

interface StoryContainerProps {
  onLaunchApp: () => void
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export default function StoryContainer({ onLaunchApp }: StoryContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)

  // Panel refs for the 6 pinned scenes
  const p1Ref = useRef<HTMLDivElement>(null)
  const p2Ref = useRef<HTMLDivElement>(null)
  const p3Ref = useRef<HTMLDivElement>(null)
  const p4Ref = useRef<HTMLDivElement>(null)
  const p5Ref = useRef<HTMLDivElement>(null)
  const p6Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Accessibility: Detect prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    useSceneStore.getState().setReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      useSceneStore.getState().setReducedMotion(e.matches)
    }
    motionQuery.addEventListener('change', handleMotionChange)

    // 2. WebGL Support Verification
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      useSceneStore.getState().setWebGLSupported(!!gl)
    } catch {
      useSceneStore.getState().setWebGLSupported(false)
    }

    // 3. Mouse Parallax Listener (budget: max ±4° -> ~0.069 rad)
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      useSceneStore.getState().setMousePos([nx, ny])
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    // 4. Initialize Lenis Smooth Scroll and sync with GSAP Ticker
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    // 5. ScrollTrigger for Hero (Section 0)
    const heroTrigger = ScrollTrigger.create({
      trigger: '#scene-hero',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        useSceneStore.getState().setActiveScene('hero', 0)
        useSceneStore.getState().setSceneProgress(0)
      },
      onEnterBack: () => {
        useSceneStore.getState().setActiveScene('hero', 0)
        useSceneStore.getState().setSceneProgress(0)
      },
    })

    // 6. Master scrubbed timeline for pinned stage (Sections 1-6)
    const panels = [
      p1Ref.current,
      p2Ref.current,
      p3Ref.current,
      p4Ref.current,
      p5Ref.current,
      p6Ref.current,
    ].filter(Boolean) as HTMLElement[]

    // Set initial positions
    panels.forEach((p, idx) => {
      gsap.set(p, {
        opacity: idx === 0 ? 1 : 0,
        y: idx === 0 ? 0 : 24,
        pointerEvents: idx === 0 ? 'auto' : 'none',
      })
    })

    const masterTl = gsap.timeline({
      paused: true,
      defaults: { ease: 'none' },
    })

    // Setup 6 segments in master timeline (total duration = 6)
    // Segment 0: Problem (0 -> 1)
    masterTl.to(
      p1Ref.current,
      {
        opacity: 0,
        y: -24,
        pointerEvents: 'none',
        duration: 0.2,
      },
      0.8,
    )

    // Segment 1: Closure (1 -> 2)
    masterTl.fromTo(
      p2Ref.current,
      { opacity: 0, y: 24, pointerEvents: 'none' },
      { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.2 },
      1.0,
    )
    masterTl.to(
      p2Ref.current,
      { opacity: 0, y: -24, pointerEvents: 'none', duration: 0.2 },
      1.8,
    )

    // Segment 2: Subset (2 -> 3)
    masterTl.fromTo(
      p3Ref.current,
      { opacity: 0, y: 24, pointerEvents: 'none' },
      { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.2 },
      2.0,
    )
    masterTl.to(
      p3Ref.current,
      { opacity: 0, y: -24, pointerEvents: 'none', duration: 0.2 },
      2.8,
    )

    // Segment 3: DFA (3 -> 4)
    masterTl.fromTo(
      p4Ref.current,
      { opacity: 0, y: 24, pointerEvents: 'none' },
      { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.2 },
      3.0,
    )
    masterTl.to(
      p4Ref.current,
      { opacity: 0, y: -24, pointerEvents: 'none', duration: 0.2 },
      3.8,
    )

    // Segment 4: Simulation (4 -> 5)
    masterTl.fromTo(
      p5Ref.current,
      { opacity: 0, y: 24, pointerEvents: 'none' },
      { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.2 },
      4.0,
    )
    masterTl.to(
      p5Ref.current,
      { opacity: 0, y: -24, pointerEvents: 'none', duration: 0.2 },
      4.8,
    )

    // Segment 5: Architecture (5 -> 6)
    masterTl.fromTo(
      p6Ref.current,
      { opacity: 0, y: 24, pointerEvents: 'none' },
      { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.2 },
      5.0,
    )
    masterTl.to(
      p6Ref.current,
      { opacity: 0, y: -24, pointerEvents: 'none', duration: 0.2 },
      5.8,
    )

    // ScrollTrigger pinning `#story-stage` for 600vh with linear scrub 0.8
    const stageTrigger = ScrollTrigger.create({
      trigger: stageRef.current,
      start: 'top top',
      end: '+=600%',
      pin: true,
      scrub: 0.8,
      animation: masterTl,
      onUpdate: (self) => {
        const totalProgress = self.progress // [0, 1]
        useSceneStore.getState().setGlobalProgress(totalProgress)

        const t = totalProgress * 6.0 // [0, 6]
        const sceneIdx = Math.min(6, Math.max(1, Math.floor(t) + 1))
        const segmentProgress = clamp(t - Math.floor(t), 0, 1)

        const scenes: StoryScene[] = [
          'hero',
          'problem',
          'closure',
          'subset',
          'dfa',
          'simulation',
          'architecture',
        ]
        const currentScene = scenes[sceneIdx] ?? 'problem'

        // Deterministic parameter calculation
        const p0 = clamp(t / 1.0, 0, 1) // Problem split
        const p1 = clamp((t - 1.0) / 1.0, 0, 1) // Closure halo
        const p2 = clamp((t - 2.0) / 1.0, 0, 1) // Subset merge
        const p3 = clamp((t - 3.0) / 1.0, 0, 1) // DFA revealed
        const p4 = clamp((t - 4.0) / 1.0, 0, 1) // Simulation progress
        const p5 = clamp((t - 5.0) / 1.0, 0, 1) // Architecture spread

        const store = useSceneStore.getState()
        store.setActiveScene(currentScene, sceneIdx)
        store.setSceneProgress(segmentProgress)
        store.setProblemSplitProgress(p0)
        store.setClosureHaloProgress(p1)
        store.setSubsetMergeProgress(p2)
        store.setDfaRevealedProgress(p3)
        store.setSimulationProgress(p4)
        store.setArchitectureSlabSpread(p5)
      },
    })

    // 7. ScrollTrigger for Features (Section 7)
    const featuresTrigger = ScrollTrigger.create({
      trigger: '#scene-features',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        useSceneStore.getState().setActiveScene('features', 7)
        useSceneStore.getState().setSceneProgress(0.5)
      },
      onEnterBack: () => {
        useSceneStore.getState().setActiveScene('features', 7)
        useSceneStore.getState().setSceneProgress(0.5)
      },
    })

    // 8. ScrollTrigger for CTA & Footer (Section 8)
    const ctaTrigger = ScrollTrigger.create({
      trigger: '#scene-cta',
      start: 'top center',
      end: 'bottom bottom',
      onEnter: () => {
        useSceneStore.getState().setActiveScene('cta', 8)
        useSceneStore.getState().setSceneProgress(1.0)
      },
      onEnterBack: () => {
        useSceneStore.getState().setActiveScene('cta', 8)
        useSceneStore.getState().setSceneProgress(1.0)
      },
    })

    // Refresh ScrollTrigger after DOM layout settle
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 250)

    return () => {
      clearTimeout(refreshTimer)
      motionQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(tickerCallback)
      heroTrigger.kill()
      stageTrigger.kill()
      featuresTrigger.kill()
      ctaTrigger.kill()
      masterTl.kill()
      lenis.destroy()
    }
  }, [])

  const handleExplore = () => {
    if (lenisRef.current && stageRef.current) {
      lenisRef.current.scrollTo(stageRef.current, { offset: 0, duration: 1.5 })
    } else {
      stageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLaunch = () => {
    if (APP_URL && APP_URL !== '#editor' && APP_URL !== '#app') {
      window.open(APP_URL, '_blank', 'noopener,noreferrer')
    } else {
      onLaunchApp()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full text-[#E8ECF2] z-10 selection:bg-[#5CF2C0] selection:text-[#07090D]">
      {/* SECTION 0: HERO (100vh) */}
      <HeroSection onLaunchApp={handleLaunch} onExplore={handleExplore} />

      {/* SECTIONS 1 - 6: PINNED STAGE (600vh scroll container) */}
      <div id="story-stage" ref={stageRef} className="relative h-screen w-full overflow-hidden">
        {/* Panel 1: The Problem */}
        <div
          id="panel-problem"
          ref={p1Ref}
          className="absolute inset-0 flex items-center justify-start pointer-events-auto"
        >
          <ProblemSection />
        </div>

        {/* Panel 2: Epsilon-Closure */}
        <div
          id="panel-closure"
          ref={p2Ref}
          className="absolute inset-0 flex items-center justify-end pointer-events-auto"
        >
          <ClosureSection />
        </div>

        {/* Panel 3: Subset Construction */}
        <div
          id="panel-subset"
          ref={p3Ref}
          className="absolute inset-0 flex items-center justify-start pointer-events-auto"
        >
          <SubsetSection />
        </div>

        {/* Panel 4: The Complete DFA */}
        <div
          id="panel-dfa"
          ref={p4Ref}
          className="absolute inset-0 flex items-center justify-end pointer-events-auto"
        >
          <DfaSection />
        </div>

        {/* Panel 5: String Simulation */}
        <div
          id="panel-simulation"
          ref={p5Ref}
          className="absolute inset-0 flex items-center justify-start pointer-events-auto"
        >
          <SimulationSection />
        </div>

        {/* Panel 6: Under The Hood Architecture */}
        <div
          id="panel-architecture"
          ref={p6Ref}
          className="absolute inset-0 flex items-center justify-end pointer-events-auto"
        >
          <ArchitectureSection />
        </div>
      </div>

      {/* SECTION 7: FEATURES GRID (min-h-screen) */}
      <FeaturesSection />

      {/* SECTION 8: CTA + FOOTER (min-h-screen) */}
      <CtaFooterSection onLaunchApp={handleLaunch} />
    </div>
  )
}

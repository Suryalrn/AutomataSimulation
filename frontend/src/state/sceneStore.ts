import { create } from 'zustand'

export type StoryScene =
  | 'hero'
  | 'problem'
  | 'closure'
  | 'subset'
  | 'dfa'
  | 'simulation'
  | 'architecture'
  | 'features'
  | 'cta'

export interface SceneState {
  // Navigation & Scroll Progress
  activeScene: StoryScene
  sceneIndex: number
  sceneProgress: number // [0, 1] within current active section
  globalProgress: number // [0, 1] across total scroll height

  // Mouse Parallax (normalized [-1, 1])
  mousePos: [number, number]

  // Scene Specific State
  problemSplitProgress: number // 0: single token at q2, 1: 2 ghost tokens on two paths
  closureHaloProgress: number // 0: off, 1: amber ε-edges glowing + halo around {q0, q1, q2}
  subsetMergeProgress: number // 0: original NFA nodes, 1: merged into DFA super-nodes
  dfaRevealedProgress: number // 0: hidden, 1: fully stable complete DFA visible
  simulationProgress: number // 0: start of string traversal, 1: reached final accept state
  stringAcceptStatus: 'idle' | 'running' | 'accepted' | 'rejected'
  architectureSlabSpread: number // 0: stacked together, 1: exploded vertically

  // Accessibility & System
  isReducedMotion: boolean
  isWebGLSupported: boolean
  isAppOpen: boolean

  // Actions
  setActiveScene: (scene: StoryScene, index: number) => void
  setSceneProgress: (progress: number) => void
  setGlobalProgress: (progress: number) => void
  setMousePos: (pos: [number, number]) => void
  setProblemSplitProgress: (val: number) => void
  setClosureHaloProgress: (val: number) => void
  setSubsetMergeProgress: (val: number) => void
  setDfaRevealedProgress: (val: number) => void
  setSimulationProgress: (val: number) => void
  setStringAcceptStatus: (status: 'idle' | 'running' | 'accepted' | 'rejected') => void
  setArchitectureSlabSpread: (val: number) => void
  setReducedMotion: (val: boolean) => void
  setWebGLSupported: (val: boolean) => void
  setAppOpen: (open: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  activeScene: 'hero',
  sceneIndex: 0,
  sceneProgress: 0,
  globalProgress: 0,
  mousePos: [0, 0],

  problemSplitProgress: 0,
  closureHaloProgress: 0,
  subsetMergeProgress: 0,
  dfaRevealedProgress: 0,
  simulationProgress: 0,
  stringAcceptStatus: 'idle',
  architectureSlabSpread: 0,

  isReducedMotion: false,
  isWebGLSupported: true,
  isAppOpen: false,

  setActiveScene: (scene, index) => set({ activeScene: scene, sceneIndex: index }),
  setSceneProgress: (progress) => set({ sceneProgress: progress }),
  setGlobalProgress: (progress) => set({ globalProgress: progress }),
  setMousePos: (pos) => set({ mousePos: pos }),
  setProblemSplitProgress: (val) => set({ problemSplitProgress: val }),
  setClosureHaloProgress: (val) => set({ closureHaloProgress: val }),
  setSubsetMergeProgress: (val) => set({ subsetMergeProgress: val }),
  setDfaRevealedProgress: (val) => set({ dfaRevealedProgress: val }),
  setSimulationProgress: (val) => set({ simulationProgress: val }),
  setStringAcceptStatus: (status) => set({ stringAcceptStatus: status }),
  setArchitectureSlabSpread: (val) => set({ architectureSlabSpread: val }),
  setReducedMotion: (val) => set({ isReducedMotion: val }),
  setWebGLSupported: (val) => set({ isWebGLSupported: val }),
  setAppOpen: (open) => set({ isAppOpen: open }),
}))

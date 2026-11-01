import { useSceneStore } from '../state/sceneStore'

export default function ClosureSection() {
  const closureHaloProgress = useSceneStore((s) => s.closureHaloProgress)

  // Typed on with scroll progress
  const fullEquation = 'ε-closure(q0) = { q0, q1, q2 }'
  const charCount = Math.floor(closureHaloProgress * fullEquation.length)
  const displayedEquation = fullEquation.slice(0, Math.max(1, charCount))

  return (
    <section
      id="scene-closure"
      className="relative flex h-screen w-full items-center justify-end p-6 sm:p-12 lg:p-20 z-10"
    >
      <div className="max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/85 p-8 backdrop-blur-xl shadow-2xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#FFB547]">
          02 // Epsilon-Closure
        </span>

        <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          Zero cost. <br />
          <span className="text-[#FFB547]">Instant reach.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#7C8696]">
          Epsilon (ε) transitions occur spontaneously without consuming any character from the input
          string. The <strong className="text-[#E8ECF2]">ε-closure</strong> captures every state
          reachable from the origin through zero or more ε-moves.
        </p>

        {/* Dynamic Typed Mono Equation Driven by Scroll */}
        <div className="mt-6 rounded-xl border border-[#FFB547]/30 bg-[#FFB547]/5 p-4 font-mono text-sm sm:text-base text-[#FFB547]">
          <span className="text-xs uppercase tracking-wider text-[#7C8696] block mb-1">
            COMPUTED HALO SHELL:
          </span>
          <span className="font-bold">{displayedEquation}</span>
          <span className="animate-pulse">_</span>
        </div>

        <p className="mt-4 text-xs text-[#7C8696]">
          Amber halo expands as the DFS traversal aggregates reachable states into a single unified
          start super-state.
        </p>
      </div>
    </section>
  )
}

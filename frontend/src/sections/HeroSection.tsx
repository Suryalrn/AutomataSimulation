import { ArrowDown, Play, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  onLaunchApp: () => void
  onExplore: () => void
}

export default function HeroSection({ onLaunchApp, onExplore }: HeroSectionProps) {
  return (
    <section
      id="scene-hero"
      className="relative flex min-h-screen w-full flex-col justify-between p-6 sm:p-10 lg:p-16 z-10"
    >
      {/* Top Bar / Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1C2430] bg-[#0E1218]/80 backdrop-blur-md">
            <span className="font-mono text-xs font-bold text-[#5CF2C0]">ε→D</span>
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold tracking-tight text-[#E8ECF2]">
              AUTOMATALAB
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#7C8696]">
              Instrument 01 • C++ Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#1C2430] bg-[#0E1218]/60 px-3 py-1 font-mono text-xs text-[#5CF2C0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5CF2C0] animate-pulse" />
            C++ Engine v1.0 Ready
          </span>

          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 rounded-lg bg-[#5CF2C0] px-4 py-2 font-sans text-xs font-semibold text-[#07090D] transition-all hover:bg-[#4ee0b0] hover:shadow-[0_0_20px_rgba(92,242,192,0.35)] focus:outline-none focus:ring-2 focus:ring-[#5CF2C0]/50 cursor-pointer"
          >
            <Play size={13} fill="#07090D" />
            Launch App
          </button>
        </div>
      </header>

      {/* Hero Editorial Centerpiece */}
      <div className="my-auto max-w-3xl py-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFB547]/30 bg-[#FFB547]/10 px-3 py-1 font-mono text-xs text-[#FFB547]">
          <Sparkles size={13} />
          Subset Construction Simulator
        </div>

        <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#E8ECF2] leading-[1.08]">
          Turn <span className="text-[#FFB547]">nondeterminism</span> into{' '}
          <span className="text-[#5CF2C0]">certainty.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#7C8696]">
          From non-deterministic ε-NFAs with branching futures to mathematical, single-state
          DFAs. Explore epsilon-closure, subset merges, and deterministic string simulation in real-time.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 rounded-xl bg-[#5CF2C0] px-6 py-3.5 font-sans text-sm font-semibold text-[#07090D] shadow-lg shadow-[#5CF2C0]/20 transition-all hover:bg-[#4ee0b0] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#5CF2C0] cursor-pointer"
          >
            <Play size={16} fill="#07090D" />
            Launch Full Studio
          </button>

          <button
            onClick={onExplore}
            className="flex items-center gap-2 rounded-xl border border-[#1C2430] bg-[#0E1218]/70 px-6 py-3.5 font-sans text-sm font-medium text-[#E8ECF2] backdrop-blur-md transition-all hover:border-[#7C8696] hover:bg-[#1C2430] cursor-pointer"
          >
            See how it works
            <ArrowDown size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Sub-info */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#1C2430]/70 pt-6 text-xs text-[#7C8696]">
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span>ALGORITHM: SUBSET CONSTRUCTION</span>
          <span>COMPLEXITY: O(2^N)</span>
          <span>PARADIGM: DETERMINISTIC MAPPING</span>
        </div>
        <p className="font-mono text-[11px] text-[#7C8696]/80">Scroll to observe transformation ↓</p>
      </div>
    </section>
  )
}

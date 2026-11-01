import { useSceneStore } from '../state/sceneStore'

export default function SubsetSection() {
  const subsetMergeProgress = useSceneStore((s) => s.subsetMergeProgress)
  const percent = Math.round(subsetMergeProgress * 100)

  return (
    <section
      id="scene-subset"
      className="relative flex h-screen w-full items-center p-6 sm:p-12 lg:p-20 z-10"
    >
      <div className="max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/85 p-8 backdrop-blur-xl shadow-2xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6AA7FF]">
          03 // Subset Construction
        </span>

        <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          Every set of states <br />
          <span className="text-[#6AA7FF]">becomes one state.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#7C8696]">
          By evaluating the power set <span className="font-mono text-[#E8ECF2]">𝒫(Q)</span>, the C++
          engine collapses multiple concurrent NFA configurations into singular, deterministic
          &quot;super-states&quot;. Ambiguity is completely erased.
        </p>

        {/* Progress of Merge */}
        <div className="mt-6 rounded-xl border border-[#1C2430] bg-[#07090D]/80 p-4">
          <div className="flex justify-between text-xs font-mono text-[#7C8696]">
            <span>POWER SET RECONFIGURATION</span>
            <span className="text-[#6AA7FF]">{percent}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1C2430]">
            <div
              className="h-full bg-[#6AA7FF] transition-all duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px] text-[#7C8696]">
            <div className="rounded bg-[#0E1218] p-2 border border-[#1C2430]">
              <span className="block text-[9px] uppercase text-[#7C8696]">NFA SUBSETS</span>
              <span className="text-[#FFB547]">q0, q1, q2</span>
            </div>
            <div className="rounded bg-[#0E1218] p-2 border border-[#1C2430]">
              <span className="block text-[9px] uppercase text-[#7C8696]">DFA SUPER-STATE</span>
              <span className="text-[#6AA7FF]">&#123; q0, q1, q2 &#125;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

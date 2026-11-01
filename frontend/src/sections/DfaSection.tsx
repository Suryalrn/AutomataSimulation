export default function DfaSection() {
  return (
    <section
      id="scene-dfa"
      className="relative flex h-screen w-full items-center justify-start p-6 sm:p-12 lg:pl-20 z-10"
    >
      {/* Soft gradient scrim behind copy block */}
      <div className="relative max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/90 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(7,9,13,0.95)] before:absolute before:-inset-4 before:-z-10 before:rounded-3xl before:bg-gradient-to-r before:from-[#07090D]/90 before:to-transparent before:blur-xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5CF2C0]">
          04 // The DFA
        </span>

        <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          Exact certainty. <br />
          <span className="text-[#5CF2C0]">Every symbol accounted for.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#7C8696]">
          The conversion produces a mathematically complete DFA. Each state possesses exactly
          one unique outgoing transition per alphabet symbol. Invalid trajectories terminate
          in a dim trap state (<span className="font-mono text-[#FF5C7A]">∅</span>) with complete self-loops.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#1C2430] pt-4 font-mono text-xs text-center">
          <div className="rounded-lg bg-[#07090D] p-3 border border-[#1C2430]">
            <span className="block text-xl font-bold text-[#6AA7FF]">1</span>
            <span className="text-[10px] text-[#7C8696]">PATH PER SYMBOL</span>
          </div>
          <div className="rounded-lg bg-[#07090D] p-3 border border-[#1C2430]">
            <span className="block text-xl font-bold text-[#5CF2C0]">0</span>
            <span className="text-[10px] text-[#7C8696]">AMBIGUITY</span>
          </div>
          <div className="rounded-lg bg-[#07090D] p-3 border border-[#1C2430]">
            <span className="block text-xl font-bold text-[#FF5C7A]">∅</span>
            <span className="text-[10px] text-[#7C8696]">DEAD STATE INCLUDED</span>
          </div>
        </div>
      </div>
    </section>
  )
}

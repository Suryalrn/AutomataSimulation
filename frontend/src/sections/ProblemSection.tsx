export default function ProblemSection() {
  return (
    <section
      id="scene-problem"
      className="relative flex h-screen w-full items-center justify-end p-6 sm:p-12 lg:pr-24 z-10"
    >
      {/* Soft gradient scrim behind copy block */}
      <div className="relative max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/90 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(7,9,13,0.95)] before:absolute before:-inset-4 before:-z-10 before:rounded-3xl before:bg-gradient-to-l before:from-[#07090D]/90 before:to-transparent before:blur-xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#FFB547]">
          01 // The Problem
        </span>

        <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          One input. <br />
          <span className="text-[#FFB547]">Many possible futures.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#7C8696]">
          In a Non-Deterministic Finite Automaton (NFA), a state can have multiple outgoing transitions
          on the exact same symbol. Observe state{' '}
          <span className="font-mono text-[#E8ECF2] bg-[#1C2430] px-1.5 py-0.5 rounded">q2</span>:
          on input <span className="font-mono text-[#FFB547] bg-[#FFB547]/10 px-1.5 py-0.5 rounded font-bold">0</span>,
          execution branches simultaneously into a self-loop and destination{' '}
          <span className="font-mono text-[#E8ECF2] bg-[#1C2430] px-1.5 py-0.5 rounded">q4</span>.
        </p>

        <div className="mt-6 flex items-center gap-3 border-t border-[#1C2430] pt-4 font-mono text-xs text-[#7C8696]">
          <span className="flex h-2 w-2 rounded-full bg-[#FFB547] animate-ping" />
          <span>δ(q2, 0) = &#123; q2, q4 &#125; (Forked Execution)</span>
        </div>
      </div>
    </section>
  )
}

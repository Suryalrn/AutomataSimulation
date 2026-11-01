export default function ProblemSection() {
  return (
    <section
      id="scene-problem"
      className="relative flex h-screen w-full items-center p-6 sm:p-12 lg:p-20 z-10"
    >
      <div className="max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/85 p-8 backdrop-blur-xl shadow-2xl">
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
          on input <span className="font-mono text-[#FFB547] bg-[#FFB547]/10 px-1.5 py-0.5 rounded">0</span>,
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

import { useSceneStore } from '../state/sceneStore'

export default function SimulationSection() {
  const simulationProgress = useSceneStore((s) => s.simulationProgress)

  // Simulation test string: "0011" (4 characters, derived from sampleAutomaton trace)
  const chars = ['0', '0', '1', '1']
  const p = simulationProgress

  let activeCharIndex = 0
  let currentStateLabel = '{ q0, q1, q2 }'
  let isCurrentAccept = false

  if (p < 0.25) {
    activeCharIndex = 0
    currentStateLabel = '{ q0, q1, q2 }'
    isCurrentAccept = false
  } else if (p < 0.5) {
    activeCharIndex = 1
    currentStateLabel = '{ q1, q2, q4 } (ACCEPT)'
    isCurrentAccept = true
  } else if (p < 0.75) {
    activeCharIndex = 2
    currentStateLabel = '{ q1, q2, q4 } (ACCEPT)'
    isCurrentAccept = true
  } else if (p < 0.9) {
    activeCharIndex = 3
    currentStateLabel = '{ q3 }'
    isCurrentAccept = false
  } else {
    activeCharIndex = 3
    currentStateLabel = '{ q4 } (ACCEPT)'
    isCurrentAccept = true
  }

  const isFinalAccepted = p >= 0.9

  return (
    <section
      id="scene-simulation"
      className="relative flex h-screen w-full items-center justify-start p-6 sm:p-12 lg:pl-20 z-10"
    >
      {/* Soft gradient scrim behind copy block */}
      <div className="relative max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/90 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(7,9,13,0.95)] before:absolute before:-inset-4 before:-z-10 before:rounded-3xl before:bg-gradient-to-r before:from-[#07090D]/90 before:to-transparent before:blur-xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5CF2C0]">
          05 // String Simulation
        </span>

        <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          Execution trace. <br />
          <span className="text-[#5CF2C0]">Deterministic proof.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#7C8696]">
          Follow the scroll-scrubbed token as it navigates the DFA. As each symbol in the string is
          consumed, the state machine transitions forward with zero hesitation.
        </p>

        {/* Input String Visualizer with Character Highlighting */}
        <div className="mt-6 rounded-xl border border-[#1C2430] bg-[#07090D] p-5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7C8696]">
            INPUT STREAM / BUFFER:
          </span>

          <div className="mt-3 flex items-center gap-2.5">
            {chars.map((char, idx) => {
              const isCurrent = idx === activeCharIndex
              const isConsumed = idx < activeCharIndex

              return (
                <div
                  key={idx}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg font-mono text-lg font-bold transition-all duration-200 border ${
                    isCurrent
                      ? 'border-[#5CF2C0] bg-[#5CF2C0]/20 text-[#5CF2C0] scale-105 shadow-[0_0_15px_rgba(92,242,192,0.4)]'
                      : isConsumed
                        ? 'border-[#1C2430] bg-[#0E1218] text-[#7C8696]/40'
                        : 'border-[#1C2430] bg-[#0E1218] text-[#E8ECF2]'
                  }`}
                >
                  {char}
                </div>
              )
            })}

            <div className="ml-auto text-right font-mono text-xs">
              <span className="text-[#7C8696] block text-[10px]">CURRENT STATE</span>
              <span
                className={`font-bold transition-colors duration-200 ${
                  isCurrentAccept ? 'text-[#5CF2C0]' : 'text-[#6AA7FF]'
                }`}
              >
                {currentStateLabel}
              </span>
            </div>
          </div>

          {/* Status Verdict */}
          <div
            className={`mt-4 rounded-lg p-3 text-xs font-mono font-semibold transition-all duration-300 flex items-center justify-between border ${
              isFinalAccepted
                ? 'border-[#5CF2C0]/40 bg-[#5CF2C0]/10 text-[#5CF2C0]'
                : 'border-[#1C2430] bg-[#0E1218] text-[#7C8696]'
            }`}
          >
            <span>VERDICT: {isFinalAccepted ? 'STRING ACCEPTED ✓' : 'PROCESSING SYMBOLS...'}</span>
            <span className="text-[10px] text-[#7C8696]">REVERSIBLE WITH SCROLL</span>
          </div>
        </div>
      </div>
    </section>
  )
}

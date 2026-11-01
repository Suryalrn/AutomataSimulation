import { Play, ArrowUpRight } from 'lucide-react'

interface CtaFooterSectionProps {
  onLaunchApp: () => void
}

export default function CtaFooterSection({ onLaunchApp }: CtaFooterSectionProps) {
  return (
    <footer id="scene-cta" className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-20 z-10">
      <div className="my-auto mx-auto max-w-3xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5CF2C0]">
          08 // Ready To Simulate
        </span>

        <h2 className="mt-4 font-sans text-4xl sm:text-6xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          Ready to turn theory <br />
          into <span className="text-[#5CF2C0]">interactive reality?</span>
        </h2>

        <p className="mt-6 text-base sm:text-lg text-[#7C8696] max-w-xl mx-auto">
          Experience the full C++ subset construction engine directly in your browser. Design,
          convert, and simulate automata with complete clarity.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 rounded-xl bg-[#5CF2C0] px-8 py-4 font-sans text-base font-bold text-[#07090D] shadow-xl shadow-[#5CF2C0]/25 transition-all hover:bg-[#4ee0b0] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#5CF2C0]"
          >
            <Play size={18} fill="#07090D" />
            Launch App
          </button>

          <a
            href="https://github.com/Suryalrn/AutomataSimulation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-[#1C2430] bg-[#0E1218]/90 px-6 py-4 font-sans text-sm font-semibold text-[#E8ECF2] transition-all hover:border-[#6AA7FF] hover:bg-[#1C2430]"
          >
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            GitHub Repository
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between border-t border-[#1C2430] pt-8 text-xs text-[#7C8696]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#E8ECF2]">AutomataLab</span>
          <span>•</span>
          <span>Automata Simulation & Subset Construction</span>
        </div>

        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span>C++17 + CROW</span>
          <span>REACT 19 + R3F</span>
          <span>MIT LICENSE</span>
        </div>
      </div>
    </footer>
  )
}

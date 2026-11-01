import { Network, History, Activity, FileJson } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: <Network className="text-[#6AA7FF]" size={24} />,
      tag: 'VISUAL STUDIO',
      title: 'Interactive Graph Studio',
      description:
        'Design ε-NFAs intuitively with drag-and-drop state machines, custom transition alphabets, and spontaneous epsilon moves.',
    },
    {
      icon: <History className="text-[#FFB547]" size={24} />,
      tag: 'STEP-BY-STEP TRACE',
      title: 'Conversion History Player',
      description:
        'Step forward and backward through every ε-closure expansion, move operation, and super-state discovery with full timeline control.',
    },
    {
      icon: <Activity className="text-[#5CF2C0]" size={24} />,
      tag: 'STRING TESTER',
      title: 'Live String Testing',
      description:
        'Feed arbitrary binary or custom alphabet strings and follow real-time token execution traces until definitive acceptance or rejection.',
    },
    {
      icon: <FileJson className="text-[#E8ECF2]" size={24} />,
      tag: 'STANDARDIZED EXPORT',
      title: 'Complete DFA JSON Output',
      description:
        'Export verified, mathematically closed transition tables and complete DFA specs for academic coursework, grading, or external tooling.',
    },
  ]

  return (
    <section id="scene-features" className="relative min-h-screen w-full px-6 py-24 sm:px-12 lg:px-20 z-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#5CF2C0]">
            07 // Engineering Capabilities
          </span>
          <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2]">
            Built for students, educators, and engineers.
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-[#7C8696]">
            Every tool required to master Theory of Computation concepts in a single unified interface.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-[#1C2430] bg-[#0E1218]/80 p-8 backdrop-blur-md transition-all duration-300 hover:border-[#6AA7FF]/50 hover:bg-[#11161F] hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#1C2430] bg-[#07090D]">
                  {feature.icon}
                </div>
                <span className="font-mono text-[10px] tracking-widest text-[#7C8696]">
                  {feature.tag}
                </span>
              </div>

              <h3 className="mt-6 font-sans text-xl font-bold text-[#E8ECF2] group-hover:text-[#6AA7FF] transition-colors">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#7C8696]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

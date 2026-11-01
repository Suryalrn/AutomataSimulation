export default function ArchitectureSection() {
  return (
    <section
      id="scene-architecture"
      className="relative flex h-screen w-full items-center justify-end p-6 sm:p-12 lg:p-20 z-10"
    >
      <div className="max-w-xl rounded-2xl border border-[#1C2430] bg-[#0E1218]/85 p-8 backdrop-blur-xl shadow-2xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6AA7FF]">
          06 // Under The Hood
        </span>

        <h2 className="mt-3 font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#E8ECF2] leading-tight">
          Mathematical rigor. <br />
          <span className="text-[#6AA7FF]">Native performance.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#7C8696]">
          A clean separation of concerns. The discrete mathematics run natively in compiled C++17,
          communicating over a low-latency Crow REST service to an interactive ReactFlow canvas.
        </p>

        {/* Tech Stack Chips */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#1C2430] pt-5 font-mono text-xs">
          <span className="rounded-md border border-[#FFB547]/30 bg-[#FFB547]/10 px-2.5 py-1 text-[#FFB547]">
            C++17 Core
          </span>
          <span className="rounded-md border border-[#5CF2C0]/30 bg-[#5CF2C0]/10 px-2.5 py-1 text-[#5CF2C0]">
            Crow HTTP Server
          </span>
          <span className="rounded-md border border-[#6AA7FF]/30 bg-[#6AA7FF]/10 px-2.5 py-1 text-[#6AA7FF]">
            React 19 + TypeScript
          </span>
          <span className="rounded-md border border-[#7C8696]/30 bg-[#1C2430] px-2.5 py-1 text-[#E8ECF2]">
            ReactFlow Graph
          </span>
          <span className="rounded-md border border-[#7C8696]/30 bg-[#1C2430] px-2.5 py-1 text-[#E8ECF2]">
            Vite Proxy
          </span>
        </div>

        <p className="mt-4 text-xs font-mono text-[#7C8696]">
          Data packets flow seamlessly from core theory down to browser render in under 15ms.
        </p>
      </div>
    </section>
  )
}


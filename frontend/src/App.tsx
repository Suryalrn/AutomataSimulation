import { useState } from 'react'
import NFAEditor from './NFAEditor'
import {
  Activity,
  ArrowRight,
  BookOpen,
  Code2,
  FileCode2,
  LayoutDashboard,
  Network,
  Play,
  Settings,
  Workflow,
  Zap,
} from 'lucide-react'

function App() {
  const [page, setPage] = useState<'dashboard' | 'nfa'>('dashboard')

  if (page === 'nfa') {
    return <NFAEditor onBack={() => setPage('dashboard')} />
  }
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-zinc-800 bg-[#0e0e11] p-6 lg:block">

        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2">
            <Workflow size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold">AutomataLab</h1>
            <p className="text-xs text-zinc-500">Finite State Machine Studio</p>
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Workspace
        </p>

        <nav className="space-y-2">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <SidebarItem icon={<Network size={18} />} label="NFA Editor" />
          <SidebarItem icon={<Workflow size={18} />} label="DFA Visualizer" />
          <SidebarItem icon={<Activity size={18} />} label="String Simulator" />
        </nav>

        <p className="mb-4 mt-10 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Resources
        </p>

        <nav className="space-y-2">
          <SidebarItem icon={<BookOpen size={18} />} label="Documentation" />
          <SidebarItem icon={<Code2 size={18} />} label="Algorithm Explorer" />
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Backend status</span>
          </div>
          <p className="text-xs text-zinc-500">
            C++ Engine • Local development
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">

        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-zinc-800 px-6 lg:px-10">
          <div>
            <p className="text-sm text-zinc-500">Workspace / Overview</p>
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:block">
              Automata Engine v1.0
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold">
              S
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <div className="space-y-8 p-6 lg:p-10">

          {/* Welcome */}
          <section>
            <p className="mb-2 text-sm font-medium text-indigo-400">
              FINITE AUTOMATA WORKSPACE
            </p>

            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Understand Automata.
              <br />
              <span className="text-zinc-500">
                Visualize Every Transition.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Build epsilon-NFAs, convert them into complete DFAs,
              explore subset construction and simulate input strings
              through an interactive workspace.
            </p>

            <button onClick={() => setPage('nfa')} className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500">
              <Play size={16} />
              Start Building
              <ArrowRight size={16} />
            </button>
          </section>

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Network size={20} />}
              label="Automata Types"
              value="02"
              description="NFA and DFA"
            />

            <StatCard
              icon={<Zap size={20} />}
              label="Conversion Engine"
              value="Ready"
              description="C++ subset construction"
            />

            <StatCard
              icon={<Activity size={20} />}
              label="String Testing"
              value="Ready"
              description="Acceptance simulation"
            />

            <StatCard
              icon={<FileCode2 size={20} />}
              label="API Status"
              value="Online"
              description="Local REST API"
            />
          </section>

          {/* Main Cards */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Choose your workspace</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Select a tool to start working with finite automata.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <WorkspaceCard
                icon={<Network size={25} />}
                title="NFA Editor"
                description="Create an NFA, define states, add transitions and specify epsilon moves."
                tag="INPUT AUTOMATON"
                button="Open NFA Editor"
                onClick={() => setPage('nfa')}
              />

              <WorkspaceCard
                icon={<Workflow size={25} />}
                title="DFA Visualizer"
                description="Explore subset construction and visualize the generated complete DFA."
                tag="AUTOMATA CONVERSION"
                button="Open DFA Visualizer"
              />

              <WorkspaceCard
                icon={<Activity size={25} />}
                title="String Simulator"
                description="Enter strings and follow every state transition to determine acceptance."
                tag="STRING TESTING"
                button="Open Simulator"
              />

              <WorkspaceCard
                icon={<BookOpen size={25} />}
                title="Algorithm Explorer"
                description="Learn epsilon closure, move operations and subset construction step by step."
                tag="LEARNING"
                button="Explore Algorithms"
              />

            </div>
          </section>

          {/* Backend information */}
          <section className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">System Architecture</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Your application development stack
                </p>
              </div>

              <Code2 size={22} className="text-zinc-500" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <TechItem name="Frontend" value="React + TypeScript" />
              <TechItem name="Backend" value="C++ + Crow" />
              <TechItem name="Data Format" value="JSON REST API" />
            </div>
          </section>

          <footer className="border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
            AutomataLab — Finite Automata Learning and Visualization Platform
          </footer>

        </div>
      </main>
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
        active
          ? 'bg-indigo-600/15 text-indigo-400'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#111114] p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-indigo-400">{icon}</span>
      </div>

      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  )
}

function WorkspaceCard({
  icon,
  title,
  description,
  tag,
  button,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  tag: string
  button: string
  onClick?: () => void
}) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-[#111114] p-6 transition hover:border-indigo-500/60">

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>

      <p className="mb-2 text-[10px] font-semibold tracking-widest text-indigo-400">
        {tag}
      </p>

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-6 flex items-center gap-2 text-sm font-medium text-white transition group-hover:text-indigo-400"
      >
        {button}
        <ArrowRight size={16} />
      </button>

    </div>
  )
}

function TechItem({
  name,
  value,
}: {
  name: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{name}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}

export default App
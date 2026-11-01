import { useCallback, useState, useEffect } from 'react'
import axios from 'axios'
import AutomataGraph from './AutomataGraph'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Play,
  Loader2,
  CheckCircle2,
  Download,
  Sparkles,
  Layers,
  Cpu,
  History,
  Activity,
  FileCode2,
} from 'lucide-react'
import ConversionHistory, {
  type ConversionStep,
} from './ConversionHistory'
import StringSimulator from './StringSimulator'
import {
  convertNFAtoDFAInBrowser,
  type NFATransition,
} from './utils/automataEngine'

type Transition = {
  from: number
  symbol: string
  to: number
}

type DFAResult = {
  states: number[][]
  alphabet: string[]
  start_state: number[]
  final_states: number[][]
  transitions: {
    from: number[]
    to: number[]
    symbol: string
  }[]
}

type ConversionResponse = {
  success: boolean
  dfa: DFAResult
  history: ConversionStep[]
}

const API_URL = import.meta.env.VITE_API_URL || ''

function getDFAStateId(state: number[]) {
  return `D${state.join('_') || 'empty'}`
}

const PRESETS = [
  {
    name: '3D Story Benchmark',
    desc: '5 states, branching on q2, spontaneous ε-moves',
    stateCount: 5,
    alphabet: '01',
    startState: 0,
    finalStates: '4',
    transitions: [
      { from: 0, symbol: 'eps', to: 1 },
      { from: 0, symbol: 'eps', to: 2 },
      { from: 1, symbol: '0', to: 3 },
      { from: 2, symbol: '0', to: 2 },
      { from: 2, symbol: '0', to: 4 },
      { from: 3, symbol: '1', to: 4 },
    ],
  },
  {
    name: 'Ends with "01"',
    desc: 'Recognizes binary strings ending in 01',
    stateCount: 3,
    alphabet: '01',
    startState: 0,
    finalStates: '2',
    transitions: [
      { from: 0, symbol: '0', to: 0 },
      { from: 0, symbol: '1', to: 0 },
      { from: 0, symbol: '0', to: 1 },
      { from: 1, symbol: '1', to: 2 },
    ],
  },
  {
    name: 'Consecutive "aa" or "bb"',
    desc: 'Nondeterministic branch selecting double-a or double-b',
    stateCount: 5,
    alphabet: 'ab',
    startState: 0,
    finalStates: '2, 4',
    transitions: [
      { from: 0, symbol: 'eps', to: 1 },
      { from: 0, symbol: 'eps', to: 3 },
      { from: 1, symbol: 'a', to: 2 },
      { from: 2, symbol: 'a', to: 2 },
      { from: 3, symbol: 'b', to: 4 },
      { from: 4, symbol: 'b', to: 4 },
    ],
  },
  {
    name: 'Transitive ε-Chain',
    desc: 'Cascade: q0 -> q1 -> q2 via spontaneous epsilon moves',
    stateCount: 4,
    alphabet: 'ab',
    startState: 0,
    finalStates: '3',
    transitions: [
      { from: 0, symbol: 'eps', to: 1 },
      { from: 1, symbol: 'eps', to: 2 },
      { from: 2, symbol: 'a', to: 3 },
    ],
  },
]

export default function NFAEditor({
  onBack,
}: {
  onBack: () => void
}) {
  const [stateCount, setStateCount] = useState(5)
  const [alphabet, setAlphabet] = useState('01')
  const [startState, setStartState] = useState(0)
  const [finalStates, setFinalStates] = useState('4')

  const [transitions, setTransitions] = useState<Transition[]>([
    { from: 0, symbol: 'eps', to: 1 },
    { from: 0, symbol: 'eps', to: 2 },
    { from: 1, symbol: '0', to: 3 },
    { from: 2, symbol: '0', to: 2 },
    { from: 2, symbol: '0', to: 4 },
    { from: 3, symbol: '1', to: 4 },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ConversionResponse | null>(null)
  const [highlightedDFAStateIds, setHighlightedDFAStateIds] = useState<string[]>([])
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [engineUsed, setEngineUsed] = useState<'cpp' | 'browser' | null>(null)
  const [activeTab, setActiveTab] = useState<'designer' | 'dfa' | 'history' | 'simulator' | 'table'>('designer')

  // Check backend health on mount
  useEffect(() => {
    let active = true
    async function checkHealth() {
      try {
        await axios.get(`${API_URL}/api/health`, { timeout: 2000 })
        if (active) setBackendOnline(true)
      } catch {
        if (active) setBackendOnline(false)
      }
    }
    checkHealth()
    return () => {
      active = false
    }
  }, [])

  const states = Array.from({ length: stateCount }, (_, index) => index)

  const nfaGraphStates = states.map((state) => ({
    id: `q${state}`,
    label: `q${state}`,
    isStart: state === startState,
    isFinal: finalStates
      .split(',')
      .map((value) => value.trim())
      .includes(String(state)),
  }))

  const nfaGraphTransitions = transitions
    .filter((t) => states.includes(t.from) && states.includes(t.to))
    .map((transition) => ({
      from: `q${transition.from}`,
      to: `q${transition.to}`,
      label:
        transition.symbol === 'eps' || transition.symbol === 'epsilon'
          ? 'ε'
          : transition.symbol,
    }))

  const handleHistoryStepChange = useCallback(
    (step: ConversionStep) => {
      let nextHighlightedIds: string[] = []

      if (step.operation === 'FINAL_STATES') {
        if (result?.dfa?.final_states) {
          nextHighlightedIds = result.dfa.final_states.map((s) => getDFAStateId(s))
        }
      } else if (step.operation === 'INITIAL_CLOSURE') {
        nextHighlightedIds = [getDFAStateId(step.next_state)]
      } else if (step.operation === 'MOVE') {
        nextHighlightedIds = [getDFAStateId(step.current_state)]
      } else {
        nextHighlightedIds = [
          getDFAStateId(step.current_state),
          getDFAStateId(step.next_state),
        ].filter((id) => id !== 'Dempty' || step.next_state.length === 0)
      }

      setHighlightedDFAStateIds(nextHighlightedIds)
    },
    [result],
  )

  function applyPreset(p: (typeof PRESETS)[0]) {
    setStateCount(p.stateCount)
    setAlphabet(p.alphabet)
    setStartState(p.startState)
    setFinalStates(p.finalStates)
    setTransitions(p.transitions)
    setResult(null)
    setError('')
    setHighlightedDFAStateIds([])
  }

  function handleStateCountChange(rawCount: number) {
    if (isNaN(rawCount) || rawCount < 1) {
      setStateCount(1)
      return
    }

    const validCount = Math.min(50, Math.max(1, Math.floor(rawCount)))
    setStateCount(validCount)
    setResult(null)

    if (startState >= validCount) {
      setStartState(0)
    }

    const cleanedFinalStates = finalStates
      .split(',')
      .map((s) => s.trim())
      .filter((s) => {
        const num = Number(s)
        return Number.isInteger(num) && num >= 0 && num < validCount
      })
      .join(', ')
    setFinalStates(cleanedFinalStates)

    setTransitions((prev) =>
      prev.filter((t) => t.from < validCount && t.to < validCount),
    )
  }

  function resetEditor() {
    applyPreset(PRESETS[0])
  }

  function exportDFA() {
    if (!result) return
    const blob = new Blob([JSON.stringify(result.dfa, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dfa-result.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function addTransition() {
    setTransitions((previous) => [
      ...previous,
      { from: 0, symbol: alphabet[0] || '0', to: 0 },
    ])
    setResult(null)
  }

  function updateTransition(
    index: number,
    field: keyof Transition,
    value: string,
  ) {
    setTransitions((previous) =>
      previous.map((transition, i) =>
        i === index
          ? {
              ...transition,
              [field]: field === 'symbol' ? value : Number(value),
            }
          : transition,
      ),
    )
    setResult(null)
  }

  function removeTransition(index: number) {
    setTransitions((previous) => previous.filter((_, i) => i !== index))
    setResult(null)
  }

  async function convertNFA() {
    setError('')
    setResult(null)
    setHighlightedDFAStateIds([])

    const alphabetSymbols = [
      ...new Set(alphabet.replace(/\s/g, '').split('')),
    ].filter(Boolean)

    const finalStateIds = finalStates
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number)

    if (!Number.isInteger(stateCount) || stateCount < 1 || stateCount > 50) {
      setError('State count must be between 1 and 50.')
      return
    }

    if (!Number.isInteger(startState) || !states.includes(startState)) {
      setError('Select a valid initial state.')
      return
    }

    if (
      finalStateIds.length === 0 ||
      finalStateIds.some(
        (state) => !Number.isInteger(state) || !states.includes(state),
      )
    ) {
      setError('Enter valid final state IDs separated by commas (e.g. 1, 2).')
      return
    }

    if (
      alphabetSymbols.length === 0 ||
      alphabetSymbols.some(
        (symbol) => symbol.length !== 1 || symbol === '\0' || symbol === 'ε',
      )
    ) {
      setError('Alphabet must contain single-character symbols (excluding ε).')
      return
    }

    const payload = {
      states,
      alphabet: alphabetSymbols,
      start_state: startState,
      final_states: [...new Set(finalStateIds)],
      transitions: transitions.map((transition) => ({
        from: transition.from,
        to: transition.to,
        symbol:
          transition.symbol === 'ε' || transition.symbol === 'epsilon'
            ? 'eps'
            : transition.symbol,
      })),
    }

    setLoading(true)

    // First attempt C++ backend; if offline, seamlessly fallback to in-browser engine
    try {
      const response = await axios.post<ConversionResponse>(
        `${API_URL}/api/convert`,
        payload,
        { timeout: 3500 },
      )
      setResult(response.data)
      setEngineUsed('cpp')
      setBackendOnline(true)
      setActiveTab('dfa')
    } catch {
      // Fallback to pure in-browser client engine
      try {
        const browserPayload = {
          states: payload.states,
          alphabet: payload.alphabet,
          startState: payload.start_state,
          finalStates: payload.final_states,
          transitions: payload.transitions as NFATransition[],
        }
        const browserRes = convertNFAtoDFAInBrowser(browserPayload)
        setResult(browserRes)
        setEngineUsed('browser')
        setBackendOnline(false)
        setActiveTab('dfa')
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Conversion computation failed.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090D] text-[#E8ECF2] selection:bg-[#5CF2C0] selection:text-[#07090D]">
      {/* Studio Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#1C2430] bg-[#0E1218]/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-[#1C2430] bg-[#07090D] px-3 py-1.5 font-mono text-xs text-[#7C8696] hover:border-[#6AA7FF] hover:text-[#6AA7FF] transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            3D Showcase
          </button>
          <span className="text-[#1C2430]">|</span>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#6AA7FF]/15 font-mono text-xs font-bold text-[#6AA7FF]">
              ε
            </span>
            <span className="font-sans text-sm font-bold tracking-tight text-[#E8ECF2]">
              Finite Automata Studio
            </span>
          </div>
        </div>

        {/* Backend & Engine Indicator */}
        <div className="flex items-center gap-3">
          {backendOnline === true ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5CF2C0]/30 bg-[#5CF2C0]/10 px-3 py-1 font-mono text-[11px] text-[#5CF2C0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5CF2C0] animate-pulse" />
              C++ Core (Port 18080)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6AA7FF]/30 bg-[#6AA7FF]/10 px-3 py-1 font-mono text-[11px] text-[#6AA7FF]">
              <Cpu size={12} />
              In-Browser Pure Engine
            </span>
          )}
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="mx-auto max-w-7xl space-y-6 p-6 lg:p-10">
        {/* Curated Benchmark Presets */}
        <section className="rounded-2xl border border-[#1C2430] bg-[#0E1218] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#7C8696] mb-3">
            <Sparkles size={14} className="text-[#FFB547]" />
            <span>CURATED BENCHMARK TEMPLATES:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group flex flex-col text-left rounded-xl border border-[#1C2430] bg-[#07090D] p-3.5 hover:border-[#6AA7FF]/60 hover:bg-[#11161F] transition cursor-pointer"
              >
                <span className="font-sans text-xs font-bold text-[#E8ECF2] group-hover:text-[#6AA7FF] transition-colors">
                  {preset.name}
                </span>
                <span className="mt-1 font-mono text-[11px] text-[#7C8696] line-clamp-2">
                  {preset.desc}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Studio Workspace Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1C2430] pb-2 overflow-x-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('designer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'designer'
                ? 'bg-[#6AA7FF]/15 text-[#6AA7FF] font-bold border border-[#6AA7FF]/30'
                : 'text-[#7C8696] hover:text-[#E8ECF2]'
            }`}
          >
            <Layers size={14} />
            1. NFA Designer
          </button>

          {result && (
            <>
              <button
                onClick={() => setActiveTab('dfa')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'dfa'
                    ? 'bg-[#5CF2C0]/15 text-[#5CF2C0] font-bold border border-[#5CF2C0]/30'
                    : 'text-[#7C8696] hover:text-[#E8ECF2]'
                }`}
              >
                <CheckCircle2 size={14} />
                2. DFA Result & Graph
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#FFB547]/15 text-[#FFB547] font-bold border border-[#FFB547]/30'
                    : 'text-[#7C8696] hover:text-[#E8ECF2]'
                }`}
              >
                <History size={14} />
                3. Step Trace ({result.history.length})
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-[#6AA7FF]/15 text-[#6AA7FF] font-bold border border-[#6AA7FF]/30'
                    : 'text-[#7C8696] hover:text-[#E8ECF2]'
                }`}
              >
                <Activity size={14} />
                4. String Simulator
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-[#E8ECF2]/15 text-[#E8ECF2] font-bold border border-[#E8ECF2]/30'
                    : 'text-[#7C8696] hover:text-[#E8ECF2]'
                }`}
              >
                <FileCode2 size={14} />
                5. Transition Matrix
              </button>
            </>
          )}
        </div>

        {/* TAB 1: NFA DESIGNER */}
        {activeTab === 'designer' && (
          <div className="space-y-6">
            {/* Input Automaton Parameters */}
            <section className="grid gap-5 rounded-2xl border border-[#1C2430] bg-[#0E1218] p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block font-mono text-xs text-[#7C8696]">
                  State Count (1 - 50)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={stateCount}
                  onChange={(e) => handleStateCountChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-sm text-[#E8ECF2] outline-none focus:border-[#6AA7FF]"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs text-[#7C8696]">
                  Alphabet Symbols
                </label>
                <input
                  value={alphabet}
                  onChange={(e) => {
                    setAlphabet(e.target.value)
                    setResult(null)
                  }}
                  placeholder="e.g. 01 or ab"
                  className="w-full rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-sm text-[#E8ECF2] outline-none focus:border-[#6AA7FF]"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs text-[#7C8696]">
                  Initial Start State
                </label>
                <select
                  value={startState}
                  onChange={(e) => {
                    setStartState(Number(e.target.value))
                    setResult(null)
                  }}
                  className="w-full rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-sm text-[#E8ECF2] outline-none focus:border-[#6AA7FF]"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      q{state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs text-[#7C8696]">
                  Accepting States
                </label>
                <input
                  value={finalStates}
                  onChange={(e) => {
                    setFinalStates(e.target.value)
                    setResult(null)
                  }}
                  placeholder="e.g. 2, 4"
                  className="w-full rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-sm text-[#E8ECF2] outline-none focus:border-[#6AA7FF]"
                />
              </div>
            </section>

            {/* States Badges Strip */}
            <section className="rounded-2xl border border-[#1C2430] bg-[#0E1218] p-5">
              <span className="block font-mono text-xs uppercase tracking-wider text-[#7C8696] mb-3">
                DEFINED STATES OVERVIEW:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {states.map((state) => {
                  const isStart = state === startState
                  const isFinal = finalStates
                    .split(',')
                    .map((s) => s.trim())
                    .includes(String(state))
                  return (
                    <div
                      key={state}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold ${
                        isStart
                          ? 'border-[#6AA7FF] bg-[#6AA7FF]/10 text-[#6AA7FF]'
                          : isFinal
                            ? 'border-[#5CF2C0] bg-[#5CF2C0]/10 text-[#5CF2C0]'
                            : 'border-[#1C2430] bg-[#07090D] text-[#E8ECF2]'
                      }`}
                    >
                      <span>q{state}</span>
                      {isStart && <span className="text-[9px] uppercase tracking-wider text-[#6AA7FF]">(Start)</span>}
                      {isFinal && <span className="text-[9px] uppercase tracking-wider text-[#5CF2C0]">(Final)</span>}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* NFA Visualizer Diagram */}
            <section className="rounded-2xl border border-[#1C2430] bg-[#0E1218] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#E8ECF2]">
                    Input ε-NFA Graph Visualization
                  </h3>
                  <p className="font-mono text-xs text-[#7C8696]">
                    Real-time topological rendering with dagre auto-layout.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#5CF2C0]">
                  {nfaGraphTransitions.length} Active Transitions
                </span>
              </div>

              <AutomataGraph states={nfaGraphStates} transitions={nfaGraphTransitions} />
            </section>

            {/* Transition Rules Editor */}
            <section className="rounded-2xl border border-[#1C2430] bg-[#0E1218] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#E8ECF2]">
                    Transition Function (δ)
                  </h3>
                  <p className="font-mono text-xs text-[#7C8696]">
                    Define state moves. Use &apos;eps&apos; or &apos;ε&apos; for spontaneous transitions.
                  </p>
                </div>

                <button
                  onClick={addTransition}
                  className="flex items-center gap-2 rounded-xl border border-[#1C2430] bg-[#07090D] px-4 py-2 font-mono text-xs font-semibold text-[#5CF2C0] hover:border-[#5CF2C0] transition cursor-pointer"
                >
                  <Plus size={15} />
                  Add Transition
                </button>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 border-b border-[#1C2430] pb-2 font-mono text-[11px] text-[#7C8696]">
                <span>FROM STATE</span>
                <span>SYMBOL</span>
                <span>TO STATE</span>
                <span />
              </div>

              <div className="space-y-2.5 pt-3">
                {transitions.map((transition, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_1fr_40px] items-center gap-3">
                    <select
                      value={transition.from}
                      onChange={(e) => updateTransition(index, 'from', e.target.value)}
                      className="rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-xs text-[#E8ECF2] outline-none focus:border-[#6AA7FF]"
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>
                          q{state}
                        </option>
                      ))}
                    </select>

                    <input
                      value={transition.symbol}
                      onChange={(e) => updateTransition(index, 'symbol', e.target.value)}
                      placeholder="symbol or eps / ε"
                      className="rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-xs text-[#FFB547] font-bold outline-none focus:border-[#FFB547]"
                    />

                    <select
                      value={transition.to}
                      onChange={(e) => updateTransition(index, 'to', e.target.value)}
                      className="rounded-xl border border-[#1C2430] bg-[#07090D] p-3 font-mono text-xs text-[#E8ECF2] outline-none focus:border-[#6AA7FF]"
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>
                          q{state}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => removeTransition(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7C8696] hover:bg-[#FF5C7A]/15 hover:text-[#FF5C7A] transition"
                      title="Delete transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Convert Action Button */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={convertNFA}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5CF2C0] p-4 font-sans text-sm font-bold text-[#07090D] shadow-xl shadow-[#5CF2C0]/20 hover:bg-[#4ee0b0] active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="#07090D" />}
                {loading ? 'Running Subset Construction...' : 'Convert ε-NFA to Equivalent DFA'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <button
                onClick={resetEditor}
                className="rounded-xl border border-[#1C2430] bg-[#07090D] px-6 py-4 font-mono text-xs text-[#7C8696] hover:border-[#E8ECF2] hover:text-white transition cursor-pointer"
              >
                Reset Default
              </button>
            </div>

            {error && (
              <p className="rounded-xl border border-[#FF5C7A]/30 bg-[#FF5C7A]/10 p-4 font-mono text-xs text-[#FF5C7A]">
                {error}
              </p>
            )}
          </div>
        )}

        {/* TAB 2: DFA RESULT & GRAPH */}
        {activeTab === 'dfa' && result && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#5CF2C0]/30 bg-[#0E1218] p-6 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5CF2C0]/15 text-[#5CF2C0]">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold text-[#E8ECF2]">
                      DFA Construction Complete
                    </h3>
                    <p className="font-mono text-xs text-[#5CF2C0]">
                      {engineUsed === 'cpp'
                        ? 'Computed via C++17 Crow REST Engine (Local port 18080)'
                        : 'Computed via High-Speed Pure In-Browser Simulation Engine'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={exportDFA}
                  className="flex items-center gap-2 rounded-xl border border-[#1C2430] bg-[#07090D] px-4 py-2.5 font-mono text-xs font-semibold text-[#E8ECF2] hover:border-[#5CF2C0] transition cursor-pointer"
                >
                  <Download size={14} />
                  Export DFA JSON
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[#1C2430] bg-[#07090D] p-4">
                  <span className="font-mono text-[10px] text-[#7C8696] uppercase">DFA SUPER-STATES</span>
                  <p className="mt-1 font-sans text-2xl font-bold text-[#6AA7FF]">{result.dfa.states.length}</p>
                </div>
                <div className="rounded-xl border border-[#1C2430] bg-[#07090D] p-4">
                  <span className="font-mono text-[10px] text-[#7C8696] uppercase">ACCEPTING STATES</span>
                  <p className="mt-1 font-sans text-2xl font-bold text-[#5CF2C0]">{result.dfa.final_states.length}</p>
                </div>
                <div className="rounded-xl border border-[#1C2430] bg-[#07090D] p-4">
                  <span className="font-mono text-[10px] text-[#7C8696] uppercase">DETERMINISTIC TRANSITIONS</span>
                  <p className="mt-1 font-sans text-2xl font-bold text-[#FFB547]">{result.dfa.transitions.length}</p>
                </div>
                <div className="rounded-xl border border-[#1C2430] bg-[#07090D] p-4">
                  <span className="font-mono text-[10px] text-[#7C8696] uppercase">TOTAL TRACE STEPS</span>
                  <p className="mt-1 font-sans text-2xl font-bold text-[#E8ECF2]">{result.history.length}</p>
                </div>
              </div>

              {/* Generated Complete DFA Graph */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#7C8696]">COMPLETE DFA TOPOLOGY:</span>
                  <span className="text-[#5CF2C0]">Double concentric rings denote acceptance</span>
                </div>

                <AutomataGraph
                  states={result.dfa.states.map((state) => ({
                    id: getDFAStateId(state),
                    label: state.length ? `{${state.map((s) => `q${s}`).join(',')}}` : '∅',
                    isStart: JSON.stringify(state) === JSON.stringify(result.dfa.start_state),
                    isFinal: result.dfa.final_states.some(
                      (finalState) => JSON.stringify(finalState) === JSON.stringify(state),
                    ),
                  }))}
                  transitions={result.dfa.transitions.map((transition) => ({
                    from: getDFAStateId(transition.from),
                    to: getDFAStateId(transition.to),
                    label: transition.symbol,
                  }))}
                  highlightedStateIds={highlightedDFAStateIds}
                />
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: STEP TRACE DEBUGGER */}
        {activeTab === 'history' && result && (
          <ConversionHistory steps={result.history} onStepChange={handleHistoryStepChange} />
        )}

        {/* TAB 4: STRING SIMULATOR */}
        {activeTab === 'simulator' && (
          <StringSimulator
            states={states}
            alphabet={[...new Set(alphabet.replace(/\s/g, '').split(''))].filter(Boolean)}
            startState={startState}
            finalStates={finalStates
              .split(',')
              .map((v) => Number(v.trim()))
              .filter(Number.isInteger)}
            transitions={transitions.map((t) => ({
              from: t.from,
              to: t.to,
              symbol: t.symbol === 'ε' || t.symbol === 'epsilon' ? 'eps' : t.symbol,
            }))}
            dfaResult={result ? result.dfa : null}
          />
        )}

        {/* TAB 5: TRANSITION MATRIX */}
        {activeTab === 'table' && result && (
          <section className="rounded-2xl border border-[#1C2430] bg-[#0E1218] p-6 space-y-4">
            <div>
              <h3 className="font-sans text-base font-bold text-[#E8ECF2]">
                Complete DFA Transition Matrix Table
              </h3>
              <p className="font-mono text-xs text-[#7C8696]">
                Mathematical mapping: δ(D_state, symbol) → D_next
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1C2430] bg-[#07090D]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-[#1C2430] text-[#7C8696] text-[11px]">
                  <tr>
                    <th className="p-3">FROM DFA SUPER-STATE</th>
                    <th className="p-3">INPUT SYMBOL</th>
                    <th className="p-3">TO DFA SUPER-STATE</th>
                    <th className="p-3">TYPE</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dfa.transitions.map((trans, idx) => {
                    const isTrap = trans.to.length === 0
                    return (
                      <tr key={idx} className="border-b border-[#1C2430]/60 hover:bg-[#1C2430]/20 transition">
                        <td className="p-3 text-[#6AA7FF] font-bold">
                          {trans.from.length ? `{${trans.from.map((s) => `q${s}`).join(', ')}}` : '∅'}
                        </td>
                        <td className="p-3 text-[#FFB547] font-bold">&apos;{trans.symbol}&apos;</td>
                        <td className={`p-3 font-bold ${isTrap ? 'text-[#FF5C7A]' : 'text-[#5CF2C0]'}`}>
                          {trans.to.length ? `{${trans.to.map((s) => `q${s}`).join(', ')}}` : '∅'}
                        </td>
                        <td className="p-3 text-[#7C8696]">
                          {isTrap ? (
                            <span className="text-[#FF5C7A] text-[10px]">TRAP TERMINATION</span>
                          ) : (
                            <span className="text-[#5CF2C0] text-[10px]">DETERMINISTIC MOVE</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

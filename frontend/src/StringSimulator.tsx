import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  StepForward,
} from 'lucide-react'
import { simulateDFAInBrowser, type DFAResultData } from './utils/automataEngine'

type Transition = {
  from: number
  symbol: string
  to: number
}

type SimulationResponse = {
  success: boolean
  input: string
  accepted: boolean
  final_state: number[]
  trace: {
    step_number: number
    current_state: number[]
    symbol: string
    next_state: number[]
  }[]
}

type Props = {
  states: number[]
  alphabet: string[]
  startState: number
  finalStates: number[]
  transitions: Transition[]
  dfaResult?: DFAResultData | null
}

const API_URL = import.meta.env.VITE_API_URL || ''

function formatState(state: number[]) {
  return state && state.length ? `{${state.map((s) => `q${s}`).join(', ')}}` : '∅'
}

const PRESET_STRINGS = ['01', '001', '1010', '011', 'ε']

export default function StringSimulator({
  states,
  alphabet,
  startState,
  finalStates,
  transitions,
  dfaResult,
}: Props) {
  const [input, setInput] = useState('01')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SimulationResponse | null>(null)

  // Step-by-step tape playback
  const [activeStep, setActiveStep] = useState(0)
  const [isPlayingTrace, setIsPlayingTrace] = useState(false)

  // Auto-run simulation on mount or input change if results are available
  async function runSimulation(targetInput?: string) {
    const rawInput = targetInput !== undefined ? targetInput : input
    setError('')
    setResult(null)
    setActiveStep(0)
    setIsPlayingTrace(false)

    const effectiveInput = rawInput === 'ε' || rawInput === '#' ? '' : rawInput

    const payload = {
      states,
      alphabet,
      start_state: startState,
      final_states: finalStates,
      transitions,
      input: effectiveInput,
    }

    setLoading(true)

    try {
      // 1. Try native compiled C++ Crow API first
      const response = await axios.post<SimulationResponse>(
        `${API_URL}/api/simulate`,
        payload,
        { timeout: 3500 },
      )
      setResult(response.data)
    } catch {
      // 2. Seamless in-browser fallback engine if C++ server is offline
      if (dfaResult) {
        const localSim = simulateDFAInBrowser(dfaResult, effectiveInput)
        setResult(localSim)
      } else {
        setError('Please convert the NFA to a DFA first or start the backend service.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Trace auto-play timer
  useEffect(() => {
    if (!isPlayingTrace || !result || result.trace.length === 0) return

    const timer = window.setTimeout(() => {
      setActiveStep((s) => {
        if (s >= result.trace.length - 1) {
          setIsPlayingTrace(false)
          return result.trace.length
        }
        return s + 1
      })
    }, 900)

    return () => window.clearTimeout(timer)
  }, [isPlayingTrace, result])

  const chars = input === 'ε' ? [] : input.split('')

  return (
    <section className="space-y-6 rounded-xl border border-[#1C2430] bg-[#0E1218] p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#5CF2C0]">
            STRING TESTING ENGINE
          </span>
          <h3 className="mt-1 font-sans text-xl font-bold text-[#E8ECF2]">
            Deterministic String Simulator
          </h3>
          <p className="mt-1 text-xs text-[#7C8696]">
            Follow token traversal step-by-step to test language membership.
          </p>
        </div>

        {/* Preset quick test strings */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[#7C8696] text-[11px] mr-1">Presets:</span>
          {PRESET_STRINGS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setInput(preset)
                runSimulation(preset)
              }}
              className="rounded border border-[#1C2430] bg-[#07090D] px-2.5 py-1 text-[#E8ECF2] hover:border-[#5CF2C0] hover:text-[#5CF2C0] transition"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field and Action */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setResult(null)
            }}
            placeholder="Enter input string (e.g. 01, 101, ε)"
            className="w-full rounded-xl border border-[#1C2430] bg-[#07090D] p-3.5 pl-4 font-mono text-sm text-[#E8ECF2] outline-none transition focus:border-[#5CF2C0] focus:ring-1 focus:ring-[#5CF2C0]"
          />
        </div>

        <button
          onClick={() => runSimulation()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#5CF2C0] px-6 py-3.5 font-sans text-sm font-bold text-[#07090D] shadow-lg shadow-[#5CF2C0]/20 hover:bg-[#4ee0b0] active:scale-95 transition disabled:opacity-60 cursor-pointer"
        >
          <Play size={16} fill="#07090D" />
          {loading ? 'Simulating...' : 'Simulate String'}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-[#FF5C7A]/30 bg-[#FF5C7A]/10 p-3 font-mono text-xs text-[#FF5C7A]">
          {error}
        </p>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Animated Tape Visualizer */}
          <div className="rounded-xl border border-[#1C2430] bg-[#07090D] p-5 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-[#7C8696]">
              <span>INPUT BUFFER TAPE</span>
              <span>
                HEAD AT: <strong className="text-[#5CF2C0]">{activeStep}</strong> / {chars.length}
              </span>
            </div>

            {/* Tape Cells */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
              {chars.length === 0 ? (
                <div className="rounded-lg border border-[#FFB547]/40 bg-[#FFB547]/10 px-4 py-2 font-mono text-xs text-[#FFB547]">
                  ε (Empty String Input)
                </div>
              ) : (
                chars.map((char, idx) => {
                  const isCurrent = idx === activeStep
                  const isConsumed = idx < activeStep
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span className={`text-[10px] mb-1 font-mono ${isCurrent ? 'text-[#5CF2C0]' : 'text-transparent'}`}>
                        ▼
                      </span>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg font-mono text-base font-bold transition-all duration-300 border ${
                          isCurrent
                            ? 'border-[#5CF2C0] bg-[#5CF2C0]/20 text-[#5CF2C0] scale-105 shadow-[0_0_15px_rgba(92,242,192,0.4)]'
                            : isConsumed
                              ? 'border-[#1C2430] bg-[#0E1218]/40 text-[#7C8696]/40'
                              : 'border-[#1C2430] bg-[#0E1218] text-[#E8ECF2]'
                        }`}
                      >
                        {char}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Playback Controls for Tape */}
            {result.trace.length > 0 && (
              <div className="flex items-center justify-between border-t border-[#1C2430] pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsPlayingTrace(false)
                      setActiveStep(0)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1C2430] bg-[#0E1218] text-[#7C8696] hover:text-white"
                    title="Reset tape"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    onClick={() => {
                      setIsPlayingTrace(false)
                      setActiveStep((s) => Math.max(0, s - 1))
                    }}
                    disabled={activeStep === 0}
                    className="flex h-8 px-2.5 items-center gap-1 rounded-lg border border-[#1C2430] bg-[#0E1218] font-mono text-xs text-[#7C8696] hover:text-white disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <button
                    onClick={() => setIsPlayingTrace((p) => !p)}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-[#5CF2C0] px-3 font-mono text-xs font-bold text-[#07090D] hover:bg-[#4ee0b0]"
                  >
                    {isPlayingTrace ? <Pause size={13} fill="#07090D" /> : <Play size={13} fill="#07090D" />}
                    {isPlayingTrace ? 'Pause' : 'Auto Play'}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlayingTrace(false)
                      setActiveStep((s) => Math.min(result.trace.length, s + 1))
                    }}
                    disabled={activeStep >= result.trace.length}
                    className="flex h-8 px-2.5 items-center gap-1 rounded-lg border border-[#1C2430] bg-[#0E1218] font-mono text-xs text-[#7C8696] hover:text-white disabled:opacity-40"
                  >
                    Next <StepForward size={13} />
                  </button>
                </div>

                <span className="font-mono text-xs text-[#7C8696]">
                  State at head:{' '}
                  <strong className="text-[#6AA7FF]">
                    {activeStep < result.trace.length
                      ? formatState(result.trace[activeStep].current_state)
                      : formatState(result.final_state)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Verdict Banner */}
          <div
            className={`flex items-center justify-between rounded-xl border p-5 shadow-lg ${
              result.accepted
                ? 'border-[#5CF2C0]/40 bg-[#5CF2C0]/10 text-[#5CF2C0]'
                : 'border-[#FF5C7A]/40 bg-[#FF5C7A]/10 text-[#FF5C7A]'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.accepted ? (
                <CheckCircle2 size={24} className="shrink-0 text-[#5CF2C0]" />
              ) : (
                <XCircle size={24} className="shrink-0 text-[#FF5C7A]" />
              )}
              <div>
                <h4 className="font-sans text-base font-bold">
                  {result.accepted ? 'STRING ACCEPTED' : 'STRING REJECTED'}
                </h4>
                <p className="text-xs opacity-85 font-mono">
                  {result.accepted
                    ? `Input "${result.input || 'ε'}" reached final accepting state ${formatState(result.final_state)}.`
                    : `Input "${result.input || 'ε'}" terminated in non-accepting state ${formatState(result.final_state)}.`}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-bold uppercase tracking-wider rounded border border-current px-2.5 py-1">
              {result.accepted ? 'Accepted ✓' : 'Rejected ✗'}
            </span>
          </div>

          {/* Trace Steps Table */}
          {result.trace.length > 0 && (
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[#7C8696] text-[11px] block uppercase tracking-wider">
                EXECUTION STEP TRACE:
              </span>
              <div className="overflow-x-auto rounded-lg border border-[#1C2430] bg-[#07090D]">
                <table className="w-full text-left">
                  <thead className="border-b border-[#1C2430] text-[#7C8696] text-[11px]">
                    <tr>
                      <th className="p-3">STEP</th>
                      <th className="p-3">FROM STATE</th>
                      <th className="p-3">CONSUMED SYMBOL</th>
                      <th className="p-3">TO STATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trace.map((step, idx) => (
                      <tr
                        key={step.step_number}
                        className={`border-b border-[#1C2430]/60 transition ${
                          idx === activeStep ? 'bg-[#5CF2C0]/10 text-[#5CF2C0]' : 'text-[#E8ECF2]'
                        }`}
                      >
                        <td className="p-3 font-bold">#{step.step_number}</td>
                        <td className="p-3 text-[#6AA7FF]">{formatState(step.current_state)}</td>
                        <td className="p-3 text-[#FFB547] font-bold">&apos;{step.symbol}&apos;</td>
                        <td className="p-3 text-[#5CF2C0]">{formatState(step.next_state)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

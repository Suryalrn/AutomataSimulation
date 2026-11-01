import { useState } from 'react'
import axios from 'axios'
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

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
}

const API_URL = import.meta.env.VITE_API_URL

function formatState(state: number[]) {
  return state.length
    ? `{${state.map((s) => `q${s}`).join(', ')}}`
    : '∅'
}

export default function StringSimulator({
  states,
  alphabet,
  startState,
  finalStates,
  transitions,
}: Props) {
  const [input, setInput] = useState('a')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SimulationResponse | null>(null)

  async function simulate() {
    setError('')
    setResult(null)

    const payload = {
      states,
      alphabet,
      start_state: startState,
      final_states: finalStates,
      transitions,
      input,
    }

    setLoading(true)

    try {
      const response = await axios.post<SimulationResponse>(
        `${API_URL}/api/simulate`,
        payload,
      )

      setResult(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        setError(
          data?.errors?.join('\n') ||
          data?.error ||
          'Unable to connect to the C++ backend.',
        )
      } else {
        setError('Unexpected simulation error.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-5 rounded-xl border border-zinc-800 bg-[#111114] p-6">
      <div>
        <h3 className="text-lg font-semibold">String Acceptance Simulator</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Test whether an input string is accepted by your NFA.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setResult(null)
            setError('')
          }}
          placeholder="Enter a string (empty string is allowed)"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-indigo-500"
        />

        <button
          onClick={simulate}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Play size={18} />
          )}
          Simulate
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Alphabet: {alphabet.length ? alphabet.join(', ') : 'Empty alphabet'}
        {' · '}Initial state: q{startState}
      </p>

      {error && (
        <div className="flex gap-2 whitespace-pre-line rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div
            className={`flex items-center gap-3 rounded-lg border p-4 ${
              result.accepted
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            {result.accepted ? (
              <CheckCircle2 className="text-green-400" size={25} />
            ) : (
              <XCircle className="text-red-400" size={25} />
            )}

            <div>
              <p className={`font-semibold ${
                result.accepted ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.accepted ? 'STRING ACCEPTED' : 'STRING REJECTED'}
              </p>
              <p className="text-xs text-zinc-400">
                Input: {result.input === '' ? 'ε (empty string)' : result.input}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Final DFA state</p>
            <p className="mt-2 text-xl font-bold">
              {formatState(result.final_state)}
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Execution trace</h4>

            {result.trace.length === 0 ? (
              <p className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-400">
                Empty input: no transitions were performed.
              </p>
            ) : (
              <div className="space-y-2">
                {result.trace.map((step) => (
                  <div
                    key={step.step_number}
                    className="flex flex-wrap items-center gap-3 rounded-lg bg-zinc-900 p-3 text-sm"
                  >
                    <span className="text-xs text-indigo-400">
                      Step {step.step_number}
                    </span>
                    <span>{formatState(step.current_state)}</span>
                    <span className="text-indigo-400">
                      --{step.symbol}→
                    </span>
                    <span className="font-semibold">
                      {formatState(step.next_state)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

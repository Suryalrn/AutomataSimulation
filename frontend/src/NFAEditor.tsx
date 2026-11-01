import { useCallback, useState } from 'react'
import axios from 'axios'
import AutomataGraph from './AutomataGraph'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Play,
  Loader2,
  Network,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import ConversionHistory, {
  type ConversionStep,
} from './ConversionHistory'
import StringSimulator from './StringSimulator'

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

const API_URL = import.meta.env.VITE_API_URL

function getDFAStateId(state: number[]) {
  return `D${state.join('_') || 'empty'}`
}

export default function NFAEditor({
  onBack,
}: {
  onBack: () => void
}) {
  const [stateCount, setStateCount] = useState(3)
  const [alphabet, setAlphabet] = useState('ab')
  const [startState, setStartState] = useState(0)
  const [finalStates, setFinalStates] = useState('2')

  const [transitions, setTransitions] = useState<Transition[]>([
    { from: 0, symbol: 'eps', to: 1 },
    { from: 1, symbol: 'a', to: 2 },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ConversionResponse | null>(null)
  const [highlightedDFAStateIds, setHighlightedDFAStateIds] = useState<string[]>([])

  const states = Array.from(
    { length: stateCount },
    (_, index) => index,
  )

  const nfaGraphStates = states.map((state) => ({
    id: `q${state}`,
    label: `q${state}`,
    isStart: state === startState,
    isFinal: finalStates
      .split(',')
      .map((value) => value.trim())
      .includes(String(state)),
  }))

  const nfaGraphTransitions = transitions.map((transition) => ({
    from: `q${transition.from}`,
    to: `q${transition.to}`,
    label: transition.symbol === 'eps' ? 'ε' : transition.symbol,
  }))

  const handleHistoryStepChange = useCallback(
    (step: ConversionStep) => {
      const nextHighlightedIds = [
        getDFAStateId(step.current_state),
        getDFAStateId(step.next_state),
      ].filter((id, index, ids) => ids.indexOf(id) === index)

      setHighlightedDFAStateIds((previousIds) =>
        previousIds.length === nextHighlightedIds.length &&
        previousIds.every((id, index) => id === nextHighlightedIds[index])
          ? previousIds
          : nextHighlightedIds,
      )
    },
    [],
  )

  function resetEditor() {
    setStateCount(3)
    setAlphabet('ab')
    setStartState(0)
    setFinalStates('2')
    setTransitions([
      { from: 0, symbol: 'eps', to: 1 },
      { from: 1, symbol: 'a', to: 2 },
    ])
    setResult(null)
    setError('')
    setHighlightedDFAStateIds([])
  }

  function exportDFA() {
    if (!result) return

    const blob = new Blob(
      [JSON.stringify(result.dfa, null, 2)],
      { type: 'application/json' },
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'generated-dfa.json'
    link.click()

    URL.revokeObjectURL(url)
  }

  function addTransition() {
    setTransitions((previous) => [
      ...previous,
      { from: 0, symbol: 'a', to: 0 },
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
              [field]:
                field === 'symbol' ? value : Number(value),
            }
          : transition,
      ),
    )

    setResult(null)
  }

  function removeTransition(index: number) {
    setTransitions((previous) =>
      previous.filter((_, i) => i !== index),
    )

    setResult(null)
  }

  async function convertNFA() {
    setError('')
    setResult(null)
    setHighlightedDFAStateIds([])

    const alphabetSymbols = [...new Set(alphabet.replace(/\s/g, '').split(''))]

    const finalStateIds = finalStates
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number)

    if (
      !Number.isInteger(stateCount) ||
      stateCount < 1 ||
      stateCount > 1000
    ) {
      setError('State count must be between 1 and 1000.')
      return
    }

    if (
      !Number.isInteger(startState) ||
      !states.includes(startState)
    ) {
      setError('Select a valid initial state.')
      return
    }

    if (
      finalStateIds.length === 0 ||
      finalStateIds.some(
        (state) =>
          !Number.isInteger(state) || !states.includes(state),
      )
    ) {
      setError('Enter valid final state IDs separated by commas.')
      return
    }

    if (
      alphabetSymbols.some(
        (symbol) => symbol.length !== 1 || symbol === '\0',
      )
    ) {
      setError('Use single-character alphabet symbols.')
      return
    }

    if (
      transitions.some(
        (transition) =>
          !states.includes(transition.from) ||
          !states.includes(transition.to) ||
          !transition.symbol ||
          (transition.symbol !== 'eps' &&
            transition.symbol !== 'epsilon' &&
            transition.symbol.length !== 1),
      )
    ) {
      setError('Check your transition states and symbols.')
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
        symbol: transition.symbol,
      })),
    }

    setLoading(true)

    try {
      const response = await axios.post<ConversionResponse>(
        `${API_URL}/api/convert`,
        payload,
      )

      setResult(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data

        setError(
          data?.errors?.join('\n') ||
          data?.error ||
          'Cannot connect to the C++ API. Check that the backend server is running.',
        )
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">

      <header className="flex h-20 items-center justify-between border-b border-zinc-800 px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-semibold">NFA Editor</h1>
            <p className="text-xs text-zinc-500">
              Define your finite automaton
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          C++ API
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-7 p-6 lg:p-10">

        <section>
          <p className="text-xs font-semibold tracking-widest text-indigo-400">
            AUTOMATA CONFIGURATION
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Create your ε-NFA
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Configure states, alphabet, accepting states and transitions.
          </p>
        </section>

        {/* Basic configuration */}
        <section className="grid gap-5 rounded-xl border border-zinc-800 bg-[#111114] p-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Number of states
            </label>

            <input
              type="number"
              min={1}
              max={1000}
              value={stateCount}
              onChange={(e) => {
                setStateCount(Number(e.target.value))
                setResult(null)
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Alphabet
            </label>

            <input
              value={alphabet}
              onChange={(e) => {
                setAlphabet(e.target.value)
                setResult(null)
              }}
              placeholder="Example: ab"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-indigo-500"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Enter single-character symbols without separators.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Initial state
            </label>

            <select
              value={startState}
              onChange={(e) => {
                setStartState(Number(e.target.value))
                setResult(null)
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none"
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  q{state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Final states
            </label>

            <input
              value={finalStates}
              onChange={(e) => {
                setFinalStates(e.target.value)
                setResult(null)
              }}
              placeholder="Example: 1,2"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-indigo-500"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Separate multiple state IDs with commas.
            </p>
          </div>
        </section>

        {/* States */}
        <section className="rounded-xl border border-zinc-800 bg-[#111114] p-6">
          <h3 className="mb-4 font-semibold">Available states</h3>

          <div className="flex flex-wrap gap-3">
            {states.map((state) => (
              <div
                key={state}
                className={`rounded-lg border px-4 py-3 text-sm ${
                  state === startState
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-zinc-700 bg-zinc-900'
                }`}
              >
                q{state}
                {state === startState && (
                  <span className="ml-2 text-xs">START</span>
                )}
                {finalStates.split(',').map((s) => s.trim()).includes(String(state)) && (
                  <span className="ml-2 text-xs text-green-400">FINAL</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-800 bg-[#111114] p-6">
          <div>
            <h3 className="font-semibold">NFA Visualization</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Visual representation of your input automaton.
            </p>
          </div>

          <AutomataGraph
            states={nfaGraphStates}
            transitions={nfaGraphTransitions}
          />
        </section>

        {/* Transitions */}
        <section className="rounded-xl border border-zinc-800 bg-[#111114] p-6">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Transitions</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Define how your automaton moves between states.
              </p>
            </div>

            <button
              onClick={addTransition}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              <Plus size={16} />
              Add transition
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 border-b border-zinc-800 pb-3 text-xs text-zinc-500">
            <span>FROM</span>
            <span>SYMBOL</span>
            <span>TO</span>
            <span />
          </div>

          <div className="space-y-3 pt-3">
            {transitions.map((transition, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_1fr_40px] items-center gap-3"
              >
                <select
                  value={transition.from}
                  onChange={(e) =>
                    updateTransition(index, 'from', e.target.value)
                  }
                  className="min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      q{state}
                    </option>
                  ))}
                </select>

                <input
                  value={transition.symbol}
                  onChange={(e) =>
                    updateTransition(index, 'symbol', e.target.value)
                  }
                  placeholder="a / eps"
                  className="min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm"
                />

                <select
                  value={transition.to}
                  onChange={(e) =>
                    updateTransition(index, 'to', e.target.value)
                  }
                  className="min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      q{state}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeTransition(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                  title="Remove transition"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}

            {transitions.length === 0 && (
              <p className="py-5 text-center text-sm text-zinc-500">
                No transitions added yet.
              </p>
            )}
          </div>
        </section>

        {/* Convert button */}
        <div className="flex gap-3">
          <button
            onClick={convertNFA}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-indigo-600 p-4 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Play size={19} />
            )}

            {loading ? 'Converting...' : 'Convert ε-NFA to DFA'}

            {!loading && <ArrowRight size={18} />}
          </button>

          <button
            onClick={resetEditor}
            className="rounded-lg border border-zinc-700 px-4 py-3 text-sm hover:bg-zinc-800"
          >
            Reset NFA
          </button>
        </div>

        {/* Errors */}
        {error && (
          <div className="flex gap-3 whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        {/* DFA result */}
        {result && (
          <section className="space-y-5 rounded-xl border border-green-500/30 bg-[#111114] p-6">

            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400" size={24} />

              <div>
                <h3 className="font-semibold text-green-400">
                  Conversion successful
                </h3>
                <p className="text-xs text-zinc-500">
                  Generated by your C++ subset construction engine.
                </p>
              </div>
            </div>

            <button
              onClick={exportDFA}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Export DFA JSON
            </button>

            <div className="grid gap-4 sm:grid-cols-3">
              <ResultStat
                label="DFA States"
                value={result.dfa.states.length}
              />

              <ResultStat
                label="DFA Transitions"
                value={result.dfa.transitions.length}
              />

              <ResultStat
                label="History Steps"
                value={result.history.length}
              />
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <Network size={18} />
                Generated DFA states
              </h4>

              <div className="flex flex-wrap gap-3">
                {result.dfa.states.map((state, index) => {
                  const isStart =
                    JSON.stringify(state) ===
                    JSON.stringify(result.dfa.start_state)

                  const isFinal = result.dfa.final_states.some(
                    (finalState) =>
                      JSON.stringify(finalState) === JSON.stringify(state),
                  )

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 text-sm ${
                        isFinal
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      <p className="font-semibold">
                        {state.length === 0
                          ? '∅'
                          : `{${state.map((s) => `q${s}`).join(', ')}}`}
                      </p>

                      <p className="mt-2 text-xs text-zinc-400">
                        {isStart ? 'INITIAL ' : ''}
                        {isFinal ? 'ACCEPTING' : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Generated DFA Graph</h4>
                <p className="mt-1 text-xs text-zinc-500">
                  Complete DFA with accepting and dead states.
                </p>
              </div>

              <AutomataGraph
                states={result.dfa.states.map((state) => ({
                  id: `D${state.join('_') || 'empty'}`,
                  label: state.length
                    ? `{${state.map((s) => `q${s}`).join(',')}}`
                    : '∅',
                  isStart:
                    JSON.stringify(state) ===
                    JSON.stringify(result.dfa.start_state),
                  isFinal: result.dfa.final_states.some(
                    (finalState) =>
                      JSON.stringify(finalState) === JSON.stringify(state),
                  ),
                }))}
                transitions={result.dfa.transitions.map((transition) => ({
                  from: `D${transition.from.join('_') || 'empty'}`,
                  to: `D${transition.to.join('_') || 'empty'}`,
                  label: transition.symbol,
                }))}
                highlightedStateIds={highlightedDFAStateIds}
              />
            </div>

            <div>
              <h4 className="mb-3 font-semibold">DFA transition table</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="border-b border-zinc-800 p-3">From</th>
                      <th className="border-b border-zinc-800 p-3">Symbol</th>
                      <th className="border-b border-zinc-800 p-3">To</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.dfa.transitions.map((transition, index) => (
                      <tr key={index}>
                        <td className="border-b border-zinc-800 p-3">
                          {transition.from.length
                            ? `{${transition.from.join(',')}}`
                            : '∅'}
                        </td>

                        <td className="border-b border-zinc-800 p-3 text-indigo-400">
                          {transition.symbol}
                        </td>

                        <td className="border-b border-zinc-800 p-3">
                          {transition.to.length
                            ? `{${transition.to.join(',')}}`
                            : '∅'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ConversionHistory
              steps={result.history}
              onStepChange={handleHistoryStepChange}
            />

            <StringSimulator
              states={states}
              alphabet={[...new Set(alphabet.replace(/\s/g, '').split(''))].filter(Boolean)}
              startState={startState}
              finalStates={finalStates
                .split(',')
                .map((value) => Number(value.trim()))
                .filter(Number.isInteger)}
              transitions={transitions}
            />

          </section>
        )}

      </main>
    </div>
  )
}

function ResultStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}
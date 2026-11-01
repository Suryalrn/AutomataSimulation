import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react'

export type ConversionStep = {
  step_number: number
  operation: string
  current_state: number[]
  symbol: string
  moved_states: number[]
  closure_states: number[]
  next_state: number[]
  description: string
}

type Props = {
  steps: ConversionStep[]
}

function formatState(state: number[]) {
  if (state.length === 0) return '∅'

  return `{${state.map((value) => `q${value}`).join(', ')}}`
}

export default function ConversionHistory({ steps }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        No conversion history available.
      </div>
    )
  }

  const currentStep = steps[currentIndex]
  const progress = ((currentIndex + 1) / steps.length) * 100

  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1

  function previousStep() {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  function nextStep() {
    setCurrentIndex((index) =>
      Math.min(steps.length - 1, index + 1),
    )
  }

  function resetHistory() {
    setCurrentIndex(0)
  }

  return (
    <section className="space-y-5 rounded-xl border border-zinc-800 bg-[#111114] p-6">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            Interactive Conversion History
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Explore subset construction operation by operation.
          </p>
        </div>

        <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-400">
          {currentStep.operation}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>
            Step {currentIndex + 1} of {steps.length}
          </span>

          <span>{Math.round(progress)}% completed</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current operation */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Play size={16} className="text-indigo-400" />

          <span className="text-sm font-semibold">
            Current operation
          </span>
        </div>

        <h4 className="text-base font-semibold text-indigo-300">
          {currentStep.operation.replaceAll('_', ' ')}
        </h4>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {currentStep.description}
        </p>
      </div>

      {/* Step details */}
      <div className="grid gap-3 sm:grid-cols-2">

        <DetailCard
          label="Current state"
          value={formatState(currentStep.current_state)}
        />

        <DetailCard
          label="Input symbol"
          value={
            currentStep.symbol === 'eps'
              ? 'ε (Epsilon)'
              : currentStep.symbol
          }
        />

        <DetailCard
          label="Move result"
          value={formatState(currentStep.moved_states)}
        />

        <DetailCard
          label="Epsilon closure"
          value={formatState(currentStep.closure_states)}
        />

      </div>

      {/* Next state */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-400" />

          <span className="text-sm font-semibold text-green-400">
            Next DFA state
          </span>
        </div>

        <p className="text-2xl font-bold text-green-300">
          {formatState(currentStep.next_state)}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        <button
          onClick={resetHistory}
          disabled={isFirst}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <RotateCcw size={16} />
          Restart
        </button>

        <div className="flex gap-2">

          <button
            onClick={previousStep}
            disabled={isFirst}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={isLast}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <ArrowRight size={16} />
          </button>

        </div>
      </div>

      {/* Step selector */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Jump to step
        </p>

        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <button
              key={step.step_number}
              onClick={() => setCurrentIndex(index)}
              title={step.operation}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs transition ${
                currentIndex === index
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-indigo-500'
              }`}
            >
              {step.step_number}
            </button>
          ))}
        </div>
      </div>

    </section>
  )
}

function DetailCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-2 text-xs text-zinc-500">{label}</p>

      <p className="break-words text-sm font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  )
}
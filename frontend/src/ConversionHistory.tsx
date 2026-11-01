import { useEffect, useState } from 'react'

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Pause,
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
  onStepChange?: (
    step: ConversionStep,
    index: number,
  ) => void
}

function formatState(state: number[]) {
  if (state.length === 0) return '∅'

  return `{${state.map((value) => `q${value}`).join(', ')}}`
}

export default function ConversionHistory({
  steps,
  onStepChange,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [prevSteps, setPrevSteps] = useState(steps)

  // Sync state cleanly when steps change without cascading useEffect renders
  if (steps !== prevSteps) {
    setPrevSteps(steps)
    setCurrentIndex(0)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (steps.length === 0) return

    const safeIndex = Math.min(
      currentIndex,
      steps.length - 1,
    )

    onStepChange?.(steps[safeIndex], safeIndex)
  }, [currentIndex, steps, onStepChange])

  useEffect(() => {
    if (!isPlaying || steps.length === 0 || currentIndex >= steps.length - 1) {
      return
    }

    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => {
        const next = Math.min(index + 1, steps.length - 1)
        if (next >= steps.length - 1) {
          setIsPlaying(false)
        }
        return next
      })
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [isPlaying, currentIndex, steps.length])

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
        No conversion history available.
      </div>
    )
  }

  const currentStep = steps[
    Math.min(currentIndex, steps.length - 1)
  ]

  const progress =
    ((currentIndex + 1) / steps.length) * 100

  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1

  function previousStep() {
    setIsPlaying(false)

    setCurrentIndex((index) =>
      Math.max(0, index - 1),
    )
  }

  function nextStep() {
    setIsPlaying(false)

    setCurrentIndex((index) =>
      Math.min(steps.length - 1, index + 1),
    )
  }

  function resetHistory() {
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  function togglePlayback() {
    if (isLast) {
      setCurrentIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying((playing) => !playing)
  }

  return (
    <section className="space-y-6 rounded-xl border border-zinc-800 bg-[#111114] p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Conversion step trace
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Step-by-step trace of the Subset Construction algorithm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={previousStep}
            disabled={isFirst}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40"
            title="Previous step"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={togglePlayback}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold hover:bg-indigo-500"
          >
            {isPlaying ? (
              <>
                <Pause size={15} /> Pause
              </>
            ) : (
              <>
                <Play size={15} /> {isLast ? 'Replay' : 'Play trace'}
              </>
            )}
          </button>

          <button
            onClick={nextStep}
            disabled={isLast}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 hover:bg-zinc-800 disabled:opacity-40"
            title="Next step"
          >
            <ArrowRight size={16} />
          </button>

          <button
            onClick={resetHistory}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 hover:bg-zinc-800"
            title="Reset to beginning"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex justify-between text-xs text-zinc-400">
          <span>
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}% completed</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-xl border border-zinc-800 bg-[#0e0e11] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-md bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {currentStep.operation.replace(/_/g, ' ')}
          </span>

          <span className="text-xs text-zinc-500">
            Step ID #{currentStep.step_number}
          </span>
        </div>

        <p className="text-base font-medium text-zinc-200">
          {currentStep.description}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <span className="text-xs text-zinc-500">
              Current state
            </span>
            <p className="mt-1 font-mono text-sm text-zinc-300">
              {formatState(currentStep.current_state)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <span className="text-xs text-zinc-500">
              Input symbol
            </span>
            <p className="mt-1 font-mono text-sm text-indigo-400">
              {currentStep.symbol === 'eps'
                ? 'ε'
                : currentStep.symbol || '—'}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <span className="text-xs text-zinc-500">
              Move states
            </span>
            <p className="mt-1 font-mono text-sm text-zinc-300">
              {formatState(currentStep.moved_states)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <span className="text-xs text-zinc-500">
              Result state
            </span>
            <p className="mt-1 font-mono text-sm text-green-400">
              {formatState(currentStep.next_state)}
            </p>
          </div>

        </div>
      </div>

      {/* Mini step list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Trace Steps
        </p>

        <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
          {steps.map((step, index) => {
            const isSelected = index === currentIndex

            return (
              <button
                key={step.step_number}
                onClick={() => {
                  setIsPlaying(false)
                  setCurrentIndex(index)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                  isSelected
                    ? 'border border-indigo-500/50 bg-indigo-500/15 text-indigo-200'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500">
                    #{step.step_number}
                  </span>
                  <span>{step.description}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-400">
                    {formatState(step.next_state)}
                  </span>
                  {isSelected && (
                    <CheckCircle2
                      size={14}
                      className="text-indigo-400"
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

    </section>
  )
}

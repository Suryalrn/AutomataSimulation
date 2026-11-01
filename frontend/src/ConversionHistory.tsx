import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
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
  onStepChange?: (step: ConversionStep, index: number) => void
}

function formatState(state: number[]): string {
  if (!state || state.length === 0) return '∅'
  return `{${state.map((value) => `q${value}`).join(', ')}}`
}

export default function ConversionHistory({ steps, onStepChange }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<number>(1200) // ms
  const [prevSteps, setPrevSteps] = useState(steps)

  if (steps !== prevSteps) {
    setPrevSteps(steps)
    setCurrentIndex(0)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (steps.length === 0) return
    const safeIndex = Math.min(currentIndex, steps.length - 1)
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
    }, speed)

    return () => window.clearTimeout(timer)
  }, [isPlaying, currentIndex, steps.length, speed])

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-[#1C2430] bg-[#0E1218] p-6 text-sm text-[#7C8696]">
        No conversion history available.
      </div>
    )
  }

  const currentStep = steps[Math.min(currentIndex, steps.length - 1)]
  const progress = ((currentIndex + 1) / steps.length) * 100
  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1

  function previousStep() {
    setIsPlaying(false)
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  function nextStep() {
    setIsPlaying(false)
    setCurrentIndex((index) => Math.min(steps.length - 1, index + 1))
  }

  function resetSteps() {
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  const opColors: Record<string, { border: string; bg: string; text: string; label: string }> = {
    INITIAL_CLOSURE: {
      border: 'border-[#FFB547]/40',
      bg: 'bg-[#FFB547]/10',
      text: 'text-[#FFB547]',
      label: 'Initial ε-Closure',
    },
    MOVE: {
      border: 'border-[#6AA7FF]/40',
      bg: 'bg-[#6AA7FF]/10',
      text: 'text-[#6AA7FF]',
      label: 'Subset Transition',
    },
    FINAL_STATES: {
      border: 'border-[#5CF2C0]/40',
      bg: 'bg-[#5CF2C0]/10',
      text: 'text-[#5CF2C0]',
      label: 'Accepting Verification',
    },
  }

  const opStyle = opColors[currentStep.operation] || {
    border: 'border-[#1C2430]',
    bg: 'bg-[#1C2430]/40',
    text: 'text-[#E8ECF2]',
    label: currentStep.operation,
  }

  return (
    <div className="space-y-5 rounded-xl border border-[#1C2430] bg-[#0E1218] p-6 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#6AA7FF]">
              ALGORITHM INSPECTOR
            </span>
            <span className="text-[#1C2430]">|</span>
            <span className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold border ${opStyle.border} ${opStyle.bg} ${opStyle.text}`}>
              {opStyle.label}
            </span>
          </div>
          <h3 className="mt-1 font-sans text-xl font-bold text-[#E8ECF2]">
            Step-by-Step Subset Construction
          </h3>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center rounded-lg border border-[#1C2430] bg-[#07090D] p-1 font-mono text-[11px]">
            <button
              onClick={() => setSpeed(1600)}
              className={`rounded px-2 py-1 transition ${speed === 1600 ? 'bg-[#1C2430] text-[#5CF2C0] font-bold' : 'text-[#7C8696] hover:text-white'}`}
            >
              0.7x
            </button>
            <button
              onClick={() => setSpeed(1000)}
              className={`rounded px-2 py-1 transition ${speed === 1000 ? 'bg-[#1C2430] text-[#5CF2C0] font-bold' : 'text-[#7C8696] hover:text-white'}`}
            >
              1.0x
            </button>
            <button
              onClick={() => setSpeed(500)}
              className={`rounded px-2 py-1 transition ${speed === 500 ? 'bg-[#1C2430] text-[#5CF2C0] font-bold' : 'text-[#7C8696] hover:text-white'}`}
            >
              2.0x
            </button>
          </div>

          <button
            onClick={resetSteps}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1C2430] bg-[#07090D] text-[#7C8696] hover:bg-[#1C2430] hover:text-white"
            title="Reset to step 1"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={previousStep}
            disabled={isFirst}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1C2430] bg-[#07090D] text-[#7C8696] hover:bg-[#1C2430] hover:text-white disabled:opacity-40"
            title="Previous step"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#5CF2C0] px-3.5 font-sans text-xs font-bold text-[#07090D] hover:bg-[#4ee0b0] shadow-[0_0_15px_rgba(92,242,192,0.3)] transition"
          >
            {isPlaying ? <Pause size={14} fill="#07090D" /> : <Play size={14} fill="#07090D" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={nextStep}
            disabled={isLast}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1C2430] bg-[#07090D] text-[#7C8696] hover:bg-[#1C2430] hover:text-white disabled:opacity-40"
            title="Next step"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between font-mono text-xs text-[#7C8696]">
          <span>TIMELINE SCRUBBER</span>
          <span>
            STEP <strong className="text-[#5CF2C0]">{currentIndex + 1}</strong> OF {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1C2430]">
          <div
            className="h-full bg-gradient-to-r from-[#6AA7FF] via-[#5CF2C0] to-[#FFB547] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Mathematical Breakdown Visual Stage */}
      <div className="rounded-xl border border-[#1C2430] bg-[#07090D] p-5 space-y-4">
        {currentStep.operation === 'MOVE' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center font-mono">
            {/* Step 1: Current State */}
            <div className="rounded-lg border border-[#1C2430] bg-[#0E1218] p-3">
              <span className="block text-[10px] text-[#7C8696] uppercase tracking-wider">
                1. CURRENT SUBSET
              </span>
              <span className="mt-1 block text-sm font-bold text-[#6AA7FF]">
                {formatState(currentStep.current_state)}
              </span>
            </div>

            {/* Step 2: Symbol */}
            <div className="rounded-lg border border-[#1C2430] bg-[#0E1218] p-3">
              <span className="block text-[10px] text-[#7C8696] uppercase tracking-wider">
                2. INPUT SYMBOL
              </span>
              <span className="mt-1 block text-sm font-bold text-[#FFB547]">
                &apos;{currentStep.symbol}&apos;
              </span>
            </div>

            {/* Step 3: Direct Move */}
            <div className="rounded-lg border border-[#1C2430] bg-[#0E1218] p-3">
              <span className="block text-[10px] text-[#7C8696] uppercase tracking-wider">
                3. MOVE OPERATION
              </span>
              <span className="mt-1 block text-sm font-bold text-[#E8ECF2]">
                {formatState(currentStep.moved_states)}
              </span>
            </div>

            {/* Step 4: Epsilon Closure */}
            <div className="rounded-lg border border-[#5CF2C0]/30 bg-[#5CF2C0]/5 p-3">
              <span className="block text-[10px] text-[#5CF2C0] uppercase tracking-wider font-semibold">
                4. ε-CLOSURE (NEW STATE)
              </span>
              <span className="mt-1 block text-sm font-bold text-[#5CF2C0]">
                {formatState(currentStep.closure_states)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-[#1C2430] bg-[#0E1218] p-4">
            <Sparkles className="text-[#5CF2C0] shrink-0" size={20} />
            <div className="font-mono text-sm">
              <span className="text-[#7C8696] block text-[10px] uppercase">OPERATION SUMMARY</span>
              <span className="text-[#E8ECF2] font-semibold">{currentStep.description}</span>
            </div>
          </div>
        )}

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-[#7C8696] font-mono leading-relaxed border-t border-[#1C2430] pt-3">
          <strong className="text-[#E8ECF2]">Explanation:</strong> {currentStep.description}
        </p>
      </div>

      {/* Interactive Step Pills Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 font-mono text-[11px] scrollbar-thin">
        {steps.map((st, idx) => {
          const isSelected = idx === currentIndex
          return (
            <button
              key={st.step_number}
              onClick={() => {
                setIsPlaying(false)
                setCurrentIndex(idx)
              }}
              className={`shrink-0 rounded px-2.5 py-1 border transition ${
                isSelected
                  ? 'border-[#5CF2C0] bg-[#5CF2C0]/20 text-[#5CF2C0] font-bold shadow-[0_0_10px_rgba(92,242,192,0.3)]'
                  : 'border-[#1C2430] bg-[#07090D] text-[#7C8696] hover:border-[#7C8696] hover:text-white'
              }`}
            >
              #{st.step_number}
            </button>
          )
        })}
      </div>
    </div>
  )
}

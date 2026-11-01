export interface NFATransition {
  from: number
  symbol: string
  to: number
}

export interface NFAInputData {
  states: number[]
  alphabet: string[]
  startState: number
  finalStates: number[]
  transitions: NFATransition[]
}

export interface DFATransition {
  from: number[]
  to: number[]
  symbol: string
}

export interface DFAResultData {
  states: number[][]
  alphabet: string[]
  start_state: number[]
  final_states: number[][]
  transitions: DFATransition[]
}

export interface ConversionStepData {
  step_number: number
  operation: string
  current_state: number[]
  symbol: string
  moved_states: number[]
  closure_states: number[]
  next_state: number[]
  description: string
}

export interface ConversionResultData {
  success: boolean
  dfa: DFAResultData
  history: ConversionStepData[]
}

export interface SimulationStepData {
  step_number: number
  current_state: number[]
  symbol: string
  next_state: number[]
}

export interface SimulationResultData {
  success: boolean
  input: string
  accepted: boolean
  final_state: number[]
  trace: SimulationStepData[]
}

function isEpsilon(sym: string): boolean {
  const s = sym.trim().toLowerCase()
  return s === 'eps' || s === 'epsilon' || s === 'ε' || s === '' || s === 'λ'
}

function stateKey(states: number[]): string {
  return [...new Set(states)].sort((a, b) => a - b).join(',')
}

function sortStates(states: number[]): number[] {
  return [...new Set(states)].sort((a, b) => a - b)
}

// Compute epsilon closure of a set of states using DFS
export function computeEpsilonClosure(
  states: number[],
  transitions: NFATransition[],
): number[] {
  const closure = new Set<number>(states)
  const stack = [...states]

  while (stack.length > 0) {
    const current = stack.pop()!
    for (const t of transitions) {
      if (t.from === current && isEpsilon(t.symbol)) {
        if (!closure.has(t.to)) {
          closure.add(t.to)
          stack.push(t.to)
        }
      }
    }
  }

  return sortStates([...closure])
}

// Compute move(T, symbol)
export function computeMove(
  states: number[],
  symbol: string,
  transitions: NFATransition[],
): number[] {
  const result = new Set<number>()
  for (const s of states) {
    for (const t of transitions) {
      if (t.from === s && t.symbol === symbol) {
        result.add(t.to)
      }
    }
  }
  return sortStates([...result])
}

// Client-side fallback Subset Construction
export function convertNFAtoDFAInBrowser(input: NFAInputData): ConversionResultData {
  const history: ConversionStepData[] = []
  let stepNumber = 1

  const alphabet = [...new Set(input.alphabet.filter((a) => !isEpsilon(a)))]

  // Initial epsilon closure of start state
  const initialClosure = computeEpsilonClosure([input.startState], input.transitions)

  history.push({
    step_number: stepNumber++,
    operation: 'INITIAL_CLOSURE',
    current_state: [input.startState],
    symbol: 'ε',
    moved_states: [input.startState],
    closure_states: initialClosure,
    next_state: initialClosure,
    description: `Computed initial ε-closure of start state q${input.startState}: {${initialClosure.map((s) => `q${s}`).join(', ')}}`,
  })

  const dfaStates: number[][] = [initialClosure]
  const stateMap = new Map<string, number[]>()
  stateMap.set(stateKey(initialClosure), initialClosure)

  const queue: number[][] = [initialClosure]
  const dfaTransitions: DFATransition[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    const currFormatted = current.length > 0 ? `{${current.map((s) => `q${s}`).join(',')}}` : '∅'

    for (const symbol of alphabet) {
      const moved = computeMove(current, symbol, input.transitions)
      const movedClosure = computeEpsilonClosure(moved, input.transitions)
      const nextKey = stateKey(movedClosure)

      const movedFormatted = moved.length > 0 ? `{${moved.map((s) => `q${s}`).join(',')}}` : '∅'
      const closureFormatted =
        movedClosure.length > 0 ? `{${movedClosure.map((s) => `q${s}`).join(',')}}` : '∅'

      history.push({
        step_number: stepNumber++,
        operation: 'MOVE',
        current_state: current,
        symbol,
        moved_states: moved,
        closure_states: movedClosure,
        next_state: movedClosure,
        description: `From state ${currFormatted} on symbol '${symbol}': move gives ${movedFormatted}, ε-closure gives ${closureFormatted}`,
      })

      if (!stateMap.has(nextKey)) {
        stateMap.set(nextKey, movedClosure)
        dfaStates.push(movedClosure)
        queue.push(movedClosure)
      }

      dfaTransitions.push({
        from: current,
        to: stateMap.get(nextKey)!,
        symbol,
      })
    }
  }

  // Identify final states
  const finalSet = new Set(input.finalStates)
  const dfaFinalStates = dfaStates.filter((state) => state.some((s) => finalSet.has(s)))

  history.push({
    step_number: stepNumber,
    operation: 'FINAL_STATES',
    current_state: [],
    symbol: '',
    moved_states: [],
    closure_states: [],
    next_state: [],
    description: `Identified ${dfaFinalStates.length} accepting states containing original final states: [${[...finalSet].map((s) => `q${s}`).join(', ')}]`,
  })

  return {
    success: true,
    dfa: {
      states: dfaStates,
      alphabet,
      start_state: initialClosure,
      final_states: dfaFinalStates,
      transitions: dfaTransitions,
    },
    history,
  }
}

// Client-side fallback DFA String Simulator
export function simulateDFAInBrowser(
  dfa: DFAResultData,
  inputString: string,
): SimulationResultData {
  let currentState = dfa.start_state
  const trace: SimulationStepData[] = []
  let stepNumber = 1

  const cleanInput = inputString === '#' ? '' : inputString

  for (let i = 0; i < cleanInput.length; i++) {
    const symbol = cleanInput[i]
    const currKey = stateKey(currentState)

    const transition = dfa.transitions.find(
      (t) => stateKey(t.from) === currKey && t.symbol === symbol,
    )

    const nextState = transition ? transition.to : []

    trace.push({
      step_number: stepNumber++,
      current_state: currentState,
      symbol,
      next_state: nextState,
    })

    currentState = nextState
    if (currentState.length === 0) {
      break
    }
  }

  const finalKey = stateKey(currentState)
  const accepted = dfa.final_states.some((f) => stateKey(f) === finalKey)

  return {
    success: true,
    input: cleanInput,
    accepted,
    final_state: currentState,
    trace,
  }
}

// Comprehensive edge case test suite for Automata Simulation in pure Node.js

function isEpsilon(sym) {
  const s = String(sym).trim().toLowerCase()
  return s === 'eps' || s === 'epsilon' || s === 'ε' || s === '' || s === 'λ'
}

function stateKey(states) {
  return [...new Set(states)].sort((a, b) => a - b).join(',')
}

function sortStates(states) {
  return [...new Set(states)].sort((a, b) => a - b)
}

function computeEpsilonClosure(states, transitions) {
  const closure = new Set(states)
  const stack = [...states]

  while (stack.length > 0) {
    const current = stack.pop()
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

function computeMove(states, symbol, transitions) {
  const result = new Set()
  for (const s of states) {
    for (const t of transitions) {
      if (t.from === s && t.symbol === symbol) {
        result.add(t.to)
      }
    }
  }
  return sortStates([...result])
}

function convertNFAtoDFA(input) {
  const alphabet = [...new Set(input.alphabet.filter((a) => !isEpsilon(a)))]
  const initialClosure = computeEpsilonClosure([input.startState], input.transitions)

  const dfaStates = [initialClosure]
  const stateMap = new Map()
  stateMap.set(stateKey(initialClosure), initialClosure)

  const queue = [initialClosure]
  const dfaTransitions = []

  while (queue.length > 0) {
    const current = queue.shift()
    for (const symbol of alphabet) {
      const moved = computeMove(current, symbol, input.transitions)
      const movedClosure = computeEpsilonClosure(moved, input.transitions)
      const nextKey = stateKey(movedClosure)

      if (!stateMap.has(nextKey)) {
        stateMap.set(nextKey, movedClosure)
        dfaStates.push(movedClosure)
        queue.push(movedClosure)
      }

      dfaTransitions.push({
        from: current,
        to: stateMap.get(nextKey),
        symbol,
      })
    }
  }

  const finalSet = new Set(input.finalStates)
  const dfaFinalStates = dfaStates.filter((state) => state.some((s) => finalSet.has(s)))

  return {
    states: dfaStates,
    alphabet,
    start_state: initialClosure,
    final_states: dfaFinalStates,
    transitions: dfaTransitions,
  }
}

function simulateDFA(dfa, inputString) {
  let currentState = dfa.start_state
  const trace = []
  let stepNumber = 1

  const cleanInput = inputString === '#' ? '' : inputString

  for (let i = 0; i < cleanInput.length; i++) {
    const symbol = cleanInput[i]
    if (!dfa.alphabet.includes(symbol)) {
      throw new Error(`Invalid symbol: ${symbol}`)
    }

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
  }

  const finalKey = stateKey(currentState)
  const accepted = dfa.final_states.some((f) => stateKey(f) === finalKey)

  return {
    input: cleanInput,
    accepted,
    final_state: currentState,
    trace,
  }
}

console.log('--- STARTING EDGE CASE INTEGRATION TESTS ---')

// 1. Epsilon Cycle Handling
const cycleNFA = {
  states: [0, 1, 2],
  alphabet: ['a'],
  startState: 0,
  finalStates: [2],
  transitions: [
    { from: 0, symbol: 'eps', to: 1 },
    { from: 1, symbol: 'eps', to: 0 },
    { from: 1, symbol: 'a', to: 2 },
  ],
}
const closure0 = computeEpsilonClosure([0], cycleNFA.transitions)
console.log('Test 1 (Epsilon Cycle):', closure0)
if (closure0.length !== 2 || !closure0.includes(0) || !closure0.includes(1)) {
  throw new Error('Epsilon cycle failed')
}

// 2. Full Subset with Cycle
const dfaCycle = convertNFAtoDFA(cycleNFA)
console.log('Test 2 (DFA from cycle NFA): States =', dfaCycle.states.length, 'Transitions =', dfaCycle.transitions.length)
if (dfaCycle.states.length < 2) throw new Error('DFA conversion failed')

// 3. String Simulation Full Trace Past Trap State
const simTrap = simulateDFA(dfaCycle, 'aa')
console.log('Test 3 (Simulation past trap state): Trace steps =', simTrap.trace.length)
if (simTrap.trace.length !== 2) {
  throw new Error(`Expected trace length 2 for 'aa', got ${simTrap.trace.length}`)
}

// 4. Trailing Comma in finalStates Input
const rawFinal = '4, '
const cleanedFinal = rawFinal
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s !== '' && Number.isInteger(Number(s)))
  .map(Number)
console.log('Test 4 (Cleaned final states):', cleanedFinal)
if (cleanedFinal.length !== 1 || cleanedFinal[0] !== 4) {
  throw new Error(`Trailing comma parsed incorrectly: ${JSON.stringify(cleanedFinal)}`)
}

// 5. Comma-separated Alphabet Input
const rawAlpha = '0, 1'
const parsedAlpha = (
  rawAlpha.includes(',')
    ? rawAlpha.split(',').map((s) => s.trim())
    : rawAlpha.replace(/\s/g, '').split('')
).filter(Boolean)
console.log('Test 5 (Parsed alphabet):', parsedAlpha)
if (parsedAlpha.length !== 2 || parsedAlpha[0] !== '0' || parsedAlpha[1] !== '1') {
  throw new Error(`Parsed alphabet incorrect: ${JSON.stringify(parsedAlpha)}`)
}

console.log('--- ALL EDGE CASE INTEGRATION TESTS PASSED (100%) ---')

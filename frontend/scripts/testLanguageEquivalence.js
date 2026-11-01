// Formal Automata Property Testing: Language Equivalence L(NFA) == L(DFA)
// Tests whether the Subset Construction engine preserves exact language semantics across all strings in Sigma^k

function isEpsilon(sym) {
  const s = String(sym).trim().toLowerCase()
  return s === 'eps' || s === 'epsilon' || s === 'ε' || s === '' || s === 'λ'
}

function computeEpsilonClosure(states, transitions) {
  const closure = new Set(states)
  const stack = [...states]
  while (stack.length > 0) {
    const curr = stack.pop()
    for (const t of transitions) {
      if (t.from === curr && isEpsilon(t.symbol)) {
        if (!closure.has(t.to)) {
          closure.add(t.to)
          stack.push(t.to)
        }
      }
    }
  }
  return [...closure].sort((a, b) => a - b)
}

function computeMove(states, symbol, transitions) {
  const res = new Set()
  for (const s of states) {
    for (const t of transitions) {
      if (t.from === s && t.symbol === symbol) {
        res.add(t.to)
      }
    }
  }
  return [...res].sort((a, b) => a - b)
}

// Pure NFA simulation: tracks sets of active states along epsilon transitions and input symbols
function simulateNFA(nfa, str) {
  let activeStates = computeEpsilonClosure([nfa.startState], nfa.transitions)
  for (const ch of str) {
    const moved = computeMove(activeStates, ch, nfa.transitions)
    activeStates = computeEpsilonClosure(moved, nfa.transitions)
    if (activeStates.length === 0) break
  }
  const finalSet = new Set(nfa.finalStates)
  return activeStates.some((s) => finalSet.has(s))
}

// Subset construction
function convertNFAtoDFA(nfa) {
  const alphabet = [...new Set(nfa.alphabet.filter((a) => !isEpsilon(a)))]
  const initialClosure = computeEpsilonClosure([nfa.startState], nfa.transitions)

  const stateKey = (s) => [...new Set(s)].sort((a, b) => a - b).join(',')
  const dfaStates = [initialClosure]
  const stateMap = new Map()
  stateMap.set(stateKey(initialClosure), initialClosure)
  const queue = [initialClosure]
  const dfaTransitions = []

  while (queue.length > 0) {
    const curr = queue.shift()
    for (const sym of alphabet) {
      const moved = computeMove(curr, sym, nfa.transitions)
      const nextClosure = computeEpsilonClosure(moved, nfa.transitions)
      const key = stateKey(nextClosure)

      if (!stateMap.has(key)) {
        stateMap.set(key, nextClosure)
        dfaStates.push(nextClosure)
        queue.push(nextClosure)
      }

      dfaTransitions.push({
        from: curr,
        to: stateMap.get(key),
        symbol: sym,
      })
    }
  }

  const finalSet = new Set(nfa.finalStates)
  const dfaFinalStates = dfaStates.filter((s) => s.some((state) => finalSet.has(state)))

  return {
    states: dfaStates,
    alphabet,
    start_state: initialClosure,
    final_states: dfaFinalStates,
    transitions: dfaTransitions,
  }
}

// Pure DFA simulation
function simulateDFA(dfa, str) {
  const stateKey = (s) => [...new Set(s)].sort((a, b) => a - b).join(',')
  let curr = dfa.start_state
  for (const ch of str) {
    const currKey = stateKey(curr)
    const t = dfa.transitions.find((trans) => stateKey(trans.from) === currKey && trans.symbol === ch)
    curr = t ? t.to : []
  }
  const finalKey = stateKey(curr)
  return dfa.final_states.some((f) => stateKey(f) === finalKey)
}

// Helper to generate all words up to length maxLen
function generateStrings(alphabet, maxLen) {
  const words = ['']
  let currentLevel = ['']
  for (let len = 1; len <= maxLen; len++) {
    const nextLevel = []
    for (const prefix of currentLevel) {
      for (const sym of alphabet) {
        const word = prefix + sym
        nextLevel.push(word)
        words.push(word)
      }
    }
    currentLevel = nextLevel
  }
  return words
}

const TEST_AUTOMATA = [
  {
    name: '3D Story Benchmark',
    states: [0, 1, 2, 3, 4],
    alphabet: ['0', '1'],
    startState: 0,
    finalStates: [4],
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
    states: [0, 1, 2],
    alphabet: ['0', '1'],
    startState: 0,
    finalStates: [2],
    transitions: [
      { from: 0, symbol: '0', to: 0 },
      { from: 0, symbol: '1', to: 0 },
      { from: 0, symbol: '0', to: 1 },
      { from: 1, symbol: '1', to: 2 },
    ],
  },
  {
    name: 'Consecutive "aa" or "bb"',
    states: [0, 1, 2, 3, 4],
    alphabet: ['a', 'b'],
    startState: 0,
    finalStates: [2, 4],
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
    name: 'Transitive ε-Chain with Single Branch',
    states: [0, 1, 2, 3],
    alphabet: ['a', 'b'],
    startState: 0,
    finalStates: [3],
    transitions: [
      { from: 0, symbol: 'eps', to: 1 },
      { from: 1, symbol: 'eps', to: 2 },
      { from: 2, symbol: 'a', to: 3 },
      { from: 3, symbol: 'b', to: 3 },
    ],
  },
  {
    name: 'Cyclic ε-Loop Automaton',
    states: [0, 1, 2],
    alphabet: ['0', '1'],
    startState: 0,
    finalStates: [2],
    transitions: [
      { from: 0, symbol: 'eps', to: 1 },
      { from: 1, symbol: 'eps', to: 0 },
      { from: 1, symbol: '0', to: 2 },
      { from: 2, symbol: '1', to: 2 },
    ],
  },
]

console.log('======================================================')
console.log('  EXHAUSTIVE LANGUAGE EQUIVALENCE TEST SUITE: L(NFA) == L(DFA)')
console.log('======================================================\n')

let totalTests = 0
let totalAccepted = 0
let totalRejected = 0

for (const nfa of TEST_AUTOMATA) {
  const dfa = convertNFAtoDFA(nfa)
  const testStrings = generateStrings(nfa.alphabet, 5) // Strings of length 0 to 5 (e.g. 63 strings for |Σ|=2)

  let passedForNFA = 0
  for (const str of testStrings) {
    totalTests++
    const nfaResult = simulateNFA(nfa, str)
    const dfaResult = simulateDFA(dfa, str)

    if (nfaResult !== dfaResult) {
      console.error(
        `[FAILURE] Discrepancy on automaton "${nfa.name}" for string "${str}": NFA=${nfaResult}, DFA=${dfaResult}`,
      )
      process.exit(1)
    }

    if (dfaResult) totalAccepted++
    else totalRejected++

    passedForNFA++
  }

  console.log(
    `[PASS] "${nfa.name}": ${passedForNFA}/${testStrings.length} strings identical across NFA & DFA (DFA states: ${dfa.states.length}, transitions: ${dfa.transitions.length})`,
  )
}

console.log('\n======================================================')
console.log(`TOTAL STRINGS VERIFIED: ${totalTests}`)
console.log(`ACCEPTED: ${totalAccepted} | REJECTED: ${totalRejected}`)
console.log('RESULT: 100% LANGUAGE EQUIVALENCE VERIFIED WITH ZERO DISCREPANCIES!')
console.log('======================================================')

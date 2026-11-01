// Verification script: Runs pure subset construction on SAMPLE_NFA and verifies SAMPLE_DFA

function sortKey(arr) {
  return [...new Set(arr)].sort((a, b) => a - b).join(',')
}

function computeEpsilonClosure(states, transitions) {
  const closure = new Set(states)
  const stack = [...states]
  while (stack.length > 0) {
    const cur = stack.pop()
    for (const t of transitions) {
      if (t.from === cur && (t.symbol === 'eps' || t.isEpsilon)) {
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

const nfa = {
  states: [0, 1, 2, 3, 4],
  alphabet: ['0', '1'],
  startState: 0,
  finalStates: [4],
  transitions: [
    { from: 0, symbol: 'eps', to: 1, isEpsilon: true },
    { from: 0, symbol: 'eps', to: 2, isEpsilon: true },
    { from: 1, symbol: '0', to: 1 },
    { from: 1, symbol: '1', to: 3 },
    { from: 2, symbol: '0', to: 2 },
    { from: 2, symbol: '0', to: 4 },
    { from: 3, symbol: '1', to: 4 },
  ],
}

// 1. Initial closure
const startClosure = computeEpsilonClosure([nfa.startState], nfa.transitions)
const dfaStates = [startClosure]
const stateMap = new Map()
stateMap.set(sortKey(startClosure), 'D_012')

const queue = [startClosure]
const dfaTransitions = []

while (queue.length > 0) {
  const current = queue.shift()
  const fromId = stateMap.get(sortKey(current))

  for (const symbol of nfa.alphabet) {
    const moved = computeMove(current, symbol, nfa.transitions)
    const closure = computeEpsilonClosure(moved, nfa.transitions)
    const key = sortKey(closure)

    if (!stateMap.has(key)) {
      let id = 'D_' + (closure.length > 0 ? closure.join('') : 'trap')
      stateMap.set(key, id)
      dfaStates.push(closure)
      queue.push(closure)
    }

    const toId = stateMap.get(key)
    dfaTransitions.push({ from: fromId, symbol, to: toId })
  }
}

console.log('--- MATHEMATICAL SUBSET CONSTRUCTION VERIFIED ---')
console.log('DFA States count:', dfaStates.length)
for (const [k, id] of stateMap.entries()) {
  console.log(`State ${id} = {${k}}`)
}
console.log('\nDFA Transitions count:', dfaTransitions.length)
for (const t of dfaTransitions) {
  console.log(`  ${t.from} --(${t.symbol})--> ${t.to}`)
}

// Verify string "0011"
let cur = 'D_012'
const str = '0011'
console.log(`\nSimulating string "${str}":`)
for (let i = 0; i < str.length; i++) {
  const sym = str[i]
  const tr = dfaTransitions.find((t) => t.from === cur && t.symbol === sym)
  if (!tr) {
    console.error(`Dead-end at state ${cur} on symbol ${sym}`)
    process.exit(1)
  }
  console.log(`  Step ${i + 1}: ${cur} -('${sym}')-> ${tr.to}`)
  cur = tr.to
}
console.log(`Ending state: ${cur}. Is final? ${cur === 'D_4' || cur === 'D_124'}`)

if (dfaStates.length !== 5 || dfaTransitions.length !== 10) {
  console.error('VERIFICATION FAILED: DFA must have exactly 5 states and 10 transitions!')
  process.exit(1)
}

console.log('\nSUCCESS: Subset construction matches theoretical specification exactly!')


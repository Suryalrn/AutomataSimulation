export type NFATransition = {
  from: number
  symbol: string
  to: number
  isEpsilon?: boolean
}

export type DFATransition = {
  from: string
  symbol: string
  to: string
}

export type AutomatonNodeData = {
  id: string
  stateNum: number
  label: string
  isStart: boolean
  isAccept: boolean
  position: [number, number, number]
  dfaTargetPos?: [number, number, number]
  dfaClusterId?: string
}

export type DFANodeData = {
  id: string
  label: string
  stateSet: number[]
  isStart: boolean
  isAccept: boolean
  position: [number, number, number]
}

export const SAMPLE_NFA = {
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
    { from: 2, symbol: '0', to: 4 }, // Nondeterministic branch: state 2 on '0' goes to both 2 and 4!
    { from: 3, symbol: '1', to: 4 },
  ] as NFATransition[],
}

export const NFA_3D_NODES: AutomatonNodeData[] = [
  {
    id: 'q0',
    stateNum: 0,
    label: 'q0',
    isStart: true,
    isAccept: false,
    position: [-4.2, 0.4, 0.2],
    dfaTargetPos: [-3.8, 0.2, 0],
    dfaClusterId: 'D_012',
  },
  {
    id: 'q1',
    stateNum: 1,
    label: 'q1',
    isStart: false,
    isAccept: false,
    position: [-1.8, 1.8, -0.6],
    dfaTargetPos: [-3.8, 0.2, 0],
    dfaClusterId: 'D_012',
  },
  {
    id: 'q2',
    stateNum: 2,
    label: 'q2',
    isStart: false,
    isAccept: false,
    position: [-1.8, -1.8, 0.5],
    dfaTargetPos: [-3.8, 0.2, 0],
    dfaClusterId: 'D_012',
  },
  {
    id: 'q3',
    stateNum: 3,
    label: 'q3',
    isStart: false,
    isAccept: false,
    position: [1.6, 1.6, -0.2],
    dfaTargetPos: [0.5, 1.8, -0.4],
    dfaClusterId: 'D_3',
  },
  {
    id: 'q4',
    stateNum: 4,
    label: 'q4',
    isStart: false,
    isAccept: true,
    position: [4.2, -0.2, 0.4],
    dfaTargetPos: [4.0, -0.3, 0.2],
    dfaClusterId: 'D_accept',
  },
]

export const SAMPLE_DFA = {
  states: ['D_012', 'D_124', 'D_3', 'D_4', 'D_trap'],
  startState: 'D_012',
  finalStates: ['D_124', 'D_4'],
  nodes: [
    {
      id: 'D_012',
      label: '{q0, q1, q2}',
      stateSet: [0, 1, 2],
      isStart: true,
      isAccept: false,
      position: [-4.5, 0.5, 0],
    },
    {
      id: 'D_124',
      label: '{q1, q2, q4}',
      stateSet: [1, 2, 4],
      isStart: false,
      isAccept: true,
      position: [-0.6, -1.6, 0.3],
    },
    {
      id: 'D_3',
      label: '{q3}',
      stateSet: [3],
      isStart: false,
      isAccept: false,
      position: [-0.6, 2.0, -0.3],
    },
    {
      id: 'D_4',
      label: '{q4}',
      stateSet: [4],
      isStart: false,
      isAccept: true,
      position: [3.8, 0.2, 0.1],
    },
    {
      id: 'D_trap',
      label: '∅ (Dead)',
      stateSet: [],
      isStart: false,
      isAccept: false,
      position: [2.5, -2.8, -0.8],
    },
  ] as DFANodeData[],
  transitions: [
    { from: 'D_012', symbol: '0', to: 'D_124' },
    { from: 'D_012', symbol: '1', to: 'D_3' },
    { from: 'D_124', symbol: '0', to: 'D_124' },
    { from: 'D_124', symbol: '1', to: 'D_4' },
    { from: 'D_3', symbol: '0', to: 'D_trap' },
    { from: 'D_3', symbol: '1', to: 'D_4' },
    { from: 'D_4', symbol: '0', to: 'D_trap' },
    { from: 'D_4', symbol: '1', to: 'D_trap' },
    { from: 'D_trap', symbol: '0, 1', to: 'D_trap' },
  ] as DFATransition[],
}

export const SIMULATION_TRACE = {
  inputString: '0110',
  steps: [
    { stepIndex: 0, char: '0', stateId: 'D_012', nextStateId: 'D_124', isAccept: false },
    { stepIndex: 1, char: '1', stateId: 'D_124', nextStateId: 'D_4', isAccept: true },
    { stepIndex: 2, char: '1', stateId: 'D_4', nextStateId: 'D_trap', isAccept: false }, // branching demo
  ],
  // Complete 0110 path:
  // Step 0: start at D_012
  // Read '0' -> D_124
  // Read '1' -> D_4
  // If loop on accept state D_4 on 0:
  // Let's have input '010' or '011':
  // In the demo string "011":
  // D_012 -('0')-> D_124 -('1')-> D_4. Accepted!
  demoInput: '01',
}

export const ARCHITECTURE_SLABS = [
  {
    id: 'frontend',
    title: 'React 19 + ReactFlow UI',
    subtitle: 'Reactive Graph Studio & Trace Visualizer',
    y: 2.1,
    color: '#6AA7FF',
    details: ['Interactive Node/Edge Canvas', 'Step playback with timeline scrubbing', 'State inspection table'],
  },
  {
    id: 'api',
    title: 'Crow C++ REST API',
    subtitle: 'Asynchronous High-Throughput HTTP Service',
    y: 0.0,
    color: '#5CF2C0',
    details: ['Thread-safe endpoint routes', 'CORS & JSON parsing layer', 'State explosion memory guards'],
  },
  {
    id: 'engine',
    title: 'C++17 Subset Engine',
    subtitle: 'Discrete Mathematics Core',
    y: -2.1,
    color: '#FFB547',
    details: ['Depth-first ε-closure computation', 'Power-set state hashing', 'Deterministic string traversal'],
  },
]

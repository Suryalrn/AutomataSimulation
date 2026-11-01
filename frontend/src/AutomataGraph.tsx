import { useMemo } from 'react'
import dagre from '@dagrejs/dagre'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react'

export type GraphState = {
  id: string
  label: string
  isStart: boolean
  isFinal: boolean
}

export type GraphTransition = {
  from: string
  to: string
  label: string
}

type Props = {
  states: GraphState[]
  transitions: GraphTransition[]
  highlightedStateIds?: string[]
}

const NODE_WIDTH = 110
const NODE_HEIGHT = 110

function AutomataNode({
  data,
}: {
  data: GraphState & { highlighted?: boolean }
}) {
  const isTrap = data.label === '∅' || data.id === 'Dempty'

  return (
    <>
      {/* Bidirectional Multi-port Handles for Clean Flow Routing */}
      <Handle id="target-left" type="target" position={Position.Left} className="!opacity-0" />
      <Handle id="source-left" type="source" position={Position.Left} className="!opacity-0" />
      <Handle id="target-right" type="target" position={Position.Right} className="!opacity-0" />
      <Handle id="source-right" type="source" position={Position.Right} className="!opacity-0" />
      <Handle id="target-top" type="target" position={Position.Top} className="!opacity-0" />
      <Handle id="source-top" type="source" position={Position.Top} className="!opacity-0" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="!opacity-0" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="!opacity-0" />

      <div
        className={`relative flex h-20 min-w-20 items-center justify-center rounded-full border-2 px-4 font-mono text-xs font-bold transition-all duration-300 shadow-lg ${
          data.highlighted
            ? 'scale-110 border-[#FFB547] bg-[#FFB547]/20 text-[#FFB547] shadow-[0_0_28px_rgba(255,181,71,0.5)] ring-2 ring-[#FFB547]/50'
            : isTrap
              ? 'border-[#FF5C7A]/60 bg-[#0E1218] text-[#FF5C7A]'
              : data.isFinal
                ? 'border-[#5CF2C0] bg-[#0E1218] text-[#5CF2C0] shadow-[0_0_15px_rgba(92,242,192,0.2)]'
                : data.isStart
                  ? 'border-[#6AA7FF] bg-[#0E1218] text-[#6AA7FF]'
                  : 'border-[#1C2430] bg-[#0E1218] text-[#E8ECF2] hover:border-[#6AA7FF]/60'
        }`}
      >
        {/* Start State Indicator Pill */}
        {data.isStart && (
          <span className="absolute -top-6 whitespace-nowrap rounded bg-[#6AA7FF]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#6AA7FF] border border-[#6AA7FF]/30 tracking-wider">
            ► START
          </span>
        )}

        {/* State Label */}
        <span className="truncate max-w-[85px] text-center">{data.label}</span>

        {/* Double Concentric Ring for Final / Accepting States */}
        {data.isFinal && (
          <span className="pointer-events-none absolute inset-1 rounded-full border border-[#5CF2C0]/70" />
        )}
      </div>
    </>
  )
}

const nodeTypes = {
  automata: AutomataNode,
}

function createLayout(
  states: GraphState[],
  transitions: GraphTransition[],
  highlightedStateIds: string[],
) {
  if (states.length === 0) {
    return { nodes: [], edges: [] }
  }

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'LR',
    nodesep: 90,
    ranksep: 140,
    marginx: 40,
    marginy: 40,
  })

  states.forEach((state) => {
    graph.setNode(state.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })
  })

  transitions.forEach((transition) => {
    if (graph.hasNode(transition.from) && graph.hasNode(transition.to)) {
      graph.setEdge(transition.from, transition.to)
    }
  })

  dagre.layout(graph)

  const highlighted = new Set(highlightedStateIds)

  const nodes: Node[] = states.map((state) => {
    const position = graph.node(state.id) ?? { x: 0, y: 0 }

    return {
      id: state.id,
      type: 'automata',
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
      data: {
        ...state,
        highlighted: highlighted.has(state.id),
      },
    }
  })

  // Group transitions between the same states into a single clean edge with combined labels
  const groupedTransitions = new Map<string, { from: string; to: string; labels: string[] }>()

  transitions.forEach((transition) => {
    if (!graph.hasNode(transition.from) || !graph.hasNode(transition.to)) {
      return
    }

    const pair = `${transition.from}->${transition.to}`
    const existing = groupedTransitions.get(pair)
    if (existing) {
      if (!existing.labels.includes(transition.label)) {
        existing.labels.push(transition.label)
      }
    } else {
      groupedTransitions.set(pair, {
        from: transition.from,
        to: transition.to,
        labels: [transition.label],
      })
    }
  })

  const edges: Edge[] = Array.from(groupedTransitions.values()).map((group, index) => {
    const isSelfLoop = group.from === group.to
    const hasEps = group.labels.some(
      (l) => l === 'ε' || l === 'eps' || l === 'epsilon' || l === 'λ',
    )
    const isTrapEdge = group.to === 'Dempty'

    const strokeColor = hasEps ? '#FFB547' : isTrapEdge ? '#7C8696' : '#6AA7FF'

    const sourcePos = graph.node(group.from) ?? { x: 0, y: 0 }
    const targetPos = graph.node(group.to) ?? { x: 0, y: 0 }
    const isBackward = !isSelfLoop && sourcePos.x > targetPos.x

    return {
      id: `edge-${index}-${group.from}-${group.to}`,
      source: group.from,
      target: group.to,
      sourceHandle: isSelfLoop
        ? 'source-top'
        : isBackward
          ? 'source-top'
          : 'source-right',
      targetHandle: isSelfLoop
        ? 'target-right'
        : isBackward
          ? 'target-top'
          : 'target-left',
      label: group.labels.join(', '),
      type: isSelfLoop || isBackward ? 'smoothstep' : 'bezier',
      animated: hasEps,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
      },
      style: {
        stroke: strokeColor,
        strokeWidth: hasEps ? 2 : 1.5,
        strokeDasharray: hasEps ? '4 3' : undefined,
      },
      labelStyle: {
        fill: hasEps ? '#FFB547' : '#E8ECF2',
        fontWeight: 600,
        fontFamily: 'JetBrains Mono',
        fontSize: 12,
      },
      labelBgStyle: {
        fill: '#07090D',
        fillOpacity: 0.95,
        stroke: '#1C2430',
        strokeWidth: 1,
      },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
    }
  })

  return { nodes, edges }
}

export default function AutomataGraph({
  states,
  transitions,
  highlightedStateIds = [],
}: Props) {
  const { nodes, edges } = useMemo(
    () => createLayout(states, transitions, highlightedStateIds),
    [states, transitions, highlightedStateIds],
  )

  return (
    <div className="h-[460px] w-full overflow-hidden rounded-xl border border-[#1C2430] bg-[#07090D] shadow-inner relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.28 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1C2430" gap={24} size={1} />
        <Controls
          className="!bg-[#0E1218] !border-[#1C2430] !fill-[#E8ECF2] !rounded-lg overflow-hidden [&>button]:!bg-[#0E1218] [&>button]:!border-[#1C2430] [&>button]:!fill-[#E8ECF2] hover:[&>button]:!bg-[#1C2430]"
        />

        <MiniMap
          nodeColor={(node) => {
            const state = node.data as GraphState
            return state.isFinal ? '#5CF2C0' : state.isStart ? '#6AA7FF' : '#7C8696'
          }}
          maskColor="rgba(7,9,13,0.85)"
          className="!bg-[#0E1218] !border-[#1C2430] !rounded-lg overflow-hidden"
        />
      </ReactFlow>
    </div>
  )
}

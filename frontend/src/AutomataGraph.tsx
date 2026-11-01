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

type GraphState = {
  id: string
  label: string
  isStart: boolean
  isFinal: boolean
}

type GraphTransition = {
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
  return (
    <>
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
      />

      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
      />

      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
      />

      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
      />

      <div
        className={`relative flex h-20 min-w-20 items-center justify-center rounded-full border-2 px-4 text-sm font-semibold transition-all duration-300 ${
          data.highlighted
            ? 'scale-110 border-yellow-300 bg-yellow-400/20 text-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.35)]'
            : data.isFinal
              ? 'border-green-400 bg-green-500/15 text-green-300'
              : 'border-indigo-400 bg-indigo-500/15 text-indigo-200'
        }`}
      >
        {data.isStart && (
          <span className="absolute -top-6 whitespace-nowrap text-[10px] text-indigo-300">
            START
          </span>
        )}

        {data.label}

        {data.isFinal && (
          <span className="pointer-events-none absolute inset-1 rounded-full border border-green-400" />
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
  const graph = new dagre.graphlib.Graph()

  graph.setDefaultEdgeLabel(() => ({}))

  graph.setGraph({
    rankdir: 'LR',
    nodesep: 90,
    ranksep: 130,
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
    if (
      graph.hasNode(transition.from) &&
      graph.hasNode(transition.to)
    ) {
      graph.setEdge(transition.from, transition.to)
    }
  })

  dagre.layout(graph)

  const highlighted = new Set(highlightedStateIds)

  const nodes: Node[] = states.map((state) => {
    const position = graph.node(state.id)

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

  const edgeCounts = new Map<string, number>()

  const edges: Edge[] = transitions.map((transition, index) => {
    const pair = `${transition.from}->${transition.to}`
    const occurrence = edgeCounts.get(pair) ?? 0

    edgeCounts.set(pair, occurrence + 1)

    const isSelfLoop = transition.from === transition.to
    const useAlternateHandles = occurrence % 2 === 1

    return {
      id: `edge-${index}`,
      source: transition.from,
      target: transition.to,

      sourceHandle: isSelfLoop
        ? 'source-bottom'
        : useAlternateHandles
          ? 'source-bottom'
          : 'source-right',

      targetHandle: isSelfLoop
        ? 'target-top'
        : useAlternateHandles
          ? 'target-top'
          : 'target-left',

      label: transition.label,
      type: 'smoothstep',
      animated: false,

      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#818cf8',
      },

      style: {
        stroke: '#818cf8',
        strokeWidth: 2,
      },

      labelStyle: {
        fill: '#c7d2fe',
        fontWeight: 600,
        fontSize: 13,
      },

      labelBgStyle: {
        fill: '#18181b',
        fillOpacity: 0.95,
      },
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
    () =>
      createLayout(
        states,
        transitions,
        highlightedStateIds,
      ),
    [states, transitions, highlightedStateIds],
  )

  return (
    <div className="h-[460px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={24} />
        <Controls />

        <MiniMap
          nodeColor={(node) => {
            const state = node.data as GraphState

            return state.isFinal
              ? '#22c55e'
              : '#818cf8'
          }}
          maskColor="rgba(9,9,11,0.7)"
        />
      </ReactFlow>
    </div>
  )
}
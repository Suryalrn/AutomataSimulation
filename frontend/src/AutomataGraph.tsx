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
}

function AutomataNode({ data }: { data: GraphState }) {
  return (
    <>
      <Handle type="target" position={Position.Left} />

      <div
        className={`relative flex h-20 min-w-20 items-center justify-center rounded-full border-2 px-4 text-sm font-semibold ${
          data.isFinal
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

      <Handle type="source" position={Position.Right} />
    </>
  )
}

const nodeTypes = {
  automata: AutomataNode,
}

export default function AutomataGraph({
  states,
  transitions,
}: Props) {
  const nodes: Node[] = states.map((state, index) => ({
    id: state.id,
    type: 'automata',
    position: {
      x: 100 + (index % 4) * 200,
      y: 100 + Math.floor(index / 4) * 170,
    },
    data: state,
  }))

  const edges: Edge[] = transitions.map((transition, index) => ({
    id: `edge-${index}`,
    source: transition.from,
    target: transition.to,
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
  }))

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
            return state.isFinal ? '#22c55e' : '#818cf8'
          }}
          maskColor="rgba(9,9,11,0.7)"
        />
      </ReactFlow>
    </div>
  )
}
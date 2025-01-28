'use client';

import type { MouseEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
  Connection,
  useReactFlow,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphQueryResult } from '@/lib/query/types';
import { useGraphStore } from '@/store/graph-store';
import { useCallback, useEffect, useRef } from 'react';
import { QueryCommand } from './QueryCommand';
import { SimpleEdge } from './edges/SimpleEdge';
import { BaseNode } from './nodes/BaseNode';

// Add React import for MouseEvent type
import type { MouseEvent as ReactMouseEvent } from 'react';

const nodeTypes = {
  concept: BaseNode,
  material: BaseNode,
  technique: BaseNode,
  regulation: BaseNode,
};

const edgeTypes = {
  simple: SimpleEdge,
};

// Default edge options for a clean, modern look
const defaultEdgeOptions = {
  type: 'simple',
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: 'hsl(var(--foreground) / 0.5)',
  },
  style: {
    strokeWidth: 2,
  },
};

export function Graph() {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { nodes, edges, setNodes, setEdges, addNodes, addEdges } =
    useGraphStore();
  const { getEdge } = useReactFlow();
  const buildingNumber = useGraphStore((state) => state.selectedBuilding);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(changes),
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(changes),
    [setEdges],
  );

  const onEdgeClick = useCallback((event: MouseEvent, edge: Edge) => {
    event.stopPropagation();
  }, []);

  const onEdgeDoubleClick = useCallback((event: MouseEvent, edge: Edge) => {
    event.stopPropagation();
  }, []);

  const onNodeDragStart = useCallback((event: ReactMouseEvent, node: Node) => {
    // Prevent node dragging if clicking a link
    if (node.data.link && event.target instanceof HTMLElement) {
      const isClickingNode = event.target.closest('.react-flow__node');
      if (isClickingNode) {
        event.preventDefault();
      }
    }
  }, []);

  const handleQueryResult = (result: GraphQueryResult) => {
    // Transform nodes to include required properties
    const nodesWithPosition = result.nodes.map((node, index) => ({
      ...node,
      id: node.id || `node-${index}`,
      position: { x: index * 200, y: 100 },
    }));

    addNodes(nodesWithPosition);
    addEdges(result.edges);

    // Optional: Center view on new nodes
    if (result.nodes.length > 0) {
      const reactFlowInstance = reactFlowRef.current;
      if (reactFlowInstance) {
        reactFlowInstance.fitView({
          padding: 0.2,
          duration: 800,
        });
      }
    }
  };

  // Add useEffect to handle graph updates
  useEffect(() => {
    if (reactFlowRef.current) {
      reactFlowRef.current.fitView({
        padding: 0.2,
        duration: 800,
      });
    }
  }, []); // Remove nodes, edges from dependency array

  return (
    <div className="relative h-full w-full">
      <QueryCommand
        onQueryResult={handleQueryResult}
        buildingNumber={buildingNumber}
      />
      <div className="h-full w-full overflow-hidden p-4">
        <ReactFlow
          onInit={(instance) => {
            reactFlowRef.current = instance;
          }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          className="bg-background/50 rounded-lg"
          fitViewOptions={{ padding: 0.4 }}
          // Add some nice defaults for better UX
          minZoom={0.2}
          maxZoom={4}
          snapToGrid={true}
          snapGrid={[15, 15]}
          onEdgeClick={onEdgeClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodesConnectable={true}
          elementsSelectable={true}
          deleteKeyCode="Backspace"
          selectNodesOnDrag={false}
          onNodeDragStart={onNodeDragStart}
          draggable={true}
        >
          <Controls className="m-4" />
          <Background color="hsl(var(--muted-foreground))" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}

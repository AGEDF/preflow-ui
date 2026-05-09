/**
 * DAGEditor - Main React Flow wrapper for workflow visualization and editing
 * Phase 2 Implementation
 */

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useUIStore } from '../../stores/uiStore';
import { type Workflow, type NodeDefinition } from '../../types';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { detectCycle } from '../../utils/dagValidation';
import './DAGEditor.css';

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

interface DAGEditorProps {
  workflow: Workflow | null;
  nodeDefinitions: NodeDefinition[];
  onWorkflowChange?: (workflow: Workflow) => void;
  onSave?: (workflow: Workflow) => void;
  isLoading?: boolean;
  error?: Error;
}

export const DAGEditor: React.FC<DAGEditorProps> = ({
  workflow,
  nodeDefinitions,
  onWorkflowChange,
}) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const setSelectedNodeId = useUIStore((state) => state.setSelectedNodeId);

  // Initialize nodes and edges from workflow
  useEffect(() => {
    if (workflow?.nodes && workflow?.edges) {
      const initialNodes: Node[] = workflow.nodes.map((node) => {
        const nodeDef = nodeDefinitions.find((nd) => nd.id === node.nodeDefinitionId);
        return {
          id: node.id,
          data: {
            label: node.label || nodeDef?.name || 'Node',
            nodeDefinitionId: node.nodeDefinitionId,
            config: node.config,
            description: nodeDef?.description,
          },
          position: { x: node.x, y: node.y },
          type: 'customNode',
        };
      });

      const initialEdges: Edge[] = workflow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'customEdge',
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [workflow, nodeDefinitions, setNodes, setEdges]);

  // Handle node changes
  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        // Notify parent of changes
        if (workflow && onWorkflowChange) {
          onWorkflowChange({
            ...workflow,
            nodes: updatedNodes.map((n) => ({
              id: n.id,
              nodeDefinitionId: n.data.nodeDefinitionId as string,
              x: n.position.x,
              y: n.position.y,
              config: n.data.config as Record<string, unknown>,
              label: n.data.label as string,
            })),
          });
        }
        return updatedNodes;
      });
    },
    [workflow, onWorkflowChange]
  );

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        // Notify parent of changes
        if (workflow && onWorkflowChange) {
          onWorkflowChange({
            ...workflow,
            edges: updatedEdges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          });
        }
        return updatedEdges;
      });
    },
    [workflow, onWorkflowChange]
  );

  // Handle connection creation
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Check for cycle
      const testEdges = [...edges, { ...connection, id: uuidv4() } as Edge];
      if (detectCycle(nodes, testEdges)) {
        console.warn('Cannot create cycle');
        return;
      }

      const newEdge: Edge = {
        id: uuidv4(),
        source: connection.source || '',
        target: connection.target || '',
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'customEdge',
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, edges, setEdges]
  );

  // Handle node selection
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // Handle drag over canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeDefinitionId = event.dataTransfer.getData('nodeDefinitionId');
      if (!nodeDefinitionId) return;

      // Get the canvas bounding box to calculate position correctly
      const container = event.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();

      // Get React Flow instance position relative to viewport
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const nodeDef = nodeDefinitions.find((nd) => nd.id === nodeDefinitionId);

      const newNode: Node = {
        id: uuidv4(),
        data: {
          label: nodeDef?.name || 'Node',
          nodeDefinitionId,
          description: nodeDef?.description,
          config: {},
        },
        position: { x, y },
        type: 'customNode',
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodeDefinitions, setNodes]
  );

  return (
    <Box
      className="dag-editor-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </Box>
  );
};

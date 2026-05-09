/**
 * WorkflowBuilder - Full DAG editing interface
 * 3-panel layout: NodePalette (left) | DAGEditor (center) | NodeConfigPanel (right)
 * Phase 2 Implementation
 */

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { workflowApi } from '../services/api';
import { nodeDefinitionApi } from '../services/api';
import { DAGEditor } from '../components/DAGEditor/DAGEditor';
import { NodePalette } from '../components/DAGEditor/NodePalette';
import { NodeConfigPanel } from '../components/DAGEditor/NodeConfigPanel';
import { type Workflow } from '../types';
import { useUIStore } from '../stores/uiStore';
import './WorkflowBuilder.css';

export const WorkflowBuilder: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflow if editing existing one
  const {
    data: existingWorkflow,
    isLoading: workflowLoading,
    error: workflowError,
  } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => (workflowId ? workflowApi.getWorkflow(workflowId) : Promise.resolve(null)),
    enabled: !!workflowId,
  });

  // Fetch available node definitions
  const {
    data: nodeDefinitions = [],
    isLoading: defsLoading,
    error: defsError,
  } = useQuery({
    queryKey: ['nodeDefinitions'],
    queryFn: () => nodeDefinitionApi.listNodeDefinitions(),
  });

  // Initialize workflow state
  React.useEffect(() => {
    if (existingWorkflow) {
      setWorkflow(existingWorkflow);
      setWorkflowName(existingWorkflow.name);
    } else if (!workflowId) {
      // Create new workflow
      const newWorkflow: Workflow = {
        id: '',
        name: 'Untitled Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setWorkflow(newWorkflow);
      setWorkflowName(newWorkflow.name);
    }
  }, [existingWorkflow, workflowId]);

  const handleSave = useCallback(async () => {
    if (!workflow || !workflowName.trim()) {
      setError('Workflow name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const workflowToSave: Workflow = {
        ...workflow,
        name: workflowName,
        updatedAt: new Date().toISOString(),
      };

      // Use the saveWorkflow method which handles the complete flow
      const savedWorkflow = await workflowApi.saveWorkflow(workflowToSave);

      setWorkflow(savedWorkflow);
      setShowSaveDialog(false);

      // Navigate to the saved workflow if it was newly created
      if (!workflow.id) {
        navigate(`/workflows/${savedWorkflow.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save workflow';
      setError(message);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [workflow, workflowName, navigate]);

  const handleUndo = useCallback(() => {
    if (existingWorkflow) {
      setWorkflow(existingWorkflow);
      setWorkflowName(existingWorkflow.name);
    }
  }, [existingWorkflow]);

  const handleBack = useCallback(() => {
    navigate('/workflows');
  }, [navigate]);

  const handleWorkflowUpdate = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  }, []);

  const handleNodeConfigChange = useCallback(
    (nodeId: string, config: Record<string, unknown>) => {
      if (!workflow) return;
      const updatedNodes = workflow.nodes.map((node) =>
        node.id === nodeId ? { ...node, config } : node
      );
      setWorkflow({ ...workflow, nodes: updatedNodes });
    },
    [workflow]
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      if (!workflow) return;
      const updatedNodes = workflow.nodes.filter((node) => node.id !== nodeId);
      const updatedEdges = workflow.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      setWorkflow({
        ...workflow,
        nodes: updatedNodes,
        edges: updatedEdges,
      });
    },
    [workflow]
  );

  // Find selected node and its definition
  const selectedNode = workflow?.nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeDef = selectedNode
    ? nodeDefinitions.find((nd) => nd.id === selectedNode.nodeDefinitionId)
    : null;

  // Determine if we're in loading state
  const isLoading = (workflowId && workflowLoading) || defsLoading;
  const hasError = workflowError || defsError;

  if (isLoading) {
    return (
      <Box className="workflow-builder loading">
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box className="workflow-builder error">
        <Alert severity="error">
          Failed to load workflow or node definitions. Please try again.
        </Alert>
        <Button onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
          Back to Workflows
        </Button>
      </Box>
    );
  }

  if (!workflow) {
    return (
      <Box className="workflow-builder error">
        <Alert severity="warning">Workflow not found</Alert>
        <Button onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
          Back to Workflows
        </Button>
      </Box>
    );
  }

  return (
    <Box className="workflow-builder">
      {/* Top toolbar */}
      <Box className="workflow-builder-toolbar">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="text"
            size="small"
          >
            Back
          </Button>
          <TextField
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            placeholder="Workflow name"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {error && (
            <Alert severity="error" sx={{ py: 0 }}>
              {error}
            </Alert>
          )}
          <Button
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            variant="outlined"
            size="small"
          >
            Undo
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={() => setShowSaveDialog(true)}
            variant="contained"
            size="small"
          >
            Save
          </Button>
        </Box>
      </Box>

      {/* Main 3-panel layout */}
      <Box className="workflow-builder-content">
        {/* Left panel: Node Palette */}
        <Box className="workflow-builder-panel left">
          <NodePalette nodeDefinitions={nodeDefinitions} isLoading={defsLoading} />
        </Box>

        {/* Center panel: DAG Editor Canvas */}
        <Box className="workflow-builder-panel center">
          <DAGEditor
            workflow={workflow}
            nodeDefinitions={nodeDefinitions}
            onWorkflowChange={handleWorkflowUpdate}
          />
        </Box>

        {/* Right panel: Config Panel */}
        <Box className="workflow-builder-panel right">
          <NodeConfigPanel
            node={
              selectedNode
                ? {
                    id: selectedNode.id,
                    data: {
                      label: selectedNode.label,
                      nodeDefinitionId: selectedNode.nodeDefinitionId,
                      config: selectedNode.config,
                    },
                    position: { x: selectedNode.x, y: selectedNode.y },
                    type: 'customNode',
                  }
                : null
            }
            nodeDefinition={selectedNodeDef ?? null}
            onConfigChange={handleNodeConfigChange}
            onNodeDelete={handleNodeDelete}
          />
        </Box>
      </Box>

      {/* Save dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              autoFocus
            />
            <TextField
              fullWidth
              label="Description"
              value={workflow.description || ''}
              onChange={(e) =>
                setWorkflow({ ...workflow, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSaving || !workflowName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

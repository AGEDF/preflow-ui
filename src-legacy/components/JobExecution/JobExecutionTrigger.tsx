/**
 * JobExecutionTrigger - Form to select workflow + dataset and trigger execution
 * Phase 3 Implementation
 */

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { workflowApi } from '../../services/api/workflowApi';
import { datasetApi } from '../../services/api/datasetApi';
import { jobApi } from '../../services/api/jobApi';
import { type UUID } from '../../types';

interface JobExecutionTriggerProps {
  onExecutionStart?: (jobId: UUID) => void;
  onExecutionError?: (error: Error) => void;
}

export const JobExecutionTrigger: React.FC<JobExecutionTriggerProps> = ({
  onExecutionStart,
  onExecutionError,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<UUID | ''>('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<UUID | ''>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch workflows
  const {
    data: workflows = [],
    isLoading: workflowsLoading,
    error: workflowsError,
  } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.listWorkflows(),
  });

  // Fetch datasets
  const {
    data: datasets = [],
    isLoading: datasetsLoading,
    error: datasetsError,
  } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetApi.listDatasets(),
  });

  // Execute workflow mutation
  const {
    mutate: executeWorkflow,
    isPending: isExecuting,
    isSuccess,
    error: executionError,
    data: executedJob,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async () => {
      if (!selectedWorkflowId || !selectedDatasetId) {
        throw new Error('Please select both workflow and dataset');
      }
      return jobApi.executeWorkflow(
        selectedWorkflowId as UUID,
        selectedDatasetId as UUID
      );
    },
    onSuccess: (job) => {
      onExecutionStart?.(job.id);
      // Reset form after successful execution
      setTimeout(() => {
        setSelectedWorkflowId('');
        setSelectedDatasetId('');
        resetMutation();
      }, 2000);
    },
    onError: (error) => {
      onExecutionError?.(error as Error);
    },
  });

  const handleExecuteClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmExecute = () => {
    setConfirmDialogOpen(false);
    executeWorkflow();
  };

  const canExecute =
    !!selectedWorkflowId && !!selectedDatasetId && !isExecuting && !isSuccess;
  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);
  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" className="font-bold mb-4">
        Execute Workflow
      </Typography>

      {/* Error alerts */}
      {(workflowsError || datasetsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load workflows or datasets. Please refresh.
        </Alert>
      )}

      {executionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Execution failed: {(executionError as Error).message}
        </Alert>
      )}

      {/* Success alert */}
      {isSuccess && executedJob && (
        <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2" className="font-semibold">
            Workflow execution started!
          </Typography>
          <Typography variant="caption">
            Job ID: {executedJob.id} | Status: {executedJob.status}
          </Typography>
        </Alert>
      )}

      {/* Form */}
      <Stack spacing={2} sx={{ opacity: isSuccess ? 0.5 : 1 }}>
        {/* Workflow selector */}
        <FormControl fullWidth disabled={workflowsLoading || isExecuting || isSuccess}>
          <InputLabel>Workflow</InputLabel>
          <Select
            value={selectedWorkflowId}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            label="Workflow"
          >
            <MenuItem value="">
              <em>Select a workflow...</em>
            </MenuItem>
            {workflows.map((workflow) => (
              <MenuItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </MenuItem>
            ))}
          </Select>
          {workflowsLoading && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </FormControl>

        {/* Workflow details */}
        {selectedWorkflow && (
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {selectedWorkflow.description || 'No description'}
            </Typography>
            <Box sx={{ mt: 1, display: 'block' }}>
              <Typography variant="caption">
                Nodes: {selectedWorkflow.nodes.length} | Edges:{' '}
                {selectedWorkflow.edges.length}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Dataset selector */}
        <FormControl fullWidth disabled={datasetsLoading || isExecuting || isSuccess}>
          <InputLabel>Dataset</InputLabel>
          <Select
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            label="Dataset"
          >
            <MenuItem value="">
              <em>Select a dataset...</em>
            </MenuItem>
            {datasets.map((dataset) => (
              <MenuItem key={dataset.id} value={dataset.id}>
                {dataset.name}
              </MenuItem>
            ))}
          </Select>
          {datasetsLoading && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </FormControl>

        {/* Dataset details */}
        {selectedDataset && (
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Format: {selectedDataset.format.toUpperCase()} | Size:{' '}
              {(selectedDataset.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            {selectedDataset.rows && (
              <Box sx={{ display: 'block' }}>
                <Typography variant="caption">
                  Rows: {selectedDataset.rows}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Execute button */}
        <Button
          variant="contained"
          startIcon={isExecuting ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          onClick={handleExecuteClick}
          disabled={!canExecute}
          fullWidth
        >
          {isExecuting ? 'Executing...' : 'Execute Workflow'}
        </Button>
      </Stack>

      {/* Confirmation dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Execution</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Execute workflow <strong>{selectedWorkflow?.name}</strong> with dataset{' '}
            <strong>{selectedDataset?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmExecute}
            variant="contained"
            autoFocus
          >
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

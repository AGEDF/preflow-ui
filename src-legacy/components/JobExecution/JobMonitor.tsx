/**
 * JobMonitor - Detailed job execution monitoring
 * Phase 3 Implementation
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { useJobPolling } from '../../hooks/useJobPolling';
import { type UUID, type JobStatus } from '../../types';

interface JobMonitorProps {
  jobId: UUID;
  workflowName?: string;
  onJobComplete?: (status: JobStatus) => void;
}

const getExecutionStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    case 'FAILED':
      return <ErrorIcon sx={{ color: '#f44336' }} />;
    case 'RUNNING':
      return <CircularProgress size={20} />;
    case 'PENDING':
    case 'QUEUED':
      return <HourglassEmptyIcon sx={{ color: '#ff9800' }} />;
    default:
      return <PauseCircleIcon sx={{ color: '#9e9e9e' }} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'error';
    case 'RUNNING':
      return 'info';
    case 'PENDING':
    case 'QUEUED':
      return 'warning';
    default:
      return 'default';
  }
};

const formatDuration = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return '—';
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const JobMonitor: React.FC<JobMonitorProps> = ({
  jobId,
  workflowName,
  onJobComplete,
}) => {
  const { job, isLoading, error, isRunning } = useJobPolling(jobId, 2000, {
    enabled: true,
  });

  React.useEffect(() => {
    if (job && !isRunning && onJobComplete) {
      onJobComplete(job.status);
    }
  }, [job, isRunning, onJobComplete]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || !job) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load job details: {error?.message || 'Unknown error'}
        </Alert>
      </Paper>
    );
  }

  const totalNodes = job.executions?.length || 0;
  const completedNodes = job.executions?.filter((e) => e.status === 'COMPLETED').length || 0;
  const failedNodes = job.executions?.filter((e) => e.status === 'FAILED').length || 0;
  const progressPercent = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  return (
    <Stack spacing={2}>
      {/* Header with job info */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" className="font-bold">
              {workflowName || 'Workflow Execution'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Job ID: {jobId}
            </Typography>
          </Box>
          <Chip
            label={job.status}
            color={getStatusColor(job.status) as any}
            variant="outlined"
            size="medium"
          />
        </Box>

        {/* Progress */}
        {isRunning && totalNodes > 0 && (
          <Box>
            <LinearProgress variant="determinate" value={progressPercent} sx={{ mb: 1 }} />
            <Typography variant="caption" color="textSecondary">
              Progress: {completedNodes} / {totalNodes} nodes completed ({Math.round(progressPercent)}%)
            </Typography>
          </Box>
        )}

        {/* Status summary */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Status
            </Typography>
            <Chip
              label={job.status}
              size="small"
              color={getStatusColor(job.status) as any}
              icon={getExecutionStatusIcon(job.status) as any}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Created
            </Typography>
            <Box sx={{ display: 'block' }}>
              <Typography variant="caption">
                {new Date(job.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          {job.completedAt && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Completed
              </Typography>
              <Box sx={{ display: 'block' }}>
                <Typography variant="caption">
                  {new Date(job.completedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Error message if job failed */}
        {job.status === 'FAILED' && job.errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="caption">{job.errorMessage}</Typography>
          </Alert>
        )}
      </Paper>

      {/* Node executions timeline */}
      {job.executions && job.executions.length > 0 ? (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Step</TableCell>
                  <TableCell>Node</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Started</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.executions.map((exec: any, index: number) => (
                  <TableRow key={exec.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {exec.nodeId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getExecutionStatusIcon(exec.status) as any}
                        label={exec.status}
                        size="small"
                        color={getStatusColor(exec.status) as any}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {formatDuration(exec.startTime, exec.endTime)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {exec.startTime
                        ? new Date(exec.startTime).toLocaleTimeString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Alert severity="info">No node executions recorded yet.</Alert>
      )}

      {/* Stats footer */}
      {totalNodes > 0 && (
        <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Summary: {completedNodes} completed • {failedNodes} failed • {totalNodes - completedNodes - failedNodes} pending
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

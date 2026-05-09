/**
 * Jobs page - Trigger and monitor workflow executions
 * Phase 3 Implementation
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { jobApi } from '../services/api/jobApi';
import { JobExecutionTrigger } from '../components/JobExecution/JobExecutionTrigger';
import { useJobPolling } from '../hooks/useJobPolling';
import { type UUID, type JobStatus } from '../types';

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'QUEUED':
    case 'PENDING':
      return 'warning';
    case 'RUNNING':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

export const Jobs: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<UUID | null>(null);

  // Fetch all jobs
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobApi.listJobs(),
    refetchInterval: 5000, // Refetch every 5 seconds for list view
  });

  // Poll selected job for detailed updates
  const { job: selectedJob } = useJobPolling(
    selectedJobId,
    2000,
    { enabled: !!selectedJobId }
  );

  // When execution starts, select it for detailed polling
  const handleExecutionStart = (jobId: UUID) => {
    setSelectedJobId(jobId);
    refetch(); // Also refresh the jobs list
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="font-bold mb-8">
        Job Executions
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 3 }}>
        {/* Left: Trigger section */}
        <Box>
          <JobExecutionTrigger onExecutionStart={handleExecutionStart} />
        </Box>

        {/* Right: Jobs list and monitoring */}
        <Box>
          {/* Selected job details */}
          {selectedJob && (
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f0f7ff', borderLeft: '4px solid #2196f3' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Current Job
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption">
                    ID: {selectedJob.id}
                  </Typography>
                  <Box sx={{ display: 'block' }}>
                    <Typography variant="caption">
                      Status: <Chip label={selectedJob.status} size="small" color={getStatusColor(selectedJob.status) as any} />
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {selectedJob && (selectedJob.status === 'QUEUED' || selectedJob.status === 'PENDING' || selectedJob.status === 'RUNNING') && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="caption" color="textSecondary">
                    Job is running...
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Jobs
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load jobs. Please refresh.
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length === 0 ? (
            <Alert severity="info">
              No jobs yet. Create a workflow and trigger an execution above.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Job ID</TableCell>
                    <TableCell>Workflow ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.slice(0, 10).map((job) => (
                    <TableRow
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedJob?.id === job.id ? '#f0f7ff' : 'initial',
                        '&:hover': { backgroundColor: '#f9f9f9' },
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {job.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {job.workflowId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          size="small"
                          color={getStatusColor(job.status) as any}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {new Date(job.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Container>
  );
};

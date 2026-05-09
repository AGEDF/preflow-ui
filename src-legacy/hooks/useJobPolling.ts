/**
 * useJobPolling - Hook to poll job status periodically
 * Phase 3 Implementation
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '../services/api/jobApi';
import { type UUID, type Job } from '../types';

export const useJobPolling = (
  jobId: UUID | null,
  pollInterval: number = 2000, // Poll every 2 seconds by default (matches backend scheduler)
  options: { enabled?: boolean } = {}
) => {
  const queryClient = useQueryClient();

  // Check if job is still running
  const isJobRunning = (job: Job | null | undefined) => {
    return job && (job.status === 'QUEUED' || job.status === 'PENDING' || job.status === 'RUNNING');
  };

  // Fetch job data with polling
  const query = useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      return jobApi.getJob(jobId);
    },
    enabled: !!jobId && (options.enabled !== false),
    refetchInterval: (queryResult) => {
      // Keep polling as long as job is running
      return isJobRunning(queryResult.state.data) ? pollInterval : false;
    },
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale for immediate refetch
    retry: 3, // Retry failed requests up to 3 times
  });

  // Auto-invalidate related queries when job completes
  useEffect(() => {
    const job = query.data;
    if (job && !isJobRunning(job)) {
      // Job is done, refetch job list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  }, [query.data, queryClient]);

  return {
    job: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isRunning: isJobRunning(query.data),
    refetch: query.refetch,
  };
};

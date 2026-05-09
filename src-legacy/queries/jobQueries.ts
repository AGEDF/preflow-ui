/**
 * TanStack Query definitions for jobs
 */

import { queryOptions } from '@tanstack/react-query';
import { jobApi } from '../services/api';
import { type UUID } from '../types';

export const jobQueries = {
  /**
   * Query options for fetching a single job
   */
  job: (jobId: UUID) =>
    queryOptions({
      queryKey: ['job', jobId],
      queryFn: () => jobApi.getJob(jobId),
      staleTime: 10000, // 10 seconds (jobs update frequently)
    }),

  /**
   * Query options for listing jobs for a workflow
   */
  forWorkflow: (workflowId: UUID) =>
    queryOptions({
      queryKey: ['jobs', 'workflow', workflowId],
      queryFn: () => jobApi.listJobsForWorkflow(workflowId),
      staleTime: 20000, // 20 seconds
    }),

  /**
   * Query options for listing all jobs
   */
  all: () =>
    queryOptions({
      queryKey: ['jobs'],
      queryFn: () => jobApi.listJobs(),
      staleTime: 20000, // 20 seconds
    }),
};

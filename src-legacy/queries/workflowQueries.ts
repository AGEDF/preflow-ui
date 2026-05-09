/**
 * TanStack Query definitions for workflows
 * Used in useQuery/useMutation hooks throughout the app
 */

import { queryOptions } from '@tanstack/react-query';
import { workflowApi } from '../services/api';
import { type UUID } from '../types';

export const workflowQueries = {
  /**
   * Query options for fetching a single workflow
   */
  workflow: (workflowId: UUID) =>
    queryOptions({
      queryKey: ['workflow', workflowId],
      queryFn: () => workflowApi.getWorkflow(workflowId),
      staleTime: 30000, // 30 seconds
    }),

  /**
   * Query options for listing all workflows
   */
  all: () =>
    queryOptions({
      queryKey: ['workflows'],
      queryFn: () => workflowApi.listWorkflows(),
      staleTime: 60000, // 60 seconds
    }),
};

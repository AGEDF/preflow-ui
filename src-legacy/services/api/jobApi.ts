/**
 * Job API calls
 * Communicates with: POST /workflows/{id}/execute, GET /jobs/{id}
 */

import apiClient from './axios';
import { type Job, type UUID } from '../../types';

export const jobApi = {
  /**
   * Execute a workflow with a dataset
   * POST /workflows/{workflowId}/execute
   */
  executeWorkflow: async (workflowId: UUID, datasetId: UUID): Promise<Job> => {
    const response = await apiClient.post(`/workflows/${workflowId}/execute`, {
      datasetId,
    });
    return response.data;
  },

  /**
   * Get job details
   * GET /jobs/{id}
   */
  getJob: async (jobId: UUID): Promise<Job> => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * List jobs for a workflow
   * GET /workflows/{workflowId}/jobs
   */
  listJobsForWorkflow: async (workflowId: UUID): Promise<Job[]> => {
    const response = await apiClient.get(`/workflows/${workflowId}/jobs`);
    return response.data;
  },

  /**
   * List all jobs
   * GET /jobs
   */
  listJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/jobs');
    return response.data;
  },
};

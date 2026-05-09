/**
 * Dataset API calls
 * Communicates with: POST /datasets/upload, GET /datasets, GET /datasets/{id}
 */

import apiClient from './axios';
import { type Dataset, type UUID } from '../../types';

export const datasetApi = {
  /**
   * Upload a dataset file
   * POST /datasets/upload
   * Expects FormData with file and metadata
   */
  uploadDataset: async (file: File, name?: string): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await apiClient.post('/datasets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * List all datasets
   * GET /datasets
   */
  listDatasets: async (): Promise<Dataset[]> => {
    const response = await apiClient.get('/datasets');
    return response.data;
  },

  /**
   * Get dataset details
   * GET /datasets/{id}
   */
  getDataset: async (datasetId: UUID): Promise<Dataset> => {
    const response = await apiClient.get(`/datasets/${datasetId}`);
    return response.data;
  },

  /**
   * Delete a dataset
   * DELETE /datasets/{id}
   */
  deleteDataset: async (datasetId: UUID): Promise<void> => {
    await apiClient.delete(`/datasets/${datasetId}`);
  },

  /**
   * Preview dataset (first N rows)
   * GET /datasets/{id}/preview?limit=10
   */
  previewDataset: async (datasetId: UUID, limit = 10): Promise<unknown[]> => {
    const response = await apiClient.get(`/datasets/${datasetId}/preview`, {
      params: { limit },
    });
    return response.data;
  },
};

/**
 * Node Definition API calls
 * Communicates with: GET /node-definitions
 */

import apiClient from './axios';
import { type NodeDefinition } from '../../types';

export const nodeDefinitionApi = {
  /**
   * List all available node definitions (transformations)
   * GET /node-definitions
   */
  listNodeDefinitions: async (): Promise<NodeDefinition[]> => {
    const response = await apiClient.get('/node-definitions');
    console.log('Fetched node definitions:', response);
    return response.data;
  },

  /**
   * Get a specific node definition
   * GET /node-definitions/{id}
   */
  getNodeDefinition: async (nodeDefId: string): Promise<NodeDefinition> => {
    const response = await apiClient.get(`/node-definitions/${nodeDefId}`);
    return response.data;
  },
};

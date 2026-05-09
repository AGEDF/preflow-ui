/**
 * Workflow API calls
 * Communicates with:
 * - POST /workflows
 * - GET /workflows, GET /workflows/{id}
 * - POST /workflows/nodes (backend expects workflowId in body)
 * - POST /workflows/edges (backend expects workflowId in body)
 */

import apiClient from './axios';
import { type Workflow, type Node, type Edge, type UUID } from '../../types';

export const workflowApi = {
  /**
   * Fetch a workflow by ID
   * GET /workflows/{id}
   */
  getWorkflow: async (workflowId: UUID): Promise<Workflow> => {
    const response = await apiClient.get(`/workflows/${workflowId}`);
    return response.data;
  },

  /**
   * List all workflows
   * GET /workflows
   */
  listWorkflows: async (): Promise<Workflow[]> => {
    const response = await apiClient.get('/workflows');
    return response.data;
  },

  /**
   * Create a new workflow
   * POST /workflows
   * @param name - Workflow name
   * @param description - Optional workflow description
   */
  createWorkflow: async (name: string, description?: string): Promise<Workflow> => {
    const response = await apiClient.post('/workflows', { name, description });
    return response.data;
  },

  /**
   * Update a workflow (currently not supported by backend, use saveWorkflow instead)
   * This is a placeholder for future implementation
   */
  updateWorkflow: async (workflowId: UUID, data: Partial<Workflow>): Promise<Workflow> => {
    const response = await apiClient.put(`/workflows/${workflowId}`, data);
    return response.data;
  },

  /**
   * Delete a workflow
   * DELETE /workflows/{id}
   */
  deleteWorkflow: async (workflowId: UUID): Promise<void> => {
    await apiClient.delete(`/workflows/${workflowId}`);
  },

  /**
   * Save a complete workflow (create or update with all nodes and edges)
   * Flow: Create workflow → Add all nodes → Add all edges
   */
  saveWorkflow: async (workflow: Workflow): Promise<Workflow> => {
    try {
      let savedWorkflow: Workflow;

      if (workflow.id) {
        // For now, if workflow has ID, just fetch the latest state
        // (backend doesn't support full update yet)
        savedWorkflow = await workflowApi.getWorkflow(workflow.id);
      } else {
        // Create new workflow
        savedWorkflow = await workflowApi.createWorkflow(workflow.name, workflow.description);
      }

      // Add all nodes
      for (const node of workflow.nodes) {
        await workflowApi.addNode(savedWorkflow.id, node);
      }

      // Add all edges
      for (const edge of workflow.edges) {
        await workflowApi.addEdge(savedWorkflow.id, edge);
      }

      // Fetch updated workflow
      return await workflowApi.getWorkflow(savedWorkflow.id);
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  },

  /**
   * Add a node to a workflow
   * POST /workflows/nodes (backend endpoint)
   */
  addNode: async (workflowId: UUID, node: Omit<Node, 'id'>): Promise<Node> => {
    const response = await apiClient.post('/workflows/nodes', {
      workflowId,
      nodeDefinitionId: node.nodeDefinitionId,
      config: node.config,
      library: undefined,
    });
    return response.data;
  },

  /**
   * Update a node in a workflow
   * Currently not supported - would need to be added to backend
   */
  updateNode: async (workflowId: UUID, nodeId: UUID, node: Partial<Node>): Promise<Node> => {
    const response = await apiClient.put(`/workflows/${workflowId}/nodes/${nodeId}`, node);
    return response.data;
  },

  /**
   * Delete a node from a workflow
   * DELETE /workflows/{id}/nodes/{nodeId}
   */
  deleteNode: async (workflowId: UUID, nodeId: UUID): Promise<void> => {
    await apiClient.delete(`/workflows/${workflowId}/nodes/${nodeId}`);
  },

  /**
   * Add an edge to a workflow
   * POST /workflows/edges (backend endpoint)
   */
  addEdge: async (workflowId: UUID, edge: Omit<Edge, 'id'>): Promise<Edge> => {
    const response = await apiClient.post('/workflows/edges', {
      workflowId,
      fromNode: edge.source,
      toNode: edge.target,
    });
    return {
      id: response.data.id,
      source: response.data.fromNode,
      target: response.data.toNode,
    };
  },

  /**
   * Delete an edge from a workflow
   * DELETE /workflows/{id}/edges/{edgeId}
   */
  deleteEdge: async (workflowId: UUID, edgeId: UUID): Promise<void> => {
    await apiClient.delete(`/workflows/${workflowId}/edges/${edgeId}`);
  },
};

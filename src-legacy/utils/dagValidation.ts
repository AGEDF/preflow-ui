/**
 * DAG Validation utilities - Cycle detection and validation
 */

import { type Node, type Edge } from 'reactflow';

interface ValidationResult {
  isValid: boolean;
  hasCycle: boolean;
  hasIsolatedNodes: boolean;
  errors: string[];
}

/**
 * Detects if adding an edge would create a cycle using DFS
 * @param nodes - Array of nodes
 * @param edges - Array of edges including the potential new edge
 * @returns true if cycle is detected
 */
export function detectCycle(nodes: Node[], edges: Edge[]): boolean {
  // Create adjacency list
  const graph = new Map<string, string[]>();

  nodes.forEach((node) => {
    if (!graph.has(node.id)) {
      graph.set(node.id, []);
    }
  });

  edges.forEach((edge) => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  // DFS for cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check each node
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates the entire DAG structure
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns Validation result object
 */
export function validateDAG(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  let hasCycle = false;
  let hasIsolatedNodes = false;

  // Check for cycles
  hasCycle = detectCycle(nodes, edges);
  if (hasCycle) {
    errors.push('DAG contains a cycle');
  }

  // Check for isolated nodes (nodes with no connections)
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const isolatedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id));
  if (isolatedNodes.length > 0 && nodes.length > 1) {
    hasIsolatedNodes = true;
    errors.push(
      `${isolatedNodes.length} isolated node(s) found: ${isolatedNodes.map((n) => n.id).join(', ')}`
    );
  }

  // Check for edges connecting non-existent nodes
  const nodeIds = new Set(nodes.map((n) => n.id));
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`);
    }
  });

  return {
    isValid: errors.length === 0,
    hasCycle,
    hasIsolatedNodes,
    errors,
  };
}

/**
 * Gets topological sort order of nodes (for execution)
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns Array of node IDs in topological order, or null if cycle detected
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] | null {
  if (detectCycle(nodes, edges)) {
    return null; // Cannot sort if cycle exists
  }

  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach((node) => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph
  edges.forEach((edge) => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);

    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Kahn's algorithm
  const queue = nodes
    .filter((node) => (inDegree.get(node.id) || 0) === 0)
    .map((node) => node.id);
  const result: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift() || '';
    result.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    neighbors.forEach((neighbor) => {
      const currentInDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, currentInDegree);

      if (currentInDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result.length === nodes.length ? result : null;
}

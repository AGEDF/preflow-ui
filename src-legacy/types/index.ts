/**
 * Type definitions for Preflow core entities
 */

export type UUID = string;

// Workflow types
export interface Node {
  id: UUID;
  nodeDefinitionId: string;
  x: number;
  y: number;
  config?: Record<string, unknown>;
  label?: string;
}

export interface Edge {
  id: UUID;
  source: UUID;
  target: UUID;
}

export interface Workflow {
  id: UUID;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

// Dataset types
export interface Dataset {
  id: UUID;
  name: string;
  format: 'csv' | 'parquet' | 'json';
  size: number; // bytes
  rows?: number;
  columns?: string[];
  uploadedAt: string;
  storagePath: string;
}

// Job types
export type JobStatus = 'QUEUED' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface JobExecution {
  id: UUID;
  jobId: UUID;
  nodeId: UUID;
  status: JobStatus;
  startTime?: string;
  endTime?: string;
  outputPath?: string;
  errorMessage?: string;
  logs?: string;
}

export interface Job {
  id: UUID;
  workflowId: UUID;
  datasetId: UUID;
  status: JobStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executions: JobExecution[];
  errorMessage?: string;
  outputPath?: string;
}

// Node Definition (available transformations)
export interface NodeDefinition {
  id: string; // e.g., "remove_nulls"
  name: string; // e.g., "Remove Null Values"
  description: string;
  category?: string; // e.g., "Data Cleaning"
  configSchema?: Record<string, unknown>; // JSON Schema for validation
  supportedLibraries?: string[]; // e.g., ["pandas", "numpy"]
  icon?: string; // icon name or URL
}

// API Response wrappers (for consistency)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

// UI State types
export interface UIState {
  selectedNodeId: UUID | null;
  selectedWorkflowId: UUID | null;
  sidebarOpen: boolean;
  darkMode: boolean;
}

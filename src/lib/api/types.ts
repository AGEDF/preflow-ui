export type UUID = string;

export type BackendError = {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
};

export type Dataset = {
  id: UUID;
  name: string;
  fileFormat: "CSV" | "JSON" | "PARQUET";
  storagePath: string;
  version: number;
  createdAt: string;
};

export type WorkflowNode = {
  id: UUID;
  workflowId: UUID;
  nodeDefinitionId: string;
  library?: string | null;
  config?: Record<string, unknown> | null;
};

export type WorkflowEdge = {
  id: UUID;
  workflowId: UUID;
  fromNode: UUID;
  toNode: UUID;
};

export type Workflow = {
  id: UUID;
  name: string;
  version: number;
  createdAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type NodeDefinition = {
  id: string;
  name: string;
  description: string;
  category?: string | null;
  configSchema?: unknown;
  supportedLibraries?: unknown;
  icon?: string | null;
};

export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type Job = {
  id: UUID;
  workflowId: UUID;
  datasetId: UUID | null;
  status: JobStatus;
  createdAt: string;
};

export type CreateWorkflowInput = {
  name: string;
};

export type AddNodeInput = {
  workflowId: UUID;
  nodeDefinitionId: string;
  library?: string | null;
  config?: Record<string, unknown>;
};

export type AddEdgeInput = {
  workflowId: UUID;
  fromNode: UUID;
  toNode: UUID;
};

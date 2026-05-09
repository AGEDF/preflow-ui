import type {
  AddEdgeInput,
  AddNodeInput,
  CreateWorkflowInput,
  Dataset,
  Job,
  NodeDefinition,
  UUID,
  Workflow,
  WorkflowEdge,
  WorkflowNode
} from "./types";

const API_ROOT = "/api/backend";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }),
      ...init?.headers
    },
    credentials: "include"
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const message =
      payload?.message ?? payload?.error?.message ?? payload?.error ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const api = {
  datasets: {
    list: () => request<Dataset[]>("/datasets"),
    get: (id: UUID) => request<Dataset>(`/datasets/${id}`),
    upload: (input: { name: string; file: File }) => {
      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("file", input.file);
      return request<Dataset>("/datasets", {
        method: "POST",
        body: formData
      });
    }
    // TODO: backend route missing: DELETE /datasets/{id}
    // TODO: backend route missing: GET /datasets/{id}/preview
  },
  workflows: {
    list: () => request<Workflow[]>("/workflows"),
    get: (id: UUID) => request<Workflow>(`/workflows/${id}`),
    create: (input: CreateWorkflowInput) =>
      request<Workflow>("/workflows", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    addNode: (input: AddNodeInput) =>
      request<WorkflowNode>("/workflows/nodes", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    addEdge: (input: AddEdgeInput) =>
      request<WorkflowEdge>("/workflows/edges", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    deleteNode: (nodeId: UUID) =>
      request<void>(`/workflows/nodes/${nodeId}`, {
        method: "DELETE"
      }),
    execute: (workflowId: UUID, datasetId: UUID) =>
      request<Job>(`/workflows/${workflowId}/execute`, {
        method: "POST",
        body: JSON.stringify({ datasetId })
      })
    // TODO: backend routes missing: workflow update/delete, node update, edge delete, persisted canvas positions.
  },
  jobs: {
    get: (id: UUID) => request<Job>(`/jobs/${id}`),
    listByWorkflow: (workflowId: UUID) => request<Job[]>(`/jobs/workflow/${workflowId}`)
    // TODO: backend route missing: GET /jobs for global job history.
    // TODO: backend route missing: job execution detail/progress/logs.
  },
  nodeDefinitions: {
    list: () => request<NodeDefinition[]>("/node-definitions"),
    get: (id: string) => request<NodeDefinition>(`/node-definitions/${id}`)
  }
};

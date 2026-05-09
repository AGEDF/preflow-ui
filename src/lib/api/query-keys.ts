export const queryKeys = {
  datasets: ["datasets"] as const,
  workflows: ["workflows"] as const,
  workflow: (id: string) => ["workflow", id] as const,
  nodeDefinitions: ["node-definitions"] as const,
  job: (id: string) => ["job", id] as const,
  workflowJobs: (workflowId: string) => ["jobs", "workflow", workflowId] as const
};

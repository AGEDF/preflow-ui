"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, PlayCircle, RadioTower } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { type JobStatus } from "@/lib/api/types";
import { formatDate, shortId } from "@/lib/utils";

const executeSchema = z.object({
  workflowId: z.string().uuid("Select a workflow"),
  datasetId: z.string().uuid("Select a dataset")
});

type ExecuteForm = z.infer<typeof executeSchema>;

function statusVariant(status: JobStatus) {
  if (status === "COMPLETED") return "emerald";
  if (status === "FAILED") return "red";
  if (status === "RUNNING") return "default";
  return "amber";
}

export function JobsDashboard() {
  const queryClient = useQueryClient();
  const [jobWorkflowId, setJobWorkflowId] = useState<string>("");

  const workflows = useQuery({ queryKey: queryKeys.workflows, queryFn: api.workflows.list });
  const datasets = useQuery({ queryKey: queryKeys.datasets, queryFn: api.datasets.list });
  const workflowJobs = useQuery({
    queryKey: jobWorkflowId ? queryKeys.workflowJobs(jobWorkflowId) : ["jobs", "workflow", "none"],
    queryFn: () => api.jobs.listByWorkflow(jobWorkflowId),
    enabled: !!jobWorkflowId,
    refetchInterval: 3000
  });

  const form = useForm<ExecuteForm>({
    resolver: zodResolver(executeSchema),
    defaultValues: { workflowId: "", datasetId: "" }
  });

  const selectedWorkflowId = form.watch("workflowId");

  const execute = useMutation({
    mutationFn: (values: ExecuteForm) => api.workflows.execute(values.workflowId, values.datasetId),
    onSuccess: (job) => {
      setJobWorkflowId(job.workflowId);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowJobs(job.workflowId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(job.id) });
      toast.success("Execution started", { description: `Job ${shortId(job.id)} is ${job.status.toLowerCase()}` });
    },
    onError: (error) => toast.error("Execution failed", { description: error.message })
  });

  return (
    <main>
      <PageHeader
        eyebrow="Execution monitor"
        title="Run and watch workflow jobs"
        description="Global job history is not exposed by the backend yet, so this dashboard lists jobs for the selected workflow."
        icon={PlayCircle}
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Execute workflow</CardTitle>
            <CardDescription>Choose a workflow and dataset, then start a backend job.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => execute.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="workflowId">Workflow</Label>
                <select
                  id="workflowId"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register("workflowId", {
                    onChange: (event) => setJobWorkflowId(event.target.value)
                  })}
                >
                  <option value="">Select workflow</option>
                  {workflows.data?.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.workflowId ? (
                  <p className="text-sm text-red-300">{form.formState.errors.workflowId.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="datasetId">Dataset</Label>
                <select
                  id="datasetId"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register("datasetId")}
                >
                  <option value="">Select dataset</option>
                  {datasets.data?.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.fileFormat})
                    </option>
                  ))}
                </select>
                {form.formState.errors.datasetId ? (
                  <p className="text-sm text-red-300">{form.formState.errors.datasetId.message}</p>
                ) : null}
              </div>

              <Button className="w-full" disabled={execute.isPending || workflows.isLoading || datasets.isLoading}>
                <Play className="h-4 w-4" />
                {execute.isPending ? "Starting..." : "Execute"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          {!selectedWorkflowId && !jobWorkflowId ? (
            <EmptyState
              icon={RadioTower}
              title="Pick a workflow"
              description="Select a workflow to load its job history from GET /jobs/workflow/{workflowId}."
            />
          ) : workflowJobs.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)
          ) : workflowJobs.isError ? (
            <EmptyState icon={RadioTower} title="Jobs could not be loaded" description={workflowJobs.error.message} />
          ) : !workflowJobs.data || workflowJobs.data.length === 0 ? (
            <EmptyState icon={RadioTower} title="No jobs for this workflow" description="Run the workflow to create the first job." />
          ) : (
            workflowJobs.data.map((job) => (
              <Card key={job.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Job {shortId(job.id)}</CardTitle>
                    <CardDescription>Created {formatDate(job.createdAt)}</CardDescription>
                  </div>
                  <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge>Workflow {shortId(job.workflowId)}</Badge>
                  <Badge variant="violet">Dataset {shortId(job.datasetId)}</Badge>
                  <Badge variant="amber">Node logs TODO</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

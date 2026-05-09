"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, GitBranch, MoreVertical, Play, Plus, Workflow as WorkflowIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { formatDate } from "@/lib/utils";

const createWorkflowSchema = z.object({
  name: z.string().min(2, "Use at least 2 characters").max(120, "Keep the workflow name under 120 characters")
});

type CreateWorkflowForm = z.infer<typeof createWorkflowSchema>;

export function WorkflowList() {
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<Record<string, string>>({});
  const workflows = useQuery({
    queryKey: queryKeys.workflows,
    queryFn: api.workflows.list
  });
  const datasets = useQuery({
    queryKey: queryKeys.datasets,
    queryFn: api.datasets.list
  });
  const workflowItems = workflows.data ?? [];
  const datasetItems = datasets.data ?? [];
  const totalNodes = workflowItems.reduce((total, workflow) => total + workflow.nodes.length, 0);
  const totalEdges = workflowItems.reduce((total, workflow) => total + workflow.edges.length, 0);

  const form = useForm<CreateWorkflowForm>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: { name: "" }
  });

  const createWorkflow = useMutation({
    mutationFn: api.workflows.create,
    onSuccess: (workflow) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      form.reset();
      toast.success("Workflow created", { description: workflow.name });
    },
    onError: (error) => {
      toast.error("Could not create workflow", { description: error.message });
    }
  });

  const executeWorkflow = useMutation({
    mutationFn: ({ workflowId, datasetId }: { workflowId: string; datasetId: string }) =>
      api.workflows.execute(workflowId, datasetId),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowJobs(job.workflowId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(job.id) });
      setOpenMenuId(null);
      toast.success("Execution started", { description: `Job ${job.id.slice(0, 8)} is ${job.status.toLowerCase()}` });
    },
    onError: (error) => toast.error("Execution failed", { description: error.message })
  });

  const runWorkflow = (workflowId: string) => {
    const datasetId = selectedDatasets[workflowId] ?? datasetItems[0]?.id;
    if (!datasetId) {
      toast.error("Select a dataset first", { description: "Workflow execution requires a dataset." });
      return;
    }
    executeWorkflow.mutate({ workflowId, datasetId });
  };

  return (
    <main>
      <PageHeader
        eyebrow="Workflow library"
        title="Build preprocessing DAGs"
        description="Create a workflow, open it, then add node definitions and edges that match the backend execution model."
        icon={GitBranch}
      />

      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="border-sky-200/80">
          <CardHeader>
            <CardDescription>Available workflows</CardDescription>
            <CardTitle className="text-3xl text-primary">{workflowItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-teal-200/80">
          <CardHeader>
            <CardDescription>Datasets ready to run</CardDescription>
            <CardTitle className="text-3xl text-teal-700">{datasetItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200/80">
          <CardHeader>
            <CardDescription>Graph objects</CardDescription>
            <CardTitle className="text-3xl text-amber-700">{totalNodes + totalEdges}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create workflow</CardTitle>
            <CardDescription>The backend currently accepts a workflow name only.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => createWorkflow.mutate(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Customer churn cleanup" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-red-300">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <Button className="w-full" disabled={createWorkflow.isPending}>
                <Plus className="h-4 w-4" />
                {createWorkflow.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="grid gap-3 2xl:grid-cols-2">
          {workflows.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />)
          ) : workflows.isError ? (
            <EmptyState
              icon={WorkflowIcon}
              title="Workflows could not be loaded"
              description={workflows.error.message}
            />
          ) : workflowItems.length === 0 ? (
            <EmptyState
              icon={WorkflowIcon}
              title="No workflows yet"
              description="Create your first workflow to start composing a preprocessing graph."
            />
          ) : (
            workflowItems.map((workflow) => (
              <Card key={workflow.id} className="transition-all hover:-translate-y-0.5 hover:border-sky-300">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription>Created {formatDate(workflow.createdAt)}</CardDescription>
                    </div>
                    <div className="relative flex items-center gap-2">
                      <Badge variant="emerald">v{workflow.version}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Open actions for ${workflow.name}`}
                        onClick={() => setOpenMenuId((current) => (current === workflow.id ? null : workflow.id))}
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden />
                      </Button>
                      {openMenuId === workflow.id ? (
                        <div className="absolute right-0 top-11 z-20 w-72 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground" htmlFor={`dataset-${workflow.id}`}>
                              Dataset for run
                            </label>
                            <select
                              id={`dataset-${workflow.id}`}
                              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground"
                              value={selectedDatasets[workflow.id] ?? datasetItems[0]?.id ?? ""}
                              onChange={(event) =>
                                setSelectedDatasets((current) => ({ ...current, [workflow.id]: event.target.value }))
                              }
                              disabled={datasets.isLoading || datasetItems.length === 0}
                            >
                              {datasetItems.length === 0 ? <option value="">No datasets available</option> : null}
                              {datasetItems.map((dataset) => (
                                <option key={dataset.id} value={dataset.id}>
                                  {dataset.name} ({dataset.fileFormat})
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2 pt-1">
                              <Button
                                type="button"
                                className="flex-1"
                                disabled={executeWorkflow.isPending || datasetItems.length === 0}
                                onClick={() => runWorkflow(workflow.id)}
                              >
                                <Play className="h-4 w-4" aria-hidden />
                                Run
                              </Button>
                              <Button type="button" variant="outline" asChild>
                                <Link href={`/workflows/${workflow.id}`}>
                                  <ExternalLink className="h-4 w-4" aria-hidden />
                                  Open
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge>{workflow.nodes.length} nodes</Badge>
                    <Badge variant="violet">{workflow.edges.length} edges</Badge>
                    <Button variant="outline" size="sm" asChild className="ml-auto">
                      <Link href={`/workflows/${workflow.id}`}>
                        <ExternalLink className="h-4 w-4" aria-hidden />
                        Open
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

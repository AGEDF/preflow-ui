"use client";

import "reactflow/dist/style.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  GitBranch,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Save,
  Trash2,
  Workflow as WorkflowIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Edge as FlowEdge,
  type Node as FlowNode,
  useEdgesState,
  useNodesState
} from "reactflow";
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
import { type NodeDefinition, type Workflow } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const workflowSchema = z.object({
  name: z.string().min(2, "Workflow name is required").max(120)
});

type WorkflowForm = z.infer<typeof workflowSchema>;

type CanvasNodeData = {
  label: string;
  nodeDefinitionId: string;
  config: Record<string, unknown>;
  persisted: boolean;
};

function toCanvas(workflow: Workflow): { nodes: FlowNode<CanvasNodeData>[]; edges: FlowEdge[] } {
  const nodes = workflow.nodes.map((node, index) => ({
    id: node.id,
    type: "default",
    position: {
      x: 80 + (index % 3) * 260,
      y: 80 + Math.floor(index / 3) * 150
    },
    data: {
      label: node.nodeDefinitionId,
      nodeDefinitionId: node.nodeDefinitionId,
      config: node.config ?? {},
      persisted: true
    }
  }));
  const edges = workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.fromNode,
    target: edge.toNode,
    animated: true
  }));
  return { nodes, edges };
}

export function WorkflowBuilder({ workflowId }: { workflowId?: string }) {
  const queryClient = useQueryClient();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const nodeDefinitions = useQuery({
    queryKey: queryKeys.nodeDefinitions,
    queryFn: api.nodeDefinitions.list
  });

  const workflow = useQuery({
    queryKey: workflowId ? queryKeys.workflow(workflowId) : ["workflow", "new"],
    queryFn: () => (workflowId ? api.workflows.get(workflowId) : Promise.resolve(null)),
    enabled: !!workflowId
  });

  const form = useForm<WorkflowForm>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { name: "Untitled workflow" }
  });

  useEffect(() => {
    if (workflow.data) {
      form.reset({ name: workflow.data.name });
      const canvas = toCanvas(workflow.data);
      setNodes(canvas.nodes);
      setEdges(canvas.edges);
    }
  }, [form, setEdges, setNodes, workflow.data]);

  const selectedNode = useMemo(() => nodes.find((node) => node.selected), [nodes]);

  const removeNodeFromCanvas = (nodeId: string) => {
    setNodes((current) => current.filter((item) => item.id !== nodeId));
    setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const deleteNode = useMutation({
    mutationFn: api.workflows.deleteNode,
    onSuccess: (_, nodeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      if (workflowId) queryClient.invalidateQueries({ queryKey: queryKeys.workflow(workflowId) });
      toast.success("Node removed", { description: nodeId.slice(0, 8) });
    },
    onError: (error) => {
      toast.error("Node deletion failed", { description: error.message });
      if (workflowId) queryClient.invalidateQueries({ queryKey: queryKeys.workflow(workflowId) });
    }
  });

  const removeNode = (nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId);
    removeNodeFromCanvas(nodeId);
    if (node?.data.persisted) {
      deleteNode.mutate(nodeId);
    }
  };

  const handleNodesDelete = (deletedNodes: FlowNode<CanvasNodeData>[]) => {
    const deletedIds = new Set(deletedNodes.map((node) => node.id));
    setEdges((current) => current.filter((edge) => !deletedIds.has(edge.source) && !deletedIds.has(edge.target)));
    deletedNodes
      .filter((node) => node.data.persisted)
      .forEach((node) => deleteNode.mutate(node.id));
  };

  const addNode = (nodeDefinition: NodeDefinition) => {
    const id = `temp-${crypto.randomUUID()}`;
    setNodes((current) => [
      ...current,
      {
        id,
        type: "default",
        position: { x: 120 + current.length * 24, y: 120 + current.length * 24 },
        data: {
          label: nodeDefinition.name,
          nodeDefinitionId: nodeDefinition.id,
          config: {},
          persisted: false
        }
      }
    ]);
  };

  const onConnect = (connection: Connection) => {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: `temp-${crypto.randomUUID()}`,
          animated: true
        },
        current
      )
    );
  };

  const save = useMutation({
    mutationFn: async (values: WorkflowForm) => {
      const activeWorkflow = workflowId ? workflow.data ?? (await api.workflows.get(workflowId)) : await api.workflows.create(values);
      const idMap = new Map<string, string>();

      for (const node of nodes) {
        if (!node.id.startsWith("temp-")) {
          idMap.set(node.id, node.id);
          continue;
        }
        const persisted = await api.workflows.addNode({
          workflowId: activeWorkflow.id,
          nodeDefinitionId: node.data.nodeDefinitionId,
          config: node.data.config
        });
        idMap.set(node.id, persisted.id);
      }

      for (const edge of edges) {
        if (!edge.id.startsWith("temp-")) continue;
        const fromNode = idMap.get(edge.source);
        const toNode = idMap.get(edge.target);
        if (fromNode && toNode) {
          await api.workflows.addEdge({ workflowId: activeWorkflow.id, fromNode, toNode });
        }
      }

      return api.workflows.get(activeWorkflow.id);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      queryClient.setQueryData(queryKeys.workflow(saved.id), saved);
      const canvas = toCanvas(saved);
      setNodes(canvas.nodes);
      setEdges(canvas.edges);
      toast.success("Workflow saved", { description: saved.name });
    },
    onError: (error) => toast.error("Save failed", { description: error.message })
  });

  const isLoading = workflow.isLoading || nodeDefinitions.isLoading;
  const hasError = workflow.isError || nodeDefinitions.isError;

  return (
    <main>
      <PageHeader
        eyebrow="DAG builder"
        title={workflowId ? workflow.data?.name ?? "Workflow" : "New workflow"}
        description="Add backend node definitions and connect them into a DAG. Canvas coordinates are local until the backend adds persisted layout fields."
        icon={GitBranch}
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setPaletteOpen((current) => !current)}>
              {paletteOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              Palette
            </Button>
            <Button type="button" variant="outline" onClick={() => setDetailsOpen((current) => !current)}>
              {detailsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              Details
            </Button>
            <Button onClick={form.handleSubmit((values) => save.mutate(values))} disabled={save.isPending || nodes.length === 0}>
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving..." : "Save graph"}
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-[680px]" />
      ) : hasError ? (
        <EmptyState icon={WorkflowIcon} title="Workflow builder could not load" description="Check the backend connection and try again." />
      ) : (
        <div
          className={cn(
            "grid min-h-[calc(100vh-11rem)] gap-4",
            paletteOpen && detailsOpen && "xl:grid-cols-[300px_minmax(0,1fr)_310px]",
            paletteOpen && !detailsOpen && "xl:grid-cols-[300px_minmax(0,1fr)]",
            !paletteOpen && detailsOpen && "xl:grid-cols-[minmax(0,1fr)_310px]",
            !paletteOpen && !detailsOpen && "xl:grid-cols-1"
          )}
        >
          {paletteOpen ? (
            <Card className="max-h-[calc(100vh-11rem)] overflow-hidden border-sky-200/80">
              <CardHeader className="flex flex-row items-start justify-between gap-3 bg-sky-50/70">
                <div>
                  <CardTitle>Node palette</CardTitle>
                  <CardDescription>{nodeDefinitions.data?.length ?? 0} backend definitions</CardDescription>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setPaletteOpen(false)} aria-label="Collapse node palette">
                  <PanelLeftClose className="h-4 w-4" aria-hidden />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto pt-5">
                {nodeDefinitions.data?.map((nodeDefinition) => (
                  <button
                    key={nodeDefinition.id}
                    type="button"
                    className="w-full rounded-md border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm"
                    onClick={() => addNode(nodeDefinition)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{nodeDefinition.name}</span>
                      <Plus className="h-4 w-4 text-primary" aria-hidden />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{nodeDefinition.description}</p>
                    <Badge className="mt-2" variant="default">
                      {nodeDefinition.category ?? "general"}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card className="flex h-[calc(100vh-11rem)] min-h-[620px] flex-col overflow-hidden border-teal-200/80">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-teal-50 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{nodes.length} nodes</Badge>
                <Badge variant="violet">{edges.length} edges</Badge>
                <Badge variant="emerald">{nodeDefinitions.data?.length ?? 0} definitions</Badge>
              </div>
              <div className="flex gap-2">
                {!paletteOpen ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
                    <PanelLeftOpen className="h-4 w-4" aria-hidden />
                    Palette
                  </Button>
                ) : null}
                {!detailsOpen ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setDetailsOpen(true)}>
                    <PanelRightOpen className="h-4 w-4" aria-hidden />
                    Details
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodesDelete={handleNodesDelete}
                fitView
              >
                <Background color="#b6c8d2" gap={22} />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            </div>
          </Card>

          {detailsOpen ? (
          <Card className="border-amber-200/80">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Graph details</CardTitle>
                  <CardDescription>Validated against available backend routes.</CardDescription>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setDetailsOpen(false)} aria-label="Collapse graph details">
                  <PanelRightClose className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-2">
                <Label htmlFor="workflow-name">Workflow name</Label>
                <Input id="workflow-name" {...form.register("name")} disabled={!!workflowId} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-red-300">{form.formState.errors.name.message}</p>
                ) : null}
              </form>
              <div className="flex flex-wrap gap-2">
                <Badge>{nodes.length} nodes</Badge>
                <Badge variant="violet">{edges.length} edges</Badge>
                <Badge variant="amber">Layout TODO</Badge>
              </div>
              <AnimatePresence mode="wait">
                {selectedNode ? (
                  <motion.div
                    key={selectedNode.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Layers3 className="h-4 w-4 text-primary" aria-hidden />
                        {selectedNode.data.label}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label={`Remove ${selectedNode.data.label}`}
                        disabled={deleteNode.isPending}
                        onClick={() => removeNode(selectedNode.id)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{selectedNode.data.nodeDefinitionId}</p>
                    <Badge className="mt-3" variant={selectedNode.data.persisted ? "emerald" : "amber"}>
                      {selectedNode.data.persisted ? "Persisted" : "Unsaved"}
                    </Badge>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Use the trash button or keyboard Delete/Backspace to remove selected nodes from the canvas.
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    Select a node to inspect it.
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          ) : null}
        </div>
      )}
    </main>
  );
}

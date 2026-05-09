import { WorkflowBuilder } from "@/components/workflows/workflow-builder";

export default function WorkflowBuilderPage({ params }: { params: { workflowId: string } }) {
  return <WorkflowBuilder workflowId={params.workflowId === "new" ? undefined : params.workflowId} />;
}

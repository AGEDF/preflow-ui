"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, FileUp, HardDrive } from "lucide-react";
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
import { formatDate, shortId } from "@/lib/utils";

const datasetSchema = z.object({
  name: z.string().min(2, "Dataset name is required"),
  file: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Select one dataset file")
    .refine((files) => {
      const file = files?.item(0);
      return !!file && /\.(csv|json|parquet)$/i.test(file.name);
    }, "Use a CSV, JSON, or Parquet file")
});

type DatasetForm = z.infer<typeof datasetSchema>;

export function DatasetManager() {
  const queryClient = useQueryClient();
  const datasets = useQuery({
    queryKey: queryKeys.datasets,
    queryFn: api.datasets.list
  });
  const datasetItems = datasets.data ?? [];

  const form = useForm<DatasetForm>({
    resolver: zodResolver(datasetSchema)
  });

  const upload = useMutation({
    mutationFn: ({ name, file }: { name: string; file: File }) => api.datasets.upload({ name, file }),
    onSuccess: (dataset) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      form.reset();
      toast.success("Dataset uploaded", { description: dataset.name });
    },
    onError: (error) => toast.error("Upload failed", { description: error.message })
  });

  return (
    <main>
      <PageHeader
        eyebrow="Dataset registry"
        title="Upload data for execution"
        description="The backend stores dataset metadata and the uploaded file path. Preview and delete actions are marked as TODOs until backend routes exist."
        icon={Database}
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload dataset</CardTitle>
            <CardDescription>Required fields: name and file.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => {
                const file = values.file.item(0);
                if (file) upload.mutate({ name: values.name, file });
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="dataset-name">Name</Label>
                <Input id="dataset-name" placeholder="raw-customers-may" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-red-300">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataset-file">File</Label>
                <Input id="dataset-file" type="file" accept=".csv,.json,.parquet" {...form.register("file")} />
                {form.formState.errors.file ? (
                  <p className="text-sm text-red-300">{form.formState.errors.file.message}</p>
                ) : null}
              </div>

              <Button className="w-full" disabled={upload.isPending}>
                <FileUp className="h-4 w-4" />
                {upload.isPending ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          {datasets.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)
          ) : datasets.isError ? (
            <EmptyState icon={HardDrive} title="Datasets could not be loaded" description={datasets.error.message} />
          ) : datasetItems.length === 0 ? (
            <EmptyState icon={HardDrive} title="No datasets uploaded" description="Upload a file to make it available for workflow execution." />
          ) : (
            datasetItems.map((dataset) => (
              <Card key={dataset.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{dataset.name}</CardTitle>
                    <CardDescription>ID {shortId(dataset.id)} - Created {formatDate(dataset.createdAt)}</CardDescription>
                  </div>
                  <Badge variant="emerald">{dataset.fileFormat}</Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge>v{dataset.version}</Badge>
                  <Badge variant="muted">Stored path available</Badge>
                  <Badge variant="amber">Preview TODO</Badge>
                  <Badge variant="amber">Delete TODO</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

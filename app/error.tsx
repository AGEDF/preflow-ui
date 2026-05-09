"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="glass max-w-lg rounded-lg p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" aria-hidden />
        <h1 className="text-2xl font-semibold">Something slipped out of place.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </section>
    </main>
  );
}

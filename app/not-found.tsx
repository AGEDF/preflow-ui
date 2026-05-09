import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="glass max-w-md rounded-lg p-8 text-center">
        <Compass className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden />
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">That route is not part of this workflow.</p>
        <Button className="mt-6" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </section>
    </main>
  );
}

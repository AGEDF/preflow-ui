import Link from "next/link";
import { Database, GitBranch, PlayCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

const cards = [
  {
    title: "Design workflows",
    description: "Compose preprocessing DAGs from backend-backed node definitions.",
    href: "/workflows",
    icon: GitBranch
  },
  {
    title: "Upload datasets",
    description: "Register CSV, JSON, and Parquet inputs through the Spring Boot engine.",
    href: "/datasets",
    icon: Database
  },
  {
    title: "Run jobs",
    description: "Launch workflow executions and poll live status through the proxy layer.",
    href: "/jobs",
    icon: PlayCircle
  }
];

export default function HomePage() {
  return (
    <main>
      <PageHeader
        eyebrow="Production rebuild"
        title="Preflow orchestration, rebuilt cleanly."
        description="A clear control surface for DAG-based ML preprocessing. Every request goes through the Next.js proxy and maps to verified backend routes."
        icon={ShieldCheck}
        action={
          <Button asChild>
            <Link href="/workflows">Create workflow</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-glow">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-sky-100 bg-sky-50 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href={card.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}

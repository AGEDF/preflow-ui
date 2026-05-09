import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <Badge variant="muted" className="mb-3 gap-1.5">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {eyebrow}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </section>
  );
}

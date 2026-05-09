"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Database, GitBranch, Home, PlayCircle, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/jobs", label: "Jobs", icon: PlayCircle }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkflowBuilder = pathname.startsWith("/workflows/") && pathname !== "/workflows";

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Preflow home">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
              <Workflow className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide text-slate-900">Preflow</span>
              <span className="block text-xs text-muted-foreground">DAG preprocessing studio</span>
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-3">
            <nav className="flex max-w-full gap-1 overflow-x-auto rounded-md border border-slate-200 bg-slate-50/80 p-1" aria-label="Primary navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground",
                    active && "text-foreground shadow-sm"
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-white"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  ) : null}
                  <Icon className="relative h-4 w-4" aria-hidden />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 xl:flex">
              <Activity className="h-3.5 w-3.5" aria-hidden />
              Backend via proxy
            </div>
          </div>
        </div>
      </header>

      <div className={cn("mx-auto px-4 py-6 sm:px-6 lg:px-8", isWorkflowBuilder ? "max-w-[1840px]" : "max-w-[1600px]")}>
        <div>{children}</div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Overview" }; // noindex comes from admin/layout.tsx

const PLACEHOLDER_STATS = [
  { label: "Published projects", hint: "projects WHERE published" },
  { label: "Playground runs (24h)", hint: "playground_runs by created_at" },
  { label: "Rate-limited requests", hint: "status = rate_limited" },
];

export default function AdminOverviewPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Admin dashboard scaffold — widgets are wired in the next iteration.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_STATS.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">—</CardTitle>
              <CardDescription className="font-mono text-xs">{s.hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

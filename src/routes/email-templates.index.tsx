import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  History,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateThumb } from "@/components/coverage/TemplateThumb";
import { TemplatePanel } from "@/components/coverage/TemplatePanel";
import {
  PRODUCT_TEMPLATE_CATALOG,
  findProduct,
  productStages,
  productStats,
  type TemplateSlot,
} from "@/lib/email-templates/catalog";


const searchSchema = z.object({
  trigger: z.string().optional(),
  status: z.enum(["all", "ready", "missing"]).optional(),
});

export const Route = createFileRoute("/email-templates/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Email Template Coverage — Exante Admin" },
      {
        name: "description",
        content:
          "See at a glance which email templates exist and which are missing across every product journey.",
      },
      { property: "og:title", content: "Email Template Coverage — Exante Admin" },
      {
        property: "og:description",
        content:
          "Track email template coverage across products and customer journeys.",
      },
    ],
  }),
  component: CoverageDashboard,
});

function StatCard({
  label,
  value,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "ready" | "missing";
  icon: React.ElementType;
}) {
  const toneClass =
    tone === "ready"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "missing"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${toneClass}`} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

function NodeCard({
  slot,
  onSelect,
}: {
  slot: TemplateSlot;
  onSelect: () => void;
}) {
  const ready = slot.status === "ready";
  return (
    <button
      onClick={onSelect}
      className={`group w-[248px] shrink-0 rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        ready
          ? "hover:border-primary/50"
          : "border-dashed border-amber-500/50 bg-amber-500/[0.04] hover:border-amber-500"
      }`}
    >
      {ready && slot.html ? (
        <TemplateThumb html={slot.html} title={slot.name} />
      ) : (
        <div className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-amber-500/40 bg-background/60">
          <FilePlus2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
            Create template
          </span>
        </div>
      )}
      <div className="mt-3 space-y-1">
        <div className="truncate text-sm font-semibold">{slot.name}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground">
          {slot.description ?? "No description"}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            ready
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          {ready ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          {ready ? "Template ready" : "Template missing"}
        </span>
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {slot.event}
        </span>
      </div>
    </button>
  );
}

function CoverageDashboard() {
  const { trigger, status = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/email-templates" });
  const [selected, setSelected] = useState<TemplateSlot | null>(null);

  const product = useMemo(() => findProduct(trigger ?? ""), [trigger]);
  const stats = useMemo(() => productStats(product), [product]);

  const stages = useMemo(
    () =>
      productStages(product).map((s) => ({
        ...s,
        slots: s.slots.filter((x) => status === "all" || x.status === status),
      })),
    [product, status],
  );


  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-[1500px] px-6 py-7">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 lg:flex lg:flex-wrap lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Email operations
              </div>
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                Email Template Coverage
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Manage and track email templates across your products and customer
                journeys.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              <Select
                value={product.trigger}
                onValueChange={(v) =>
                  navigate({ search: (s) => ({ ...s, trigger: v }) })
                }
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TEMPLATE_CATALOG.map((p) => {
                    const s = productStats(p);
                    return (
                      <SelectItem key={p.trigger} value={p.trigger}>
                        {p.product} · {s.ready}/{s.total}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button asChild variant="ghost" size="sm" className="self-end">
                <Link to="/email-templates/v1">
                  <History className="mr-1 h-4 w-4" /> Version 1 browser
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              {product.trigger}
            </span>
            <div className="flex min-w-[220px] flex-1 items-center gap-3">
              <Progress value={stats.coverage} className="h-2 flex-1" />
              <span className="whitespace-nowrap text-sm font-medium tabular-nums">
                {stats.ready} / {stats.total} templates ready
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Email events"
              value={String(stats.total)}
              icon={LayoutTemplate}
            />
            <StatCard
              label="Ready"
              value={String(stats.ready)}
              tone="ready"
              icon={CheckCircle2}
            />
            <StatCard
              label="Missing"
              value={String(stats.missing)}
              tone="missing"
              icon={AlertTriangle}
            />
            <StatCard
              label="Coverage"
              value={`${stats.coverage}%`}
              icon={Sparkles}
            />
          </div>
        </div>
      </header>

      {/* Flow */}
      <main className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Customer journey
          </h2>
          <Tabs
            value={status}
            onValueChange={(v) =>
              navigate({ search: (s) => ({ ...s, status: v as "all" }) })
            }
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="missing">Missing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="-mx-6 overflow-x-auto px-6 pb-6">
          <div className="flex min-w-max flex-col gap-6 lg:flex-row lg:items-start">
            {stages.map((stage, i) => (
              <div key={stage.label} className="flex items-start gap-6">
                <section className="w-[280px] shrink-0 rounded-2xl border bg-background/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                          {i + 1}
                        </span>
                        <h3 className="truncate text-sm font-semibold">
                          {stage.label}
                        </h3>
                      </div>
                    </div>
                    <Badge
                      variant={stage.kind === "core" ? "secondary" : "outline"}
                      className="text-[10px] uppercase"
                    >
                      {stage.kind}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-3">
                    {stage.slots.map((slot) => (
                      <NodeCard
                        key={slot.templateName}
                        slot={slot}
                        onSelect={() => setSelected(slot)}
                      />
                    ))}
                  </div>
                </section>
                {i < stages.length - 1 && (
                  <div className="hidden shrink-0 items-center self-center lg:flex">
                    <span className="h-px w-4 bg-border" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                )}
              </div>
            ))}
            {stages.length === 0 && (
              <div className="w-full rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                No email events match this filter.
              </div>
            )}
          </div>
        </div>
      </main>

      <TemplatePanel
        slot={selected}
        product={product}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

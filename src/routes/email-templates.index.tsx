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
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateThumb } from "@/components/coverage/TemplateThumb";
import { TemplatePanel } from "@/components/coverage/TemplatePanel";
import {
  NewTemplateDialog,
  type NewTemplatePreset,
} from "@/components/coverage/NewTemplateDialog";
import type { StageId } from "@/lib/email-templates/schema";
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
  active,
  onClick,
}: {
  label: string;
  value: string;
  tone?: "default" | "ready" | "pending" | "missing";
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    default: {
      wrap: "bg-card hover:bg-muted/60",
      on: "border-primary bg-primary/10 ring-1 ring-primary/40",
      text: "text-foreground",
    },
    ready: {
      wrap: "bg-emerald-500/5 hover:bg-emerald-500/10",
      on: "border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/40",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    pending: {
      wrap: "bg-sky-500/5 hover:bg-sky-500/10",
      on: "border-sky-500 bg-sky-500/15 ring-1 ring-sky-500/40",
      text: "text-sky-600 dark:text-sky-400",
    },
    missing: {
      wrap: "bg-amber-500/5 hover:bg-amber-500/10",
      on: "border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/40",
      text: "text-amber-600 dark:text-amber-400",
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-[74px] rounded-xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 ${
        active ? tones.on : tones.wrap
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${tones.text}`} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${tones.text}`}>
        {value}
      </div>
    </button>
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
  const [newOpen, setNewOpen] = useState(false);
  const [newPreset, setNewPreset] = useState<NewTemplatePreset | undefined>(
    undefined,
  );

  const product = useMemo(() => findProduct(trigger ?? ""), [trigger]);

  const openNewTemplate = (stageId?: string) => {
    if (stageId === "policy") {
      // "policy-ready" lives under the account stage in the canonical schema
      setNewPreset({
        product: product.trigger,
        stage: "account",
        event: "policy-ready",
      });
    } else if (stageId) {
      setNewPreset({ product: product.trigger, stage: stageId as StageId });
    } else {
      setNewPreset({ product: product.trigger });
    }
    setNewOpen(true);
  };
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
              <div className="flex items-center gap-2 self-end">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/email-templates/v1">
                    <History className="mr-1 h-4 w-4" /> Version 1 browser
                  </Link>
                </Button>
                <Button size="sm" onClick={() => openNewTemplate()}>
                  <Plus className="mr-1 h-4 w-4" /> New template
                </Button>
              </div>
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

        <div className="pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stages.map((stage, i) => (
              <section
                key={stage.id}
                className="relative min-w-0 rounded-2xl border bg-background/60 p-4"
              >
                {i < stages.length - 1 && (
                  <div className="pointer-events-none absolute -right-4 top-7 hidden w-4 items-center xl:flex">
                    <span className="h-px w-2 bg-border" />
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                )}
                <div className="mb-1 flex items-center gap-2">
                  <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-md bg-primary/10 px-1 font-mono text-[10px] font-semibold text-primary">
                    {stage.index}
                  </span>
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {stage.label}
                  </span>
                </div>
                <div className="mb-3 flex items-end justify-between gap-2 border-b pb-3">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {stage.subtitle}
                  </h3>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {stage.slots.length}{" "}
                    {stage.slots.length === 1 ? "event" : "events"}
                  </span>
                </div>
                <div className="mb-3 text-[11px] text-muted-foreground">
                  {stage.summary}
                </div>
                <div className="flex flex-col gap-3">
                  {stage.slots.map((slot) => (
                    <NodeCard
                      key={slot.templateName}
                      slot={slot}
                      onSelect={() => setSelected(slot)}
                    />
                  ))}
                  {stage.slots.length === 0 && (
                    <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                      No events
                    </div>
                  )}
                  <button
                    onClick={() => openNewTemplate(stage.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed p-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/[0.04] hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" /> New template
                  </button>
                </div>
              </section>
            ))}


          </div>
        </div>
      </main>

      <TemplatePanel
        slot={selected}
        product={product}
        onOpenChange={(open) => !open && setSelected(null)}
      />
      <NewTemplateDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        preset={newPreset}
      />
    </div>
  );
}

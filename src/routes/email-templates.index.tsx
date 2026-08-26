import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FilePlus2,
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
  status: z.enum(["all", "ready", "pending", "missing"]).optional(),
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
  const pending = slot.status === "pending";
  return (
    <button
      onClick={onSelect}
      className={`group w-full rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        ready
          ? "hover:border-primary/50"
          : pending
            ? "border-sky-500/50 bg-sky-500/[0.05] hover:border-sky-500"
            : "border-dashed border-amber-500/50 bg-amber-500/[0.04] hover:border-amber-500"
      }`}
    >
      {ready && slot.html ? (
        <TemplateThumb html={slot.html} title={slot.name} />
      ) : (
        <div
          className={`flex h-24 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed bg-background/60 ${
            pending ? "border-sky-500/40" : "border-amber-500/40"
          }`}
        >
          {pending ? (
            <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          ) : (
            <FilePlus2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          )}
          <span
            className={`text-[11px] font-medium ${
              pending
                ? "text-sky-700 dark:text-sky-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {pending ? "In review" : "Create template"}
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
              : pending
                ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          {ready ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : pending ? (
            <Clock className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          {ready ? "Template ready" : pending ? "In review" : "Template missing"}
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


  const setStatus = (v: "all" | "ready" | "pending" | "missing") =>
    navigate({ search: (s) => ({ ...s, status: v }) });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-[1500px] px-6 py-6">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Email operations
          </div>

          <div className="rounded-2xl border bg-card/60 p-2">
            <div className="grid gap-2 md:grid-cols-[minmax(240px,340px)_repeat(4,minmax(0,1fr))]">
              <div className="flex min-w-0 flex-col justify-center rounded-xl border bg-background px-3 py-2">
                <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Product
                </span>
                <Select
                  value={product.trigger}
                  onValueChange={(v) =>
                    navigate({ search: (s) => ({ ...s, trigger: v }) })
                  }
                >
                  <SelectTrigger className="h-8 w-full border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TEMPLATE_CATALOG.map((p) => (
                      <SelectItem key={p.trigger} value={p.trigger}>
                        {p.product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <StatCard
                label="All emails"
                value={String(stats.total)}
                icon={LayoutTemplate}
                active={status === "all"}
                onClick={() => setStatus("all")}
              />
              <StatCard
                label="Ready"
                value={String(stats.ready)}
                tone="ready"
                icon={CheckCircle2}
                active={status === "ready"}
                onClick={() => setStatus(status === "ready" ? "all" : "ready")}
              />
              <StatCard
                label="In review"
                value={String(stats.pending)}
                tone="pending"
                icon={Clock}
                active={status === "pending"}
                onClick={() =>
                  setStatus(status === "pending" ? "all" : "pending")
                }
              />
              <StatCard
                label="Missing"
                value={String(stats.missing)}
                tone="missing"
                icon={AlertTriangle}
                active={status === "missing"}
                onClick={() =>
                  setStatus(status === "missing" ? "all" : "missing")
                }
              />
            </div>
          </div>

          <div className="mt-3 font-mono text-[11px] text-muted-foreground">
            {product.trigger}
          </div>
        </div>
      </header>

      {/* Flow */}
      <main className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Customer journey
          </h2>
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

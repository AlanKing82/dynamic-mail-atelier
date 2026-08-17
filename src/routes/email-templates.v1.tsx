import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Eye, Code2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  templatesQueryOptions,
  duplicateTemplate,
} from "@/lib/email-templates/service";
import type { EmailTemplate } from "@/lib/email-templates/types";

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute("/email-templates/v1")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(templatesQueryOptions()),
  component: TemplatesBrowser,
});

function TemplatesBrowser() {
  const { data: templates } = useSuspenseQuery(templatesQueryOptions());
  const { id: selectedId } = Route.useSearch();
  const navigate = useNavigate({ from: "/email-templates/v1" });
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [product, setProduct] = useState<string>("all");
  const [trigger, setTrigger] = useState<string>("all");
  const [event, setEvent] = useState<string>("all");
  const [viewSource, setViewSource] = useState(false);

  const products = useMemo(
    () => Array.from(new Set(templates.map((t) => t.product))),
    [templates],
  );
  const triggers = useMemo(
    () =>
      Array.from(
        new Set(
          templates
            .filter((t) => product === "all" || t.product === product)
            .map((t) => t.trigger),
        ),
      ),
    [templates, product],
  );
  const events = useMemo(
    () =>
      Array.from(
        new Set(
          templates
            .filter(
              (t) =>
                (product === "all" || t.product === product) &&
                (trigger === "all" || t.trigger === trigger),
            )
            .map((t) => t.event),
        ),
      ),
    [templates, product, trigger],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (product !== "all" && t.product !== product) return false;
      if (trigger !== "all" && t.trigger !== trigger) return false;
      if (event !== "all" && t.event !== event) return false;
      if (q) {
        const hay = `${t.name} ${t.product} ${t.trigger} ${t.event}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [templates, search, product, trigger, event]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, EmailTemplate[]>>();
    for (const t of filtered) {
      if (!map.has(t.product)) map.set(t.product, new Map());
      const inner = map.get(t.product)!;
      if (!inner.has(t.trigger)) inner.set(t.trigger, []);
      inner.get(t.trigger)!.push(t);
    }
    return map;
  }, [filtered]);

  const selected =
    templates.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const handleDuplicate = () => {
    if (!selected) return;
    const copy = duplicateTemplate(selected);
    queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    toast.success(`Duplicated "${selected.name}"`);
    navigate({ to: "/email-builder/$id", params: { id: copy.id } });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left panel */}
      <aside className="w-[340px] border-r flex flex-col bg-background">
        <div className="p-4 space-y-3 border-b">
          <Input
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={product}
              onValueChange={(v) => {
                setProduct(v);
                setTrigger("all");
                setEvent("all");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={trigger} onValueChange={(v) => { setTrigger(v); setEvent("all"); }}>
              <SelectTrigger><SelectValue placeholder="Trigger" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All triggers</SelectItem>
                {triggers.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={event} onValueChange={setEvent}>
              <SelectTrigger><SelectValue placeholder="Event" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {events.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            {Array.from(grouped.entries()).map(([prod, triggerMap]) => (
              <div key={prod}>
                <div className="px-2 pt-2 pb-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  {prod}
                </div>
                {Array.from(triggerMap.entries()).map(([trg, list]) => (
                  <div key={trg} className="mb-2">
                    <div className="px-2 py-1 text-[10px] font-mono text-muted-foreground truncate" title={trg}>
                      {trg}
                    </div>
                    {list.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate({ search: { id: t.id } })}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors flex items-center justify-between gap-2 ${
                          selected?.id === t.id ? "bg-accent" : ""
                        }`}
                      >
                        <span className="truncate">
                          <span className="text-muted-foreground">{t.event}</span>
                          <span className="mx-1 text-muted-foreground/50">·</span>
                          <span className="font-medium">{t.name}</span>
                        </span>
                        {t.source === "user" && (
                          <Badge variant="secondary" className="text-[10px]">custom</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No templates match these filters.
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Right preview */}
      <section className="flex-1 min-w-0 flex flex-col bg-muted/30">
        {selected ? (
          <>
            <div className="p-4 border-b bg-background">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">{selected.name}</h2>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span><b className="text-foreground">Product:</b> {selected.product}</span>
                    <span><b className="text-foreground">Event:</b> {selected.event}</span>
                    <span className="font-mono"><b className="text-foreground font-sans">Trigger:</b> {selected.trigger}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewSource ? "outline" : "default"}
                    size="sm"
                    onClick={() => setViewSource(false)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                  <Button
                    variant={viewSource ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewSource(true)}
                  >
                    <Code2 className="h-4 w-4 mr-1" /> Source
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-1" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate({ to: "/email-builder/$id", params: { id: selected.id } })
                    }
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit in builder
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {viewSource ? (
                <pre className="p-4 text-xs whitespace-pre-wrap font-mono bg-background m-4 rounded border">
                  {selected.html}
                </pre>
              ) : (
                <div className="flex justify-center py-8 px-4">
                  <div className="bg-white shadow-sm" style={{ width: "100%", maxWidth: 550 }}>
                    <iframe
                      title={selected.name}
                      srcDoc={selected.html}
                      sandbox="allow-same-origin"
                      className="w-full block border-0"
                      style={{ height: 700 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a template to preview.
          </div>
        )}
      </section>
    </div>
  );
}

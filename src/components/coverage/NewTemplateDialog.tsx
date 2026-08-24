import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, FolderGit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  eventsForProduct,
  expectedFilesFor,
  productsForUI,
  stagesForProduct,
  suggestFileName,
  suggestName,
  templatePath,
  STAGE_LABELS,
  TEMPLATE_FORMATS,
  type StageId,
  type TemplateFormat,
} from "@/lib/email-templates/schema";
import { findProduct } from "@/lib/email-templates/catalog";

export interface NewTemplatePreset {
  /** Product trigger id, e.g. ETIT-TRIGGER-EXTREME-TEMPERATURE */
  product?: string;
  stage?: StageId;
  event?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset?: NewTemplatePreset;
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function NewTemplateDialog({ open, onOpenChange, preset }: Props) {
  const navigate = useNavigate();
  const products = useMemo(() => productsForUI(), []);

  const [product, setProduct] = useState(products[0]?.trigger ?? "");
  const [stage, setStage] = useState<StageId | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [customFile, setCustomFile] = useState(false);
  const [format, setFormat] = useState<TemplateFormat>("html");
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  // Reset the form each time the dialog opens, applying any preset.
  useEffect(() => {
    if (!open) return;
    const validProduct =
      preset?.product && products.some((p) => p.trigger === preset.product)
        ? preset.product
        : (products[0]?.trigger ?? "");
    setProduct(validProduct);
    setStage(preset?.stage ?? null);
    setEventName(preset?.event ?? null);
    setFileName("");
    setCustomFile(false);
    setFormat("html");
    setName("");
    setNameTouched(false);
  }, [open, preset, products]);

  const stages = useMemo(() => stagesForProduct(product), [product]);
  const effectiveStage: StageId | null =
    stage && stages.includes(stage) ? stage : (stages[0] ?? null);

  const events = useMemo(
    () => (effectiveStage ? eventsForProduct(product, effectiveStage) : []),
    [product, effectiveStage],
  );
  const effectiveEvent =
    eventName && (events.length === 0 || events.includes(eventName))
      ? eventName
      : (events[0] ?? (eventName ?? ""));

  const expected = useMemo(
    () =>
      effectiveStage && effectiveEvent
        ? expectedFilesFor(product, effectiveStage, effectiveEvent)
        : [],
    [product, effectiveStage, effectiveEvent],
  );

  const suggested =
    effectiveEvent && product
      ? (expected[0] ?? suggestFileName(product, effectiveEvent, format))
      : "";

  // Keep the file name in sync with selections unless the user typed a custom one.
  useEffect(() => {
    if (!customFile) setFileName(suggested);
  }, [suggested, customFile]);

  // Suggest a friendly template name from the file name until the user edits it.
  useEffect(() => {
    if (!nameTouched && fileName) setName(suggestName(fileName));
  }, [fileName, nameTouched]);

  const existing = useMemo(() => {
    if (!fileName) return null;
    const catalog = findProduct(product);
    return (
      catalog.categories
        .flatMap((c) => c.slots)
        .find((s) => s.fileName === fileName) ?? null
    );
  }, [product, fileName]);

  const path =
    product && effectiveStage && effectiveEvent && fileName
      ? templatePath(product, effectiveStage, effectiveEvent, format, fileName)
      : null;

  const canCreate = !!(product && effectiveStage && effectiveEvent && fileName);

  const handleCreate = () => {
    if (!canCreate || !effectiveStage) return;
    const displayName = products.find((p) => p.trigger === product)?.displayName;
    onOpenChange(false);
    navigate({
      to: "/email-builder",
      search: {
        product: displayName,
        trigger: product,
        stage: effectiveStage,
        event: effectiveEvent,
        fileName,
        format,
        name: name.trim() || suggestName(fileName),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </span>
            New email template
          </DialogTitle>
          <DialogDescription>
            Pick the product, journey stage and event — the storage location and
            file name are determined for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="nt-product">Product</Label>
            <Select
              value={product}
              onValueChange={(v) => {
                setProduct(v);
                setStage(null);
                setEventName(null);
                setCustomFile(false);
              }}
            >
              <SelectTrigger id="nt-product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.trigger} value={p.trigger}>
                    {p.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nt-stage">Stage</Label>
              <Select
                value={effectiveStage ?? ""}
                onValueChange={(v) => {
                  setStage(v as StageId);
                  setEventName(null);
                  setCustomFile(false);
                }}
              >
                <SelectTrigger id="nt-stage">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="nt-event">Event</Label>
              {events.length > 0 ? (
                <Select
                  value={effectiveEvent}
                  onValueChange={(v) => {
                    setEventName(v);
                    setCustomFile(false);
                  }}
                >
                  <SelectTrigger id="nt-event">
                    <SelectValue placeholder="Event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e} value={e}>
                        {humanize(e)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="nt-event"
                  value={effectiveEvent}
                  onChange={(e) => {
                    setEventName(e.target.value);
                    setCustomFile(false);
                  }}
                  placeholder="event-name"
                  className="font-mono text-xs"
                />
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="nt-file">File</Label>
              {expected.length > 0 && !customFile && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomFile(true);
                    setFileName(`${suggestFileName(product, effectiveEvent, format)}`);
                  }}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Use custom name
                </button>
              )}
              {customFile && expected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomFile(false)}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Choose from expected files
                </button>
              )}
            </div>
            {expected.length > 0 && !customFile ? (
              <Select value={fileName} onValueChange={setFileName}>
                <SelectTrigger id="nt-file" className="font-mono text-xs">
                  <SelectValue placeholder="Expected file" />
                </SelectTrigger>
                <SelectContent>
                  {expected.map((f) => (
                    <SelectItem key={f} value={f} className="font-mono text-xs">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="nt-file"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={suggested}
                className="font-mono text-xs"
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              {expected.length > 0 && !customFile
                ? "Files the system expects for this slot."
                : "Suggested from the product code and event."}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nt-name">Template name</Label>
              <Input
                id="nt-name"
                value={name}
                onChange={(e) => {
                  setNameTouched(true);
                  setName(e.target.value);
                }}
                placeholder="Template name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nt-format">Format</Label>
              <Select
                value={format}
                onValueChange={(v) => {
                  setFormat(v as TemplateFormat);
                  setCustomFile(false);
                }}
              >
                <SelectTrigger id="nt-format" className="w-[96px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      .{f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {path && (
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <FolderGit2 className="h-3 w-3" />
                Storage location
              </div>
              <div className="break-all font-mono text-[11px] leading-relaxed text-foreground">
                {path}
              </div>
              {existing?.status === "ready" && (
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  A ready template already uses this file name — creating will
                  add a new version.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            Create in builder
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

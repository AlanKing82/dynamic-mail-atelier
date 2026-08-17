import { Link } from "@tanstack/react-router";
import { CheckCircle2, FilePlus2, Pencil, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProductTemplateCatalog, TemplateSlot } from "@/lib/email-templates/catalog";

interface Props {
  slot: TemplateSlot | null;
  product: ProductTemplateCatalog;
  onOpenChange: (open: boolean) => void;
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`text-sm ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</div>
    </div>
  );
}

export function TemplatePanel({ slot, product, onOpenChange }: Props) {
  const ready = slot?.status === "ready";
  return (
    <Sheet open={!!slot} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        {slot && (
          <>
            <SheetHeader className="border-b p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={ready ? "secondary" : "destructive"} className="gap-1">
                  {ready ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {ready ? "Template ready" : "Template missing"}
                </Badge>
                <Badge variant="outline">{product.product}</Badge>
              </div>
              <SheetTitle className="text-xl">{slot.name}</SheetTitle>
              <SheetDescription>{slot.description}</SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-5 border-b p-6">
              <Meta label="Event" value={slot.event} mono />
              <Meta label="SES identifier" value={slot.templateName} mono />
              <Meta label="File name" value={slot.fileName} mono />
              <Meta
                label="Last updated"
                value={
                  slot.updatedAt
                    ? new Date(slot.updatedAt).toISOString().slice(0, 10)
                    : "—"
                }
              />
            </div>

            <div className="bg-muted/40 p-6">
              {ready && slot.html ? (
                <div className="mx-auto max-w-[550px] overflow-hidden rounded-lg border bg-background shadow-sm">
                  <iframe
                    title={slot.name}
                    srcDoc={slot.html}
                    sandbox=""
                    className="block w-full border-0"
                    style={{ height: 620 }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-background/60 px-6 py-16 text-center">
                  <FilePlus2 className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No template has been created yet</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Create this email in the builder. The product, event and SES identifier
                    will be pre-filled from this journey step.
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background p-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button asChild>
                <Link to="/email-builder">
                  {ready ? (
                    <>
                      <Pencil className="mr-1 h-4 w-4" /> Edit template
                    </>
                  ) : (
                    <>
                      <FilePlus2 className="mr-1 h-4 w-4" /> Create template
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

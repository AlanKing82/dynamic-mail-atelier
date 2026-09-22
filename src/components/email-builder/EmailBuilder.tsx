import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Type,
  Heading as HeadingIcon,
  Image as ImageIcon,
  MousePointerClick,
  Minus,
  Columns as ColumnsIcon,
  Save,
  Eye,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { renderBuilderDocToHtml, emptyDoc, newBlock } from "@/lib/email-templates/render";
import { saveTemplate } from "@/lib/email-templates/service";
import { TRIGGER_VARIABLES, SEED_TEMPLATES } from "@/lib/email-templates/seed";
import {
  productsForUI,
  schemaLocationForEvent,
  templatePath,
} from "@/lib/email-templates/schema";
import type {
  Block,
  BuilderDoc,
  EmailTemplate,
  BuilderBlockType,
} from "@/lib/email-templates/types";

interface BuilderPreset {
  product?: string;
  trigger?: string;
  stage?: string;
  event?: string;
  fileName?: string;
  format?: string;
  name?: string;
}

interface Props {
  initial?: EmailTemplate;
  preset?: BuilderPreset;
}

const COMPONENTS: { type: BuilderBlockType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "columns", label: "Columns", icon: ColumnsIcon },
  { type: "heading", label: "Heading", icon: HeadingIcon },
  { type: "text", label: "Text Block", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "divider", label: "Divider", icon: Minus },
];

const PRODUCTS = Array.from(
  new Set([
    ...SEED_TEMPLATES.map((t) => t.product),
    ...productsForUI().map((p) => p.displayName),
  ]),
);
const TRIGGERS = Array.from(
  new Set([
    ...Object.keys(TRIGGER_VARIABLES),
    ...productsForUI().map((p) => p.trigger),
  ]),
);

export function EmailBuilder({ initial, preset }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const readOnly = !!initial && !initial.json;

  const [id] = useState(() => initial?.id ?? crypto.randomUUID());
  const [name, setName] = useState(
    initial?.name ?? preset?.name ?? "Untitled template",
  );
  const [product, setProduct] = useState(
    initial?.product ?? preset?.product ?? PRODUCTS[0] ?? "",
  );
  const [trigger, setTrigger] = useState(
    initial?.trigger ?? preset?.trigger ?? TRIGGERS[0] ?? "",
  );
  const [eventName, setEventName] = useState(
    initial?.event ??
      (preset?.stage && preset?.event
        ? `${preset.stage}/${preset.event}`
        : (preset?.event ?? "trip/start")),
  );
  const [fileName, setFileName] = useState(
    initial?.fileName ?? preset?.fileName ?? "",
  );
  const [format] = useState<"html" | "json">(
    initial?.format ?? (preset?.format === "json" ? "json" : "html"),
  );
  const [doc, setDoc] = useState<BuilderDoc>(() => initial?.json ?? emptyDoc());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [tab, setTab] = useState<"components" | "properties" | "variables">("components");

  const selected = useMemo(
    () => doc.blocks.find((b) => b.id === selectedId) ?? null,
    [doc, selectedId],
  );

  const html = useMemo(() => renderBuilderDocToHtml(doc), [doc]);
  const variables = TRIGGER_VARIABLES[trigger] ?? [];
  const pathLocation = schemaLocationForEvent(eventName);

  useEffect(() => {
    if (selected) setTab("properties");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setDoc((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    }));
  };

  const removeBlock = (id: string) => {
    setDoc((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const onDropNew = (type: BuilderBlockType, index?: number) => {
    const block = newBlock(type);
    setDoc((d) => {
      const blocks = [...d.blocks];
      if (typeof index === "number") blocks.splice(index, 0, block);
      else blocks.push(block);
      return { ...d, blocks };
    });
    setSelectedId(block.id);
  };

  const handleSave = () => {
    const template: EmailTemplate = {
      id,
      name: name.trim() || "Untitled template",
      product,
      trigger,
      event: eventName,
      html,
      json: doc,
      fileName: fileName || undefined,
      format,
      source: "user",
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(template);
    queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    toast.success("Template saved");
  };

  const handleDuplicateFromReadOnly = () => {
    if (!initial) return;
    const copy: EmailTemplate = {
      ...initial,
      id: crypto.randomUUID(),
      name: `${initial.name} (copy)`,
      json: emptyDoc(),
      source: "user",
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(copy);
    queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    toast.success("Duplicated as new editable template");
    navigate({ to: "/email-builder/$id", params: { id: copy.id } });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="border-b bg-background p-3 flex flex-wrap items-center gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
          placeholder="Template name"
          disabled={readOnly}
        />
        <Select value={product} onValueChange={setProduct} disabled={readOnly}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Product" /></SelectTrigger>
          <SelectContent>
            {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={trigger} onValueChange={setTrigger} disabled={readOnly}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Trigger" /></SelectTrigger>
          <SelectContent>
            {TRIGGERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="max-w-[160px]"
          placeholder="event"
          disabled={readOnly}
        />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSource((s) => !s)}>
            {showSource ? <Eye className="h-4 w-4 mr-1" /> : <Code2 className="h-4 w-4 mr-1" />}
            {showSource ? "Preview" : "Source"}
          </Button>
          {readOnly ? (
            <Button size="sm" onClick={handleDuplicateFromReadOnly}>
              Duplicate as new
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          )}
        </div>
      </div>

      {fileName && (
        <div className="border-b bg-muted/30 px-4 py-1.5 font-mono text-[11px] text-muted-foreground">
          Saves to{" "}
          <span className="text-foreground">
            {templatePath(
              trigger,
              pathLocation.stage,
              pathLocation.event,
              format,
              fileName,
            )}
          </span>
        </div>
      )}

      {readOnly && (
        <Alert className="rounded-none border-x-0 border-t-0">
          <AlertDescription>
            This template cannot be fully converted into editable blocks. You can duplicate it and create a new template.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/40 p-6">
          {readOnly || showSource ? (
            showSource ? (
              <pre className="max-w-[900px] mx-auto p-4 text-xs whitespace-pre-wrap font-mono bg-background rounded border">
                {readOnly ? initial!.html : html}
              </pre>
            ) : (
              <div className="mx-auto bg-white shadow-sm" style={{ maxWidth: 550 }}>
                <iframe
                  title="preview"
                  srcDoc={initial!.html}
                  sandbox="allow-same-origin"
                  className="w-full block border-0"
                  style={{ height: 700 }}
                />
              </div>
            )
          ) : (
            <Canvas
              doc={doc}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDropNew={onDropNew}
              onRemove={removeBlock}
            />
          )}
        </div>

        {/* Right sidebar */}
        {!readOnly && (
          <aside className="w-[320px] border-l bg-background flex flex-col">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 m-3">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1">
                <TabsContent value="components" className="p-3 space-y-2 m-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    Drag a component into the canvas, or click to append.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPONENTS.map((c) => (
                      <div
                        key={c.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/x-block-type", c.type);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => onDropNew(c.type)}
                        className="border rounded-md p-3 flex flex-col items-center justify-center gap-2 cursor-grab hover:border-primary hover:bg-accent transition-colors"
                      >
                        <c.icon className="h-5 w-5" />
                        <span className="text-xs">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="properties" className="p-3 m-0">
                  {selected ? (
                    <PropertiesPanel block={selected} onChange={(patch) => updateBlock(selected.id, patch)} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a block on the canvas to edit its properties.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="variables" className="p-3 m-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    Available variables for <span className="font-mono">{trigger}</span>. Click to copy the token.
                  </p>
                  <div className="space-y-1">
                    {variables.map((v) => {
                      const token = `{{${v}}}`;
                      return (
                        <button
                          key={v}
                          className="w-full text-left px-2 py-1.5 text-xs font-mono rounded hover:bg-accent"
                          onClick={() => {
                            navigator.clipboard.writeText(token);
                            toast.success(`Copied ${token}`);
                          }}
                        >
                          {token}
                        </button>
                      );
                    })}
                    {variables.length === 0 && (
                      <p className="text-xs text-muted-foreground">No variables defined for this trigger.</p>
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </aside>
        )}
      </div>
    </div>
  );
}

function Canvas({
  doc,
  selectedId,
  onSelect,
  onDropNew,
  onRemove,
}: {
  doc: BuilderDoc;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDropNew: (t: BuilderBlockType, index?: number) => void;
  onRemove: (id: string) => void;
}) {
  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/x-block-type") as BuilderBlockType;
    if (type) onDropNew(type, index);
  };

  return (
    <div
      className="mx-auto bg-white shadow-sm min-h-[600px] p-6"
      style={{ maxWidth: 550 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      {doc.blocks.length === 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center text-sm text-muted-foreground"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 0)}
        >
          Drag a component here to start building your email.
        </div>
      )}
      {doc.blocks.map((b, i) => (
        <div key={b.id} className="group relative">
          <div
            className="h-2 -my-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation();
              handleDrop(e, i);
            }}
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(b.id);
            }}
            className={`relative rounded ring-offset-2 cursor-pointer ${
              selectedId === b.id ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-muted-foreground/30"
            }`}
          >
            <BlockPreview block={b} />
            {selectedId === b.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(b.id);
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded px-2 py-0.5"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3";
      const size = block.level === 1 ? 28 : block.level === 2 ? 22 : 18;
      return (
        <Tag
          style={{
            margin: "0 0 12px",
            fontSize: size,
            color: block.color,
            textAlign: block.align,
            fontWeight: 600,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {block.text}
        </Tag>
      );
    }
    case "text":
      return (
        <p
          style={{
            margin: "0 0 12px",
            color: block.color,
            textAlign: block.align,
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: "Arial, Helvetica, sans-serif",
            whiteSpace: "pre-wrap",
          }}
        >
          {block.text}
        </p>
      );
    case "image":
      return (
        <div style={{ textAlign: block.align, margin: "0 0 12px" }}>
          <img src={block.src} alt={block.alt} style={{ maxWidth: "100%", width: block.width }} />
        </div>
      );
    case "button":
      return (
        <div style={{ textAlign: block.align, margin: "16px 0" }}>
          <span
            style={{
              background: block.background,
              color: block.color,
              padding: "12px 24px",
              borderRadius: 6,
              display: "inline-block",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {block.label}
          </span>
        </div>
      );
    case "divider":
      return <hr style={{ border: "none", borderTop: `1px solid ${block.color}`, margin: "16px 0" }} />;
    case "columns":
      return (
        <div className="grid grid-cols-2 gap-3 my-3">
          <div className="border border-dashed rounded p-3 text-xs text-muted-foreground">Left column</div>
          <div className="border border-dashed rounded p-3 text-xs text-muted-foreground">Right column</div>
        </div>
      );
  }
}

function PropertiesPanel({
  block,
  onChange,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
}) {
  const alignSelect = (value: string, onChangeAlign: (v: "left" | "center" | "right") => void) => (
    <div>
      <Label className="text-xs">Alignment</Label>
      <Select value={value} onValueChange={(v) => onChangeAlign(v as "left" | "center" | "right")}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const colorInput = (label: string, value: string, onColorChange: (v: string) => void) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-9 w-12 rounded border cursor-pointer"
        />
        <Input value={value} onChange={(e) => onColorChange(e.target.value)} />
      </div>
    </div>
  );

  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Text</Label>
            <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Level</Label>
            <Select value={String(block.level)} onValueChange={(v) => onChange({ level: Number(v) as 1 | 2 | 3 })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {alignSelect(block.align, (align) => onChange({ align }))}
          {colorInput("Color", block.color, (color) => onChange({ color }))}
        </div>
      );
    case "text":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Text</Label>
            <Textarea rows={6} value={block.text} onChange={(e) => onChange({ text: e.target.value })} />
          </div>
          {alignSelect(block.align, (align) => onChange({ align }))}
          {colorInput("Color", block.color, (color) => onChange({ color }))}
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <ImageSourceField
            src={block.src}
            onChange={(src, alt) => onChange(alt ? { src, alt } : { src })}
          />
          <div>
            <Label className="text-xs">Alt text</Label>
            <Input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Width (px)</Label>
            <Input
              type="number"
              value={block.width}
              onChange={(e) => onChange({ width: Number(e.target.value) || 0 })}
            />
          </div>
          {alignSelect(block.align, (align) => onChange({ align }))}
        </div>
      );
    case "button":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Label</Label>
            <Input value={block.label} onChange={(e) => onChange({ label: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Link URL</Label>
            <Input value={block.href} onChange={(e) => onChange({ href: e.target.value })} />
          </div>
          {colorInput("Background", block.background, (background) => onChange({ background }))}
          {colorInput("Text color", block.color, (color) => onChange({ color }))}
          {alignSelect(block.align, (align) => onChange({ align }))}
        </div>
      );
    case "divider":
      return (
        <div className="space-y-3">
          {colorInput("Color", block.color, (color) => onChange({ color }))}
        </div>
      );
    case "columns":
      return (
        <p className="text-xs text-muted-foreground">
          Columns render as a two-column layout in the final email. Content editing inside columns is not yet supported.
        </p>
      );
  }
}

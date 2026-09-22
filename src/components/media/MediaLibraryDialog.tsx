import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ImagePlus,
  Search,
  Tag as TagIcon,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  allTags,
  deleteImage,
  formatBytes,
  listImages,
  normalizeTags,
  subscribeImages,
  updateImage,
  uploadImages,
  type MediaImage,
} from "@/lib/email-templates/media";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, images become selectable and this is called on "Use image". */
  onSelect?: (image: MediaImage) => void;
}

export function MediaLibraryDialog({ open, onOpenChange, onSelect }: Props) {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [uploadTags, setUploadTags] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setImages(listImages()), []);

  useEffect(() => {
    if (!open) return;
    refresh();
    return subscribeImages(refresh);
  }, [open, refresh]);

  const tags = useMemo(() => allTags(), [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return images.filter(
      (i) =>
        (!activeTag || i.tags.includes(activeTag)) &&
        (!q ||
          i.name.toLowerCase().includes(q) ||
          i.tags.some((t) => t.includes(q))),
    );
  }, [images, query, activeTag]);

  const selected = useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  useEffect(() => {
    setTagDraft(selected ? selected.tags.join(", ") : "");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    const created = await uploadImages(list, normalizeTags(uploadTags));
    refresh();
    if (created.length) {
      setSelectedId(created[0].id);
      toast.success(
        `${created.length} image${created.length > 1 ? "s" : ""} added to the library`,
      );
    } else {
      toast.error("Only image files can be uploaded");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b p-5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ImagePlus className="h-5 w-5 text-primary" /> Image library
          </DialogTitle>
          <DialogDescription>
            Upload once, reuse across every email template. Tag images to keep
            them easy to find.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1fr_290px]">
          <div className="min-w-0 border-r">
            {/* Upload zone */}
            <div className="space-y-3 border-b p-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  dragging
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/60 hover:bg-muted/50"
                }`}
              >
                <UploadCloud className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm">
                  Drag and drop your images here, or{" "}
                  <span className="font-medium text-primary">
                    choose images to upload
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF or SVG
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TagIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Input
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="Tags for new uploads, comma separated (e.g. logo, hero)"
                  className="h-8 text-xs"
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Filters */}
            <div className="space-y-3 border-b p-5 pb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search images"
                  className="h-9 pl-8"
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setActiveTag(null)}>
                    <Badge variant={activeTag ? "outline" : "default"}>All</Badge>
                  </button>
                  {tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(activeTag === t ? null : t)}
                    >
                      <Badge variant={activeTag === t ? "default" : "outline"}>
                        {t}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            <ScrollArea className="h-[340px]">
              <div className="p-5">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    {images.length === 0
                      ? "No images yet — upload your first one above."
                      : "No images match your search."}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {filtered.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedId(img.id)}
                        className={`group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          selectedId === img.id
                            ? "border-primary ring-2 ring-primary/40"
                            : ""
                        }`}
                      >
                        <div className="flex h-24 items-center justify-center bg-[linear-gradient(45deg,var(--muted)_25%,transparent_25%,transparent_75%,var(--muted)_75%),linear-gradient(45deg,var(--muted)_25%,transparent_25%,transparent_75%,var(--muted)_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="max-h-24 max-w-full object-contain"
                          />
                        </div>
                        {selectedId === img.id && (
                          <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <div className="space-y-1 border-t p-2">
                          <div className="truncate text-xs font-medium">
                            {img.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {img.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Details */}
          <aside className="flex min-h-[420px] flex-col">
            {selected ? (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  <div className="overflow-hidden rounded-lg border bg-muted/40 p-3">
                    <img
                      src={selected.url}
                      alt={selected.name}
                      className="mx-auto max-h-40 object-contain"
                    />
                  </div>
                  <div>
                    <div className="truncate text-sm font-semibold">
                      {selected.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selected.width && selected.height
                        ? `${selected.width} × ${selected.height} · `
                        : ""}
                      {formatBytes(selected.size)}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Tags
                    </label>
                    <Input
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onBlur={() => {
                        updateImage(selected.id, {
                          tags: normalizeTags(tagDraft),
                        });
                        refresh();
                      }}
                      placeholder="logo, hero, footer"
                      className="h-8 text-xs"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selected.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 border-t p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      deleteImage(selected.id);
                      setSelectedId(null);
                      refresh();
                      toast.success("Image removed");
                    }}
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {onSelect ? (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        onSelect(selected);
                        onOpenChange(false);
                      }}
                    >
                      Use image
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(selected.url);
                        toast.success("Image URL copied");
                      }}
                    >
                      Copy URL
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
                <X className="h-5 w-5" />
                Select an image to see details and tags.
              </div>
            )}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

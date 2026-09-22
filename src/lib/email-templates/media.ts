export interface MediaImage {
  id: string;
  name: string;
  /** data URL (later: AWS-backed URL) */
  url: string;
  tags: string[];
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

const LS_KEY = "email-templates:images";
const EVT = "email-templates:images-changed";

export function listImages(): MediaImage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const list = raw ? (JSON.parse(raw) as MediaImage[]) : [];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function write(list: MediaImage[]) {
  window.localStorage.setItem(LS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function subscribeImages(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function allTags(): string[] {
  const set = new Set<string>();
  listImages().forEach((i) => i.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

export function normalizeTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function measure(url: string) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = url;
  });
}

export async function uploadImages(
  files: File[],
  tags: string[] = [],
): Promise<MediaImage[]> {
  const created: MediaImage[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const url = await readFile(file);
    const dims = await measure(url);
    created.push({
      id: crypto.randomUUID(),
      name: file.name,
      url,
      tags,
      size: file.size,
      ...dims,
      createdAt: new Date().toISOString(),
    });
  }
  if (created.length) write([...created, ...listImages()]);
  return created;
}

export function updateImage(id: string, patch: Partial<MediaImage>) {
  write(listImages().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function deleteImage(id: string) {
  write(listImages().filter((i) => i.id !== id));
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

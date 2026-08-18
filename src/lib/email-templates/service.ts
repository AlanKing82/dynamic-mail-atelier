import { queryOptions } from "@tanstack/react-query";
import { SEED_TEMPLATES } from "./seed";
import type { EmailTemplate } from "./types";

const LS_KEY = "email-templates:user";

function readUser(): EmailTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as EmailTemplate[]) : [];
  } catch {
    return [];
  }
}

function writeUser(list: EmailTemplate[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function listTemplates(): Promise<EmailTemplate[]> {
  // Simulated API latency; swap for real fetch later.
  await new Promise((r) => setTimeout(r, 50));
  return [...SEED_TEMPLATES, ...readUser()];
}

export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  const all = await listTemplates();
  return all.find((t) => t.id === id) ?? null;
}

export function saveTemplate(t: EmailTemplate): EmailTemplate {
  const list = readUser();
  const idx = list.findIndex((x) => x.id === t.id);
  const next: EmailTemplate = { ...t, source: "user", updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = next;
  else list.push(next);
  writeUser(list);
  return next;
}

export function duplicateTemplate(source: EmailTemplate): EmailTemplate {
  const copy: EmailTemplate = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} (copy)`,
    source: "user",
    updatedAt: new Date().toISOString(),
    json: source.json ?? null,
  };
  const list = readUser();
  list.push(copy);
  writeUser(list);
  return copy;
}

export function deleteTemplate(id: string) {
  writeUser(readUser().filter((t) => t.id !== id));
}

export const templatesQueryOptions = () =>
  queryOptions({
    queryKey: ["email-templates"],
    queryFn: listTemplates,
    staleTime: 5 * 60 * 1000,
  });

/**
 * Canonical template path schema (mirrors template-path-schema.json).
 *
 * Every template resolves to a canonical download URL:
 *   templates/<PRODUCT>/<STAGE>/<EVENT>/<FORMAT>/<FILE>
 * e.g.
 *   templates/ETIT-TRIGGER-EXTREME-TEMPERATURE/authentication/password-reset/html/ETIT-Password-Reset-Request.html
 *
 * All picker inputs (products, stages, events, expected files) are derived
 * from this module so the UI never asks for free-form values it can predict.
 */

export type StageId = "account" | "authentication" | "coverage" | "payment" | "other";
export type TemplateFormat = "html" | "json";

export const TEMPLATE_STAGES: StageId[] = [
  "account",
  "authentication",
  "coverage",
  "payment",
  "other",
];

export const TEMPLATE_FORMATS: TemplateFormat[] = ["html", "json"];

export const STAGE_LABELS: Record<StageId, string> = {
  account: "Account",
  authentication: "Authentication",
  coverage: "Coverage",
  payment: "Payment",
  other: "Other",
};

interface EventSpec {
  expectedFiles?: string[];
}

type StageSpec = Record<string, EventSpec>;

export interface ProductSpec {
  trigger: string;
  displayName: string;
  /** short file-prefix code, e.g. ETIT */
  code: string;
  uiVisible: boolean;
  includeShared: StageId[];
  stages: Partial<Record<StageId, StageSpec>>;
}

/** Events every product may inherit per stage. */
const SHARED: Record<StageId, StageSpec> = {
  account: {
    "account-creation": {},
    "policy-ready": {},
  },
  authentication: {
    "email-reset": {},
    "password-reset": {},
  },
  coverage: {
    started: {},
    added: {},
    ended: {},
  },
  payment: {
    due: {},
    failed: {},
    "not-due": {},
  },
  other: {},
};

export const TEMPLATE_SCHEMA_PRODUCTS: ProductSpec[] = [
  {
    trigger: "EXANTE-TRIGGER-EMAIL-TEMPLATES",
    displayName: "Core Email Templates",
    code: "TEST",
    uiVisible: false,
    includeShared: ["account", "authentication", "coverage", "payment", "other"],
    stages: {
      account: {
        "account-creation": { expectedFiles: ["TEST-Account-Creation.html"] },
        "policy-ready": { expectedFiles: ["TEST-Policy-Ready-Confirmation.html"] },
      },
      authentication: {
        "email-reset": {
          expectedFiles: ["TEST-Email-Reset-Request.html", "TEST-Email-Reset-Confirmation.html"],
        },
        "password-reset": {
          expectedFiles: [
            "TEST-Password-Reset-Request.html",
            "TEST-Password-Reset-Confirmation.html",
          ],
        },
      },
    },
  },
  {
    trigger: "ETIT-TRIGGER-EXTREME-TEMPERATURE",
    displayName: "Extreme Temperature",
    code: "ETIT",
    uiVisible: true,
    includeShared: ["account", "authentication", "coverage"],
    stages: {
      account: {
        "account-creation": { expectedFiles: ["ETIT-Account-Creation.html"] },
        "policy-ready": { expectedFiles: ["ETIT-Policy-Ready-Confirmation.html"] },
      },
      authentication: {
        "email-reset": {
          expectedFiles: ["ETIT-Email-Reset-Request.html", "ETIT-Email-Reset-Confirmation.html"],
        },
        "password-reset": {
          expectedFiles: [
            "ETIT-Password-Reset-Request.html",
            "ETIT-Password-Reset-Confirmation.html",
          ],
        },
      },
      payment: {
        due: {
          expectedFiles: ["ETIT-Payment-Warm-Due.html", "ETIT-Payment-Cold-Due.html"],
        },
        failed: {
          expectedFiles: ["ETIT-Payment-Warm-Failed.html", "ETIT-Payment-Cold-Failed.html"],
        },
        "not-due": {
          expectedFiles: [
            "ETIT-Payment-Warm-Not-Due.html",
            "ETIT-Payment-Cold-Not-Due.html",
          ],
        },
      },
    },
  },
  {
    trigger: "EXANTE-TRIGGER-WEATHER-AT-DESTINATION",
    displayName: "Weather At Destination",
    code: "WAD",
    uiVisible: true,
    includeShared: ["account", "authentication", "payment"],
    stages: {
      account: {
        "account-creation": {
          expectedFiles: [
            "WAD-Account-Creation-Single.html",
            "WAD-Account-Creation-Multi.html",
            "WAD-Account-Creation-Group.html",
          ],
        },
      },
      authentication: {
        "email-reset": {
          expectedFiles: ["WAD-Email-Reset-Request.html", "WAD-Email-Reset-Confirmation.html"],
        },
        "password-reset": {
          expectedFiles: [
            "WAD-Password-Reset-Request.html",
            "WAD-Password-Reset-Confirmation.html",
          ],
        },
      },
      payment: {
        due: { expectedFiles: ["WAD-Payment-Due.html"] },
      },
      coverage: {
        started: { expectedFiles: ["WAD-Trip-Start.html"] },
        added: { expectedFiles: ["WAD-Trip-Added.html"] },
        ended: {
          expectedFiles: ["WAD-Trip-End-Payment.html", "WAD-Trip-End-No-Payment.html"],
        },
      },
    },
  },
  {
    trigger: "ZURICH-TRIGGER-SOLAR-IRRADIATION",
    displayName: "Solar Irradiation",
    code: "SGIT",
    uiVisible: true,
    includeShared: ["account", "authentication", "coverage", "payment"],
    stages: {
      account: {
        "account-creation": { expectedFiles: ["SGIT-Account-Creation.html"] },
        "policy-ready": {
          expectedFiles: [
            "SGIT-Policy-Ready-Confirmation.html",
            "SGIT-Policy-Ready-Set-Password.html",
          ],
        },
      },
      authentication: {
        "email-reset": {
          expectedFiles: [
            "SGIT-Email-Reset-Request.html",
            "SGIT-Email-Reset-Confirmation.html",
          ],
        },
        "password-reset": {
          expectedFiles: [
            "SGIT-Password-Reset-Request.html",
            "SGIT-Password-Reset-Confirmation.html",
          ],
        },
      },
    },
  },
];

/* ---------- Derived pickers ---------- */

export function productsForUI(): ProductSpec[] {
  return TEMPLATE_SCHEMA_PRODUCTS.filter((p) => p.uiVisible);
}

export function findProductSpec(trigger: string): ProductSpec | undefined {
  return TEMPLATE_SCHEMA_PRODUCTS.find((p) => p.trigger === trigger);
}

/** Stages a product can create templates in (shared + product-specific). */
export function stagesForProduct(trigger: string): StageId[] {
  const spec = findProductSpec(trigger);
  if (!spec) return [];
  const own = Object.keys(spec.stages) as StageId[];
  const all = new Set<StageId>([...spec.includeShared, ...own]);
  return TEMPLATE_STAGES.filter((s) => all.has(s));
}

/** Events available for a product within a stage. */
export function eventsForProduct(trigger: string, stage: StageId): string[] {
  const spec = findProductSpec(trigger);
  if (!spec) return [];
  const shared = spec.includeShared.includes(stage) ? Object.keys(SHARED[stage]) : [];
  const own = Object.keys(spec.stages[stage] ?? {});
  return Array.from(new Set([...own, ...shared]));
}

/** Files the system expects for a given product/stage/event. */
export function expectedFilesFor(
  trigger: string,
  stage: StageId,
  event: string,
): string[] {
  const spec = findProductSpec(trigger);
  return spec?.stages[stage]?.[event]?.expectedFiles ?? [];
}

/** Canonical download path for a template file. */
export function templatePath(
  trigger: string,
  stage: string,
  event: string,
  format: string,
  fileName: string,
): string {
  return `templates/${trigger}/${stage}/${event}/${format}/${fileName}`;
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

/** Suggested file name when the schema has no expected files for the slot. */
export function suggestFileName(
  trigger: string,
  event: string,
  format: TemplateFormat,
): string {
  const code = findProductSpec(trigger)?.code ?? "NEW";
  return `${code}-${titleCase(event)}.${format}`;
}

const CODE_WORDS = new Set(["ETIT", "WAD", "SGIT", "TEST", "EXANTE", "ZURICH"]);

/** Human-friendly template name derived from a file name. */
export function suggestName(fileName: string): string {
  const base = fileName.replace(/\.(html|json)$/i, "");
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) =>
      CODE_WORDS.has(w.toUpperCase())
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

/**
 * Maps a legacy/loose event string (e.g. "trip/start", "coverage/started",
 * "password-reset") onto the canonical schema stage + event pair.
 */
export function schemaLocationForEvent(event: string): {
  stage: StageId;
  event: string;
} {
  const e = event.toLowerCase();
  if (e.includes("/")) {
    const [head, tail] = e.split("/", 2);
    if (head === "trip") {
      const map: Record<string, string> = { start: "started", added: "added", end: "ended" };
      return { stage: "coverage", event: map[tail] ?? tail };
    }
    if ((TEMPLATE_STAGES as string[]).includes(head)) {
      return { stage: head as StageId, event: tail };
    }
    return { stage: "other", event: tail };
  }
  if (e.startsWith("account") || e.startsWith("policy")) return { stage: "account", event: e };
  if (e.startsWith("email-reset") || e.startsWith("password-reset"))
    return { stage: "authentication", event: e };
  if (e.startsWith("payment")) return { stage: "payment", event: e.replace(/^payment-/, "") };
  return { stage: "other", event: e };
}

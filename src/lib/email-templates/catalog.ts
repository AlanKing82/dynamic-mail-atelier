export type SlotStatus = "ready" | "missing";

export interface TemplateSlot {
  /** Event input + folder under the trigger */
  event: string;
  /** Suggested SES TemplateName */
  templateName: string;
  /** Display name */
  name: string;
  /** Short human description of when this email fires */
  description: string;
  /** HTML basename on S3 / in html/ */
  fileName: string;
  status: SlotStatus;
  updatedAt?: string;
  html?: string;
}

export interface TemplateCategory {
  label: string;
  kind: "core" | "bespoke";
  slots: TemplateSlot[];
}

export interface ProductTemplateCatalog {
  product: string;
  trigger: string;
  /** short code used for badges */
  code: string;
  categories: TemplateCategory[];
}

function email(title: string, paragraphs: string[], cta?: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
  body{font-family:-apple-system,Segoe UI,Arial,Helvetica,sans-serif;color:#111827;margin:0;padding:0;background:#f4f4f5}
  .w{padding:24px 12px}
  .c{max-width:550px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb}
  .hd{background:#0f172a;padding:18px 28px;color:#fff;font-weight:700;letter-spacing:-.02em;font-size:18px}
  .bd{padding:28px}
  h1{font-size:21px;line-height:1.3;margin:0 0 16px}
  p{font-size:15px;line-height:1.6;margin:0 0 14px}
  .btn{display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;margin-top:8px}
  .ft{padding:18px 28px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px}
  </style></head><body><div class="w"><div class="c">
  <div class="hd">exante<span style="color:#f97316">.</span></div>
  <div class="bd"><h1>${title}</h1>${paragraphs.map((p) => `<p>${p}</p>`).join("")}
  ${cta ? `<a class="btn" href="#">${cta}</a>` : ""}
  <p style="margin-top:22px">Kind Regards,<br/>Customer Care Team</p></div>
  <div class="ft">You are receiving this email because you hold an active policy with us.</div>
  </div></div></body></html>`;
}

export const PRODUCT_TEMPLATE_CATALOG: ProductTemplateCatalog[] = [
  {
    product: "Extreme Temperature",
    trigger: "ETIT-TRIGGER-EXTREME-TEMPERATURE",
    code: "ETIT",
    categories: [
      {
        label: "Account Creation",
        kind: "core",
        slots: [
          {
            event: "account-creation",
            templateName: "etit-account-creation",
            name: "ETIT Account Creation",
            description: "Sent when a customer account is first created.",
            fileName: "ETIT-Account-Created.html",
            status: "ready",
            updatedAt: "2026-06-14T09:20:00Z",
            html: email("Welcome to Extreme Temperature Cover", [
              "Hello {{display_name}},",
              "Your account has been created. You can now access the Policy Portal to view your cover and manage your details.",
            ], "Open Policy Portal"),
          },
        ],
      },
      {
        label: "Email Reset",
        kind: "core",
        slots: [
          {
            event: "email-reset",
            templateName: "etit-email-reset-request",
            name: "ETIT Email Reset Request",
            description: "Confirms a request to change the account email address.",
            fileName: "ETIT-Email-Reset-Request.html",
            status: "ready",
            updatedAt: "2026-05-02T11:05:00Z",
            html: email("Confirm Your New Email Address", [
              "Hello {{display_name}},",
              "We received a request to change the email address on your account to {{new_email}}. Confirm the change using the link below.",
            ], "Confirm Email Change"),
          },
          {
            event: "email-reset",
            templateName: "etit-email-reset-confirmation",
            name: "ETIT Email Reset Confirmation",
            description: "Sent once the email address change has completed.",
            fileName: "ETIT-Email-Reset-Confirmation.html",
            status: "missing",
          },
        ],
      },
      {
        label: "Password Reset",
        kind: "core",
        slots: [
          {
            event: "password-reset",
            templateName: "etit-password-reset-request",
            name: "ETIT Password Reset Request",
            description: "Sends a secure link so the customer can set a new password.",
            fileName: "ETIT-Password-Reset-Request.html",
            status: "ready",
            updatedAt: "2026-05-02T11:07:00Z",
            html: email("Reset Your Password", [
              "Hello {{display_name}},",
              "Use the link below to set a new password. This link expires in 60 minutes.",
            ], "Reset Password"),
          },
          {
            event: "password-reset",
            templateName: "etit-password-reset-confirmation",
            name: "ETIT Password Reset Confirmation",
            description: "Confirms the password was successfully changed.",
            fileName: "ETIT-Password-Reset-Confirmation.html",
            status: "ready",
            updatedAt: "2026-05-02T11:09:00Z",
            html: email("Your Password Has Been Changed", [
              "Hello {{display_name}},",
              "Your password was changed on {{changed_at}}. If this wasn't you, contact our Customer Care Team immediately.",
            ]),
          },
        ],
      },
      {
        label: "Policy Ready",
        kind: "core",
        slots: [
          {
            event: "policy-ready",
            templateName: "etit-policy-ready-confirmation",
            name: "ETIT Policy Ready",
            description: "Sent when the policy documents are issued and cover is live.",
            fileName: "ETIT_Policy_Ready_Confirmation.html",
            status: "ready",
            updatedAt: "2026-06-28T15:40:00Z",
            html: email("Your Policy Is Ready", [
              "Hello {{display_name}},",
              "Policy {{policyRef}} is now active. Your Extreme Temperature cover runs from {{startDate}} to {{endDate}}.",
            ], "View Policy Documents"),
          },
        ],
      },
      {
        label: "Coverage",
        kind: "core",
        slots: [
          {
            event: "coverage/started",
            templateName: "etit-coverage-started",
            name: "Coverage Started",
            description: "Sent when the parametric cover period begins.",
            fileName: "ETIT-Coverage-Started.html",
            status: "missing",
          },
          {
            event: "coverage/ended",
            templateName: "etit-coverage-ended",
            name: "Coverage Ended",
            description: "Sent when the parametric cover period ends.",
            fileName: "ETIT-Coverage-Ended.html",
            status: "missing",
          },
          {
            event: "coverage/added",
            templateName: "etit-coverage-added",
            name: "Coverage Added",
            description: "Confirms additional cover added to the policy.",
            fileName: "ETIT-Coverage-Added.html",
            status: "missing",
          },
        ],
      },
      {
        label: "Payment",
        kind: "core",

        slots: [
          {
            event: "payment/due",
            templateName: "etit-payment-warm-due",
            name: "ETIT Payment Warm Due",
            description: "Payout due notice for warm-temperature triggers.",
            fileName: "ETIT-Payment-Warm-Due.html",
            status: "ready",
            updatedAt: "2026-07-03T08:12:00Z",
            html: email("A Payment Is Due To You", [
              "Hello {{display_name}},",
              "Temperatures at {{location}} exceeded your agreed threshold. A payment of {{amount}} is due to you and will be processed within 3 working days.",
            ], "View Payment Details"),
          },
          {
            event: "payment/due",
            templateName: "etit-payment-cold-due",
            name: "ETIT Payment Cold Due",
            description: "Payout due notice for cold-temperature triggers.",
            fileName: "ETIT-Payment-Cold-Due.html",
            status: "ready",
            updatedAt: "2026-07-03T08:14:00Z",
            html: email("A Payment Is Due To You", [
              "Hello {{display_name}},",
              "Temperatures at {{location}} fell below your agreed threshold. A payment of {{amount}} is due to you.",
            ], "View Payment Details"),
          },
          {
            event: "payment/failed",
            templateName: "etit-payment-warm-failed",
            name: "ETIT Payment Warm Failed",
            description: "Sent when a warm-trigger payout could not be processed.",
            fileName: "ETIT-Payment-Warm-Failed.html",
            status: "missing",
          },
          {
            event: "payment/failed",
            templateName: "etit-payment-cold-failed",
            name: "ETIT Payment Cold Failed",
            description: "Sent when a cold-trigger payout could not be processed.",
            fileName: "ETIT-Payment-Cold-Failed.html",
            status: "missing",
          },
          {
            event: "payment/not-due",
            templateName: "etit-payment-warm-not-due",
            name: "ETIT Payment Warm Not Due",
            description: "Confirms no warm-trigger payout is due for the period.",
            fileName: "ETIT-Payment-Warm-Not-Due.html",
            status: "ready",
            updatedAt: "2026-04-19T13:00:00Z",
            html: email("No Payment Due This Period", [
              "Hello {{display_name}},",
              "Temperatures at {{location}} stayed within your agreed range, so no payment is due for this period.",
            ]),
          },
          {
            event: "payment/not-due",
            templateName: "etit-payment-cold-not-due",
            name: "ETIT Payment Cold Not Due",
            description: "Confirms no cold-trigger payout is due for the period.",
            fileName: "ETIT-Payment-Cold-Not-Due.html",
            status: "missing",
          },
        ],
      },
    ],
  },

  {
    product: "Weather At Destination",
    trigger: "EXANTE-TRIGGER-WEATHER-AT-DESTINATION",
    code: "WAD",
    categories: [
      {
        label: "Account Creation",
        kind: "core",
        slots: [
          {
            event: "account-creation",
            templateName: "wad-account-creation-single",
            name: "Account Creation (Single)",
            description: "Welcome email for a single-traveller account.",
            fileName: "WAD-Account-Creation-Single.html",
            status: "ready",
            updatedAt: "2026-06-01T10:00:00Z",
            html: email("Welcome to Weather At Destination", [
              "Hello {{display_name}},",
              "Your account is ready. Add your trip details in the Policy Portal and we'll monitor the weather at your destination.",
            ], "Open Policy Portal"),
          },
          {
            event: "account-creation",
            templateName: "wad-account-creation-multi",
            name: "Account Creation (Multi)",
            description: "Welcome email for multi-traveller accounts.",
            fileName: "WAD-Account-Creation-Multi.html",
            status: "ready",
            updatedAt: "2026-06-01T10:02:00Z",
            html: email("Welcome to Weather At Destination", [
              "Hello {{display_name}},",
              "Your multi-traveller account is ready. You can add up to {{traveller_limit}} travellers to each trip.",
            ], "Open Policy Portal"),
          },
          {
            event: "account-creation",
            templateName: "wad-account-creation-group",
            name: "Account Creation (Group)",
            description: "Welcome email for group/corporate accounts.",
            fileName: "WAD-Account-Creation-Group.html",
            status: "missing",
          },
        ],
      },
      {
        label: "Email Reset",
        kind: "core",
        slots: [
          {
            event: "email-reset",
            templateName: "wad-email-reset-request",
            name: "Email Reset Request",
            description: "Confirms a request to change the account email address.",
            fileName: "WAD-Email-Reset-Request.html",
            status: "ready",
            updatedAt: "2026-03-11T09:30:00Z",
            html: email("Confirm Your New Email Address", [
              "Hello {{display_name}},",
              "Confirm the change to {{new_email}} using the link below.",
            ], "Confirm Email Change"),
          },
          {
            event: "email-reset",
            templateName: "wad-email-reset-confirmation",
            name: "Email Reset Confirmation",
            description: "Sent once the email address change has completed.",
            fileName: "WAD-Email-Reset-Confirmation.html",
            status: "missing",
          },
        ],
      },
      {
        label: "Payment",
        kind: "core",
        slots: [
          {
            event: "payment",
            templateName: "wad-payment-due",
            name: "Payment Triggered",
            description: "Sent when bad weather triggers a payout on the trip.",
            fileName: "WAD-Payment-Due.html",
            status: "ready",
            updatedAt: "2026-07-01T10:00:00Z",
            html: email("A Payment Has Been Triggered", [
              "Hello {{display_name}},",
              "The weather at {{tripDestination}} triggered your cover. A payment of {{amount}} is on its way to you.",
            ], "View Payment Details"),
          },
        ],
      },
      {
        label: "Trip",
        kind: "bespoke",
        slots: [
          {
            event: "trip/start",
            templateName: "wad-trip-start",
            name: "Weather Cover Started",
            description: "Sent on the first day of the covered trip.",
            fileName: "WAD-Trip-Start.html",
            status: "ready",
            updatedAt: "2026-07-01T10:00:00Z",
            html: email("Your Weather at Destination Cover Starts Now", [
              "Hello {{display_name}},",
              "We hope that the weather during your trip to {{tripDestination}} is everything you hope it will be.",
              "Your cover is active from <strong>{{tripStartDate}}</strong> until <strong>{{tripEndDate}}</strong>.",
            ], "Open Policy Portal"),
          },
          {
            event: "trip/end",
            templateName: "wad-trip-end-payment",
            name: "Weather Cover Ended (Payment)",
            description: "End-of-trip summary where a payout was made.",
            fileName: "WAD-Trip-End-Payment.html",
            status: "ready",
            updatedAt: "2026-07-01T10:05:00Z",
            html: email("Your Cover Has Ended", [
              "Hello {{display_name}},",
              "Your cover for {{tripDestination}} ended on {{tripEndDate}}. A payment of {{amount}} was made during this trip.",
            ]),
          },
          {
            event: "trip/end",
            templateName: "wad-trip-end-no-payment",
            name: "Weather Cover Ended (No Payment)",
            description: "End-of-trip summary where no payout was triggered.",
            fileName: "WAD-Trip-End-No-Payment.html",
            status: "missing",
          },
          {
            event: "trip/added",
            templateName: "wad-trip-added",
            name: "Trip Added",
            description: "Confirms a new trip has been added to the policy.",
            fileName: "WAD-Trip-Added.html",
            status: "ready",
            updatedAt: "2026-06-22T16:45:00Z",
            html: email("New Trip Added To Your Policy", [
              "Hello {{display_name}},",
              "A trip to {{tripDestination}} ({{tripStartDate}} – {{tripEndDate}}) has been added to your policy.",
            ], "View Trip"),
          },
        ],
      },
    ],
  },

  {
    product: "Solar Irradiation",
    trigger: "ZURICH-TRIGGER-SOLAR-IRRADIATION",
    code: "SGIT",
    categories: [
      {
        label: "Account Creation",
        kind: "core",
        slots: [
          {
            event: "account-creation",
            templateName: "sgit-account-creation",
            name: "Zurich Account Creation",
            description: "Sent when a Zurich solar customer account is created.",
            fileName: "SGIT-Account-Creation.html",
            status: "ready",
            updatedAt: "2026-02-08T08:00:00Z",
            html: email("Welcome to Solar Irradiation Cover", [
              "Hello {{display_name}},",
              "Your account has been created. Sign in to view your solar irradiation cover and site details.",
            ], "Open Policy Portal"),
          },
        ],
      },
      {
        label: "Email Reset",
        kind: "core",
        slots: [
          {
            event: "email-reset",
            templateName: "sgit-email-reset-request",
            name: "Zurich Email Reset Request",
            description: "Confirms a request to change the account email address.",
            fileName: "SGIT-Email-Reset-Request.html",
            status: "missing",
          },
          {
            event: "email-reset",
            templateName: "sgit-email-reset-confirmation",
            name: "Zurich Email Reset Confirmation",
            description: "Sent once the email address change has completed.",
            fileName: "SGIT-Email-Reset-Confirmation.html",
            status: "missing",
          },
        ],
      },
      {
        label: "Password Reset",
        kind: "core",
        slots: [
          {
            event: "password-reset",
            templateName: "sgit-password-reset-request",
            name: "Zurich Password Reset Request",
            description: "Sends a secure link so the customer can set a new password.",
            fileName: "SGIT-Password-Reset-Request.html",
            status: "ready",
            updatedAt: "2026-02-08T08:10:00Z",
            html: email("Reset Your Password", [
              "Hello {{display_name}},",
              "Use the link below to set a new password. This link expires in 60 minutes.",
            ], "Reset Password"),
          },
          {
            event: "password-reset",
            templateName: "sgit-password-reset-confirmation",
            name: "Zurich Password Reset Confirmation",
            description: "Confirms the password was successfully changed.",
            fileName: "SGIT-Password-Reset-Confirmation.html",
            status: "missing",
          },
        ],
      },
      {
        label: "Policy Ready",
        kind: "core",
        slots: [
          {
            event: "policy-ready",
            templateName: "sgit-policy-ready-confirmation",
            name: "Zurich Policy Ready",
            description: "Sent when the solar policy is issued and cover is live.",
            fileName: "SGIT-Policy-Ready-Confirmation.html",
            status: "ready",
            updatedAt: "2026-05-30T12:00:00Z",
            html: email("Your Policy Is Ready", [
              "Hello {{display_name}},",
              "Policy {{policyRef}} for site {{siteName}} is now active.",
            ], "View Policy Documents"),
          },
          {
            event: "policy-ready",
            templateName: "sgit-policy-ready-set-password",
            name: "Zurich Policy Ready (Set Password)",
            description: "Policy-ready email for customers who must still set a password.",
            fileName: "SGIT-Policy-Ready-Set-Password.html",
            status: "ready",
            updatedAt: "2026-05-30T12:04:00Z",
            html: email("Your Policy Is Ready — Set Your Password", [
              "Hello {{display_name}},",
              "Policy {{policyRef}} is active. Set your password to access the Policy Portal.",
            ], "Set Password"),
          },
        ],
      },
    ],
  },
];

/* ---------- Canonical taxonomy stages ---------- */

export interface JourneyStage {
  id: "account" | "authentication" | "policy" | "coverage" | "payment";
  index: string;
  label: string;
  subtitle: string;
  summary: string;
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "account",
    index: "01",
    label: "Account",
    subtitle: "Customer Creation",
    summary: "Account Creation",
  },
  {
    id: "authentication",
    index: "02",
    label: "Authentication",
    subtitle: "Security & Access",
    summary: "Email / Password Reset",
  },
  {
    id: "policy",
    index: "03",
    label: "Policy",
    subtitle: "Quote & Purchase",
    summary: "Policy Ready",
  },
  {
    id: "coverage",
    index: "04",
    label: "Coverage",
    subtitle: "Parametric Bounds",
    summary: "Started / Ended / Added",
  },
  {
    id: "payment",
    index: "05",
    label: "Payment",
    subtitle: "Billing & Invoicing",
    summary: "Due / Failed / Not Due",
  },
];

export function stageForEvent(event: string): JourneyStage["id"] {
  const e = event.toLowerCase();
  if (e.startsWith("account")) return "account";
  if (e.startsWith("email-reset") || e.startsWith("password-reset"))
    return "authentication";
  if (e.startsWith("policy")) return "policy";
  if (e.startsWith("payment")) return "payment";
  return "coverage";
}

export interface ResolvedStage extends JourneyStage {
  slots: TemplateSlot[];
}

/** Regroups a product's slots into the canonical taxonomy stages. */
export function productStages(
  product: ProductTemplateCatalog,
): ResolvedStage[] {
  const all = product.categories.flatMap((c) => c.slots);
  return JOURNEY_STAGES.map((stage) => ({
    ...stage,
    slots: all.filter((s) => stageForEvent(s.event) === stage.id),
  }));
}

export function productStats(product: ProductTemplateCatalog) {
  const slots = product.categories.flatMap((c) => c.slots);
  const ready = slots.filter((s) => s.status === "ready").length;
  return {
    total: slots.length,
    ready,
    missing: slots.length - ready,
    coverage: slots.length ? Math.round((ready / slots.length) * 100) : 0,
  };
}

export function findProduct(trigger: string) {
  return (
    PRODUCT_TEMPLATE_CATALOG.find((p) => p.trigger === trigger) ??
    PRODUCT_TEMPLATE_CATALOG[0]
  );
}


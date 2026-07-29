import type { EmailTemplate } from "./types";

const WEATHER_TRIP_START_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,Helvetica,sans-serif;color:#000;margin:0;padding:24px 0;background:#f4f4f5}a{color:#1188E6;text-decoration:none}.c{max-width:550px;margin:0 auto;background:#fff;padding:32px}</style></head><body><div class="c"><h1 style="font-size:22px;margin:0 0 16px">Your Weather at Destination Cover Starts Now.</h1><p>Hello {{#if display_name}}{{display_name}}{{else}}Client{{/if}},</p><p>We hope that the weather during your trip to {{tripDestination}} is everything you hope it will be.</p><p>Your Weather At Destination cover will be active from <strong>{{tripStartDate}}</strong> until <strong>{{tripEndDate}}</strong>.</p><p>We hope you don't get bad weather but if you do we will contact you directly with payment.</p><p>You can monitor this trip in the Policy Portal by clicking the link below.</p><p>Kind Regards,<br/>Customer Care Team</p><p><a href="#" style="background:#1e293b;color:#fff;padding:12px 20px;border-radius:6px;display:inline-block">Open Policy Portal</a></p></div></body></html>`;

function html(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,Helvetica,sans-serif;color:#000;margin:0;padding:24px 0;background:#f4f4f5}a{color:#1188E6}.c{max-width:550px;margin:0 auto;background:#fff;padding:32px}</style></head><body><div class="c"><h1 style="font-size:22px;margin:0 0 16px">${title}</h1>${body}<p style="margin-top:24px">Kind Regards,<br/>Customer Care Team</p></div></body></html>`;
}

export const SEED_TEMPLATES: EmailTemplate[] = [
  {
    id: "seed-weather-trip-start",
    name: "Weather Cover Started",
    product: "Weather At Destination",
    trigger: "EXANTE-TRIGGER-WEATHER-AT-DESTINATION",
    event: "trip/start",
    html: WEATHER_TRIP_START_HTML,
    source: "seed",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "seed-weather-trip-end",
    name: "Weather Cover Ended",
    product: "Weather At Destination",
    trigger: "EXANTE-TRIGGER-WEATHER-AT-DESTINATION",
    event: "trip/end",
    html: html(
      "Your Weather at Destination Cover Has Ended",
      `<p>Hello {{display_name}},</p><p>Your cover for the trip to {{tripDestination}} ended on {{tripEndDate}}. We hope you had wonderful weather.</p>`,
    ),
    source: "seed",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "seed-weather-trip-added",
    name: "Trip Added",
    product: "Weather At Destination",
    trigger: "EXANTE-TRIGGER-WEATHER-AT-DESTINATION",
    event: "trip/added",
    html: html(
      "New Trip Added To Your Policy",
      `<p>Hello {{display_name}},</p><p>A new trip to {{tripDestination}} ({{tripStartDate}} – {{tripEndDate}}) has been added to your policy.</p>`,
    ),
    source: "seed",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "seed-weather-payment",
    name: "Payment Confirmation",
    product: "Weather At Destination",
    trigger: "EXANTE-TRIGGER-WEATHER-AT-DESTINATION",
    event: "payment",
    html: html(
      "Payment Received",
      `<p>Hello {{display_name}},</p><p>We've received your payment of {{amount}} for policy {{policyRef}}.</p>`,
    ),
    source: "seed",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "seed-account-creation",
    name: "Welcome to Exante",
    product: "Account",
    trigger: "EXANTE-TRIGGER-ACCOUNT",
    event: "account-creation",
    html: html(
      "Welcome to Exante",
      `<p>Hello {{display_name}},</p><p>Your account has been created. Sign in any time via the Policy Portal.</p>`,
    ),
    source: "seed",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "seed-flight-delay-payment",
    name: "Flight Delay Payment",
    product: "Flight Delay Cover",
    trigger: "EXANTE-TRIGGER-FLIGHT-DELAY",
    event: "payment",
    html: html(
      "Flight Delay Payment Processed",
      `<p>Hello {{display_name}},</p><p>Your flight {{flightNumber}} was delayed. A payment of {{amount}} has been issued.</p>`,
    ),
    source: "seed",
    updatedAt: "2026-07-01T10:00:00Z",
  },
];

export const TRIGGER_VARIABLES: Record<string, string[]> = {
  "EXANTE-TRIGGER-WEATHER-AT-DESTINATION": [
    "display_name",
    "tripDestination",
    "tripStartDate",
    "tripEndDate",
    "tripTypeGroup",
    "tripTypeMulti",
    "policyRef",
    "amount",
  ],
  "EXANTE-TRIGGER-ACCOUNT": ["display_name", "email", "accountId"],
  "EXANTE-TRIGGER-FLIGHT-DELAY": [
    "display_name",
    "flightNumber",
    "delayMinutes",
    "amount",
  ],
};

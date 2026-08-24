import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { EmailBuilder } from "@/components/email-builder/EmailBuilder";

const searchSchema = z.object({
  product: z.string().optional(),
  trigger: z.string().optional(),
  stage: z.string().optional(),
  event: z.string().optional(),
  fileName: z.string().optional(),
  format: z.string().optional(),
  name: z.string().optional(),
});

export const Route = createFileRoute("/email-builder")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Email Builder — Exante Admin" },
      { name: "description", content: "Visual drag-and-drop email template builder" },
      { property: "og:title", content: "Email Builder — Exante Admin" },
      { property: "og:description", content: "Visual drag-and-drop email template builder" },
    ],
  }),
  component: NewBuilderRoute,
});

function NewBuilderRoute() {
  const preset = Route.useSearch();
  return <EmailBuilder preset={preset} />;
}

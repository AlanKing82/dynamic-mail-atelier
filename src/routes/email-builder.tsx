import { createFileRoute } from "@tanstack/react-router";
import { EmailBuilder } from "@/components/email-builder/EmailBuilder";

export const Route = createFileRoute("/email-builder")({
  head: () => ({
    meta: [
      { title: "Email Builder — Exante Admin" },
      { name: "description", content: "Visual drag-and-drop email template builder" },
      { property: "og:title", content: "Email Builder — Exante Admin" },
      { property: "og:description", content: "Visual drag-and-drop email template builder" },
    ],
  }),
  component: () => <EmailBuilder />,
});

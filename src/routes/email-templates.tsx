import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/email-templates")({
  head: () => ({
    meta: [
      { title: "Email Templates — Exante Admin" },
      { name: "description", content: "Browse, search and preview existing email templates" },
      { property: "og:title", content: "Email Templates — Exante Admin" },
      { property: "og:description", content: "Browse, search and preview existing email templates" },
    ],
  }),
  component: () => <Outlet />,
});

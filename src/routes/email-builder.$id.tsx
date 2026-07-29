import { createFileRoute, notFound } from "@tanstack/react-router";
import { EmailBuilder } from "@/components/email-builder/EmailBuilder";
import { getTemplate } from "@/lib/email-templates/service";

export const Route = createFileRoute("/email-builder/$id")({
  head: () => ({
    meta: [
      { title: "Edit Template — Exante Admin" },
      { name: "description", content: "Edit an existing email template" },
      { property: "og:title", content: "Edit Template — Exante Admin" },
      { property: "og:description", content: "Edit an existing email template" },
    ],
  }),
  loader: async ({ params }) => {
    const t = await getTemplate(params.id);
    if (!t) throw notFound();
    return { template: t };
  },
  component: EditRoute,
});

function EditRoute() {
  const { template } = Route.useLoaderData();
  return <EmailBuilder initial={template} />;
}

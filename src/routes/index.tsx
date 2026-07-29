import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Exante Admin" },
      { name: "description", content: "Admin dashboard shortcuts" },
      { property: "og:title", content: "Home — Exante Admin" },
      { property: "og:description", content: "Admin dashboard shortcuts" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-center mb-2">Admin Dashboard Shortcuts</h2>
      <p className="text-muted-foreground text-center mb-10">
        Manage email templates and build new ones with the visual editor.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/email-templates">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer h-full">
            <Mail className="h-8 w-8 mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-1">Browse Existing Templates</h3>
            <p className="text-sm text-muted-foreground">
              Search, filter, preview, and duplicate existing email templates.
            </p>
          </Card>
        </Link>
        <Link to="/email-builder">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer h-full">
            <Wand2 className="h-8 w-8 mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-1">New Email Template</h3>
            <p className="text-sm text-muted-foreground">
              Drag components onto a canvas to design a new email template.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

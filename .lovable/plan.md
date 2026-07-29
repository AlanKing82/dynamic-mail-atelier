# Email Template Builder — Plan

Build a mini admin app with a left sidebar shell (styled like the reference screenshot) and two main workspaces: **Existing Templates** (browse/preview) and **Email Builder** (visual drag-and-drop). Templates come from a mocked service layer; user-created/duplicated templates persist in `localStorage`.

## App shell

- `src/routes/__root.tsx`: wrap `<Outlet />` in `SidebarProvider` + `AppSidebar` + header with `SidebarTrigger`.
- `src/components/app-sidebar.tsx`: dark navy sidebar, "exante"-style wordmark, icon nav items. Only the two entries below are wired; the rest (Tenants, Admins, Companies, etc.) render as inert placeholders so the layout matches the screenshot without inventing features.
  - Home → `/`
  - Email Templates → `/email-templates` (existing templates browser)
  - Email Builder → `/email-builder` (new template)
- `/` becomes a simple Home page with two shortcut cards ("Browse Templates", "New Template").

## Routes

```
src/routes/
  index.tsx                       # Home shortcuts
  email-templates.tsx             # layout with <Outlet/>
  email-templates.index.tsx       # list + filters + preview panel
  email-templates.$id.tsx         # full-page preview (deep link)
  email-builder.tsx               # builder layout (canvas + right sidebar)
  email-builder.$id.tsx           # edit existing template in builder
  api/email-templates.ts          # mocked GET server route (returns seed JSON)
```

## Service layer

`src/lib/email-templates/service.ts`
- `listTemplates()` — merges seed templates (fetched from `/api/email-templates`, mock) with localStorage user templates.
- `getTemplate(id)`, `saveTemplate(t)`, `duplicateTemplate(id)`, `deleteTemplate(id)`.
- Uses TanStack Query (`emailTemplatesQueryOptions`) so route loaders can `ensureQueryData`.

Template shape:
```ts
type EmailTemplate = {
  id: string; name: string;
  product: string; trigger: string; event: string;
  html: string;                 // rendered HTML for preview
  json?: BuilderDoc | null;     // present only for builder-native templates
  source: 'seed' | 'user';
  updatedAt: string;
};
```

Seed data: ~6 templates matching the "Weather At Destination" example (trip/start, trip/end, trip/added, payment, account-creation) plus 1–2 across another product/trigger to prove filters work. The trip/start HTML uses the sample provided in the prompt.

## Existing Templates page (`/email-templates`)

Two-pane layout inside the main content area:

- Left column (~340px): search input, three filter selects (Product / Trigger / Event), grouped list (Product → Trigger → template names). Selecting an item updates the right pane and URL (`?id=...`).
- Right column: rendered email preview + metadata + actions.

Preview frame:
- Grey background (`bg-muted`), centered white card, `max-width: 550px`, `iframe` with `srcDoc={template.html}` and `sandbox="allow-same-origin"` for isolated email styling.
- Metadata block: Template Name, Product, Trigger, Event, Last updated.
- Actions row: **Preview HTML** (default), **View source HTML** (toggles a `<pre>` view), **Duplicate** (creates `user` copy, navigates to builder), **Edit in builder** (navigates to `/email-builder/$id`).

## Email Builder page (`/email-builder` and `/email-builder/$id`)

Layout inside the app shell's main area:

```
+---------------------------+------------------+
| Canvas (email preview)    | Right sidebar    |
|  - 550px wide             |  Tabs:           |
|  - grey bg, white card    |   Components     |
|  - drop zone for blocks   |   Properties     |
|                           |   Variables      |
+---------------------------+------------------+
```

- Top toolbar (above canvas): template name input, Product/Trigger/Event selects, Save, Preview, Export HTML.
- Canvas renders the current `BuilderDoc` as blocks; clicking a block selects it (highlight + Properties tab focuses it).
- Right sidebar tabs:
  - **Components**: draggable tiles for Columns, Heading, Text Block, Image, Button, Divider. HTML5 drag-and-drop into the canvas; drop indicators between blocks.
  - **Properties**: form for the selected block (text, color, alignment, url, image src, padding). Uses shadcn `Input`, `Select`, `Slider`, color picker.
  - **Variables**: list of Handlebars-style variables available for the selected trigger (`{{display_name}}`, `{{tripDestination}}`, `{{tripStartDate}}`, `{{tripEndDate}}`, etc.). Click to insert into focused text field.
- `BuilderDoc` → HTML via `renderBuilderDocToHtml(doc)` (simple table-based email HTML template). Saved into `template.html` + `template.json`.
- Persistence: Save writes through service to localStorage; new templates get `crypto.randomUUID()`.

### Edit-existing flow (`/email-builder/$id`)

- If template has `json`, load into builder.
- If not (seed HTML only), show a top-of-canvas warning banner:
  > "This template cannot be fully converted into editable blocks. You can duplicate it and create a new template."
  Canvas shows read-only HTML preview; only **Duplicate as new** action is enabled. No HTML parser in v1.

## Home (`/`)

Simple centered card with two large shortcut buttons: "Browse Existing Templates" and "New Email Template". Replaces the placeholder.

## Out of scope for v1

- No real backend/AWS integration (service layer is designed to swap later).
- No HTML → BuilderDoc parser.
- No auth / user management.
- No email sending.

## Technical notes

- All colors via semantic tokens; add a `--sidebar` navy tone and accent orange dot in `src/styles.css` to match the reference.
- Drag-and-drop: native HTML5 DnD (no extra deps) to keep bundle light.
- Preview isolation: `<iframe srcDoc>` so email `<style>` doesn't leak into the app.
- Each new route file defines its own `head()` with unique title/description/OG.
- Router: no changes to `src/router.tsx` needed beyond the generated route tree.

## Deliverables checklist

1. App shell with left sidebar + header trigger.
2. Home shortcuts page.
3. `/email-templates` browser with filters, search, preview, actions.
4. `/email-builder` new-template flow with drag-in components, properties, variables, save.
5. `/email-builder/$id` edit flow (JSON or read-only-with-warning).
6. Service layer + mocked `/api/email-templates` + localStorage persistence.
7. Static HTML generator for builder docs.

# Email Subject Line

## Changes
- Add a prominent, labelled Subject field to the Email Builder toolbar, with the example subject as helpful placeholder text.
- Keep the subject editable for builder-native templates and visible but locked for read-only templates.
- Save the subject with the template data so it is restored when reopening or duplicating a template.
- Reflow the toolbar into clear metadata and action rows on narrower screens while preserving the current desktop layout.

## Technical details
- Extend the existing `EmailTemplate` model with an optional `subject` field for compatibility with older saved and seeded templates.
- Pass an optional subject through the new-template route preset.
- Use the existing Input, Label, Button, and semantic design tokens; no backend changes.
- Verify creating, saving, and reopening a template, plus desktop and mobile presentation.

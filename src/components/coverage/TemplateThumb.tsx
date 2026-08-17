interface Props {
  html: string;
  title: string;
}

/** Scaled, non-interactive miniature of the real email HTML. */
export function TemplateThumb({ html, title }: Props) {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-md border bg-muted/40">
      <iframe
        title={`${title} preview`}
        srcDoc={html}
        sandbox=""
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: 760, height: 800, transform: "scale(0.32)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
    </div>
  );
}

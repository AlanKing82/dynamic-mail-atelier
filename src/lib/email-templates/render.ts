import type { Block, BuilderDoc } from "./types";

function renderBlock(block: Block): string {
  switch (block.type) {
    case "heading": {
      const tag = `h${block.level}`;
      const size = block.level === 1 ? 28 : block.level === 2 ? 22 : 18;
      return `<${tag} style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;color:${block.color};text-align:${block.align};font-weight:600;">${escapeHtml(block.text)}</${tag}>`;
    }
    case "text":
      return `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${block.color};text-align:${block.align};">${escapeHtml(block.text).replace(/\n/g, "<br/>")}</p>`;
    case "image":
      return `<div style="text-align:${block.align};margin:0 0 12px;"><img src="${block.src}" alt="${escapeHtml(block.alt)}" style="max-width:100%;width:${block.width}px;height:auto;display:inline-block;" /></div>`;
    case "button":
      return `<div style="text-align:${block.align};margin:16px 0;"><a href="${block.href}" style="background:${block.background};color:${block.color};text-decoration:none;padding:12px 24px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;display:inline-block;">${escapeHtml(block.label)}</a></div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${block.color};margin:16px 0;" />`;
    case "columns":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;"><tr><td valign="top" width="50%" style="padding-right:8px;">${block.left.map(renderBlock).join("")}</td><td valign="top" width="50%" style="padding-left:8px;">${block.right.map(renderBlock).join("")}</td></tr></table>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderBuilderDocToHtml(doc: BuilderDoc): string {
  const body = doc.blocks.map(renderBlock).join("\n");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:24px 0;background:${doc.background};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${doc.background};">
    <tr><td align="center">
      <table role="presentation" width="550" cellpadding="0" cellspacing="0" style="max-width:550px;width:100%;background:${doc.containerBackground};padding:32px;">
        <tr><td>${body}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function emptyDoc(): BuilderDoc {
  return {
    background: "#f4f4f5",
    containerBackground: "#ffffff",
    blocks: [],
  };
}

export function newBlock(type: Block["type"]): Block {
  const id = crypto.randomUUID();
  switch (type) {
    case "heading":
      return { id, type, text: "Heading", level: 1, align: "left", color: "#111111" };
    case "text":
      return {
        id,
        type,
        text: "Write your message here. Use {{variables}} for personalization.",
        align: "left",
        color: "#333333",
      };
    case "image":
      return {
        id,
        type,
        src: "https://via.placeholder.com/500x200",
        alt: "Image",
        width: 500,
        align: "center",
      };
    case "button":
      return {
        id,
        type,
        label: "Open Policy Portal",
        href: "https://example.com",
        background: "#1e293b",
        color: "#ffffff",
        align: "left",
      };
    case "divider":
      return { id, type, color: "#e5e7eb" };
    case "columns":
      return { id, type, left: [], right: [] };
  }
}

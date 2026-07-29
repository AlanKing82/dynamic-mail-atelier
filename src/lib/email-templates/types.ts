export type BuilderBlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "columns";

export interface BaseBlock {
  id: string;
  type: BuilderBlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  text: string;
  level: 1 | 2 | 3;
  align: "left" | "center" | "right";
  color: string;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  text: string;
  align: "left" | "center" | "right";
  color: string;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  width: number;
  align: "left" | "center" | "right";
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  label: string;
  href: string;
  background: string;
  color: string;
  align: "left" | "center" | "right";
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  color: string;
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  left: Block[];
  right: Block[];
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | ColumnsBlock;

export interface BuilderDoc {
  background: string;
  containerBackground: string;
  blocks: Block[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  product: string;
  trigger: string;
  event: string;
  html: string;
  json?: BuilderDoc | null;
  source: "seed" | "user";
  updatedAt: string;
}

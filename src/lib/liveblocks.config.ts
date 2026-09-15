import { LiveMap } from "@liveblocks/client";

export type Point = {
  x: number;
  y: number;
  pressure: number;
};

export type Stroke = {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  erased?: boolean;
};

export type Tool = "select" | "pen" | "eraser";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      name: string;
      color: string;
      tool: Tool;
    };
    Storage: {
      strokes: LiveMap<string, Stroke>;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
      };
    };
  }
}

export {};

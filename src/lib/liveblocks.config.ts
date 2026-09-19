import { LiveMap } from "@liveblocks/client";

// Note: `Point.x` and `Point.y` are stored in *world* coordinates (shared,
// independent of any user's local pan/zoom). See `useUiStore.viewport` for
// the per-user screen viewport that maps world <-> screen.
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

export type Tool = "select" | "pen" | "eraser" | "hand";

declare global {
  interface Liveblocks {
    Presence: {
      // Cursor is broadcast in world coordinates so remote peers can map it
      // through their own viewport without drifting when someone pans/zooms.
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

import { create } from "zustand";

export type Tool = "select" | "pen" | "eraser" | "hand";

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;
export const ZOOM_STEP = 1.2;

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

type UiState = {
  tool: Tool;
  color: string;
  strokeSize: number;
  viewport: Viewport;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeSize: (size: number) => void;
  setViewport: (viewport: Viewport) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (factor: number, cx: number, cy: number) => void;
  resetViewport: () => void;
};

export const COLORS = [
  "#0f172a",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#ffffff",
] as const;

export const useUiStore = create<UiState>((set) => ({
  tool: "pen",
  color: "#0f172a",
  strokeSize: 8,
  viewport: DEFAULT_VIEWPORT,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeSize: (strokeSize) => set({ strokeSize }),
  setViewport: (viewport) => set({ viewport }),
  panBy: (dx, dy) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        x: state.viewport.x + dx,
        y: state.viewport.y + dy,
      },
    })),
  zoomAt: (factor, cx, cy) =>
    set((state) => {
      const { x, y, zoom } = state.viewport;
      const newZoom = clampZoom(zoom * factor);
      if (newZoom === zoom) return state;
      const k = newZoom / zoom;
      return {
        viewport: {
          x: cx - (cx - x) * k,
          y: cy - (cy - y) * k,
          zoom: newZoom,
        },
      };
    }),
  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),
}));

import { create } from "zustand";

export type Tool = "select" | "pen" | "eraser";

type UiState = {
  tool: Tool;
  color: string;
  strokeSize: number;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeSize: (size: number) => void;
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
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeSize: (strokeSize) => set({ strokeSize }),
}));

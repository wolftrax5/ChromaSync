"use client";

import { useMutation } from "@liveblocks/react/suspense";
import { COLORS, type Tool, useUiStore } from "@/store/ui";

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pen", label: "Pen", icon: "✎" },
  { id: "eraser", label: "Eraser", icon: "⌫" },
];

export function Toolbar() {
  const tool = useUiStore((s) => s.tool);
  const color = useUiStore((s) => s.color);
  const strokeSize = useUiStore((s) => s.strokeSize);
  const setTool = useUiStore((s) => s.setTool);
  const setColor = useUiStore((s) => s.setColor);
  const setStrokeSize = useUiStore((s) => s.setStrokeSize);

  const clearCanvas = useMutation(({ storage }) => {
    const strokes = storage.get("strokes");
    for (const id of Array.from(strokes.keys())) {
      strokes.delete(id);
    }
  }, []);

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md">
      <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
        {TOOLS.map((item) => {
          const active = tool === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => setTool(item.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-1 h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-1.5">
        {COLORS.map((swatch) => {
          const active = color === swatch;
          return (
            <button
              key={swatch}
              type="button"
              title={swatch}
              aria-label={`Color ${swatch}`}
              aria-pressed={active}
              onClick={() => {
                setColor(swatch);
                if (tool === "eraser" || tool === "select") setTool("pen");
              }}
              className={`h-7 w-7 rounded-full border transition ${
                active
                  ? "scale-110 border-slate-900 ring-2 ring-slate-900/20"
                  : "border-slate-300 hover:scale-105"
              }`}
              style={{ backgroundColor: swatch }}
            />
          );
        })}
        <label className="relative ml-1 flex h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-dashed border-slate-400">
          <span className="sr-only">Custom color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              if (tool !== "pen") setTool("pen");
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            className="block h-full w-full"
            style={{
              background:
                "conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
            }}
          />
        </label>
      </div>

      <div className="mx-1 h-8 w-px bg-slate-200" />

      <label className="flex items-center gap-2 px-1 text-xs text-slate-500">
        Size
        <input
          type="range"
          min={2}
          max={32}
          value={strokeSize}
          onChange={(e) => setStrokeSize(Number(e.target.value))}
          className="w-20 accent-slate-900"
        />
      </label>

      <div className="mx-1 h-8 w-px bg-slate-200" />

      <button
        type="button"
        onClick={() => {
          if (window.confirm("Clear the entire board for everyone?")) {
            clearCanvas();
          }
        }}
        className="rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
      >
        Clear
      </button>
    </div>
  );
}

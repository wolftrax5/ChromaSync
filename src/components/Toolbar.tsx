"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import {
  COLORS,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  type Tool,
  useUiStore,
} from "@/store/ui";

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pen", label: "Pen", icon: "✎" },
  { id: "eraser", label: "Eraser", icon: "⌫" },
  { id: "hand", label: "Hand (pan)", icon: "✋" },
];

function getViewportCenter(): { cx: number; cy: number } {
  if (typeof window === "undefined") {
    return { cx: 0, cy: 0 };
  }
  return {
    cx: window.innerWidth / 2,
    cy: window.innerHeight / 2,
  };
}

export function Toolbar() {
  const tool = useUiStore((s) => s.tool);
  const color = useUiStore((s) => s.color);
  const strokeSize = useUiStore((s) => s.strokeSize);
  const zoom = useUiStore((s) => s.viewport.zoom);
  const setTool = useUiStore((s) => s.setTool);
  const setColor = useUiStore((s) => s.setColor);
  const setStrokeSize = useUiStore((s) => s.setStrokeSize);
  const zoomAt = useUiStore((s) => s.zoomAt);
  const resetViewport = useUiStore((s) => s.resetViewport);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close the mobile menu if the viewport grows into the desktop layout,
  // otherwise it would stay open (and invisible) on the next resize down.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const handle = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setMobileMenuOpen(false);
    };
    handle(mql);
    mql.addEventListener("change", handle);
    return () => mql.removeEventListener("change", handle);
  }, []);

  const clearCanvas = useMutation(({ storage }) => {
    const strokes = storage.get("strokes");
    for (const id of Array.from(strokes.keys())) {
      strokes.delete(id);
    }
  }, []);

  const zoomOutDisabled = zoom <= MIN_ZOOM + 1e-6;
  const zoomInDisabled = zoom >= MAX_ZOOM - 1e-6;

  const handleZoomOut = () => {
    const { cx, cy } = getViewportCenter();
    zoomAt(1 / ZOOM_STEP, cx, cy);
  };

  const handleZoomIn = () => {
    const { cx, cy } = getViewportCenter();
    zoomAt(ZOOM_STEP, cx, cy);
  };

  const handleClear = () => {
    if (window.confirm("Clear the entire board for everyone?")) {
      clearCanvas();
    }
  };

  const toolsSection = (
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
  );

  const colorsSection = (
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
              if (tool === "eraser" || tool === "select" || tool === "hand")
                setTool("pen");
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
  );

  const sizeSection = (
    <label className="flex items-center gap-2 px-1 text-xs text-slate-500">
      Size
      <input
        type="range"
        min={2}
        max={32}
        value={strokeSize}
        onChange={(e) => setStrokeSize(Number(e.target.value))}
        className="w-24 accent-slate-900 lg:w-20"
      />
    </label>
  );

  const zoomSection = (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        onClick={handleZoomOut}
        disabled={zoomOutDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-base text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600"
      >
        <span aria-hidden>−</span>
      </button>
      <button
        type="button"
        title="Reset zoom"
        aria-label={`Reset zoom (currently ${Math.round(zoom * 100)}%)`}
        onClick={resetViewport}
        className="min-w-13 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-white hover:text-slate-900"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        onClick={handleZoomIn}
        disabled={zoomInDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-base text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600"
      >
        <span aria-hidden>+</span>
      </button>
    </div>
  );

  const clearButton = (
    <button
      type="button"
      onClick={handleClear}
      className="rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
    >
      Clear
    </button>
  );

  const divider = <div className="mx-1 h-8 w-px bg-slate-200" />;

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
      {/* Mobile / tablet: expandable horizontal panel that sits above the bar. */}
      <div
        id="chroma-toolbar-menu"
        role="region"
        aria-label="Toolbar options"
        aria-hidden={!mobileMenuOpen}
        className={`absolute bottom-full left-1/2 mb-3 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-200 lg:hidden ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {colorsSection}
          </div>
          <div className="flex items-center justify-center border-t border-slate-100 pt-3">
            {sizeSection}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            {zoomSection}
            {clearButton}
          </div>
        </div>
      </div>

      {/* Main bar. */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md">
        {toolsSection}

        {/* Desktop-only inline sections. */}
        <div className="hidden items-center gap-2 lg:flex">
          {divider}
          {colorsSection}
          {divider}
          {sizeSection}
          {divider}
          {zoomSection}
          {divider}
          {clearButton}
        </div>

        {/* Mobile hamburger toggle. */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-controls="chroma-toolbar-menu"
          aria-label={
            mobileMenuOpen ? "Close toolbar options" : "Open toolbar options"
          }
          title="More options"
          className={`ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-sm transition lg:hidden ${
            mobileMenuOpen
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

import getStroke from "perfect-freehand";
import type { Point, Stroke } from "@/lib/liveblocks.config";
import type { Viewport } from "@/store/ui";

export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"] as (string | number)[],
  );

  d.push("Z");
  return d.join(" ");
}

export function strokeToPath(stroke: Stroke): string {
  const outline = getStroke(
    stroke.points.map((p) => [p.x, p.y, p.pressure]),
    {
      size: stroke.size,
      thinning: 0.55,
      smoothing: 0.5,
      streamline: 0.45,
      easing: (t) => t,
      start: { taper: 0, cap: true },
      end: { taper: 12, cap: true },
    },
  );

  return getSvgPathFromStroke(outline);
}

export function pointerToPoint(
  event: Pick<PointerEvent, "clientX" | "clientY" | "pressure">,
  bounds: DOMRect,
): Point {
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
    pressure: event.pressure > 0 ? event.pressure : 0.5,
  };
}

export function screenToWorld(
  event: Pick<PointerEvent, "clientX" | "clientY" | "pressure">,
  bounds: DOMRect,
  viewport: Viewport,
): Point {
  const screenX = event.clientX - bounds.left;
  const screenY = event.clientY - bounds.top;
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
    pressure: event.pressure > 0 ? event.pressure : 0.5,
  };
}

export function createStrokeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

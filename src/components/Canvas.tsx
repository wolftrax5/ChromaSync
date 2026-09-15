"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  useMutation,
  useStorage,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense";
import type { Point, Stroke } from "@/lib/liveblocks.config";
import { createStrokeId, pointerToPoint, strokeToPath } from "@/lib/drawing";
import { useUiStore } from "@/store/ui";
import { LiveCursors } from "@/components/LiveCursors";

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  dpr: number,
) {
  if (stroke.erased || stroke.points.length < 1) return;

  const pathData = strokeToPath(stroke);
  if (!pathData) return;

  const path = new Path2D(pathData);
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.fillStyle = stroke.color;
  ctx.globalAlpha = stroke.opacity;
  ctx.fill(path);
  ctx.restore();
}

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPointRef = useRef<Point | null>(null);
  const drawingIdRef = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const tool = useUiStore((s) => s.tool);
  const color = useUiStore((s) => s.color);
  const strokeSize = useUiStore((s) => s.strokeSize);
  const updateMyPresence = useUpdateMyPresence();

  const strokes = useStorage((root) => root.strokes);

  const addStroke = useMutation(({ storage }, stroke: Stroke) => {
    storage.get("strokes").set(stroke.id, stroke);
  }, []);

  const appendPoint = useMutation(
    ({ storage }, strokeId: string, point: Point) => {
      const map = storage.get("strokes");
      const existing = map.get(strokeId);
      if (!existing) return;
      map.set(strokeId, {
        ...existing,
        points: [...existing.points, point],
      });
    },
    [],
  );

  const eraseNear = useMutation(({ storage }, point: Point, radius: number) => {
    const map = storage.get("strokes");
    for (const [id, stroke] of map) {
      if (stroke.erased) continue;
      const hit = stroke.points.some((p) => {
        const dx = p.x - point.x;
        const dy = p.y - point.y;
        return Math.hypot(dx, dy) <= radius;
      });
      if (hit) {
        map.set(id, { ...stroke, erased: true });
      }
    }
  }, []);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!strokes) return;

    const ordered = Array.from(strokes.values()).filter((s) => !s.erased);
    for (const stroke of ordered) {
      drawStroke(ctx, stroke, dpr);
    }
  }, [strokes]);

  useEffect(() => {
    paint();
  }, [paint, size]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size.width * dpr);
    canvas.height = Math.floor(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    paint();
  }, [size, paint]);

  const flushPendingPoint = useCallback(() => {
    rafRef.current = null;
    const point = pendingPointRef.current;
    const strokeId = drawingIdRef.current;
    if (!point || !strokeId) return;
    pendingPointRef.current = null;

    if (tool === "eraser") {
      eraseNear(point, Math.max(14, strokeSize * 1.6));
      return;
    }

    if (tool === "pen") {
      appendPoint(strokeId, point);
    }
  }, [appendPoint, eraseNear, strokeSize, tool]);

  const schedulePoint = useCallback(
    (point: Point) => {
      pendingPointRef.current = point;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(flushPendingPoint);
    },
    [flushPendingPoint],
  );

  const getLocalPoint = (event: ReactPointerEvent) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return pointerToPoint(event.nativeEvent, bounds);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (tool === "select") return;
    if (event.button !== 0) return;

    const point = getLocalPoint(event);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    updateMyPresence({ cursor: { x: point.x, y: point.y }, tool });

    if (tool === "eraser") {
      drawingIdRef.current = "eraser";
      eraseNear(point, Math.max(14, strokeSize * 1.6));
      return;
    }

    const id = createStrokeId();
    drawingIdRef.current = id;
    addStroke({
      id,
      points: [point],
      color,
      size: strokeSize,
      opacity: 1,
    });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = getLocalPoint(event);
    if (!point) return;

    updateMyPresence({ cursor: { x: point.x, y: point.y }, tool });

    if (!drawingIdRef.current) return;
    if (tool === "select") return;

    schedulePoint(point);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drawingIdRef.current = null;
    pendingPointRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const onPointerLeave = () => {
    updateMyPresence({ cursor: null });
  };

  const cursorClass =
    tool === "pen"
      ? "cursor-crosshair"
      : tool === "eraser"
        ? "cursor-cell"
        : "cursor-default";

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full touch-none overflow-hidden bg-[#f6f4ef] ${cursorClass}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
      <LiveCursors />
    </div>
  );
}

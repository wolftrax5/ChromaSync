"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { useUiStore } from "@/store/ui";

function Cursor({
  x,
  y,
  color,
  name,
}: {
  x: number;
  y: number;
  color: string;
  name: string;
}) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-30 transition-transform duration-75 ease-out"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M1 1L16.5 9.2L9.4 11.1L6.8 19.5L1 1Z"
          fill={color}
          stroke="#0f172a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute left-4 top-4 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}

export function LiveCursors() {
  const others = useOthers();
  const viewport = useUiStore((s) => s.viewport);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null;
        // presence.cursor is stored in world coordinates; project through the
        // local viewport so remote cursors track the shared drawing.
        const screenX = presence.cursor.x * viewport.zoom + viewport.x;
        const screenY = presence.cursor.y * viewport.zoom + viewport.y;
        return (
          <Cursor
            key={connectionId}
            x={screenX}
            y={screenY}
            color={info?.color ?? presence.color}
            name={info?.name ?? presence.name}
          />
        );
      })}
    </div>
  );
}

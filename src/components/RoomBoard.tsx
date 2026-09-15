"use client";

import { useEffect } from "react";
import {
  useOthers,
  useSelf,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { useUiStore } from "@/store/ui";

export function RoomBoard({ roomId }: { roomId: string }) {
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();
  const tool = useUiStore((s) => s.tool);
  const color = useUiStore((s) => s.color);

  useEffect(() => {
    const name = self.info?.name ?? "Guest";
    const userColor = self.info?.color ?? color;
    updateMyPresence({ name, color: userColor, tool });
  }, [self.info?.name, self.info?.color, color, tool, updateMyPresence]);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <header className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-4">
        <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
          <p className="font-[family-name:var(--font-display)] text-lg tracking-tight text-slate-900">
            ChromaSync
          </p>
          <p className="text-xs text-slate-500">
            Room <span className="font-mono text-slate-700">{roomId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md">
          <div className="flex -space-x-2">
            {others.slice(0, 5).map(({ connectionId, info, presence }) => (
              <div
                key={connectionId}
                title={info?.name ?? presence.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                style={{ backgroundColor: info?.color ?? presence.color }}
              >
                {(info?.name ?? presence.name).slice(0, 1)}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-600">
            {others.length + 1} online
          </span>
        </div>
      </header>

      <div className="relative flex-1">
        <Canvas />
        <Toolbar />
      </div>
    </div>
  );
}

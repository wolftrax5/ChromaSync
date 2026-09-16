"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useOthers,
  useSelf,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { useUiStore } from "@/store/ui";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "touchmove",
  "pointerdown",
  "pointermove",
  "wheel",
  "scroll",
];

export function RoomBoard({ roomId }: { roomId: string }) {
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();
  const router = useRouter();
  const tool = useUiStore((s) => s.tool);
  const color = useUiStore((s) => s.color);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasExitedRef = useRef(false);

  useEffect(() => {
    const name = self.info?.name ?? "Guest";
    const userColor = self.info?.color ?? color;
    updateMyPresence({ name, color: userColor, tool });
  }, [self.info?.name, self.info?.color, color, tool, updateMyPresence]);

  // Navigating to "/" unmounts the RoomProvider, which cleanly closes the
  // Liveblocks WebSocket session for this user.
  const exitRoom = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    router.push("/");
  }, [router]);

  // Auto-exit after 5 minutes of inactivity.
  useEffect(() => {
    const resetTimer = () => {
      if (hasExitedRef.current) return;
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(exitRoom, INACTIVITY_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );
    resetTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
    };
  }, [exitRoom]);

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

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={exitRoom}
            title="Exit room"
            aria-label="Exit room"
            className="flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-rose-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Exit
          </button>
        </div>
      </header>

      <div className="relative flex-1">
        <Canvas />
        <Toolbar />
      </div>
    </div>
  );
}

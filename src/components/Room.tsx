"use client";

import { ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { LiveMap } from "@liveblocks/client";
import type { Stroke } from "@/lib/liveblocks.config";

function BoardSkeleton() {
  return (
    <div className="flex items-center justify-center bg-[#f6f4ef]">
      <div className="flex flex-col items-center gap-3 ">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <p className="text-sm text-slate-500">Connecting to room…</p>
      </div>
    </div>
  );
}

export function Room({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          name: "Guest",
          color: "#3b82f6",
          tool: "pen",
        }}
        initialStorage={{
          strokes: new LiveMap<string, Stroke>(),
        }}
      >
        <ClientSideSuspense fallback={<BoardSkeleton />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

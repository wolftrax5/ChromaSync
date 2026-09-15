import { NextRequest, NextResponse } from "next/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "",
});

const NAMES = [
  "Nova",
  "Orbit",
  "Pixel",
  "Quill",
  "Ripple",
  "Spark",
  "Tess",
  "Vivid",
];

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

function pick<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  }
  return items[hash % items.length];
}

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return NextResponse.json(
      { error: "Missing LIVEBLOCKS_SECRET_KEY" },
      { status: 500 },
    );
  }

  const { room } = (await request.json()) as { room?: string };

  if (!room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  const userId = `user_${crypto.randomUUID().slice(0, 8)}`;
  const name = pick(NAMES, userId);
  const color = pick(COLORS, userId);

  const session = liveblocks.prepareSession(userId, {
    userInfo: { name, color },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}

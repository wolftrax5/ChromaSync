"use client";

import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function randomRoomId(): string {
  const adjectives = ["amber", "coral", "indigo", "mint", "violet", "copper"];
  const nouns = ["canvas", "studio", "atelier", "board", "sketch", "frame"];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${a}-${n}-${suffix}`;
}

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const joinRoom = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = slugify(roomId) || randomRoomId();
    router.push(`/room/${id}`);
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <div
        className="chroma-blobs pointer-events-none absolute -inset-[15%]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 10%, rgba(251,146,60,0.2), transparent 50%), radial-gradient(ellipse 60% 50% at 50% 90%, rgba(167,139,250,0.18), transparent 55%), #f6f4ef",
        }}
      />
      <div
        className="chroma-dots pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.1) 1px, transparent 0)",
        }}
      />

      <section className="relative z-10 w-full max-w-lg">
        <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-slate-900 sm:text-6xl">
          ChromaSync
        </p>
        <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
          Draw together in real time — shared strokes, live cursors, and a
          pressure-sensitive pen.
        </p>
        <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
          share the room name with your friends to start drawing together{" "}
          <span className="font-medium text-slate-900">Mine is wolftrax</span>
        </p>

        <form
          onSubmit={joinRoom}
          className="mt-10 flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md sm:flex-row sm:items-center"
        >
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            name="roomId"
            placeholder="Room name (optional)"
            className="h-12 sm:flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-base sm:text-sm text-slate-900 outline-none ring-slate-900/10 placeholder:text-slate-400 focus:ring-2"
          />
          <button
            type="submit"
            className="h-12 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Enter room
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push(`/room/${randomRoomId()}`)}
          className="mt-4 text-sm text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline"
        >
          Or create a random room
        </button>
      </section>

      <footer className="absolute bottom-6 left-0 right-0 z-10 text-center text-sm text-slate-500">
        Made with Love by{" "}
        <a
          href="https://www.wolftrax.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
        >
          wolftrax5
        </a>
      </footer>
    </main>
  );
}

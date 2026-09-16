# ChromaSync

Real-time collaborative whiteboard built with Next.js, Liveblocks, and perfect-freehand.

## Stack`

<img src="https://skillicons.dev/icons?i=ts,react,nextjs,nodejs,tailwind,git,github&perline=7" alt="tech stack">

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a [Liveblocks](https://liveblocks.io) account, then copy keys into `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

- `LIVEBLOCKS_SECRET_KEY` — secret key (server auth)
- `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` — public key (client)

3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create or join a room.

## Features

- Shared canvas with CRDT-backed strokes (`LiveMap`)
- Live cursors + presence name tags
- Pen, eraser, select, color picker, clear canvas
- Pressure-sensitive strokes via [`perfect-freehand`](https://github.com/steveruizok/perfect-freehand)



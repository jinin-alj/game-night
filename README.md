# Game Night Planner

Game Night Planner helps students who host weekly board game nights pick what to play so they fill the night with games that fit who's coming and how much time they have.

## Requirements

- Node.js 20.9 or newer (the project pins Node 24 in `.nvmrc`; run `nvm use` if you use nvm)
- npm
- A Supabase project with email + password sign-in

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a file called `.env.local` in the project root with these two variables (values come from Supabase → Connect):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

   **NEVER COMMIT `.env.local`, AND NEVER USE THE SECRET / SERVICE_ROLE KEY.** Only the URL and the publishable key are used.

3. Set up the database: in Supabase open **SQL Editor → New query**, then paste and run each file in `supabase/migrations/` in number order (`0001_…`, `0002_…`, `0003_…`). In **Authentication → Sign In / Providers → Email**, keep Email on and turn **Confirm email** off.

4. Start the dev server and open http://localhost:3000:

   ```bash
   npm run dev
   ```

## Scripts

| Script                 | What it does                             |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Starts the development server            |
| `npm run build`        | Builds the app for production            |
| `npm run start`        | Runs the production build                |
| `npm run lint`         | Checks the code with ESLint              |
| `npm run format`       | Formats every file with Prettier         |
| `npm run format:check` | Fails if any file is not formatted       |
| `npm run typecheck`    | Checks TypeScript types without building |
| `npm run test`         | Runs the unit tests once with Vitest     |
| `npm run art:crops`    | Rebuilds the art crops from the panorama |

CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, tests and build on every pull request and every push to `main`.

## Replacing the art

The illustrations are placeholders. Everything comes from one drawing, `public/art/panorama.svg`. The other files in `public/art/` are crops of it, made by `scripts/make-art-crops.mjs`, so never edit them by hand.

| File                | Used for                     | viewBox            |
| ------------------- | ---------------------------- | ------------------ |
| `panorama.svg`      | Landing page hero            | `0 0 2400 900`     |
| `zone-1.svg`        | "How it works" step 1        | `0 160 660 660`    |
| `zone-2.svg`        | "How it works" step 2        | `640 260 620 620`  |
| `zone-3.svg`        | "How it works" step 3        | `1200 260 620 620` |
| `zone-4.svg`        | Thumbnail on each night card | `1860 60 540 540`  |
| `horizon-strip.svg` | Band under the `/app` header | `0 470 2400 180`   |

To swap in final art:

1. Export your drawing as `public/art/panorama.svg`, keeping the same filename.
2. Keep the root tag exactly as `<svg ... id="panorama" viewBox="0 0 2400 900" width="2400" height="900" ...>`. The script looks for it and stops with an error if it is missing.
3. Keep the four zones in the same places, left to right: afternoon (x 0–660), golden hour (540–1260), sunset (1140–1860), night (1740–2400).
4. Keep the layer groups `sky`, `far`, `mid`, `near` and `foreground`, so a light parallax can be added later. Any parallax must switch off under `prefers-reduced-motion`.
5. Run `npm run art:crops` to rebuild the crops. If a crop frames your art badly, change its viewBox in `scripts/make-art-crops.mjs` and run it again.

Rules for the art: SVG only (no raster images or external files), each file under about 200 KB, and no text inside the drawing. The pages always place text on cream panels, never directly on the art.

## Where the docs live

The build plan, coding rules and challenge brief are kept in a local `docs/` folder that is gitignored, so they are not in this repository. This README is the public documentation and will be completed in milestone 8.

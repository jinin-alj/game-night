# Game Night Planner

Game Night Planner helps students who host weekly board game nights pick what to play so they fill the night with games that fit who's coming and how much time they have.

- **Author:** Jinin Aljayyousi
- **Live app:** https://game-night-planner-zeta.vercel.app

## What it does

1. **Sign up** with email and password. You get a personal group straight away, with 8 starter games on its shelf.
2. **Create a game night** on `/app`. Only the name is required; the date defaults to next Friday and the time to 3 hours.
3. **Fill the shelf** (`/app/games`): add, edit and delete games with player counts, playtime and whose copy it is.
4. **Invite friends** (`/app/group`): share the invite link or code. Friends confirm before joining, and you can be in several groups.
5. **Plan the night:** open a night, tick who's coming, add guests (friends without an account), then press **Plan my night** for a lineup that fits the players and the time, with a reason for each game.
6. **Log what you played** with **We played this**, then **rate** the games (1–10). Recently played games drop down the next lineup, and well-rated ones move up.

Data is private to each group: nobody outside a group can see its nights, games, plays or ratings, and nothing can be read without logging in.

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

   **NEVER COMMIT `.env.local`, AND NEVER USE THE SECRET / SERVICE_ROLE KEY.** Only the URL and the publishable key are used. The URL is the bare project URL (`https://<ref>.supabase.co`), without `/rest/v1/`.

3. Set up the database: in Supabase open **SQL Editor → New query**, then paste and run every file in `supabase/migrations/` in number order, from `0001_…` to `0008_…`. In **Authentication → Sign In / Providers → Email**, keep Email on and turn **Confirm email** off.

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

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS, Supabase (Auth + Postgres) through `@supabase/ssr`, Zod for validation, Vitest for tests. Hosted on Vercel.

| Folder                 | What lives there                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `src/app/`             | Pages: landing, `/signup`, `/login`, and the logged-in area under `/app`                   |
| `src/features/<name>/` | One folder per feature: `account`, `groups`, `nights`, `games`, `plays`, `ratings`         |
| `src/lib/`             | Shared helpers: Supabase clients, dates, form helpers, and the planner                     |
| `src/proxy.ts`         | Refreshes the session and keeps logged-out visitors out of `/app` (keeping an invite code) |
| `supabase/migrations/` | The database, as numbered SQL files                                                        |

Inside each feature folder, `schemas.ts` holds the Zod rules for its input, `queries.ts` the reads used by pages, `actions.ts` the server actions (check the user, validate, write, refresh the page), and `components/` its UI.

**How a change flows:** a form posts to a server action → the action checks who is logged in and validates the input with Zod → it writes through Supabase → Row Level Security (and, for groups and ratings, a database function) enforces the rules again → the page is refreshed. Database errors are turned into plain messages; raw errors are never shown.

**Data model:**

| Table             | Holds                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| `profiles`        | Display name and active group for each account                           |
| `groups`          | Name, invite code, owner                                                 |
| `group_members`   | Who is in which group                                                    |
| `games`           | The shelf: title, players, playtime, whose copy                          |
| `game_nights`     | Name, date, available minutes                                            |
| `night_attendees` | Members coming to a night                                                |
| `night_guests`    | Friends without an account coming to a night                             |
| `plays`           | Games played on a night (kept, with their title, if the game is deleted) |
| `ratings`         | One 1–10 rating per member per game                                      |

**Security:**

- Row Level Security is on for every table, with policies based on `auth.uid()` and group membership. Logged-out visitors get no access at all.
- Composite foreign keys stop a row from mixing two groups (for example, an attendee or a play from another group).
- Group changes, invites, leaving, account deletion and ratings go through `security definer` functions that check the caller and the rules themselves.
- The browser only ever receives the Supabase URL and the publishable key.

## Planner rules

**Inputs:** the group's games, the members coming, the number of guests, the minutes available, the members' ratings and the date each game was last played.

1. **Players** = members coming + guests. Only games whose player range includes that number are considered.
2. **Rating part:** the average over the members coming of their own rating, or 10 for a game never played, or 5 for a game played but not rated by them. Guests count as players but don't rate.
3. **Recency part:** full weeks since the game was last played, up to 5. A game never played gets 5.
4. **Score** = rating part + recency part. Ties go to the shorter game, then title A–Z.
5. **Fill:** from the highest score down, add each game that still fits in the minutes left.

**Output:** the lineup in order, minutes used and left, and a reason per game ("avg rating 8.5", "not played in 4 weeks", "never played"). At least one member must be coming.

## Inputs and limits

| Field            | Rule                                       |
| ---------------- | ------------------------------------------ |
| Display name     | 1–40 characters                            |
| Group name       | 1–60 characters                            |
| Invite code      | 10 letters and numbers (no I, O, 0 or 1)   |
| Night name       | 1–80 characters                            |
| Night length     | 30 minutes to 12 hours, in 30-minute steps |
| Game title       | 1–100 characters                           |
| Players          | 1–20, max not below min                    |
| Playtime         | 5–600 minutes                              |
| Guests per night | Up to 20, names 1–40 characters            |
| Rating           | Whole number 1–10                          |

## Known limitations

- No email confirmation and no password reset.
- Guests can't rate games; only members' ratings count.
- Plays can be logged only on or after the night's date (Madrid time).
- The 8 starter games are a fixed list.
- The illustrations are placeholders, and there is no parallax yet.
- Free Supabase projects pause after 7 days without use.

## Accessibility

Built to WCAG 2.1 AA basics: every field has a label, errors appear next to their field and are linked to it, text meets AA contrast on the brand palette, focus is always visible, there is a "Skip to main content" link, decorative art is hidden from screen readers, and every page works on a phone without sideways scrolling.

## Maintenance and errors

- **Checks:** CI must pass on every pull request before merging into `main`; Vercel deploys `main`.
- **Logs:** server errors are logged with their error code (see the Vercel function logs). Users only ever see a friendly message.
- **Changing the database:** add a new numbered file in `supabase/migrations/` (never edit one that has already run), run it in the SQL Editor, then deploy the code that uses it.
- **If a key leaks:** create new keys in Supabase, delete the old ones, and update `.env.local` and the Vercel environment variables, then redeploy.
- **If the app suddenly stops working:** open the Supabase dashboard and click **Resume project**.

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

The build plan, coding rules and challenge brief are kept in a local `docs/` folder that is gitignored, so they are not in this repository. This README is the public documentation.

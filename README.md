# Game Night Planner

Game Night Planner helps students who host weekly board game nights pick what to play so they fill the night with games that fit who's coming and how much time they have.

> **Status:** milestone 0

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

CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, tests and build on every pull request and every push to `main`.

## Where the docs live

The build plan, coding rules and challenge brief are kept in a local `docs/` folder that is gitignored, so they are not in this repository. This README is the public documentation and will be completed in milestone 8.

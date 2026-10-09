# University of Northeastern Somalia Portal

The UNS public website and admin/student portal is a React 18 + TypeScript application built with Vite and deployed to Vercel.

## Stack

- React 18 and React Router
- TypeScript
- Vite
- Tailwind CSS
- Supabase Auth and Postgres-backed profiles/roles
- Zustand for client-side UI state
- pnpm 10.28.0

## Local development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Set these public Supabase client values in `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

   Only use the Supabase URL and publishable key in browser code. Never expose a `service_role` or secret key.

4. Start the development server:

   ```bash
   pnpm dev
   ```

## Portal access

The login screen uses Supabase email/password authentication. After authentication, the application reads the signed-in user's profile from `public.profiles` and their role from `public.user_roles`.

- `student` users are sent to the student portal.
- `admin`, `super_admin`, `registrar`, `admissions`, and `finance` users are sent to the admin portal.
- Authenticated users without a supported role are signed out and shown an explanatory error.

Create and manage users in Supabase Auth, then add their matching profile and role records. Do not add demo credentials to source code.

## Verification commands

```bash
pnpm run typecheck
pnpm run build
pnpm preview
```

GitHub Actions runs typechecking and a production build on pushes and pull requests targeting `main`.

## Deployment

Vercel is connected to the `main` branch of `Gurmad190/unts`. The repository's `vercel.json` is the source of truth for the Vite build:

- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm run build`
- Output: `dist`
- SPA fallback: all routes rewrite to `index.html`

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Vercel Production, Preview, and Development environments before deploying.

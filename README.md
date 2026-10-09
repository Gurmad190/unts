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

## Portal architecture

- `PortalShell` provides the responsive authenticated navigation for administrators and students.
- Portal domain data is loaded through `src/lib/portalApi.ts` and Supabase RLS; the old in-memory admin store is no longer used.
- Zustand is limited to auth and portal loading/UI state.
- The public `/apply` form calls the protected `submit_application` database function. It only exposes active programmes and the current academic term.
- Admissions staff use `/admin/admissions`. Approving an application calls the `approve-student-application` Edge Function, which creates the student account server-side, runs the atomic approval function, and returns a temporary password only in the approval response. Review-state changes use the protected `set_application_status` RPC.
- Registrars use `/admin/departments`, `/admin/courses`, `/admin/terms`, and `/admin/students` for catalogue, term and enrollment operations. Sensitive student and enrollment writes use protected database RPCs.
- Super Admins and Admins can review `/admin/audit`, which reads the append-only audit trail populated by database triggers.
- Super Admins use `/admin/users` to create staff accounts through the protected `admin-create-user` Edge Function.

The database migrations and Edge Functions must be applied to the Supabase project before using these workflows. Keep `SUPABASE_SERVICE_ROLE_KEY` and all other secret keys in Supabase Edge Function secrets only; they must never be added to Vercel client environment variables or browser code.

## Portal access

The login screen uses Supabase email/password authentication. After authentication, the application reads the signed-in user's profile from `public.profiles` and their role from `public.user_roles`.

- `student` users are sent to the student portal.
- `admin`, `super_admin`, `registrar`, `admissions`, `faculty`, and `finance` users are sent to the admin portal.
- Navigation is filtered by the user's system role, while Supabase RLS and Edge Function authorization remain the security boundary.
- Authenticated users without a supported role are signed out and shown an explanatory error.

For production, use the Super Admin user-management workflow or a controlled Supabase admin process to provision accounts. Do not add demo credentials or service keys to source code. Student accounts are created from accepted applications; they are not created from the staff form.

## Verification commands

```bash
pnpm run typecheck
pnpm run build
pnpm preview
```

GitHub Actions runs typechecking and a production build on pushes and pull requests targeting `main`.

## Deployment

Vercel is connected to the `main` branch of `Gurmad190/unts`. The repository's `vercel.json` is the source of truth for the Vite build:

- Install: `pnpm install --no-frozen-lockfile`
- Build: `pnpm run build`
- Output: `dist`
- SPA fallback: all routes rewrite to `index.html`

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Vercel Production, Preview, and Development environments before deploying. The Edge Functions use Supabase-managed `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` secrets; these are not frontend environment variables.

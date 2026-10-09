# Supabase backend

The hosted project contains the portal schema, RLS policies and tracked migrations for the UNS portal. The protected Edge Functions in this directory are the server-side boundary for privileged workflows:

- `admin-create-user` — Super Admin-only staff account creation.
- `approve-student-application` — admissions approval, optional student account creation, and atomic database approval.
- `admin-update-user` — Admin/Super Admin profile and role updates through the atomic database workflow.

Required Edge Function secrets are managed by Supabase and must never be copied into Vercel or browser code:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The frontend only uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Hosted migration history

The hosted project has these workflow migrations applied:

1. `portal_workflows_and_seed_catalog` — grants backend privileges, creates `submit_application` and `approve_application`, and seeds the initial catalogue and current academic term.
2. `public_application_catalog_read` — permits anonymous reads of active programmes and the current academic term.
3. `restrict_public_applications_to_current_term` — ensures the public submission RPC accepts only the current term.
4. `allow_registrar_catalog_management` — lets Registrars maintain departments as well as programmes and terms.
5. `public_catalog_department_read` — permits anonymous department names for the public catalogue.
6. `public_published_announcements_read` — permits anonymous visitors to read published announcements only.
7. `grant_anon_published_announcements_select` — grants the anonymous API role the minimum table permission needed for that policy.
8. `fix_approve_application_conflict` — fixes the approval RPC conflict with its `application_id` return column.
9. `qualify_approve_application_student_number` — qualifies the accepted-student lookup to avoid a `student_number` return-column conflict.
10. `qualify_approve_application_profile_id` — qualifies the joined profile lookup to avoid an `id` collision.
11. `add_admin_update_user_workflow` — adds an atomic Super Admin-only profile and role update workflow.
12. `allow_admin_user_profile_updates` — lets Admin users edit ordinary profiles while protecting Super Admin access.

The repository now mirrors the hosted migration ledger. The first fifteen historical migrations are retained verbatim for reproducibility; they have already been applied to production and must not be replayed there. The current Phase 1 hardening migrations are also tracked here:

- `phase1_security_and_onboarding` — prevents anonymous applicant PII overwrites, assigns the `student` role during acceptance, prevents orphan student rows, protects profile email identity fields, narrows profile administration, and removes unnecessary browser privileges.
- `phase1_application_insert_boundary` — removes direct browser inserts into `applications`; public submissions use the `submit_application` RPC.
- `phase1_privileged_rpc_boundary` — requires an authenticated caller for `admin_update_user` while retaining server-side role checks.

Apply schema changes through Supabase migrations, review RLS policies after each change, and deploy the matching function source with JWT verification enabled. Never use the service-role key from a client component. Do not run `supabase db reset`, blind `supabase db push`, or replay the historical files against the hosted project.

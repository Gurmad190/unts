-- UNS Digital Portal foundation
-- Additive only: no DROP, DELETE, RESET, or seed data.

create extension if not exists pgcrypto;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_terms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  starts_on date not null,
  ends_on date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint academic_terms_dates check (ends_on > starts_on)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin','admin','admissions','registrar','faculty','finance','student','applicant')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  code text not null unique,
  name text not null,
  degree_level text not null default 'undergraduate' check (degree_level in ('certificate','diploma','undergraduate','postgraduate')),
  duration_years numeric(3,1) not null default 4 check (duration_years > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  program_id uuid references public.programs(id) on delete set null,
  code text not null unique,
  title text not null,
  credits numeric(3,1) not null default 3 check (credits > 0),
  level integer check (level between 1 and 10),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_faculty (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  employee_number text unique,
  title text,
  faculty_type text not null default 'faculty' check (faculty_type in ('staff','faculty','advisor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone text,
  date_of_birth date,
  nationality text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  term_id uuid not null references public.academic_terms(id) on delete restrict,
  application_number text not null unique,
  status text not null default 'applied' check (status in ('applied','new','review','accepted','rejected','waitlisted','enrolled','withdrawn')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (applicant_id, program_id, term_id)
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  file_name text not null,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  uploaded_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.admissions_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  decided_by uuid not null references public.profiles(id) on delete restrict,
  decision text not null check (decision in ('accepted','rejected','waitlisted')),
  decision_date timestamptz not null default now(),
  notes text
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  applicant_id uuid unique references public.applicants(id) on delete set null,
  student_number text not null unique,
  program_id uuid not null references public.programs(id) on delete restrict,
  admission_term_id uuid references public.academic_terms(id) on delete set null,
  status text not null default 'active' check (status in ('active','graduated','suspended','withdrawn','inactive')),
  enrollment_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  term_id uuid not null references public.academic_terms(id) on delete restrict,
  status text not null default 'enrolled' check (status in ('enrolled','completed','withdrawn','deferred')),
  enrolled_at timestamptz not null default now(),
  unique (student_id, term_id)
);

create table if not exists public.course_registrations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  faculty_id uuid references public.staff_faculty(id) on delete set null,
  status text not null default 'registered' check (status in ('registered','completed','dropped','withdrawn')),
  registered_at timestamptz not null default now(),
  unique (enrollment_id, course_id)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.course_registrations(id) on delete cascade,
  grade text check (grade in ('A','A-','B+','B','B-','C+','C','C-','D','F','I','W')),
  grade_points numeric(3,2) check (grade_points between 0 and 4),
  submitted_by uuid references public.staff_faculty(id) on delete set null,
  submitted_at timestamptz,
  remarks text,
  updated_at timestamptz not null default now()
);

create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  term_id uuid not null references public.academic_terms(id) on delete restrict,
  credits_attempted numeric(5,1) not null default 0,
  credits_earned numeric(5,1) not null default 0,
  term_gpa numeric(3,2) check (term_gpa between 0 and 4),
  cumulative_gpa numeric(3,2) check (cumulative_gpa between 0 and 4),
  generated_at timestamptz not null default now(),
  unique (student_id, term_id)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  term_id uuid references public.academic_terms(id) on delete set null,
  invoice_number text not null unique,
  amount numeric(12,2) not null check (amount >= 0),
  due_date date not null,
  status text not null default 'unpaid' check (status in ('draft','unpaid','partial','paid','overdue','cancelled')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null default 'manual' check (payment_method in ('manual','bank_transfer','cash','card','mobile_money')),
  reference text unique,
  paid_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null,
  notes text
);

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  term_id uuid references public.academic_terms(id) on delete set null,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'active' check (status in ('pending','active','expired','revoked')),
  awarded_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  summary text,
  body text not null,
  content_type text not null default 'announcement' check (content_type in ('news','announcement','event','scholarship')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_programs_department on public.programs(department_id);
create index if not exists idx_courses_department on public.courses(department_id);
create index if not exists idx_courses_program on public.courses(program_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_program on public.applications(program_id);
create index if not exists idx_applications_term on public.applications(term_id);
create index if not exists idx_documents_application on public.application_documents(application_id);
create index if not exists idx_students_program on public.students(program_id);
create index if not exists idx_enrollments_term on public.enrollments(term_id);
create index if not exists idx_registrations_course on public.course_registrations(course_id);
create index if not exists idx_invoices_student on public.invoices(student_id);
create index if not exists idx_payments_student on public.payments(student_id);
create index if not exists idx_announcements_status on public.announcements(status);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

create or replace function public.has_role(required_role text)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = required_role); $$;

create or replace function public.has_any_role(required_roles text[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = any(required_roles)); $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_any_role(array['super_admin','admin','admissions','registrar','faculty','finance']); $$;

alter table public.departments enable row level security;
alter table public.academic_terms enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.staff_faculty enable row level security;
alter table public.applicants enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.admissions_decisions enable row level security;
alter table public.students enable row level security;
alter table public.enrollments enable row level security;
alter table public.course_registrations enable row level security;
alter table public.grades enable row level security;
alter table public.transcripts enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.scholarships enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

create policy departments_read on public.departments for select to authenticated using (true);
create policy departments_admin on public.departments for all to authenticated using (public.has_any_role(array['super_admin','admin'])) with check (public.has_any_role(array['super_admin','admin']));
create policy terms_read on public.academic_terms for select to authenticated using (true);
create policy terms_admin on public.academic_terms for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar'])) with check (public.has_any_role(array['super_admin','admin','registrar']));
create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid() or public.has_any_role(array['super_admin','admin','registrar','admissions','finance']));
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin on public.profiles for all to authenticated using (public.has_any_role(array['super_admin','admin'])) with check (public.has_any_role(array['super_admin','admin']));
create policy roles_self_read on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_any_role(array['super_admin','admin']));
create policy roles_admin on public.user_roles for all to authenticated using (public.has_any_role(array['super_admin','admin'])) with check (public.has_any_role(array['super_admin','admin']));
create policy programs_read on public.programs for select to authenticated using (true);
create policy programs_admin on public.programs for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar'])) with check (public.has_any_role(array['super_admin','admin','registrar']));
create policy courses_read on public.courses for select to authenticated using (true);
create policy courses_manage on public.courses for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar','faculty'])) with check (public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy staff_read on public.staff_faculty for select to authenticated using (public.is_staff() or profile_id = auth.uid());
create policy staff_admin on public.staff_faculty for all to authenticated using (public.has_any_role(array['super_admin','admin'])) with check (public.has_any_role(array['super_admin','admin']));
create policy applicants_self on public.applicants for select to authenticated using (lower(email) = lower(coalesce(auth.jwt()->>'email','')) or public.has_any_role(array['super_admin','admin','admissions']));
create policy applicants_create on public.applicants for insert to authenticated with check (lower(email) = lower(coalesce(auth.jwt()->>'email','')) or public.has_any_role(array['super_admin','admin','admissions']));
create policy applicants_manage on public.applicants for update to authenticated using (public.has_any_role(array['super_admin','admin','admissions'])) with check (public.has_any_role(array['super_admin','admin','admissions']));
create policy applications_self on public.applications for select to authenticated using (exists (select 1 from public.applicants a where a.id = applicant_id and lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))) or public.has_any_role(array['super_admin','admin','admissions']));
create policy applications_create on public.applications for insert to authenticated with check (exists (select 1 from public.applicants a where a.id = applicant_id and lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))) or public.has_any_role(array['super_admin','admin','admissions']));
create policy applications_manage on public.applications for update to authenticated using (public.has_any_role(array['super_admin','admin','admissions'])) with check (public.has_any_role(array['super_admin','admin','admissions']));
create policy documents_self on public.application_documents for select to authenticated using (exists (select 1 from public.applications ap join public.applicants a on a.id = ap.applicant_id where ap.id = application_id and lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))) or public.has_any_role(array['super_admin','admin','admissions']));
create policy documents_manage on public.application_documents for all to authenticated using (public.has_any_role(array['super_admin','admin','admissions'])) with check (public.has_any_role(array['super_admin','admin','admissions']));
create policy decisions_read on public.admissions_decisions for select to authenticated using (public.has_any_role(array['super_admin','admin','admissions','registrar']));
create policy decisions_manage on public.admissions_decisions for all to authenticated using (public.has_any_role(array['super_admin','admin','admissions'])) with check (public.has_any_role(array['super_admin','admin','admissions']));
create policy students_self on public.students for select to authenticated using (profile_id = auth.uid() or public.has_any_role(array['super_admin','admin','registrar','faculty','finance']));
create policy students_manage on public.students for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar'])) with check (public.has_any_role(array['super_admin','admin','registrar']));
create policy enrollments_self on public.enrollments for select to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid()) or public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy enrollments_manage on public.enrollments for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar'])) with check (public.has_any_role(array['super_admin','admin','registrar']));
create policy registrations_self on public.course_registrations for select to authenticated using (exists (select 1 from public.enrollments e join public.students s on s.id=e.student_id where e.id=enrollment_id and s.profile_id=auth.uid()) or public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy registrations_manage on public.course_registrations for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar','faculty'])) with check (public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy grades_self on public.grades for select to authenticated using (exists (select 1 from public.course_registrations cr join public.enrollments e on e.id=cr.enrollment_id join public.students s on s.id=e.student_id where cr.id=registration_id and s.profile_id=auth.uid()) or public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy grades_manage on public.grades for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar','faculty'])) with check (public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy transcripts_self on public.transcripts for select to authenticated using (exists (select 1 from public.students s where s.id=student_id and s.profile_id=auth.uid()) or public.has_any_role(array['super_admin','admin','registrar','faculty']));
create policy transcripts_manage on public.transcripts for all to authenticated using (public.has_any_role(array['super_admin','admin','registrar'])) with check (public.has_any_role(array['super_admin','admin','registrar']));
create policy invoices_self on public.invoices for select to authenticated using (exists (select 1 from public.students s where s.id=student_id and s.profile_id=auth.uid()) or public.has_any_role(array['super_admin','admin','finance']));
create policy invoices_manage on public.invoices for all to authenticated using (public.has_any_role(array['super_admin','admin','finance'])) with check (public.has_any_role(array['super_admin','admin','finance']));
create policy payments_self on public.payments for select to authenticated using (student_id in (select id from public.students where profile_id=auth.uid()) or public.has_any_role(array['super_admin','admin','finance']));
create policy payments_manage on public.payments for all to authenticated using (public.has_any_role(array['super_admin','admin','finance'])) with check (public.has_any_role(array['super_admin','admin','finance']));
create policy scholarships_self on public.scholarships for select to authenticated using (student_id in (select id from public.students where profile_id=auth.uid()) or public.has_any_role(array['super_admin','admin','finance']));
create policy scholarships_manage on public.scholarships for all to authenticated using (public.has_any_role(array['super_admin','admin','finance'])) with check (public.has_any_role(array['super_admin','admin','finance']));
create policy announcements_read on public.announcements for select to authenticated using (status='published' or public.has_any_role(array['super_admin','admin']));
create policy announcements_manage on public.announcements for all to authenticated using (public.has_any_role(array['super_admin','admin'])) with check (public.has_any_role(array['super_admin','admin']));
create policy audit_read on public.audit_logs for select to authenticated using (public.has_any_role(array['super_admin','admin']));
create policy audit_insert on public.audit_logs for insert to authenticated with check (actor_id = auth.uid() and public.is_staff());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do update set email=excluded.email; return new; end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
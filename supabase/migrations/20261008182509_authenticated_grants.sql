-- UNS authenticated table privileges
-- Grants table access to the authenticated role; existing RLS policies remain the authorization boundary.

grant usage on schema public to authenticated;

grant select, insert, update, delete on table
  public.departments,
  public.academic_terms,
  public.profiles,
  public.user_roles,
  public.programs,
  public.courses,
  public.staff_faculty,
  public.applicants,
  public.applications,
  public.application_documents,
  public.admissions_decisions,
  public.students,
  public.enrollments,
  public.course_registrations,
  public.grades,
  public.transcripts,
  public.invoices,
  public.payments,
  public.scholarships,
  public.announcements,
  public.audit_logs
  to authenticated;

grant execute on function public.has_role(text) to authenticated;
grant execute on function public.has_any_role(text[]) to authenticated;
grant execute on function public.is_staff() to authenticated;

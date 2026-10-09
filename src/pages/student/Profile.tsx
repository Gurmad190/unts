import React, { useEffect, useState } from 'react';
import { Mail, Phone, Save, UserRound } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge, cardClass } from '../../components/portal/ui';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';
import Avatar from '../../components/portal/Avatar';
import { updateOwnProfileAvatar } from '../../lib/portalApi';

const StudentProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { studentPortal, isLoading, error, loadStudentData } = usePortalStore();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  useEffect(() => { if (user?.id) void loadStudentData(user.id); }, [loadStudentData, user?.id]);
  const student = studentPortal?.student;
  const saveAvatar = async () => {
    if (!user?.id || !avatarFile) return;
    setAvatarSaving(true); setAvatarNotice(null);
    try { await updateOwnProfileAvatar(user.id, avatarFile); setAvatarFile(null); await loadStudentData(user.id); setAvatarNotice('Profile picture updated.'); } catch (reason) { setAvatarNotice(reason instanceof Error ? reason.message : 'Could not update profile picture.'); } finally { setAvatarSaving(false); }
  };
  return <div className="space-y-8"><PageHeader eyebrow="Student services" title="My profile" description="Your identity and enrolment details as recorded by the University." />{error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}{isLoading ? <div className="grid gap-6 lg:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /></div> : !student ? <EmptyState title="Profile unavailable" description="Your student record is not available yet." /> : <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><section className={`${cardClass} p-6`}><div className="flex items-center gap-4"><Avatar name={student.name} path={student.avatar_url} size="lg" /><div><h2 className="text-lg font-semibold text-slate-950">{student.name}</h2><p className="mt-1 text-sm text-slate-500">{student.student_number}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-2"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} className="block max-w-full text-xs" /><button type="button" onClick={() => void saveAvatar()} disabled={!avatarFile || avatarSaving} className="inline-flex items-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="mr-1.5 h-3.5 w-3.5" /> Save picture</button></div>{avatarNotice && <p className="mt-2 text-xs text-slate-500">{avatarNotice}</p>}<div className="mt-6"><StatusBadge status={student.status} /></div><div className="mt-6 space-y-4 border-t border-slate-100 pt-5"><div className="flex items-center gap-3 text-sm text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{student.email}</div><div className="flex items-center gap-3 text-sm text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{student.phone || 'No phone number recorded'}</div></div></section><section className={`${cardClass} p-6`}><div className="flex items-center gap-2"><UserRound className="h-5 w-5 text-teal-600" /><h2 className="font-semibold text-slate-950">Enrolment details</h2></div><dl className="mt-6 grid gap-6 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Programme</dt><dd className="mt-2 text-sm font-medium text-slate-900">{student.program_name}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</dt><dd className="mt-2 text-sm font-medium text-slate-900">{student.department_name}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Enrolment date</dt><dd className="mt-2 text-sm font-medium text-slate-900">{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'Not recorded'}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admission term</dt><dd className="mt-2 text-sm font-medium text-slate-900">{student.admission_term_id || 'Not recorded'}</dd></div></dl><div className="mt-8 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">Need to change a personal detail? Contact the Registrar so the official record stays accurate.</div></section></div>}</div>;
};

export default StudentProfile;

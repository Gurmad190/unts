import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCheck, Users } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, Select, StatusBadge, cardClass } from '../../components/portal/ui';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const STUDENT_STATUSES = ['active', 'graduated', 'suspended', 'withdrawn', 'inactive'] as const;

const AdminStudents: React.FC = () => {
  const { user } = useAuthStore();
  const { students, terms, isLoading, error, loadStudents, loadTerms, updateStudentRecordStatus, enrollStudent } = usePortalStore();
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const canManage = ['super_admin', 'admin', 'registrar'].includes(user?.systemRole || '');
  const currentTerm = terms.find((term) => term.is_current) || null;

  useEffect(() => { void Promise.all([loadStudents(), loadTerms()]); }, [loadStudents, loadTerms]);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return students;
    return students.filter((student) => [student.name, student.email, student.student_number, student.program_name, student.department_name].some((value) => value.toLowerCase().includes(search)));
  }, [query, students]);

  const changeStatus = async (id: string, status: typeof STUDENT_STATUSES[number]) => {
    setSavingId(id); setSuccess(null);
    try { await updateStudentRecordStatus(id, status); setSuccess('Student status updated.'); } catch { /* store exposes the error */ } finally { setSavingId(null); }
  };

  const enroll = async (id: string) => {
    if (!currentTerm) return;
    setSavingId(id); setSuccess(null);
    try { await enrollStudent(id, currentTerm.id); setSuccess(`Student enrolled in ${currentTerm.name}.`); } catch { /* store exposes the error */ } finally { setSavingId(null); }
  };

  return <div className="space-y-8"><PageHeader eyebrow="Student registry" title="Students" description="Search student records, manage lifecycle status and enrol eligible students into the current academic term." action={<div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800"><Users className="h-4 w-4" /> {students.length} records</div>} />
    {success && <Notice tone="success">{success}</Notice>}
    {error && <Notice tone="error">{error}</Notice>}
    {canManage && !currentTerm && <Notice tone="info">No current academic term is configured. Create or activate one before enrolling students.</Notice>}
    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 p-4 sm:p-5"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, ID or programme" className="pl-10" /></div></div>
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length === 0 ? <div className="p-6"><EmptyState title={students.length ? 'No matching students' : 'No student records yet'} description={students.length ? 'Try a different name, ID or programme.' : 'Student records appear automatically after an admissions application is approved.'} /></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left"><thead className="bg-slate-50"><tr>{['Student', 'Programme', 'Department', 'Status', 'Enrolled', ...(canManage ? ['Actions'] : [])].map((heading) => <th key={heading} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((student) => <tr key={student.id} className="hover:bg-slate-50"><td className="whitespace-nowrap px-5 py-4"><p className="text-sm font-semibold text-slate-900">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.student_number} · {student.email}</p></td><td className="px-5 py-4 text-sm text-slate-700">{student.program_name}</td><td className="px-5 py-4 text-sm text-slate-700">{student.department_name}</td><td className="px-5 py-4">{canManage ? <Select value={student.status} disabled={savingId === student.id} onChange={(event) => void changeStatus(student.id, event.target.value as typeof STUDENT_STATUSES[number])} className="min-w-32"><option value="active">Active</option><option value="graduated">Graduated</option><option value="suspended">Suspended</option><option value="withdrawn">Withdrawn</option><option value="inactive">Inactive</option></Select> : <StatusBadge status={student.status} />}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : '—'}</td>{canManage && <td className="px-5 py-4"><Button variant="secondary" disabled={!currentTerm || savingId === student.id || ['withdrawn', 'graduated', 'suspended'].includes(student.status)} onClick={() => void enroll(student.id)}><UserCheck className="mr-1.5 h-4 w-4" /> Enrol current term</Button></td>}</tr>)}</tbody></table></div>}
    </section></div>;
};

export default AdminStudents;

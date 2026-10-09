import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { EmptyState, Input, PageHeader, StatusBadge, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminStudents: React.FC = () => {
  const { students, isLoading, error, loadStudents } = usePortalStore();
  const [query, setQuery] = useState('');
  useEffect(() => { void loadStudents(); }, [loadStudents]);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return students;
    return students.filter((student) => [student.name, student.email, student.student_number, student.program_name, student.department_name].some((value) => value.toLowerCase().includes(search)));
  }, [query, students]);

  return <div className="space-y-8"><PageHeader eyebrow="Student registry" title="Students" description="A searchable view of enrolled student records created through approved admissions." action={<div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800"><Users className="h-4 w-4" /> {students.length} records</div>} />
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 p-4 sm:p-5"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, ID or programme" className="pl-10" /></div></div>
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length === 0 ? <div className="p-6"><EmptyState title={students.length ? 'No matching students' : 'No student records yet'} description={students.length ? 'Try a different name, ID or programme.' : 'Student records appear automatically after an admissions application is approved.'} /></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left"><thead className="bg-slate-50"><tr>{['Student', 'Programme', 'Department', 'Status', 'Enrolled'].map((heading) => <th key={heading} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((student) => <tr key={student.id} className="hover:bg-slate-50"><td className="whitespace-nowrap px-5 py-4"><p className="text-sm font-semibold text-slate-900">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.student_number} · {student.email}</p></td><td className="px-5 py-4 text-sm text-slate-700">{student.program_name}</td><td className="px-5 py-4 text-sm text-slate-700">{student.department_name}</td><td className="px-5 py-4"><StatusBadge status={student.status} /></td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div>}
    </section></div>;
};

export default AdminStudents;

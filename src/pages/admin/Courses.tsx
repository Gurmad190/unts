import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Save } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, Select, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminCourses: React.FC = () => {
  const { departments, programs, courses, isLoading, error, loadCatalogue, loadCourses, addCourse, toggleCourse } = usePortalStore();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ department_id: '', program_id: '', code: '', title: '', credits: 3, level: 1, active: true });
  const departmentMap = useMemo(() => new Map(departments.map((department) => [department.id, department.name])), [departments]);
  const programMap = useMemo(() => new Map(programs.map((program) => [program.id, program.name])), [programs]);

  useEffect(() => { void Promise.all([loadCatalogue(), loadCourses()]); }, [loadCatalogue, loadCourses]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      await addCourse({ ...form, program_id: form.program_id || null });
      setForm({ department_id: '', program_id: '', code: '', title: '', credits: 3, level: 1, active: true });
      setShowForm(false);
    } catch { /* store exposes the error */ } finally { setSaving(false); }
  };

  const changeStatus = async (id: string, active: boolean) => {
    setSaving(true);
    try { await toggleCourse(id, active); } finally { setSaving(false); }
  };

  return <div className="space-y-8">
    <PageHeader eyebrow="Academic catalogue" title="Courses" description="Maintain course offerings used by registrar, faculty and student academic workflows." action={<Button onClick={() => setShowForm((value) => !value)}><Plus className="mr-1.5 h-4 w-4" /> New course</Button>} />
    {error && <Notice tone="error">{error}</Notice>}
    {showForm && <form onSubmit={save} className={`${cardClass} space-y-4 p-6`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BookOpen className="h-5 w-5" /></div><div><h2 className="font-semibold">Add course</h2><p className="mt-1 text-sm text-slate-500">Course codes are unique across the catalogue.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><Select required value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })}><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</Select><Select value={form.program_id} onChange={(event) => setForm({ ...form, program_id: event.target.value })}><option value="">Shared / department course</option>{programs.filter((program) => !form.department_id || program.department_id === form.department_id).map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</Select><Input required placeholder="Code, e.g. CS101" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /><Input required placeholder="Course title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><Input required type="number" min="0.5" step="0.5" value={form.credits} onChange={(event) => setForm({ ...form, credits: Number(event.target.value) })} /><Input type="number" min="1" max="10" value={form.level} onChange={(event) => setForm({ ...form, level: Number(event.target.value) })} /></div><div className="flex gap-2"><Button disabled={saving}><Save className="mr-1.5 h-4 w-4" /> Save course</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div></form>}
    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-semibold">Course catalogue <span className="ml-1 text-sm font-normal text-slate-500">{courses.length}</span></h2></div>{isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : courses.length === 0 ? <div className="p-6"><EmptyState title="No courses yet" description="Add courses to begin building the academic delivery catalogue." /></div> : <div className="divide-y divide-slate-100">{courses.map((course) => <div key={course.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{course.code} · {course.title}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${course.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{course.active ? 'Active' : 'Inactive'}</span></div><p className="mt-1 text-sm text-slate-500">{course.department_name || departmentMap.get(course.department_id) || 'Department'}{course.program_id ? ` · ${course.program_name || programMap.get(course.program_id) || 'Programme'}` : ' · Shared course'} · {course.credits} credits · Level {course.level || '—'}</p></div><Button variant="secondary" disabled={saving} onClick={() => void changeStatus(course.id, !course.active)}>{course.active ? 'Deactivate' : 'Activate'}</Button></div>)}</div>}</section>
  </div>;
};

export default AdminCourses;

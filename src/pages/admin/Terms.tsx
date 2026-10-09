import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, Plus, Save } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminTerms: React.FC = () => {
  const { terms, isLoading, error, loadTerms, addTerm, activateTerm } = usePortalStore();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', starts_on: '', ends_on: '', is_current: false });

  useEffect(() => { void loadTerms(); }, [loadTerms]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setSuccess(null);
    try {
      await addTerm(form);
      setForm({ name: '', code: '', starts_on: '', ends_on: '', is_current: false });
      setShowForm(false);
      setSuccess('Academic term created.');
    } catch { /* store exposes the error */ } finally { setSaving(false); }
  };

  const activate = async (id: string) => {
    setSaving(true); setSuccess(null);
    try {
      await activateTerm(id);
      setSuccess('Current academic term updated.');
    } catch { /* store exposes the error */ } finally { setSaving(false); }
  };

  return <div className="space-y-8">
    <PageHeader eyebrow="Academic calendar" title="Academic terms" description="Set the active admissions term and keep the academic calendar explicit for registrar workflows." action={<Button onClick={() => setShowForm((value) => !value)}><Plus className="mr-1.5 h-4 w-4" /> New term</Button>} />
    {success && <Notice tone="success">{success}</Notice>}
    {error && <Notice tone="error">{error}</Notice>}
    {showForm && <form onSubmit={save} className={`${cardClass} space-y-4 p-6`}>
      <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-300"><CalendarDays className="h-5 w-5" /></div><div><h2 className="font-semibold">Create academic term</h2><p className="mt-1 text-sm text-slate-500">Only one term can be current. Changing it affects public application availability.</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><Input required placeholder="Name, e.g. Spring 2027" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Input required placeholder="Code, e.g. 2027-SPRING" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /><div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Starts on</label><Input required type="date" value={form.starts_on} onChange={(event) => setForm({ ...form, starts_on: event.target.value })} /></div><div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Ends on</label><Input required type="date" value={form.ends_on} onChange={(event) => setForm({ ...form, ends_on: event.target.value })} /></div></div>
      <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={form.is_current} onChange={(event) => setForm({ ...form, is_current: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-slate-950" /> Make this the current term</label>
      <div className="flex gap-2"><Button disabled={saving}><Save className="mr-1.5 h-4 w-4" /> Save term</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form>}
    <section className={`${cardClass} overflow-hidden`}>
      <div className="border-b border-slate-100 px-6 py-5"><h2 className="font-semibold">Term history <span className="ml-1 text-sm font-normal text-slate-500">{terms.length}</span></h2><p className="mt-1 text-sm text-slate-500">The current term is used by the public application form.</p></div>
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : terms.length === 0 ? <div className="p-6"><EmptyState title="No academic terms" description="Create a term to enable admissions and registrar planning." /></div> : <div className="divide-y divide-slate-100">{terms.map((term) => <div key={term.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{term.name}</p>{term.is_current && <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700"><Check className="h-3.5 w-3.5" /> Current</span>}</div><p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{term.code}</p><p className="mt-2 text-sm text-slate-600">{new Date(`${term.starts_on}T00:00:00`).toLocaleDateString()} – {new Date(`${term.ends_on}T00:00:00`).toLocaleDateString()}</p></div>{!term.is_current && <Button variant="secondary" disabled={saving} onClick={() => void activate(term.id)}>Make current</Button>}</div>)}</div>}
    </section>
  </div>;
};

export default AdminTerms;

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock3, FileCheck2, Search, X } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, Select, StatusBadge, Textarea, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminAdmissions: React.FC = () => {
  const { applications, isLoading, error, loadApplications, decideApplication, setApplicationWorkflowStatus, clearError } = usePortalStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void loadApplications(); }, [loadApplications]);

  const filtered = useMemo(() => applications.filter((application) => {
    const matchesStatus = status === 'all' || application.status === status;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [application.applicant_name, application.applicant_email, application.application_number, application.program_name].some((value) => value.toLowerCase().includes(search));
    return matchesStatus && matchesQuery;
  }), [applications, query, status]);

  const decide = async (id: string, decision: 'accepted' | 'rejected' | 'waitlisted') => {
    setSaving(true); setSuccess(null); setTemporaryPassword(null); clearError();
    try {
      const result = await decideApplication(id, decision, notes);
      setSuccess(decision === 'accepted' ? 'Application approved and the student record was created.' : `Application ${decision}.`);
      setTemporaryPassword(result.temporaryPassword);
      setSelectedId(null); setNotes('');
    } catch { /* store exposes the error */ } finally { setSaving(false); }
  };


  const decideWorkflow = async (id: string, workflowStatus: 'new' | 'review' | 'withdrawn') => {
    setSaving(true); setSuccess(null); setTemporaryPassword(null); clearError();
    try {
      await setApplicationWorkflowStatus(id, workflowStatus, notes);
      setSuccess(workflowStatus === 'withdrawn' ? 'Application withdrawn from the active admissions queue.' : `Application marked ${workflowStatus === 'review' ? 'under review' : 'new'}.`);
      setSelectedId(null); setNotes('');
    } catch { /* store exposes the error */ } finally { setSaving(false); }
  };

  return <div className="space-y-8"><PageHeader eyebrow="Admissions workflow" title="Applications" description="Review online applications, record a decision and create a student record only after approval." action={<div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"><FileCheck2 className="h-4 w-4" /> {applications.filter((application) => ['applied', 'new', 'review'].includes(application.status)).length} awaiting review</div>} />
    {success && <Notice tone="success"><p>{success}</p>{temporaryPassword && <p className="mt-2 font-medium">Temporary student password: <code className="rounded bg-white/70 px-2 py-1">{temporaryPassword}</code> <span className="font-normal">Share this securely; it is shown only once.</span></p>}</Notice>}
    {(error) && <Notice tone="error">{error}</Notice>}
    <section className={`${cardClass} overflow-hidden`}><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applicant, application number or programme" className="pl-10" /></div><Select value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-48"><option value="all">All statuses</option><option value="new">New</option><option value="review">Under review</option><option value="applied">Applied</option><option value="accepted">Accepted</option><option value="waitlisted">Waitlisted</option><option value="rejected">Rejected</option><option value="withdrawn">Withdrawn</option></Select></div>
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length === 0 ? <div className="p-6"><EmptyState title="No applications found" description="Applications submitted through the public form will appear in this queue." /></div> : <div className="divide-y divide-slate-100">{filtered.map((application) => <div key={application.id} className="p-5 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-950">{application.applicant_name}</p><StatusBadge status={application.status} /></div><p className="mt-1 text-xs text-slate-500">{application.application_number} · {application.applicant_email} · {application.program_name}</p><p className="mt-2 text-sm text-slate-600">Submitted {new Date(application.submitted_at).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2">{['accepted', 'waitlisted', 'rejected'].map((decision) => <Button key={decision} variant={decision === 'rejected' ? 'danger' : decision === 'accepted' ? 'primary' : 'secondary'} disabled={saving || ['accepted', 'rejected'].includes(application.status)} onClick={() => { setSelectedId(application.id); setNotes(''); }}>{decision === 'accepted' ? <Check className="mr-1.5 h-4 w-4" /> : decision === 'rejected' ? <X className="mr-1.5 h-4 w-4" /> : <Clock3 className="mr-1.5 h-4 w-4" />}{decision === 'accepted' ? 'Approve' : decision === 'rejected' ? 'Reject' : 'Waitlist'}</Button>)}{['applied', 'new', 'waitlisted'].includes(application.status) && <Button variant="secondary" disabled={saving} onClick={() => { setSelectedId(application.id); setNotes(''); }}>Review</Button>}</div></div>{selectedId === application.id && <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review note (optional)</label><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-2" placeholder="Add context for the decision" /><div className="mt-3 flex flex-wrap gap-2"><Button disabled={saving} onClick={() => decide(application.id, 'accepted')}>Approve application</Button><Button variant="secondary" disabled={saving} onClick={() => decideWorkflow(application.id, 'review')}>Mark under review</Button><Button variant="secondary" disabled={saving} onClick={() => decideWorkflow(application.id, 'new')}>Return to new</Button><Button variant="secondary" disabled={saving} onClick={() => decide(application.id, 'waitlisted')}>Waitlist</Button><Button variant="danger" disabled={saving} onClick={() => decide(application.id, 'rejected')}>Reject</Button><Button variant="secondary" disabled={saving} onClick={() => decideWorkflow(application.id, 'withdrawn')}>Withdraw</Button><Button variant="secondary" disabled={saving} onClick={() => setSelectedId(null)}>Cancel</Button></div></div>}</div>)}</div>}
    </section></div>;
};

export default AdminAdmissions;

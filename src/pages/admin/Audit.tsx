import React, { useEffect, useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';
import { EmptyState, Input, Notice, PageHeader, Select, StatusBadge, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminAudit: React.FC = () => {
  const { auditLogs, isLoading, error, loadAuditLogs } = usePortalStore();
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState('all');
  useEffect(() => { void loadAuditLogs(); }, [loadAuditLogs]);
  const entities = useMemo(() => [...new Set(auditLogs.map((log) => log.entity_type))].sort(), [auditLogs]);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchesEntity = entity === 'all' || log.entity_type === entity;
      const matchesSearch = !search || [log.actor_name, log.actor_email, log.action, log.entity_type, log.entity_id || ''].some((value) => value.toLowerCase().includes(search));
      return matchesEntity && matchesSearch;
    });
  }, [auditLogs, entity, query]);

  return <div className="space-y-8"><PageHeader eyebrow="Governance" title="Audit trail" description="Review recent operational changes recorded by the database workflows and protected portal actions." action={<div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"><History className="h-4 w-4" /> {auditLogs.length} recent events</div>} />
    {error && <Notice tone="error">{error}</Notice>}
    <section className={`${cardClass} overflow-hidden`}><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actor, action or entity" className="pl-10" /></div><Select value={entity} onChange={(event) => setEntity(event.target.value)} className="sm:w-52"><option value="all">All entities</option>{entities.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</Select></div>
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length === 0 ? <div className="p-6"><EmptyState title="No audit events" description="New admissions, enrolment, catalogue and access changes will appear here." /></div> : <div className="divide-y divide-slate-100">{filtered.map((log) => <div key={log.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={log.action} /><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{log.entity_type.replaceAll('_', ' ')}</span></div><p className="mt-2 text-sm font-semibold text-slate-900">{log.actor_name}{log.actor_email ? ` · ${log.actor_email}` : ''}</p><p className="mt-1 break-all text-xs text-slate-500">{log.entity_id || 'No entity ID'}</p></div><time className="shrink-0 text-xs text-slate-500" dateTime={log.created_at}>{new Date(log.created_at).toLocaleString()}</time></div>)}</div>}
    </section>
  </div>;
};

export default AdminAudit;

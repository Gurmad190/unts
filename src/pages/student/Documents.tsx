import React, { useEffect } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { Button, EmptyState, PageHeader, StatusBadge, cardClass } from '../../components/portal/ui';
import { getPrivateStorageUrl } from '../../lib/portalApi';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const StudentDocuments: React.FC = () => {
  const { user } = useAuthStore();
  const { studentPortal, isLoading, error, loadStudentData } = usePortalStore();
  useEffect(() => { if (user?.id) void loadStudentData(user.id); }, [user?.id, loadStudentData]);
  const open = async (path: string) => { const url = await getPrivateStorageUrl('student-documents', path); if (url) window.open(url, '_blank', 'noopener,noreferrer'); };
  const documents = studentPortal?.documents || [];
  return <div className="space-y-8"><PageHeader eyebrow="Student services" title="My documents" description="View the documents associated with your admission and student record, including their verification status." action={<FileText className="h-6 w-6 text-teal-600" />} />{error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}{isLoading ? <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> : documents.length === 0 ? <EmptyState title="No documents available" description="Documents will appear here once the Admissions office uploads them to your record." /> : <section className={`${cardClass} divide-y divide-slate-100`}>{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-sm font-semibold">{document.file_name}</p><p className="mt-1 text-xs text-slate-500">{document.document_type} · uploaded {new Date(document.uploaded_at).toLocaleDateString()}</p></div><div className="flex items-center gap-3"><StatusBadge status={document.status} /><Button variant="secondary" onClick={() => void open(document.storage_path)}><ExternalLink className="mr-1.5 h-4 w-4" /> View</Button></div></div>)}</section>}</div>;
};
export default StudentDocuments;

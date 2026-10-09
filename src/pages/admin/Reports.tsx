import React, { useEffect } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import { Button, EmptyState, PageHeader, StatCard, cardClass } from '../../components/portal/ui';
import { downloadCsv, printCurrentReport } from '../../lib/export';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { students, applications, invoices, auditLogs, isLoading, loadStudents, loadApplications, loadInvoices, loadAuditLogs } = usePortalStore();
  const canAudit = ['super_admin', 'admin'].includes(user?.systemRole || '');
  useEffect(() => { void Promise.all([loadStudents(), loadApplications(), loadInvoices(), canAudit ? loadAuditLogs() : Promise.resolve()]); }, [canAudit, loadStudents, loadApplications, loadInvoices, loadAuditLogs]);
  const activeStudents = students.filter((student) => student.status === 'active').length;
  const outstanding = invoices.reduce((sum, invoice) => sum + (invoice.balance || 0), 0);

  return <div className="space-y-8 print:bg-white"><PageHeader eyebrow="Institutional reporting" title="Reports & exports" description="Download current production records as CSV or print a clean report. Exports follow the same role boundaries as the portal." action={<Button variant="secondary" onClick={printCurrentReport}><Printer className="mr-2 h-4 w-4" /> Print report</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Students" value={students.length} detail={`${activeStudents} active`} icon={<BarChart3 className="h-5 w-5" />} /><StatCard label="Applications" value={applications.length} detail="All visible application states" icon={<BarChart3 className="h-5 w-5" />} tone="teal" /><StatCard label="Invoices" value={invoices.length} detail="Financial role visibility" icon={<BarChart3 className="h-5 w-5" />} tone="amber" /><StatCard label="Outstanding balance" value={outstanding.toFixed(2)} detail="Across visible invoices" icon={<BarChart3 className="h-5 w-5" />} tone="rose" /></div>
    {isLoading && <div className="h-2 animate-pulse rounded-full bg-slate-200" />}
    <section className={`${cardClass} p-6`}><h2 className="font-semibold">Available exports</h2><p className="mt-1 text-sm text-slate-500">CSV files contain only the fields permitted by your current portal role.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Button variant="secondary" onClick={() => downloadCsv('uns-students.csv', students.map((student) => ({ student_number: student.student_number, name: student.name, email: student.email, programme: student.program_name, department: student.department_name, status: student.status, enrollment_date: student.enrollment_date || '' })))}><Download className="mr-2 h-4 w-4" /> Students CSV</Button><Button variant="secondary" onClick={() => downloadCsv('uns-applications.csv', applications.map((application) => ({ application_number: application.application_number, applicant: application.applicant_name, email: application.applicant_email, programme: application.program_name, status: application.status, submitted_at: application.submitted_at })))}><Download className="mr-2 h-4 w-4" /> Applications CSV</Button><Button variant="secondary" onClick={() => downloadCsv('uns-invoices.csv', invoices.map((invoice) => ({ invoice_number: invoice.invoice_number, student: invoice.student_name || '', student_number: invoice.student_number || '', term: invoice.term_name || '', amount: invoice.amount, paid: invoice.paid_amount || 0, balance: invoice.balance || 0, status: invoice.status })))}><Download className="mr-2 h-4 w-4" /> Finance CSV</Button>{canAudit && <Button variant="secondary" onClick={() => downloadCsv('uns-audit-log.csv', auditLogs.map((log) => ({ created_at: log.created_at, actor: log.actor_email, action: log.action, entity_type: log.entity_type, entity_id: log.entity_id || '' })))}><Download className="mr-2 h-4 w-4" /> Audit CSV</Button>}</div></section>
    {!students.length && !applications.length && !invoices.length && <EmptyState title="No production records to report" description="The report workspace stays empty until real university records exist; no demo data is inserted." />}
  </div>;
};
export default Reports;

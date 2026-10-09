import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ExternalLink, FileUp, GraduationCap, Save, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../../components/portal/Avatar';
import { Button, EmptyState, Input, Notice, PageHeader, Select, StatusBadge, Textarea, cardClass } from '../../components/portal/ui';
import { getPrivateStorageUrl, uploadStudentDocument, verifyApplicationDocument } from '../../lib/portalApi';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const statusOptions = ['active', 'graduated', 'suspended', 'withdrawn', 'inactive'] as const;

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { studentDetail, programs, terms, courses, error, isLoading, loadStudentDetail, loadCatalogue, loadCourses, loadTerms, updateStudentRecordStatus, updateStudentProfile, registerCourse, dropCourse, recordGrade } = usePortalStore();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', dateOfBirth: '', nationality: '', address: '', programId: '', admissionTermId: '' });
  const [courseTermId, setCourseTermId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [gradeValues, setGradeValues] = useState<Record<string, { grade: string; points: string; remarks: string }>>({});
  const [documentType, setDocumentType] = useState('identity');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const canEdit = ['super_admin', 'admin', 'registrar'].includes(user?.systemRole || '');
  const canFinance = ['super_admin', 'admin', 'finance'].includes(user?.systemRole || '');
  const canManageDocuments = ['super_admin', 'admin', 'admissions'].includes(user?.systemRole || '');

  useEffect(() => {
    if (id) void loadStudentDetail(id);
    void Promise.all([loadCatalogue(), loadCourses(), loadTerms()]);
  }, [id, loadStudentDetail, loadCatalogue, loadCourses, loadTerms]);

  useEffect(() => {
    if (!studentDetail) return;
    setForm({
      fullName: studentDetail.student.name,
      phone: studentDetail.student.phone || '',
      dateOfBirth: studentDetail.student.date_of_birth || '',
      nationality: studentDetail.student.nationality || '',
      address: studentDetail.student.address || '',
      programId: studentDetail.student.program_id || '',
      admissionTermId: studentDetail.student.admission_term_id || '',
    });
    setCourseTermId(studentDetail.enrollments.find((enrollment) => enrollment.status === 'enrolled')?.term_id || terms.find((term) => term.is_current)?.id || '');
  }, [studentDetail, terms]);

  const eligibleCourses = useMemo(() => courses.filter((course) => course.active && (!course.program_id || course.program_id === studentDetail?.student.program_id)), [courses, studentDetail?.student.program_id]);
  const selectedRegistrationIds = new Set(studentDetail?.registrations.filter((registration) => registration.status !== 'dropped').map((registration) => registration.course_id) || []);

  const saveProfile = async () => {
    if (!id) return;
    setSaving(true); setNotice(null);
    try {
      await updateStudentProfile({ studentId: id, ...form, programId: form.programId || null, admissionTermId: form.admissionTermId || null });
      setNotice('Student profile saved securely.');
    } catch { /* store error is rendered below */ } finally { setSaving(false); }
  };

  const changeStatus = async (status: typeof statusOptions[number]) => {
    if (!id) return;
    setSaving(true); setNotice(null);
    try { await updateStudentRecordStatus(id, status); await loadStudentDetail(id); setNotice('Student lifecycle status updated.'); } catch { /* store error */ } finally { setSaving(false); }
  };

  const register = async () => {
    if (!id || !courseTermId || !courseId) return;
    setSaving(true); setNotice(null);
    try { await registerCourse(id, courseTermId, courseId); setCourseId(''); setNotice('Course registration saved.'); } catch { /* store error */ } finally { setSaving(false); }
  };

  const submitGrade = async (registrationId: string) => {
    const value = gradeValues[registrationId];
    if (!value?.grade || !id) return;
    setSaving(true); setNotice(null);
    try { await recordGrade(registrationId, value.grade, Number(value.points || 0), value.remarks); setNotice('Grade saved and registration marked complete.'); } catch { /* store error */ } finally { setSaving(false); }
  };

  const uploadDocument = async () => {
    if (!documentFile || !studentDetail?.application_id) return;
    setSaving(true); setNotice(null);
    try { await uploadStudentDocument(studentDetail.application_id, documentType, documentFile); setDocumentFile(null); setNotice('Document uploaded for verification.'); if (id) await loadStudentDetail(id); } catch { /* store error */ } finally { setSaving(false); }
  };

  const openDocument = async (path: string) => {
    try { const url = await getPrivateStorageUrl('student-documents', path); if (url) window.open(url, '_blank', 'noopener,noreferrer'); } catch { setNotice('The document could not be opened.'); }
  };

  if (isLoading && !studentDetail) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (!studentDetail) return <EmptyState title="Student record not found" description={error || 'The requested student record is unavailable to your role.'} action={<Link to="/admin/students" className="font-semibold text-slate-900">Back to students</Link>} />;
  const { student, enrollments, registrations, grades, transcripts, invoices, payments, scholarships, documents } = studentDetail;
  const gradeByRegistration = new Map(grades.map((grade) => [grade.registration_id, grade]));

  return <div className="space-y-8">
    <Link to="/admin/students" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to students</Link>
    <PageHeader eyebrow="Student registry" title={student.name} description={`${student.student_number} · ${student.program_name}`} action={<div className="flex items-center gap-3"><Avatar name={student.name} path={student.avatar_url} size="lg" /><StatusBadge status={student.status} /></div>} />
    {notice && <Notice tone="success">{notice}</Notice>}
    {error && <Notice tone="error">{error}</Notice>}

    <section className={`${cardClass} p-6`}>
      <div className="flex items-center gap-2"><UserRound className="h-5 w-5 text-teal-600" /><h2 className="font-semibold">Profile and lifecycle</h2></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">Full name<Input value={form.fullName} disabled={!canEdit} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-1.5" /></label>
        <label className="text-sm font-medium text-slate-700">Phone<Input value={form.phone} disabled={!canEdit} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1.5" /></label>
        <label className="text-sm font-medium text-slate-700">Date of birth<Input type="date" value={form.dateOfBirth} disabled={!canEdit} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} className="mt-1.5" /></label>
        <label className="text-sm font-medium text-slate-700">Nationality<Input value={form.nationality} disabled={!canEdit} onChange={(event) => setForm({ ...form, nationality: event.target.value })} className="mt-1.5" /></label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">Address<Textarea value={form.address} disabled={!canEdit} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-1.5" rows={2} /></label>
        <label className="text-sm font-medium text-slate-700">Programme<Select value={form.programId} disabled={!canEdit} onChange={(event) => setForm({ ...form, programId: event.target.value })} className="mt-1.5"><option value="">Select programme</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</Select></label>
        <label className="text-sm font-medium text-slate-700">Admission term<Select value={form.admissionTermId} disabled={!canEdit} onChange={(event) => setForm({ ...form, admissionTermId: event.target.value })} className="mt-1.5"><option value="">Select term</option>{terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</Select></label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3"><Select value={student.status} disabled={!canEdit || saving} onChange={(event) => void changeStatus(event.target.value as typeof statusOptions[number])} className="w-44"><option value="active">Active</option><option value="graduated">Graduated</option><option value="suspended">Suspended</option><option value="withdrawn">Withdrawn</option><option value="inactive">Archived / inactive</option></Select>{canEdit && <Button onClick={() => void saveProfile()} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save profile</Button>}</div>
    </section>

    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 p-6"><div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-teal-600" /><h2 className="font-semibold">Academic history and registration</h2></div></div><div className="p-6"><h3 className="text-sm font-semibold text-slate-900">Term enrolments</h3>{enrollments.length ? <div className="mt-3 overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left"><thead className="bg-slate-50"><tr>{['Term', 'Status', 'Enrolled on'].map((heading) => <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{enrollments.map((enrollment) => <tr key={enrollment.id}><td className="px-4 py-3 text-sm font-medium">{enrollment.term_name}</td><td className="px-4 py-3"><StatusBadge status={enrollment.status} /></td><td className="px-4 py-3 text-sm text-slate-600">{new Date(enrollment.enrolled_at || '').toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-slate-500">No term enrolments recorded.</p>}
      {canEdit && <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-semibold">Register a course</h3><div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.5fr_auto]"><Select value={courseTermId} onChange={(event) => setCourseTermId(event.target.value)}><option value="">Select enrolled term</option>{enrollments.filter((enrollment) => enrollment.status === 'enrolled').map((enrollment) => <option key={enrollment.term_id} value={enrollment.term_id}>{enrollment.term_name}</option>)}</Select><Select value={courseId} onChange={(event) => setCourseId(event.target.value)}><option value="">Select active course</option>{eligibleCourses.filter((course) => !selectedRegistrationIds.has(course.id)).map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</Select><Button onClick={() => void register()} disabled={saving || !courseTermId || !courseId}>Register</Button></div></div>}
      <h3 className="mt-8 text-sm font-semibold text-slate-900">Course registrations and grades</h3>{registrations.length ? <div className="mt-3 space-y-3">{registrations.map((registration) => { const grade = gradeByRegistration.get(registration.id); const value = gradeValues[registration.id] || { grade: grade?.grade || '', points: grade?.grade_points?.toString() || '', remarks: grade?.remarks || '' }; return <div key={registration.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{registration.course_code} · {registration.course_title}</p><p className="mt-1 text-xs text-slate-500">{registration.credits} credits · registered {registration.registered_at ? new Date(registration.registered_at).toLocaleDateString() : '—'}</p></div><div className="flex items-center gap-2"><StatusBadge status={grade?.grade ? 'completed' : registration.status} />{canEdit && registration.status !== 'dropped' && <Button variant="secondary" onClick={() => void dropCourse(registration.id)} disabled={saving}>Drop</Button>}</div></div>{canEdit && registration.status !== 'dropped' && <div className="mt-4 grid gap-2 md:grid-cols-[110px_110px_1fr_auto]"><Input placeholder="Grade" value={value.grade} onChange={(event) => setGradeValues({ ...gradeValues, [registration.id]: { ...value, grade: event.target.value.toUpperCase() } })} /><Input type="number" min="0" max="4" step="0.01" placeholder="Points" value={value.points} onChange={(event) => setGradeValues({ ...gradeValues, [registration.id]: { ...value, points: event.target.value } })} /><Input placeholder="Remarks" value={value.remarks} onChange={(event) => setGradeValues({ ...gradeValues, [registration.id]: { ...value, remarks: event.target.value } })} /><Button variant="secondary" onClick={() => void submitGrade(registration.id)} disabled={saving || !value.grade}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Grade</Button></div>}</div>; })}</div> : <p className="mt-3 text-sm text-slate-500">No course registrations recorded.</p>}</div></section>

    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 p-6"><h2 className="font-semibold">Transcript and documents</h2></div><div className="grid gap-6 p-6 xl:grid-cols-2"><div><h3 className="text-sm font-semibold">Transcript summaries</h3>{transcripts.length ? <div className="mt-3 space-y-2">{transcripts.map((transcript) => <div key={transcript.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{transcript.term_name || transcript.term_id}</span><span className="text-slate-600">{transcript.credits_earned} credits · GPA {transcript.term_gpa?.toFixed(2) || '—'}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No transcript summaries published.</p>}</div><div><h3 className="text-sm font-semibold">Student documents</h3>{canManageDocuments && studentDetail.application_id && <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex gap-2"><Select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-40"><option value="identity">Identity</option><option value="certificate">Certificate</option><option value="transcript">Transcript</option><option value="other">Other</option></Select><Input type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} /><Button onClick={() => void uploadDocument()} disabled={saving || !documentFile}><FileUp className="mr-1.5 h-4 w-4" /> Upload</Button></div></div>}{documents.length ? <div className="mt-3 space-y-2">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><p className="text-sm font-medium">{document.file_name}</p><p className="mt-1 text-xs text-slate-500">{document.document_type} · <StatusBadge status={document.status} /></p></div><div className="flex gap-2"><Button variant="secondary" onClick={() => void openDocument(document.storage_path)}><ExternalLink className="mr-1.5 h-4 w-4" /> View</Button>{canManageDocuments && <Select value={document.status} onChange={async (event) => { await verifyApplicationDocument(document.id, event.target.value as 'pending' | 'verified' | 'rejected'); if (id) await loadStudentDetail(id); }} className="w-32"><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></Select>}</div></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No documents uploaded.</p>}</div></div></section>

    {canFinance && <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 p-6"><h2 className="font-semibold">Financial record</h2></div><div className="grid gap-6 p-6 xl:grid-cols-2"><div><h3 className="text-sm font-semibold">Invoices</h3>{invoices.length ? <div className="mt-3 space-y-2">{invoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><div><p className="font-medium">{invoice.invoice_number}</p><p className="mt-1 text-xs text-slate-500">{invoice.term_name || 'Unassigned term'} · due {invoice.due_date || '—'}</p></div><div className="text-right"><p className="font-semibold">{invoice.amount.toFixed(2)}</p><p className="text-xs text-slate-500">Balance {invoice.balance?.toFixed(2)}</p></div></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No invoices recorded.</p>}</div><div><h3 className="text-sm font-semibold">Payments and scholarships</h3>{payments.length ? <div className="mt-3 space-y-2">{payments.map((payment) => <div key={payment.id} className="flex justify-between rounded-xl bg-emerald-50 p-3 text-sm"><span>{payment.payment_method} · {payment.reference || 'No reference'}</span><span className="font-semibold">{payment.amount.toFixed(2)}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No payments recorded.</p>}{scholarships.length > 0 && <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scholarships</p>{scholarships.map((scholarship) => <p key={scholarship.id} className="mt-2 text-sm">{scholarship.name}: {scholarship.amount.toFixed(2)} · {scholarship.status}</p>)}</div>}</div></div></section>}
  </div>;
};

export default StudentDetail;

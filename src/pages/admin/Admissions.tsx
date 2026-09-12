import React, { useState } from 'react';
import { useAdminStore, Application } from '../../store/adminStore';
import { Search, Eye, Edit2, Trash2, FileText } from 'lucide-react';
import Modal from '../../components/Modal';

const Admissions: React.FC = () => {
  const { applications, programs, updateApplication, updateApplicationStatus, deleteApplication } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');

  // View/Edit modal
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<Application['status']>('New');

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesProgram = programFilter === 'All' || app.programId === programFilter;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const openView = (app: Application) => {
    setViewingApp(app);
    setEditNotes(app.notes || '');
    setEditStatus(app.status);
  };

  const saveApp = () => {
    if (viewingApp) {
      updateApplicationStatus(viewingApp.id, editStatus, editNotes);
      setViewingApp(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteApplication(deleteTarget);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const statusColors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Accepted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Enrolled': 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admissions Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} total &bull; {applications.filter(a => a.status === 'New').length} new &bull; {applications.filter(a => a.status === 'Under Review').length} under review
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="Search by name or email..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Enrolled">Enrolled</option>
          </select>
          <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
            <option value="All">All Programs</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map(app => {
                const program = programs.find(p => p.id === app.programId);
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.applicantName}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                      <div className="text-xs text-gray-400">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{program?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.dateApplied}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{app.documents?.length || 0} files</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => openView(app)} className="text-gray-400 hover:text-[#002147] p-1.5 rounded hover:bg-blue-50 transition-colors" title="View & Edit"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => confirmDelete(app.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredApplications.length === 0 && <div className="text-center py-12 text-gray-500">No applications found matching your criteria.</div>}
      </div>

      {/* View/Edit Application Modal */}
      <Modal isOpen={!!viewingApp} onClose={() => setViewingApp(null)} title="Application Details" maxWidth="max-w-3xl">
        {viewingApp && (() => {
          const program = programs.find(p => p.id === viewingApp.programId);
          return (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Name</p><p className="text-sm font-medium text-gray-900">{viewingApp.applicantName}</p></div>
                  <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{viewingApp.email}</p></div>
                  <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{viewingApp.phone}</p></div>
                  <div><p className="text-xs text-gray-500">Date Applied</p><p className="text-sm font-medium text-gray-900">{viewingApp.dateApplied}</p></div>
                  <div><p className="text-xs text-gray-500">Program</p><p className="text-sm font-medium text-gray-900">{program?.name}</p></div>
                  <div><p className="text-xs text-gray-500">Application ID</p><p className="text-sm font-medium text-gray-900">{viewingApp.id}</p></div>
                </div>
              </div>

              {/* Submitted Documents */}
              {viewingApp.documents && viewingApp.documents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Submitted Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingApp.documents.map((doc, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 rounded-md bg-white border border-gray-200 text-sm text-gray-700">
                        <FileText className="h-3 w-3 mr-2 text-gray-400" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Review Actions</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value as Application['status'])} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none resize-none" placeholder="Add review notes, comments, or observations..." />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button onClick={() => setViewingApp(null)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={saveApp} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">Save Changes</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete this application? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admissions;

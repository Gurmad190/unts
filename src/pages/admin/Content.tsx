import React, { useState } from 'react';
import { useAdminStore, ContentItem } from '../../store/adminStore';
import { Megaphone, Calendar, FileText, Award, Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import Modal from '../../components/Modal';

const Content: React.FC = () => {
  const { contents, addContent, updateContent, deleteContent } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'announcement' | 'event' | 'scholarship'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const emptyForm = { type: 'news' as 'news' | 'announcement' | 'event' | 'scholarship', title: '', summary: '', body: '', date: new Date().toISOString().slice(0, 10), status: 'Draft' as 'Published' | 'Draft' | 'Archived' };
  const [form, setForm] = useState(emptyForm);

  const tabs = [
    { key: 'all', label: 'All', icon: null },
    { key: 'news', label: 'News', icon: Megaphone },
    { key: 'announcement', label: 'Announcements', icon: FileText },
    { key: 'event', label: 'Events', icon: Calendar },
    { key: 'scholarship', label: 'Scholarships', icon: Award },
  ];

  const typeConfig = {
    news: { icon: Megaphone, color: 'bg-blue-500', label: 'News' },
    announcement: { icon: FileText, color: 'bg-orange-500', label: 'Announcement' },
    event: { icon: Calendar, color: 'bg-green-500', label: 'Event' },
    scholarship: { icon: Award, color: 'bg-yellow-500', label: 'Scholarship' },
  };

  const filtered = contents.filter(c => {
    const matchesTab = activeTab === 'all' || c.type === activeTab;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    news: contents.filter(c => c.type === 'news').length,
    announcement: contents.filter(c => c.type === 'announcement').length,
    event: contents.filter(c => c.type === 'event').length,
    scholarship: contents.filter(c => c.type === 'scholarship').length,
  };

  const openAdd = () => {
    setEditingContent(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingContent(item);
    setForm({ type: item.type, title: item.title, summary: item.summary, body: item.body, date: item.date, status: item.status });
    setFormError('');
    setShowModal(true);
  };

  const save = () => {
    if (!form.title.trim()) {
      setFormError('Title is required. Please enter a title before saving.');
      return;
    }
    setFormError('');
    if (editingContent) {
      updateContent(editingContent.id, form);
    } else {
      addContent(form);
    }
    setShowModal(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteContent(deleteTarget);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-sm text-gray-500 mt-1">{contents.length} items total</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#002147] hover:bg-[#001833] transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-6 px-6" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#002147] text-[#002147]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                  {tab.key === 'all' ? contents.length : counts[tab.key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="Search content..." />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filtered.map(item => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${config.color} text-white flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'Published' ? 'bg-green-100 text-green-800' :
                          item.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>{item.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{item.summary}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-400 capitalize">{config.label}</span>
                        <span className="text-xs text-gray-400">&bull;</span>
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                    <button onClick={() => setViewingContent(item)} className="text-gray-400 hover:text-[#002147] p-1.5 rounded hover:bg-blue-50 transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => confirmDelete(item.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="px-6 py-12 text-center text-gray-500">No content found.</div>}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingContent ? 'Edit Content' : 'Add Content'} maxWidth="max-w-3xl">
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                <option value="news">News</option>
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="scholarship">Scholarship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => { setForm({...form, title: e.target.value}); if (formError) setFormError(''); }} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="Enter title..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <input type="text" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="Brief summary..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body / Content</label>
            <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={6} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none resize-none" placeholder="Full content text..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">{editingContent ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      {/* View Content Modal */}
      <Modal isOpen={!!viewingContent} onClose={() => setViewingContent(null)} title="Content Preview" maxWidth="max-w-3xl">
        {viewingContent && (() => {
          const config = typeConfig[viewingContent.type];
          const Icon = config.icon;
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${config.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 capitalize">{config.label}</span>
                  <h3 className="text-lg font-bold text-gray-900">{viewingContent.title}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{viewingContent.date}</span>
                <span>&bull;</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  viewingContent.status === 'Published' ? 'bg-green-100 text-green-800' :
                  viewingContent.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                }`}>{viewingContent.status}</span>
              </div>
              {viewingContent.summary && <p className="text-gray-600 italic">{viewingContent.summary}</p>}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingContent.body || 'No content available.'}</p>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button onClick={() => { setViewingContent(null); openEdit(viewingContent); }} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">Edit</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete this content? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Content;

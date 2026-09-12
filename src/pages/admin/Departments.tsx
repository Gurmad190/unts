import React, { useState } from 'react';
import { useAdminStore, Department, Program } from '../../store/adminStore';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';

const Departments: React.FC = () => {
  const { departments, programs, addDepartment, updateDepartment, deleteDepartment, addProgram, updateProgram, deleteProgram } = useAdminStore();
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  
  // Department modal state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', status: 'active' as 'active' | 'inactive' });
  
  // Program modal state
  const [showProgModal, setShowProgModal] = useState(false);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [progForm, setProgForm] = useState({ departmentId: '', name: '', level: 'Undergraduate' as 'Undergraduate' | 'Postgraduate' | 'PhD', duration: '4 Years', description: '', status: 'active' as 'active' | 'inactive' });
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'department' | 'program'; id: string } | null>(null);

  const toggleDept = (id: string) => {
    setExpandedDept(expandedDept === id ? null : id);
  };

  // Department handlers
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', description: '', status: 'active' });
    setShowDeptModal(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, description: dept.description, status: dept.status });
    setShowDeptModal(true);
  };

  const saveDept = () => {
    if (!deptForm.name.trim()) return;
    if (editingDept) {
      updateDepartment(editingDept.id, deptForm);
    } else {
      addDepartment(deptForm);
    }
    setShowDeptModal(false);
  };

  const confirmDeleteDept = (id: string) => {
    setDeleteTarget({ type: 'department', id });
    setShowDeleteModal(true);
  };

  const confirmDeleteProg = (id: string) => {
    setDeleteTarget({ type: 'program', id });
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'department') {
      deleteDepartment(deleteTarget.id);
    } else {
      deleteProgram(deleteTarget.id);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Program handlers
  const openAddProg = (departmentId: string) => {
    setEditingProg(null);
    setProgForm({ departmentId, name: '', level: 'Undergraduate', duration: '4 Years', description: '', status: 'active' });
    setShowProgModal(true);
  };

  const openEditProg = (prog: Program) => {
    setEditingProg(prog);
    setProgForm({ departmentId: prog.departmentId, name: prog.name, level: prog.level, duration: prog.duration, description: prog.description, status: prog.status });
    setShowProgModal(true);
  };

  const saveProg = () => {
    if (!progForm.name.trim()) return;
    if (editingProg) {
      updateProgram(editingProg.id, progForm);
    } else {
      addProgram(progForm);
    }
    setShowProgModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments & Programs</h2>
          <p className="text-sm text-gray-500 mt-1">{departments.length} departments &bull; {programs.length} programs</p>
        </div>
        <button onClick={openAddDept} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#002147] hover:bg-[#001833] transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {departments.map((dept) => {
            const deptPrograms = programs.filter(p => p.departmentId === dept.id);
            return (
              <li key={dept.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center cursor-pointer flex-1" onClick={() => toggleDept(dept.id)}>
                      {expandedDept === dept.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      )}
                      <div className="ml-2">
                        <p className="text-lg font-medium text-[#002147]">{dept.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{dept.description}</p>
                      </div>
                      <span className={`ml-4 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.status}
                      </span>
                      <span className="ml-3 text-sm text-gray-400 flex-shrink-0">{deptPrograms.length} programs</span>
                    </div>
                    <div className="flex space-x-2 ml-4 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); openEditDept(dept); }} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); confirmDeleteDept(dept.id); }} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Programs List */}
                  {expandedDept === dept.id && (
                    <div className="mt-4 ml-7">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Programs in this Department</h4>
                        <button onClick={() => openAddProg(dept.id)} className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Program
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <ul className="divide-y divide-gray-200 rounded-lg">
                          {deptPrograms.map(prog => (
                            <li key={prog.id} className="px-4 py-3 flex items-center justify-between hover:bg-white transition-colors">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{prog.name}</p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500">{prog.level}</span>
                                  <span className="text-xs text-gray-400">&bull;</span>
                                  <span className="text-xs text-gray-500">{prog.duration}</span>
                                </div>
                                {prog.description && <p className="text-xs text-gray-400 mt-1 max-w-lg">{prog.description}</p>}
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  prog.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {prog.status}
                                </span>
                                <button onClick={() => openEditProg(prog)} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => confirmDeleteProg(prog.id)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                          {deptPrograms.length === 0 && (
                            <li className="px-4 py-6 text-sm text-gray-500 text-center">
                              No programs in this department yet.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Department Modal */}
      <Modal isOpen={showDeptModal} onClose={() => setShowDeptModal(false)} title={editingDept ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
            <input type="text" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none resize-none" placeholder="Brief description of the department..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={deptForm.status} onChange={e => setDeptForm({...deptForm, status: e.target.value as 'active' | 'inactive'})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowDeptModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={saveDept} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">{editingDept ? 'Update' : 'Create'} Department</button>
          </div>
        </div>
      </Modal>

      {/* Program Modal */}
      <Modal isOpen={showProgModal} onClose={() => setShowProgModal(false)} title={editingProg ? 'Edit Program' : 'Add Program'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
            <input type="text" value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. BSc Computer Science" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select value={progForm.level} onChange={e => setProgForm({...progForm, level: e.target.value as any})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" value={progForm.duration} onChange={e => setProgForm({...progForm, duration: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. 4 Years" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={progForm.description} onChange={e => setProgForm({...progForm, description: e.target.value})} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none resize-none" placeholder="Describe the program..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={progForm.status} onChange={e => setProgForm({...progForm, status: e.target.value as 'active' | 'inactive'})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowProgModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={saveProg} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">{editingProg ? 'Update' : 'Create'} Program</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;

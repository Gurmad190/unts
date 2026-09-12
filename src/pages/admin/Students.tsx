import React, { useState } from 'react';
import { useAdminStore, Student } from '../../store/adminStore';
import { Search, Download, Plus, Edit2, Eye, Trash2, X } from 'lucide-react';
import Modal from '../../components/Modal';

const Students: React.FC = () => {
  const { students, programs, departments, addStudent, updateStudent, deleteStudent } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'admissionYear' | 'gpa'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const emptyForm = { name: '', email: '', phone: '', dateOfBirth: '', gender: 'Male' as 'Male' | 'Female', departmentId: 'd4', programId: 'p1', status: 'Active' as 'Active' | 'Inactive' | 'Graduated' | 'Suspended', admissionYear: 2026, gpa: 3.0, address: '' };
  const [studentForm, setStudentForm] = useState(emptyForm);

  const years = [...new Set(students.map(s => s.admissionYear))].sort((a, b) => b - a);

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesDept = deptFilter === 'All' || s.departmentId === deptFilter;
      const matchesYear = yearFilter === 'All' || String(s.admissionYear) === yearFilter;
      return matchesSearch && matchesStatus && matchesDept && matchesYear;
    })
    .sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (sortField === 'gpa') {
        return sortDir === 'asc' ? (a.gpa || 0) - (b.gpa || 0) : (b.gpa || 0) - (a.gpa || 0);
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  // Reset to first page when filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, deptFilter, yearFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: 'name' | 'admissionYear' | 'gpa') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const openAdd = () => {
    setEditingStudent(null);
    setStudentForm(emptyForm);
    setShowStudentModal(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      departmentId: student.departmentId,
      programId: student.programId,
      status: student.status,
      admissionYear: student.admissionYear,
      gpa: student.gpa || 0,
      address: student.address || '',
    });
    setShowStudentModal(true);
  };

  const saveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.email.trim()) return;
    if (editingStudent) {
      updateStudent(editingStudent.id, { ...studentForm, gpa: Number(studentForm.gpa) || 0 });
    } else {
      addStudent({ ...studentForm, gpa: Number(studentForm.gpa) || 0 });
    }
    setShowStudentModal(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteStudent(deleteTarget);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Program', 'Status', 'Year', 'GPA'];
    const rows = filteredStudents.map(s => {
      const prog = programs.find(p => p.id === s.programId);
      const dept = departments.find(d => d.id === s.departmentId);
      return [s.id, s.name, s.email, s.phone, dept?.name || '', prog?.name || '', s.status, String(s.admissionYear), String(s.gpa || '')];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredStudents.length} of {students.length} students</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportCSV} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button onClick={openAdd} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#002147] hover:bg-[#001833] transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="Search by name, email, or ID..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
            <option value="All">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
            <option value="All">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                  Student {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program / Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('admissionYear')}>
                  Year {sortField === 'admissionYear' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('gpa')}>
                  GPA {sortField === 'gpa' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStudents.map(student => {
                const program = programs.find(p => p.id === student.programId);
                const department = departments.find(d => d.id === student.departmentId);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#002147] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{program?.name}</div>
                      <div className="text-xs text-gray-500">{department?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        student.status === 'Active' ? 'bg-green-100 text-green-800' :
                        student.status === 'Graduated' ? 'bg-blue-100 text-blue-800' :
                        student.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>{student.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.gpa?.toFixed(2) || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => setViewingStudent(student)} className="text-gray-400 hover:text-[#002147] p-1.5 rounded hover:bg-blue-50 transition-colors" title="View Profile"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(student)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => confirmDelete(student.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && <div className="text-center py-12 text-gray-500">No students found matching your criteria.</div>}

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
                </p>
                <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">First</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M7.707 5.293a1 1 0 010 1.414L4.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Previous</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) => item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                  ) : (
                    <button key={item} onClick={() => goToPage(item as number)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === item ? 'z-10 bg-[#002147] text-white border-[#002147]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{item}</button>
                  ))
                }
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Next</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Last</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M12.293 14.707a1 1 0 010-1.414L15.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      <Modal isOpen={showStudentModal} onClose={() => setShowStudentModal(false)} title={editingStudent ? 'Edit Student' : 'Add Student'} maxWidth="max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. Faaduma Axmed Cali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. name@uns.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. +252615..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={studentForm.dateOfBirth} onChange={e => setStudentForm({...studentForm, dateOfBirth: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={studentForm.gender} onChange={e => setStudentForm({...studentForm, gender: e.target.value as 'Male' | 'Female'})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select value={studentForm.departmentId} onChange={e => setStudentForm({...studentForm, departmentId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
              <select value={studentForm.programId} onChange={e => setStudentForm({...studentForm, programId: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                {programs.filter(p => p.departmentId === studentForm.departmentId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={studentForm.status} onChange={e => setStudentForm({...studentForm, status: e.target.value as any})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
              <input type="number" value={studentForm.admissionYear} onChange={e => setStudentForm({...studentForm, admissionYear: Number(e.target.value)})} min="2015" max="2030" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
              <input type="number" step="0.01" min="0" max="4" value={studentForm.gpa} onChange={e => setStudentForm({...studentForm, gpa: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="0.00 - 4.00" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={studentForm.address} onChange={e => setStudentForm({...studentForm, address: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#002147] focus:border-[#002147] outline-none" placeholder="e.g. Hargeisa, Somaliland" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowStudentModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={saveStudent} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">{editingStudent ? 'Update' : 'Add'} Student</button>
          </div>
        </div>
      </Modal>

      {/* View Student Profile Modal */}
      <Modal isOpen={!!viewingStudent} onClose={() => setViewingStudent(null)} title="Student Profile" maxWidth="max-w-2xl">
        {viewingStudent && (() => {
          const program = programs.find(p => p.id === viewingStudent.programId);
          const department = departments.find(d => d.id === viewingStudent.departmentId);
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="h-16 w-16 bg-[#002147] text-white rounded-full flex items-center justify-center text-xl font-bold">{viewingStudent.name.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewingStudent.name}</h3>
                  <p className="text-sm text-gray-500">{viewingStudent.email}</p>
                  <span className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewingStudent.status === 'Active' ? 'bg-green-100 text-green-800' :
                    viewingStudent.status === 'Graduated' ? 'bg-blue-100 text-blue-800' :
                    viewingStudent.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>{viewingStudent.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p><p className="text-sm font-medium text-gray-900">{viewingStudent.id}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p><p className="text-sm font-medium text-gray-900">{viewingStudent.phone}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p><p className="text-sm font-medium text-gray-900">{viewingStudent.dateOfBirth}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p><p className="text-sm font-medium text-gray-900">{viewingStudent.gender}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Department</p><p className="text-sm font-medium text-gray-900">{department?.name}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Program</p><p className="text-sm font-medium text-gray-900">{program?.name}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Admission Year</p><p className="text-sm font-medium text-gray-900">{viewingStudent.admissionYear}</p></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">GPA</p><p className="text-sm font-bold text-[#002147]">{viewingStudent.gpa?.toFixed(2) || 'N/A'}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Address</p><p className="text-sm font-medium text-gray-900">{viewingStudent.address || 'N/A'}</p></div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button onClick={() => { setViewingStudent(null); openEdit(viewingStudent); }} className="px-4 py-2 bg-[#002147] text-white rounded-md text-sm font-medium hover:bg-[#001833] transition-colors">Edit Profile</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete this student? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;

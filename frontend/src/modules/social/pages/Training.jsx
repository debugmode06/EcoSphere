import React, { useState, useEffect } from 'react';
import useTraining from '../hooks/useTraining';
import TrainingTable from '../components/TrainingTable';
import { useAuth } from '../../../context/AuthContext';
import axiosClient from '../../../api/axiosClient';
import { Plus, X, GraduationCap, Calendar, BookOpen, Users } from 'lucide-react';

export default function Training() {
  const { role } = useAuth();
  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

  const {
    trainings,
    history,
    loading,
    error,
    refetchTrainings,
    refetchHistory,
    createTraining,
    updateTraining,
    deleteTraining,
    assignTraining,
    markComplete,
  } = useTraining();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formError, setFormError] = useState(null);

  // Assign states
  const [checkedEmployees, setCheckedEmployees] = useState({});

  useEffect(() => {
    refetchTrainings({ department: selectedDeptFilter });
    if (!isAdminOrManager) {
      refetchHistory();
    }
  }, [selectedDeptFilter, refetchTrainings, refetchHistory, isAdminOrManager]);

  useEffect(() => {
    // Fetch departments
    axiosClient.get('/core/departments')
      .then((r) => setDepartments(r.data.departments || r.data || []))
      .catch(() => {});

    // Fetch employees if admin/manager for assignment
    if (isAdminOrManager) {
      axiosClient.get('/auth/employees')
        .then((r) => setEmployees(r.data.employees || []))
        .catch(() => {});
    }
  }, [isAdminOrManager]);

  const openCreateDialog = () => {
    setSelectedTraining(null);
    setTitle('');
    setDescription('');
    setDepartment('');
    setStartDate('');
    setEndDate('');
    setFormError(null);
    setFormOpen(true);
  };

  const openEditDialog = (t) => {
    setSelectedTraining(t);
    setTitle(t.title);
    setDescription(t.description || '');
    setDepartment(t.departmentInfo?._id || t.department?._id || t.department || '');
    setStartDate(t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '');
    setEndDate(t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '');
    setFormError(null);
    setFormOpen(true);
  };

  const openAssignDialog = (t) => {
    setSelectedTraining(t);
    // Pre-fill checked state and build a map for statuses
    const initialChecked = {};
    if (t.completions) {
      t.completions.forEach(c => {
        initialChecked[c.employeeId] = true;
      });
    }
    setCheckedEmployees(initialChecked);
    setAssignOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const data = { title, description, department, startDate, endDate };

    try {
      if (selectedTraining) {
        await updateTraining(selectedTraining._id, data);
      } else {
        await createTraining(data);
      }
      setFormOpen(false);
      refetchTrainings({ department: selectedDeptFilter });
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Action failed');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const employeeIds = Object.keys(checkedEmployees).filter((id) => checkedEmployees[id]);

    if (employeeIds.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    try {
      await assignTraining(selectedTraining._id, employeeIds);
      setAssignOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to assign training');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program? All assignment histories will be deleted.')) return;
    try {
      await deleteTraining(id);
      refetchTrainings({ department: selectedDeptFilter });
    } catch (err) {
      alert(err.message || 'Failed to delete training');
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await markComplete(id);
      alert('Training marked as completed successfully!');
    } catch (err) {
      alert(err.message || 'Failed to complete training');
    }
  };

  const handleCheckboxChange = (empId) => {
    setCheckedEmployees((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-brand-500" />
            Training &amp; Education
          </h1>
          <p className="page-subheader">
            Manage sustainability programs, assign requirements, and track completions.
          </p>
        </div>
        {isAdminOrManager && (
          <button onClick={openCreateDialog} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Training
          </button>
        )}
      </div>

      {/* Filters & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter Department:
          </label>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="input max-w-xs py-1 px-3 text-xs bg-white border-slate-200"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* User stats card (Employee perspective) */}
        {!isAdminOrManager && history.length > 0 && (
          <div className="flex items-center gap-6 px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Assigned</span>
              <p className="text-lg font-bold text-slate-900">{history.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Completed</span>
              <p className="text-lg font-bold text-emerald-600">
                {history.filter((h) => h.status === 'completed').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Main List */}
      <TrainingTable
        trainings={trainings}
        history={history}
        role={role}
        onAssign={openAssignDialog}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        onComplete={handleMarkComplete}
        loading={loading}
      />

      {/* Training Create/Edit Dialog */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg bg-white border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" />
                {selectedTraining ? 'Edit Training Program' : 'New Training Program'}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-xs px-3 py-2 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="title">
                  Training Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="e.g. CSR Guidelines Workshop"
                />
              </div>

              <div>
                <label className="label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input h-20 resize-none"
                  placeholder="Provide course structure, details, or resources..."
                />
              </div>

              <div>
                <label className="label" htmlFor="dept">
                  Target Department
                </label>
                <select
                  id="dept"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="start">
                    Start Date
                  </label>
                  <input
                    id="start"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="end">
                    End Date
                  </label>
                  <input
                    id="end"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-4 py-2">
                  {selectedTraining ? 'Save Changes' : 'Create Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Dialog */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md bg-white border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-500" />
                Assign Course
              </h3>
              <button
                onClick={() => setAssignOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select employees to assign to the training program <strong>{selectedTraining?.title}</strong>:
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg p-2 bg-slate-50">
                {employees.map((emp) => (
                  <label
                    key={emp._id}
                    className="flex items-center gap-3 py-2.5 px-2 hover:bg-slate-200 rounded-md cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedEmployees[emp._id]}
                      onChange={() => handleCheckboxChange(emp._id)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 bg-slate-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{emp.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {emp.email} &bull; {emp.department?.name || 'No Dept'}
                      </p>
                    </div>
                    {(() => {
                      const comp = selectedTraining?.completions?.find(c => c.employeeId === emp._id);
                      if (comp && comp.status === 'completed') {
                        return <span className="inline-block text-emerald-600 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Completed</span>;
                      } else if (comp && comp.status === 'assigned') {
                        return <span className="inline-block text-amber-600 text-[10px] font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">In Progress</span>;
                      }
                      return null;
                    })()}
                  </label>
                ))}
                {employees.length === 0 && (
                  <p className="text-xs text-center py-4 text-slate-500">No employees available</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignOpen(false)}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-4 py-2">
                  Assign Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit: Employee | null; // Null means we are creating a new one
  initialParentId?: string | null;  // Quick report creation
  employees: Employee[];
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  initialParentId,
  employees,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [parentId, setParentId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('San Francisco, USA');
  const [salary, setSalary] = useState<number>(90000);
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState<Employee['status']>('Active');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load employee details if editing
  useEffect(() => {
    if (employeeToEdit) {
      setId(employeeToEdit.id);
      setName(employeeToEdit.name);
      setRole(employeeToEdit.role);
      setDepartment(employeeToEdit.department);
      setParentId(employeeToEdit.parentId);
      setEmail(employeeToEdit.email);
      setPhone(employeeToEdit.phone);
      setLocation(employeeToEdit.location);
      setSalary(employeeToEdit.salary);
      setStartDate(employeeToEdit.startDate);
      setStatus(employeeToEdit.status);
      setBio(employeeToEdit.bio || '');
    } else {
      // Create new: generate unique ID
      setId(Math.random().toString(36).substr(2, 9));
      setName('');
      setRole('');
      setDepartment('Engineering');
      setParentId(initialParentId !== undefined ? initialParentId : null);
      setEmail('');
      setPhone('');
      setLocation('San Francisco, USA');
      setSalary(95000);
      setStartDate(new Date().toISOString().split('T')[0]);
      setStatus('Active');
      setBio('');
    }
    setError(null);
  }, [employeeToEdit, initialParentId, isOpen]);

  if (!isOpen) return null;

  // Department definitions
  const departments = [
    'Executive',
    'Engineering',
    'Product',
    'Sales',
    'Marketing',
    'Human Resources',
    'Finance'
  ];

  // Status frameworks
  const statuses: Employee['status'][] = ['Active', 'On Leave', 'Remote', 'Hybrid'];

  // Avatar colors choice (Tailwind background selections)
  const avatarColors = [
    'bg-blue-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-emerald-500',
    'bg-cyan-500',
  ];

  // Helper to find all descendants of an employee (to prevent circular reporting loops)
  const getDescendantIds = (empId: string): Set<string> => {
    const ids = new Set<string>();
    const collect = (pid: string) => {
      employees.forEach(emp => {
        if (emp.parentId === pid) {
          ids.add(emp.id);
          collect(emp.id);
        }
      });
    };
    collect(empId);
    return ids;
  };

  // Valid candidates for reports (filtered to prevent recursive manager tree errors)
  const descendantIds = employeeToEdit ? getDescendantIds(employeeToEdit.id) : new Set<string>();
  const supervisorCandidates = employees.filter(emp => {
    if (!employeeToEdit) return true; // everything is valid when hiring new
    return emp.id !== employeeToEdit.id && !descendantIds.has(emp.id);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Employee name is required.');
      return;
    }
    if (!role.trim()) {
      setError('Professional job title/role is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid corporate email address is required.');
      return;
    }
    if (salary < 10000) {
      setError('Salary must be at least $10,000.');
      return;
    }

    // Verify if we have another CEO/null parent when selecting root
    if (parentId === null && employees.length > 0) {
      const activeCEO = employees.find(emp => emp.parentId === null);
      if (activeCEO && activeCEO.id !== id) {
        // Warning: multiple roots. Allowed, but we notify or handle gracefully.
      }
    }

    // Random avatar assignment if not edited
    const randomAvatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const updatedEmployee: Employee = {
      id,
      name: name.trim(),
      role: role.trim(),
      department,
      parentId,
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 010-0000',
      location,
      avatarColor: employeeToEdit ? employeeToEdit.avatarColor : randomAvatarColor,
      salary,
      startDate: startDate || new Date().toISOString().split('T')[0],
      status,
      bio: bio.trim(),
    };

    onSave(updatedEmployee);
    onClose();
  };

  return (
    <div id="add-edit-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="add-edit-modal-container"
        className="relative bg-white w-full max-w-lg rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#FAFAFA]">
          <h3 className="text-sm font-semibold text-[#111827]">
            {employeeToEdit ? `Edit Profile: ${employeeToEdit.name}` : 'Onboard New Employee'}
          </h3>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-[#6B7280] hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Error Banner */}
          {error && (
            <div id="modal-error-banner" className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="input-name" className="text-xs font-semibold text-[#111827]">Full Name *</label>
              <input
                id="input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam O'Connor"
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="input-role" className="text-xs font-semibold text-[#111827]">Job Title / Role *</label>
              <input
                id="input-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="select-department" className="text-xs font-semibold text-[#111827]">Department</label>
              <select
                id="select-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] bg-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Manager Selection */}
            <div className="space-y-1">
              <label htmlFor="select-manager" className="text-xs font-semibold text-[#111827]">Reports To (Supervisor)</label>
              <select
                id="select-manager"
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value === '' ? null : e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] bg-white"
              >
                <option value="">None - Top Executive (CEO)</option>
                {supervisorCandidates.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="input-email" className="text-xs font-semibold text-[#111827]">Email Address *</label>
              <input
                id="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="liam.oconnor@nexushr.com"
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="input-phone" className="text-xs font-semibold text-[#111827]">Phone Number</label>
              <input
                id="input-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-9112"
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Location & Finance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="input-location" className="text-xs font-semibold text-[#111827]">Office Location</label>
              <input
                id="input-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, USA"
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="input-salary" className="text-xs font-semibold text-[#111827]">Annual Salary ($) *</label>
              <input
                id="input-salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                placeholder="95000"
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="select-status" className="text-xs font-semibold text-[#111827]">Work Status</label>
              <select
                id="select-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Employee['status'])}
                className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] bg-white"
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hire Date */}
          <div className="space-y-1">
            <label htmlFor="input-hiredate" className="text-xs font-semibold text-[#111827]">Hire Start Date</label>
            <input
              id="input-hiredate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Professional Bio */}
          <div className="space-y-1">
            <label htmlFor="textarea-bio" className="text-xs font-semibold text-[#111827]">Employee Bio / About</label>
            <textarea
              id="textarea-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Liam leads frontend systems. He specializes in React engineering and interactive data chart layouts."
              rows={3}
              className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E5E7EB] bg-[#FAFAFA]">
          <button
            id="btn-modal-cancel"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-modal-save"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Save Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
};

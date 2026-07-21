import React from 'react';
import { Employee } from '../types';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Trash2, 
  Edit, 
  ChevronRight,
  TrendingUp,
  Building,
  ShieldCheck,
  Award,
  Briefcase
} from 'lucide-react';

interface DetailsPanelProps {
  employeeId: string | null;
  employees: Employee[];
  onClose: () => void;
  onSelectEmployee: (id: string) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  employeeId,
  employees,
  onClose,
  onSelectEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  const employee = employees.find(e => e.id === employeeId);

  if (!employee) {
    return (
      <div id="details-panel-empty" className="h-full flex flex-col items-center justify-center p-8 text-center bg-white border-l border-[#E5E7EB]">
        <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-[#111827]">No Employee Selected</h3>
        <p className="text-xs text-[#6B7280] mt-1 max-w-[200px]">
          Click on any node in the organization chart or search in the directory to inspect details.
        </p>
      </div>
    );
  }

  // Find manager
  const manager = employees.find(e => e.id === employee.parentId);

  // Find direct reports
  const directReports = employees.filter(e => e.parentId === employee.id);

  // Department color indicator
  const getDeptColorClass = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'executive': return 'bg-blue-600 text-white';
      case 'engineering': return 'bg-teal-600 text-white';
      case 'product': return 'bg-purple-600 text-white';
      case 'sales': return 'bg-amber-600 text-white';
      case 'marketing': return 'bg-orange-600 text-white';
      case 'human resources': return 'bg-rose-600 text-white';
      case 'finance': return 'bg-emerald-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Remote': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hybrid': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Format currency
  const formatSalary = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format Date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate Tenure
  const calculateTenure = (dateStr: string) => {
    const start = new Date(dateStr);
    const diffTime = Math.abs(new Date().getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} yr${years !== 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
  };

  return (
    <div id={`details-panel-${employee.id}`} className="h-full flex flex-col bg-white border-l border-[#E5E7EB] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          Employee Profile
        </span>
        <div className="flex items-center gap-2">
          <button
            id={`btn-edit-emp-${employee.id}`}
            onClick={() => onEditEmployee(employee)}
            className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-colors"
            title="Edit Employee"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            id={`btn-delete-emp-${employee.id}`}
            onClick={() => onDeleteEmployee(employee.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-[#6B7280] hover:text-red-600 transition-colors"
            title="Delete Employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            id="btn-close-details"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-[#6B7280] hover:text-gray-900 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Main Avatar & Hero */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#E5E7EB]">
          <div className={`w-18 h-18 rounded-full ${employee.avatarColor} text-white font-semibold text-2xl flex items-center justify-center mb-3 shadow-xs`}>
            {employee.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-base font-semibold text-[#111827]">{employee.name}</h2>
          <p className="text-xs text-[#6B7280] font-medium mt-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            {employee.role}
          </p>
          
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${getDeptColorClass(employee.department)}`}>
              {employee.department}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusColorClass(employee.status)}`}>
              {employee.status}
            </span>
          </div>
        </div>

        {/* Bio Section */}
        {employee.bio && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">About</h4>
            <p className="text-xs text-[#6B7280] leading-relaxed bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E7EB]">
              {employee.bio}
            </p>
          </div>
        )}

        {/* Detailed Metadata Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Contact & Location</h4>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-[#FAFAFA] transition-colors">
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280] leading-none">Email Address</p>
                <a href={`mailto:${employee.email}`} className="text-xs font-medium text-[#111827] hover:underline truncate block mt-0.5">
                  {employee.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-[#FAFAFA] transition-colors">
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] leading-none">Phone Number</p>
                <span className="text-xs font-medium text-[#111827] block mt-0.5">
                  {employee.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-[#FAFAFA] transition-colors">
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] leading-none">Office Location</p>
                <span className="text-xs font-medium text-[#111827] block mt-0.5">
                  {employee.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hire Date & Financial Statistics */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Employment Details</h4>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-[#FAFAFA] transition-colors">
              <p className="text-[10px] text-[#6B7280] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#2563EB]" />
                Hire Date
              </p>
              <p className="text-xs font-semibold text-[#111827] mt-1 truncate">
                {formatDate(employee.startDate)}
              </p>
              <p className="text-[9px] text-[#6B7280] font-mono mt-0.5">
                {calculateTenure(employee.startDate)} tenure
              </p>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-[#FAFAFA] transition-colors">
              <p className="text-[10px] text-[#6B7280] flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#10B981]" />
                Annual Salary
              </p>
              <p className="text-xs font-semibold text-[#111827] mt-1">
                {formatSalary(employee.salary)}
              </p>
              <p className="text-[9px] text-[#10B981] font-medium mt-0.5 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                SaaS Mid-grade
              </p>
            </div>
          </div>
        </div>

        {/* Organization Relationships */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Reports & Relations</h4>
          
          {/* Manager Link */}
          {manager ? (
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium text-[#6B7280] block">Direct Supervisor</span>
              <div 
                onClick={() => onSelectEmployee(manager.id)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-white hover:border-[#2563EB] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-full ${manager.avatarColor} text-white font-bold text-[10px] flex items-center justify-center`}>
                    {manager.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">{manager.name}</p>
                    <p className="text-[10px] text-[#6B7280] truncate">{manager.role}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-[#6B7280] block">Direct Supervisor</span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
                <div className="p-1 rounded-full bg-blue-100 text-[#2563EB]">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-[#111827]">At the summit (CEO)</span>
              </div>
            </div>
          )}

          {/* Direct Reports Listing */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-medium text-[#6B7280] flex items-center justify-between">
              <span>Direct Reports</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[9px] font-semibold">
                {directReports.length}
              </span>
            </span>

            {directReports.length > 0 ? (
              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                {directReports.map(sub => (
                  <div 
                    id={`report-item-${sub.id}`}
                    key={sub.id}
                    onClick={() => onSelectEmployee(sub.id)}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-white hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-full ${sub.avatarColor} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}>
                        {sub.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">{sub.name}</p>
                        <p className="text-[9px] text-[#6B7280] truncate">{sub.role}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-[#FAFAFA] border border-dashed border-[#E5E7EB] rounded-xl text-[11px] text-[#6B7280]">
                No direct reports report to this person.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

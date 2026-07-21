import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ChevronRight,
  UserPlus
} from 'lucide-react';

interface DirectoryViewProps {
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
  onAddEmployee: (parentId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  employees,
  onSelectEmployee,
  onAddEmployee,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'startDate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Find unique departments for filters
  const departments = useMemo(() => {
    return ['All', ...Array.from(new Set(employees.map(e => e.department)))];
  }, [employees]);

  // Find unique statuses
  const statuses = useMemo(() => {
    return ['All', ...Array.from(new Set(employees.map(e => e.status)))];
  }, [employees]);

  // Process sorting & filtering
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }

    // Department Filter
    if (selectedDept !== 'All') {
      result = result.filter(e => e.department === selectedDept);
    }

    // Work Status Filter
    if (selectedStatus !== 'All') {
      result = result.filter(e => e.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'salary') {
        comparison = a.salary - b.salary;
      } else if (sortBy === 'startDate') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [employees, searchQuery, selectedDept, selectedStatus, sortBy, sortDirection]);

  const handleSort = (field: 'name' | 'salary' | 'startDate') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Remote': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hybrid': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatSalary = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="directory-view-container" className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      
      {/* Directory Filter bar */}
      <div id="directory-filter-bar" className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Dynamic Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#6B7280]" />
            <input
              id="directory-search-input"
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] w-[200px]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1.5 rounded-lg text-xs text-[#6B7280]">
            <Filter className="w-3.5 h-3.5" />
            <span>Dept:</span>
            <select
              id="directory-dept-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-semibold text-[#111827] outline-none cursor-pointer"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1.5 rounded-lg text-xs text-[#6B7280]">
            <Filter className="w-3.5 h-3.5" />
            <span>Presence:</span>
            <select
              id="directory-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-[#111827] outline-none cursor-pointer"
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Quick Onboard Button */}
        <button
          id="btn-directory-onboard"
          onClick={() => onAddEmployee(null)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-xs shrink-0 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Directory Table / Spreadsheet Card */}
      <div id="directory-table-card" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-[#111827] cursor-pointer"
                  >
                    <span>Employee</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Work Presence</th>
                <th className="py-3 px-4">Office Location</th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('startDate')}
                    className="flex items-center gap-1.5 hover:text-[#111827] cursor-pointer"
                  >
                    <span>Tenure Start</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('salary')}
                    className="flex items-center gap-1.5 hover:text-[#111827] cursor-pointer"
                  >
                    <span>Salary</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <tr 
                    id={`directory-row-${emp.id}`}
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp.id)}
                    className="hover:bg-[#EFF6FF]/20 cursor-pointer transition-colors group"
                  >
                    {/* Column 1: Identity */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${emp.avatarColor} text-white font-bold text-[10px] flex items-center justify-center`}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors truncate">
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                            {emp.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Department */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-[#111827]">{emp.department}</span>
                    </td>

                    {/* Column 3: Presence */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusBadge(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>

                    {/* Column 4: Location */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-[#6B7280]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span>{emp.location}</span>
                      </div>
                    </td>

                    {/* Column 5: Hire date */}
                    <td className="py-4 px-4 font-mono text-[#6B7280] text-[11px]">
                      {new Date(emp.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Column 6: Salary */}
                    <td className="py-4 px-4 font-mono font-medium text-[#111827]">
                      {formatSalary(emp.salary)}
                    </td>

                    {/* Column 7: Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] font-medium mr-1">Inspect Profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#6B7280]">
                    No employees matched your selection filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer statistics bar */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
          <span>
            Showing <strong className="text-[#111827]">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-[#111827]">{employees.length}</strong> registered professionals
          </span>
          <span className="font-semibold text-[#111827]">NexusHR System Directory v1.2</span>
        </div>
      </div>
    </div>
  );
};

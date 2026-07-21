import React, { useMemo } from 'react';
import { Employee } from '../types';
import { 
  Building, 
  User, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface DepartmentsViewProps {
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ employees, onSelectEmployee }) => {
  
  const departmentGroups = useMemo(() => {
    // Group employees by department
    const groups: Record<string, {
      name: string;
      members: Employee[];
      budget: number;
      lead: Employee | null;
    }> = {};

    employees.forEach(emp => {
      const dept = emp.department;
      if (!groups[dept]) {
        groups[dept] = {
          name: dept,
          members: [],
          budget: 0,
          lead: null
        };
      }

      groups[dept].members.push(emp);
      groups[dept].budget += emp.salary;

      // Identify department lead
      // VPs or Directors are considered leads. If multiple, we pick the highest rank or first one.
      const isLead = emp.role.toLowerCase().includes('vp') || 
                     emp.role.toLowerCase().includes('director') || 
                     emp.role.toLowerCase().includes('chief');
      if (isLead) {
        // If there's no lead yet, or this lead has a higher salary (indicative of rank) or reports to CEO
        if (!groups[dept].lead || emp.parentId === '1') {
          groups[dept].lead = emp;
        }
      }
    });

    // Sort by member count desc
    return Object.values(groups).sort((a, b) => b.members.length - a.members.length);
  }, [employees]);

  const formatSalary = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="departments-view-container" className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Largest Investment</p>
          {departmentGroups.length > 0 ? (
            <div className="mt-2.5">
              {/* Find largest budget */}
              {(() => {
                const largest = [...departmentGroups].sort((a, b) => b.budget - a.budget)[0];
                return (
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111827] flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#2563EB]" />
                      {largest.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Total budget: <strong className="text-[#111827]">{formatSalary(largest.budget)}</strong> for {largest.members.length} members.
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] mt-2">No departments active.</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Highest Avg Compensation</p>
          {departmentGroups.length > 0 ? (
            <div className="mt-2.5">
              {/* Find highest average salary */}
              {(() => {
                const sortedByAvg = [...departmentGroups].sort((a, b) => 
                  (b.budget / b.members.length) - (a.budget / a.members.length)
                )[0];
                const avgSalary = sortedByAvg.budget / sortedByAvg.members.length;
                return (
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111827] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#10B981]" />
                      {sortedByAvg.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Average salary: <strong className="text-[#111827]">{formatSalary(avgSalary)}</strong> per capita.
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] mt-2">No departments active.</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Leanest Department</p>
          {departmentGroups.length > 0 ? (
            <div className="mt-2.5">
              {/* Find smallest department */}
              {(() => {
                const smallest = [...departmentGroups].sort((a, b) => a.members.length - b.members.length)[0];
                return (
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111827] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      {smallest.name}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Composed of only <strong className="text-[#111827]">{smallest.members.length}</strong> active professionals.
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] mt-2">No departments active.</p>
          )}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departmentGroups.map(group => {
          const avgCompensation = group.budget / group.members.length;
          
          return (
            <div 
              id={`dept-group-card-${group.name}`}
              key={group.name} 
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col"
            >
              {/* Card Header banner */}
              <div className="p-5 border-b border-gray-100 bg-[#FAFAFA] flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Building className="w-4.5 h-4.5 text-[#2563EB]" />
                    {group.name} Team
                  </h3>
                  {group.lead ? (
                    <p className="text-xs text-[#6B7280] mt-1">
                      Led by:{' '}
                      <button 
                        onClick={() => onSelectEmployee(group.lead!.id)}
                        className="text-[#2563EB] font-semibold hover:underline"
                      >
                        {group.lead.name}
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 font-medium mt-1">Director/VP vacant - Hiring</p>
                  )}
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-semibold uppercase tracking-wider">
                  {group.members.length} members
                </span>
              </div>

              {/* Financial Subtitles */}
              <div className="grid grid-cols-2 divide-x divide-gray-100 bg-[#FAFAFA]/50 border-b border-gray-100 text-xs py-2.5">
                <div className="px-5">
                  <span className="text-[10px] text-[#6B7280] uppercase font-semibold">Annual Payroll</span>
                  <p className="font-mono font-bold text-[#111827] mt-0.5">{formatSalary(group.budget)}</p>
                </div>
                <div className="px-5">
                  <span className="text-[10px] text-[#6B7280] uppercase font-semibold">Average Salary</span>
                  <p className="font-mono font-bold text-[#111827] mt-0.5">{formatSalary(avgCompensation)}</p>
                </div>
              </div>

              {/* Members Roll */}
              <div className="flex-1 p-4">
                <p className="text-[10px] font-semibold uppercase text-[#6B7280] tracking-wider mb-2 px-1">
                  Team Roster ({group.members.length})
                </p>

                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {group.members.map(member => {
                    const isDeptLead = group.lead?.id === member.id;
                    
                    return (
                      <div 
                        id={`dept-member-item-${member.id}`}
                        key={member.id}
                        onClick={() => onSelectEmployee(member.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border border-gray-50 bg-white hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/5 cursor-pointer transition-all ${
                          isDeptLead ? 'ring-1 ring-blue-100 bg-[#EFF6FF]/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full ${member.avatarColor} text-white font-bold text-[9px] flex items-center justify-center`}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#111827] flex items-center gap-1.5 truncate">
                              {member.name}
                              {isDeptLead && (
                                <span className="text-[8px] bg-blue-100 text-[#2563EB] px-1.5 py-0.25 rounded-md font-bold uppercase">
                                  Lead
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[#6B7280] truncate">{member.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#6B7280] font-mono">{member.location.split(',')[0]}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

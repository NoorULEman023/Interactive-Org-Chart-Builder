import React, { useMemo } from 'react';
import { Employee } from '../types';
import { 
  Users, 
  DollarSign, 
  Building, 
  MapPin, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  Network
} from 'lucide-react';

interface StatsDashboardProps {
  employees: Employee[];
  onSelectEmployee: (id: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ employees, onSelectEmployee }) => {
  
  const stats = useMemo(() => {
    const totalCount = employees.length;
    if (totalCount === 0) return null;

    // Total and Average salary
    const totalSalary = employees.reduce((acc, curr) => acc + curr.salary, 0);
    const avgSalary = totalSalary / totalCount;

    // Unique Departments
    const departmentsSet = new Set(employees.map(e => e.department));
    const totalDepts = departmentsSet.size;

    // Unique Locations
    const locationsSet = new Set(employees.map(e => e.location));
    const totalLocations = locationsSet.size;

    // Status breakdown
    const statusCounts = employees.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Department budget and count breakdown
    const deptStats = employees.reduce((acc, curr) => {
      if (!acc[curr.department]) {
        acc[curr.department] = { count: 0, budget: 0, managerName: 'Vacant', managerId: '' };
      }
      acc[curr.department].count += 1;
      acc[curr.department].budget += curr.salary;
      return acc;
    }, {} as Record<string, { count: number; budget: number; managerName: string; managerId: string }>);

    // Try to find managers for each department (VPs or Directors)
    employees.forEach(emp => {
      const isLead = emp.role.toLowerCase().includes('vp') || 
                     emp.role.toLowerCase().includes('director') || 
                     emp.role.toLowerCase().includes('chief');
      if (isLead && deptStats[emp.department]) {
        deptStats[emp.department].managerName = emp.name;
        deptStats[emp.department].managerId = emp.id;
      }
    });

    // Average span of control (Managers' reporting counts)
    // Find how many unique managers exist
    const uniqueManagers = new Set(employees.filter(e => e.parentId !== null).map(e => e.parentId));
    const managerCount = uniqueManagers.size;
    const avgSpanOfControl = managerCount > 0 ? (totalCount - 1) / managerCount : 0; // total subordinates / managers

    return {
      totalCount,
      totalSalary,
      avgSalary,
      totalDepts,
      totalLocations,
      statusCounts,
      deptStats,
      avgSpanOfControl,
      managerCount
    };
  }, [employees]);

  if (!stats) {
    return (
      <div id="stats-empty" className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] max-w-xl mx-auto mt-10">
        <h3 className="text-sm font-semibold text-[#111827]">No data available</h3>
        <p className="text-xs text-[#6B7280] mt-1">Please add or import employees to inspect organization metrics.</p>
      </div>
    );
  }

  // Format currency
  const formatVal = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Convert status to percentages for visual progress rings
  const totalEmployees = stats.totalCount;
  const statusSummary = (Object.entries(stats.statusCounts) as [string, number][]).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / totalEmployees) * 100)
  }));

  return (
    <div id="stats-dashboard-view" className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total headcount */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-semibold text-[#6B7280] tracking-tight uppercase truncate">Total Headcount</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">{stats.totalCount}</h3>
            <p className="text-[10px] text-[#10B981] font-bold flex items-center gap-1 mt-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Active Directory
            </p>
          </div>
        </div>

        {/* Card 2: Annual budget */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-semibold text-[#6B7280] tracking-tight uppercase truncate">Payroll Budget</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">{formatVal(stats.totalSalary)}</h3>
            <p className="text-[10px] text-[#6B7280] mt-1 truncate">
              Average: <span className="font-semibold text-[#111827]">{formatVal(stats.avgSalary)}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Departments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-semibold text-[#6B7280] tracking-tight uppercase truncate">Active Depts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#8B5CF6] flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">{stats.totalDepts}</h3>
            <p className="text-[10px] text-[#6B7280] mt-1 truncate">
              Across <span className="font-semibold text-[#111827]">{stats.totalLocations}</span> locations
            </p>
          </div>
        </div>

        {/* Card 4: Span of control */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-semibold text-[#6B7280] tracking-tight uppercase truncate">Span of Control</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {stats.avgSpanOfControl.toFixed(1)}
            </h3>
            <p className="text-[10px] text-[#6B7280] mt-1 truncate">
              Managed by <span className="font-semibold text-[#111827]">{stats.managerCount}</span> leaders
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department budgeting bar chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Department Financial & Staff Distribution</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Breakdown of headcounts and payroll investments per department.</p>
          </div>

          <div className="space-y-4 mt-6">
            {(Object.entries(stats.deptStats) as [string, { count: number; budget: number; managerName: string; managerId: string }][]).map(([dept, details]) => {
              // Calculate proportion of total budget
              const pctOfBudget = stats.totalSalary > 0 ? (details.budget / stats.totalSalary) * 100 : 0;
              const barWidth = `${Math.max(pctOfBudget, 5)}%`;

              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#111827]">{dept}</span>
                      <span className="text-[10px] px-1.5 py-0.25 rounded-md bg-[#EFF6FF] text-[#2563EB] font-medium">
                        {details.count} member{details.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[#111827] font-medium">{formatVal(details.budget)}</span>
                      <span className="text-[#6B7280] text-[10px] ml-1.5">({pctOfBudget.toFixed(0)}%)</span>
                    </div>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="w-full h-3 bg-[#FAFAFA] rounded-full overflow-hidden border border-[#E5E7EB]">
                    <div 
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-500" 
                      style={{ width: barWidth }}
                    />
                  </div>

                  {/* Leader Tag */}
                  {details.managerId && (
                    <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                      <span>Lead:</span>
                      <button 
                        onClick={() => onSelectEmployee(details.managerId)}
                        className="text-[#2563EB] hover:underline font-semibold text-left"
                      >
                        {details.managerName}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Work status distribution */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Workplace Status Distribution</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Corporate breakdown of work presence frameworks.</p>
          </div>

          {/* SVG Pie/Circle chart */}
          <div className="flex justify-center my-6 relative">
            <svg width="140" height="140" viewBox="0 0 36 36" className="w-32 h-32">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F3F4F6" strokeWidth="2.5" />
              {/* Stacked strokes */}
              {(() => {
                let cumulativePct = 0;
                return statusSummary.map((item, idx) => {
                  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];
                  const strokeColor = colors[idx % colors.length];
                  const dashArray = `${item.percentage} ${100 - item.percentage}`;
                  const dashOffset = 100 - cumulativePct + 25; // 25 to start at 12 o'clock
                  cumulativePct += item.percentage;

                  return (
                    <circle
                      key={item.status}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="3.2"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-300"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-[#111827] leading-none">{totalEmployees}</span>
              <span className="text-[9px] text-[#6B7280] font-medium tracking-wide mt-1 uppercase">Staff</span>
            </div>
          </div>

          {/* Status Legend table */}
          <div className="space-y-2 text-xs">
            {statusSummary.map((item, idx) => {
              const colors = ['bg-[#2563EB]', 'bg-[#10B981]', 'bg-[#F59E0B]', 'bg-[#8B5CF6]'];
              const indicatorColor = colors[idx % colors.length];
              
              return (
                <div key={item.status} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></span>
                    <span className="font-medium text-[#111827]">{item.status}</span>
                  </div>
                  <div className="text-[#6B7280] font-mono text-right">
                    <span className="font-semibold text-[#111827]">{item.count}</span> ({item.percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Directory Snapshot */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">Key Executive Officers</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Primary corporate decision makers directing operations.</p>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">Level L1 & L2 leadership</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {employees
            .filter(emp => emp.parentId === null || emp.parentId === "1")
            .map(emp => (
              <div 
                key={emp.id}
                onClick={() => onSelectEmployee(emp.id)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-[#2563EB] cursor-pointer transition-colors bg-[#FAFAFA]"
              >
                <div className={`w-10 h-10 rounded-full ${emp.avatarColor} text-white font-bold flex items-center justify-center shrink-0`}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#111827] truncate">{emp.name}</h4>
                  <p className="text-[10px] text-[#6B7280] truncate mt-0.5">{emp.role}</p>
                  <p className="text-[9px] text-[#2563EB] font-semibold mt-1 inline-flex bg-blue-50 px-2 py-0.5 rounded-md">
                    {emp.department}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

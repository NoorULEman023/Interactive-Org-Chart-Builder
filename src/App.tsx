import React, { useState, useEffect, useRef } from 'react';
import { Employee, ActiveTab } from './types';
import { INITIAL_EMPLOYEES } from './data/sampleData';
import { OrgChartCanvas } from './components/OrgChartCanvas';
import { DetailsPanel } from './components/DetailsPanel';
import { StatsDashboard } from './components/StatsDashboard';
import { DirectoryView } from './components/DirectoryView';
import { DepartmentsView } from './components/DepartmentsView';
import { AddEditModal } from './components/AddEditModal';
import { 
  Network, 
  Users, 
  Building, 
  BarChart3, 
  Search, 
  Download, 
  Upload, 
  RotateCcw,
  Briefcase,
  Layers,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Local storage state initialization
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('nexushr_employees_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to load employees from local storage", err);
      }
    }
    return INITIAL_EMPLOYEES;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('chart');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [quickAddParentId, setQuickAddParentId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state to local storage on modification
  useEffect(() => {
    localStorage.setItem('nexushr_employees_state', JSON.stringify(employees));
  }, [employees]);

  // Handle saving (creating new or updating existing)
  const handleSaveEmployee = (emp: Employee) => {
    const exists = employees.some(e => e.id === emp.id);
    if (exists) {
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    } else {
      setEmployees(prev => [...prev, emp]);
    }
    setSelectedEmployeeId(emp.id); // Automatically inspect active save
  };

  // Safe Deletion with subordinates re-routing
  const handleDeleteEmployee = (empId: string) => {
    const employee = employees.find(e => e.id === empId);
    if (!employee) return;

    const directReports = employees.filter(e => e.parentId === empId);
    
    // Custom corporate prompt for safe layout reassignment
    const promptMessage = directReports.length > 0
      ? `Are you sure you want to remove ${employee.name} (${employee.role})? \n\nThis employee manages ${directReports.length} direct report(s). Subordinates will be automatically reassigned to report to ${
          employee.parentId 
            ? employees.find(e => e.id === employee.parentId)?.name 
            : 'no supervisor (Root level)'
        }.`
      : `Are you sure you want to remove ${employee.name} (${employee.role}) from the organization?`;

    if (window.confirm(promptMessage)) {
      // Reassign subordinates to parent supervisor
      const updated = employees.map(e => {
        if (e.parentId === empId) {
          return { ...e, parentId: employee.parentId };
        }
        return e;
      }).filter(e => e.id !== empId);

      setEmployees(updated);
      if (selectedEmployeeId === empId) {
        setSelectedEmployeeId(null);
      }
    }
  };

  // Reset to default sample organization
  const handleResetToDefault = () => {
    if (window.confirm("This will reset all your changes and restore the realistic 40-employee demo chart. Continue?")) {
      setEmployees(INITIAL_EMPLOYEES);
      setSelectedEmployeeId(null);
      setSearchQuery('');
      localStorage.removeItem('nexushr_employees_state');
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(employees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexus_organization_chart.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check standard schema fields
          if (parsed[0].name && parsed[0].role) {
            setEmployees(parsed);
            setSelectedEmployeeId(null);
            alert("NexusHR Organization Chart imported successfully!");
          } else {
            alert("Error: JSON does not match the employee schema.");
          }
        } else {
          alert("Error: Invalid JSON representation.");
        }
      } catch (err) {
        alert("Error: Failed to parse file as JSON.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Export SVG visual tree representation
  const handleExportSVG = () => {
    const svgElement = document.getElementById('org-chart-svg');
    if (!svgElement) {
      alert("Chart must be visible on screen to export visual representation.");
      return;
    }

    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Add styling headers or namespaces for self-contained downloads
    let serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);

    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexus_organization_chart.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export PNG visual tree representation
  const handleExportPNG = () => {
    const svgElement = document.getElementById('org-chart-svg');
    if (!svgElement) {
      alert("Chart must be visible on screen to export visual representation.");
      return;
    }

    // High fidelity export: render on high-res canvas
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // high resolution multiplier
      
      canvas.width = svgElement.clientWidth * scale;
      canvas.height = svgElement.clientHeight * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FAFAFA'; // Background matches palette
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0, svgElement.clientWidth, svgElement.clientHeight);

        try {
          const pngURL = canvas.toDataURL('image/png');
          const dl = document.createElement('a');
          dl.href = pngURL;
          dl.download = 'nexus_organization_chart.png';
          dl.click();
        } catch (e) {
          console.error("Canvas export blocked by cross-origin permissions", e);
          alert("PNG export failed. Please download as SVG directly.");
        }
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  // Quick Action: Add report from specific node
  const handleTriggerQuickAdd = (parentId: string) => {
    setEmployeeToEdit(null);
    setQuickAddParentId(parentId);
    setIsAddEditModalOpen(true);
  };

  // Menu action: Onboard fresh individual
  const handleTriggerAddFromMenu = (parentId: string | null = null) => {
    setEmployeeToEdit(null);
    setQuickAddParentId(parentId);
    setIsAddEditModalOpen(true);
  };

  // Menu action: Edit existing
  const handleTriggerEdit = (empToEdit: Employee) => {
    setEmployeeToEdit(empToEdit);
    setQuickAddParentId(null);
    setIsAddEditModalOpen(true);
  };

  return (
    <div id="nexushr-root-application" className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#111827]">
      
      {/* Hidden file uploader */}
      <input
        id="hidden-file-uploader"
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* TOP NAVIGATION BAR */}
      <header id="app-top-navbar" className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <button 
            id="mobile-sidebar-toggle"
            onClick={() => setIsMobileSidebarOpen(prev => !prev)}
            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#111827] leading-none">OrgFlow</h1>
            <p className="text-[10px] text-[#6B7280] font-medium mt-0.5 tracking-wider uppercase">Chart Builder</p>
          </div>
        </div>

        {/* Global Search (triggers matching highlight in live view) */}
        <div className="hidden sm:flex items-center relative max-w-xs w-full mx-4">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#6B7280]" />
          <input
            id="navbar-search-input"
            type="text"
            placeholder="Search employee or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] bg-[#FAFAFA]"
          />
          {searchQuery && (
            <button 
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* System Toolbar Actions (Import, Export, Settings) */}
        <div className="flex items-center gap-2">
          {/* Reset Chart */}
          <button
            id="btn-toolbar-reset"
            onClick={handleResetToDefault}
            className="p-2 hover:bg-[#EFF6FF] rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-all hover:shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Reset to default template"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>

          {/* Import JSON */}
          <button
            id="btn-toolbar-import"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-[#EFF6FF] rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-all hover:shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Import Organization JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden lg:inline">Import JSON</span>
          </button>

          {/* Visual SVG PNG Exports */}
          <div className="flex items-center bg-[#FAFAFA] border border-[#E5E7EB] p-0.5 rounded-lg">
            <button
              id="btn-toolbar-export-png"
              onClick={handleExportPNG}
              className="px-2.5 py-1.5 hover:bg-white text-[11px] font-semibold rounded-md text-[#6B7280] hover:text-[#111827] transition-all flex items-center gap-1"
              title="Download PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
            <button
              id="btn-toolbar-export-svg"
              onClick={handleExportSVG}
              className="px-2.5 py-1.5 hover:bg-white text-[11px] font-semibold rounded-md text-[#6B7280] hover:text-[#111827] transition-all flex items-center gap-1"
              title="Download Vector SVG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
            <button
              id="btn-toolbar-export-json"
              onClick={handleExportJSON}
              className="px-2.5 py-1.5 hover:bg-white text-[11px] font-semibold rounded-md text-[#6B7280] hover:text-[#111827] transition-all flex items-center gap-1"
              title="Download Data JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER WORKSPACE */}
      <div id="main-app-grid" className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR (Desktop navigation & overview metrics) */}
        <aside 
          id="desktop-left-sidebar" 
          className={`w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between shrink-0 absolute md:relative inset-y-0 left-0 z-30 transition-transform duration-300 md:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Navigation Items list */}
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between md:hidden">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation</span>
              <button 
                id="close-mobile-sidebar-btn"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider px-3 block">
                Workspace VIEWS
              </span>
              
              {/* Tab 1: Organization Chart */}
              <button
                id="sidebar-tab-chart"
                onClick={() => {
                  setActiveTab('chart');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'chart'
                    ? 'bg-[#EFF6FF] text-[#2563EB] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Network className="w-4.5 h-4.5" />
                  <span>Interactive Tree</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === 'chart' ? 'text-[#2563EB]' : 'text-gray-400'}`} />
              </button>

              {/* Tab 2: Directory spreadsheet */}
              <button
                id="sidebar-tab-employees"
                onClick={() => {
                  setActiveTab('employees');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'employees'
                    ? 'bg-[#EFF6FF] text-[#2563EB] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4.5 h-4.5" />
                  <span>Employees Directory</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === 'employees' ? 'text-[#2563EB]' : 'text-gray-400'}`} />
              </button>

              {/* Tab 3: Department hub */}
              <button
                id="sidebar-tab-departments"
                onClick={() => {
                  setActiveTab('departments');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'departments'
                    ? 'bg-[#EFF6FF] text-[#2563EB] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4.5 h-4.5" />
                  <span>Departments Hub</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === 'departments' ? 'text-[#2563EB]' : 'text-gray-400'}`} />
              </button>

              {/* Tab 4: Statistics Overview */}
              <button
                id="sidebar-tab-statistics"
                onClick={() => {
                  setActiveTab('statistics');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'statistics'
                    ? 'bg-[#EFF6FF] text-[#2563EB] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4.5 h-4.5" />
                  <span>Analytical Statistics</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === 'statistics' ? 'text-[#2563EB]' : 'text-gray-400'}`} />
              </button>
            </div>

            {/* Quick Summary stats */}
            <div className="pt-2 border-t border-[#E5E7EB] space-y-3 px-3">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                Directory Summary
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                  <p className="text-[10px] text-[#6B7280] leading-none">Active Staff</p>
                  <p className="text-sm font-bold text-[#111827] mt-1">{employees.length}</p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                  <p className="text-[10px] text-[#6B7280] leading-none">Average Salary</p>
                  <p className="text-xs font-bold text-[#111827] mt-1.5">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(employees.reduce((a, b) => a + b.salary, 0) / (employees.length || 1))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer branding credits */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA]/50 text-[10px] text-[#6B7280] space-y-1 font-medium leading-normal">
            <p className="font-semibold text-[#111827]">NexusHR SaaS Platform</p>
            <p>Built for production HR scaling.</p>
            <p className="text-[9px] text-[#2563EB] font-bold mt-2 font-mono">SECURE OFFLINE CLIENT</p>
          </div>
        </aside>

        {/* Mobile backdrop for sidebar */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* MAIN DISPLAY WORKSPACE (renders active view) */}
        <main id="main-viewport-pane" className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] overflow-y-auto">
          {activeTab === 'chart' && (
            <OrgChartCanvas
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              onSelectEmployee={setSelectedEmployeeId}
              onAddEmployee={handleTriggerQuickAdd}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'employees' && (
            <DirectoryView
              employees={employees}
              onSelectEmployee={setSelectedEmployeeId}
              onAddEmployee={handleTriggerAddFromMenu}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              employees={employees}
              onSelectEmployee={setSelectedEmployeeId}
            />
          )}

          {activeTab === 'statistics' && (
            <StatsDashboard
              employees={employees}
              onSelectEmployee={setSelectedEmployeeId}
            />
          )}
        </main>

        {/* RIGHT SIDEBAR (Inspect profile & related employee info) */}
        <section 
          id="profile-details-sidebar" 
          className={`h-full transition-all duration-300 absolute md:relative right-0 z-20 overflow-hidden ${
            selectedEmployeeId 
              ? 'w-full sm:w-[350px] lg:w-[380px] shrink-0 border-l border-[#E5E7EB] bg-white translate-x-0 opacity-100' 
              : 'w-0 shrink-0 pointer-events-none translate-x-full opacity-0 border-none'
          }`}
        >
          <DetailsPanel
            employeeId={selectedEmployeeId}
            employees={employees}
            onClose={() => setSelectedEmployeeId(null)}
            onSelectEmployee={setSelectedEmployeeId}
            onEditEmployee={handleTriggerEdit}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </section>
      </div>

      {/* POPUP MODAL FOR ADDING AND EDITING PROFILES */}
      <AddEditModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEmployeeToEdit(null);
          setQuickAddParentId(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        initialParentId={quickAddParentId}
        employees={employees}
      />
    </div>
  );
}

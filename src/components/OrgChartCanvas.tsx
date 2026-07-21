import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Employee } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Briefcase, 
  MapPin, 
  Users,
  Eye
} from 'lucide-react';
import { motion } from 'motion/react';

interface OrgChartCanvasProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  onAddEmployee: (parentId: string) => void;
  searchQuery: string;
}

export const OrgChartCanvas: React.FC<OrgChartCanvasProps> = ({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  onAddEmployee,
  searchQuery,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set<string>());
  
  // Track d3 zoom transform in React state to sync visual controls if needed
  const [zoomScale, setZoomScale] = useState<number>(0.8);
  const d3ZoomRef = useRef<any>(null);

  // Department colors mapping for visual identification
  const getDeptColorClass = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'executive': return 'border-blue-500 bg-blue-500';
      case 'engineering': return 'border-teal-500 bg-teal-500';
      case 'product': return 'border-purple-500 bg-purple-500';
      case 'sales': return 'border-amber-500 bg-amber-500';
      case 'marketing': return 'border-orange-500 bg-orange-500';
      case 'human resources': return 'border-rose-500 bg-rose-500';
      case 'finance': return 'border-emerald-500 bg-emerald-500';
      default: return 'border-gray-400 bg-gray-400';
    }
  };

  const getDeptLightColorClass = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'executive': return 'bg-blue-50 text-blue-700';
      case 'engineering': return 'bg-teal-50 text-teal-700';
      case 'product': return 'bg-purple-50 text-purple-700';
      case 'sales': return 'bg-amber-50 text-amber-700';
      case 'marketing': return 'bg-orange-50 text-orange-700';
      case 'human resources': return 'bg-rose-50 text-rose-700';
      case 'finance': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Safe stratification logic
  const { descendants, links, visibleEmployeesMap } = useMemo(() => {
    // Filter out parentIds that do not exist to prevent infinite loops or broken structures
    const employeeIds = new Set(employees.map(e => e.id));
    const sanitizedEmployees = employees.map(e => {
      if (e.parentId && !employeeIds.has(e.parentId)) {
        return { ...e, parentId: null };
      }
      return e;
    });

    // Helper to filter out descendants of collapsed nodes
    const getVisibleEmployees = (allEmps: Employee[], collapsed: Set<string>) => {
      if (collapsed.size === 0) return allEmps;
      
      const hiddenIds = new Set<string>();
      
      const addChildrenToHidden = (pid: string) => {
        allEmps.forEach(emp => {
          if (emp.parentId === pid) {
            hiddenIds.add(emp.id);
            addChildrenToHidden(emp.id);
          }
        });
      };

      Array.from(collapsed).forEach(id => {
        addChildrenToHidden(id);
      });

      return allEmps.filter(emp => !hiddenIds.has(emp.id));
    };

    const visibleEmployees = getVisibleEmployees(sanitizedEmployees, collapsedIds);
    const visibleMap = new Map(visibleEmployees.map(e => [e.id, e]));

    // Handle potential multiple roots or missing roots safely
    const roots = visibleEmployees.filter(e => e.parentId === null);
    
    // Fallback: If no root found, pick the first employee and make their parent null
    if (roots.length === 0 && visibleEmployees.length > 0) {
      visibleEmployees[0].parentId = null;
    }

    let rootNode: d3.HierarchyNode<Employee>;
    try {
      const stratify = d3.stratify<Employee>()
        .id(d => d.id)
        .parentId(d => d.parentId);
      rootNode = stratify(visibleEmployees);
    } catch (err) {
      console.warn("D3 stratify failed, reconstructing...", err);
      // Clean fallback: force first element as parent of any orphans
      const fallbackRootId = roots[0]?.id || visibleEmployees[0]?.id;
      const forceFixed = visibleEmployees.map(e => {
        if (e.id !== fallbackRootId && (!e.parentId || !employeeIds.has(e.parentId))) {
          return { ...e, parentId: fallbackRootId };
        }
        return e;
      });
      const stratify = d3.stratify<Employee>()
        .id(d => d.id)
        .parentId(d => d.parentId);
      rootNode = stratify(forceFixed);
    }

    // Configure layout size
    // For vertical tree, node width spacing is ~250px, level height is ~180px
    // For horizontal tree, node width spacing is ~280px, level height is ~140px
    const treeLayout = d3.tree<Employee>();
    if (orientation === 'vertical') {
      treeLayout.nodeSize([260, 160]);
    } else {
      treeLayout.nodeSize([120, 300]); // swapped for horizontal
    }

    const treeData = treeLayout(rootNode);
    return {
      descendants: treeData.descendants(),
      links: treeData.links(),
      visibleEmployeesMap: visibleMap
    };
  }, [employees, collapsedIds, orientation]);

  // Handle D3 zoom binding
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('#zoom-container');

    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomScale(event.transform.k);
      });

    d3ZoomRef.current = zoom;
    svg.call(zoom as any);

    // Initial center positioning
    const containerWidth = containerRef.current?.clientWidth || 800;
    const initialTransform = d3.zoomIdentity
      .translate(containerWidth / 2, orientation === 'vertical' ? 80 : 250)
      .scale(0.75);
    
    svg.call(zoom.transform as any, initialTransform);
    setZoomScale(0.75);
  }, [orientation]);

  // Center on searched or selected employee
  useEffect(() => {
    if (!selectedEmployeeId || !svgRef.current) return;

    const matchedNode = descendants.find(d => d.data.id === selectedEmployeeId);
    if (matchedNode) {
      const svg = d3.select(svgRef.current);
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 600;

      let targetX = 0;
      let targetY = 0;

      if (orientation === 'vertical') {
        targetX = containerWidth / 2 - matchedNode.x * 0.85;
        targetY = containerHeight / 2 - matchedNode.y * 0.85;
      } else {
        targetX = containerWidth / 2 - matchedNode.y * 0.85;
        targetY = containerHeight / 2 - matchedNode.x * 0.85;
      }

      svg.transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .call(
          d3ZoomRef.current.transform as any,
          d3.zoomIdentity.translate(targetX, targetY).scale(0.85)
        );
    }
  }, [selectedEmployeeId, descendants, orientation]);

  // Zoom controls helpers
  const handleZoomIn = () => {
    if (!svgRef.current || !d3ZoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(d3ZoomRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !d3ZoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(d3ZoomRef.current.scaleBy, 0.8);
  };

  const handleFitScreen = () => {
    if (!svgRef.current || !d3ZoomRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (descendants.length === 0) return;

    // Calculate bounds of visible nodes
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    descendants.forEach(d => {
      const posX = orientation === 'vertical' ? d.x : d.y;
      const posY = orientation === 'vertical' ? d.y : d.x;
      
      minX = Math.min(minX, posX);
      maxX = Math.max(maxX, posX);
      minY = Math.min(minY, posY);
      maxY = Math.max(maxY, posY);
    });

    // Add padding for card dimensions (W=240, H=100)
    minX -= 150;
    maxX += 150;
    minY -= 100;
    maxY += 100;

    const chartWidth = maxX - minX;
    const chartHeight = maxY - minY;

    const scaleX = containerWidth / chartWidth;
    const scaleY = containerHeight / chartHeight;
    const scale = Math.min(Math.min(scaleX, scaleY), 1); // Max scale of 1 to prevent pixelation

    const transformX = containerWidth / 2 - (minX + chartWidth / 2) * scale;
    const transformY = containerHeight / 2 - (minY + chartHeight / 2) * scale;

    svg.transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .call(
        d3ZoomRef.current.transform as any,
        d3.zoomIdentity.translate(transformX, transformY).scale(scale)
      );
  };

  // Toggle Collapse State
  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Count reports recursively
  const getSubordinateCount = (empId: string): number => {
    let count = 0;
    const countChildren = (pid: string) => {
      employees.forEach(emp => {
        if (emp.parentId === pid) {
          count++;
          countChildren(emp.id);
        }
      });
    };
    countChildren(empId);
    return count;
  };

  // Count direct reports (not recursive)
  const getDirectReportsCount = (empId: string): number => {
    return employees.filter(e => e.parentId === empId).length;
  };

  // Generate connection path curves
  const renderLink = (link: d3.HierarchyLink<Employee>) => {
    const { source, target } = link;
    const isMatched = searchQuery 
      ? (source.data.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         target.data.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : false;

    if (orientation === 'vertical') {
      // Cards centered at (x, y)
      // Height of card is 90
      const sY = source.y + 45;
      const tY = target.y - 45;
      const midY = (sY + tY) / 2;

      return (
        <path
          key={`link-${source.data.id}-${target.data.id}`}
          d={`M ${source.x} ${sY} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${tY}`}
          fill="none"
          stroke={isMatched ? '#3B82F6' : '#E5E7EB'}
          strokeWidth={isMatched ? 2.5 : 1.5}
          className="transition-all duration-300"
          strokeDasharray={isMatched ? "4,4" : "none"}
        />
      );
    } else {
      // Cards horizontal (swapped x and y)
      // Width of card is 220
      const sX = source.y + 110;
      const tX = target.y - 110;
      const midX = (sX + tX) / 2;

      return (
        <path
          key={`link-${source.data.id}-${target.data.id}`}
          d={`M ${sX} ${source.x} C ${midX} ${source.x}, ${midX} ${target.x}, ${tX} ${target.x}`}
          fill="none"
          stroke={isMatched ? '#3B82F6' : '#E5E7EB'}
          strokeWidth={isMatched ? 2.5 : 1.5}
          className="transition-all duration-300"
          strokeDasharray={isMatched ? "4,4" : "none"}
        />
      );
    }
  };

  return (
    <div id="org-chart-canvas-container" className="relative w-full h-full bg-[#FAFAFA] flex flex-col overflow-hidden" ref={containerRef}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Canvas Header Controls */}
      <div id="canvas-toolbar" className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E5E7EB] shadow-xs">
        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-fit-screen"
          onClick={handleFitScreen}
          className="p-1.5 hover:bg-[#EFF6FF] rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-colors"
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
        
        <div className="w-px h-5 bg-[#E5E7EB] mx-1"></div>

        {/* Layout Orientation Selector */}
        <div className="flex bg-[#FAFAFA] p-0.5 rounded-lg border border-[#E5E7EB]">
          <button
            id="btn-orientation-vertical"
            onClick={() => setOrientation('vertical')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              orientation === 'vertical'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Vertical
          </button>
          <button
            id="btn-orientation-horizontal"
            onClick={() => setOrientation('horizontal')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              orientation === 'horizontal'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Horizontal
          </button>
        </div>

        <div className="w-px h-5 bg-[#E5E7EB] mx-1"></div>
        <span className="text-xs text-[#6B7280] font-mono px-1">
          {Math.round(zoomScale * 100)}%
        </span>
      </div>

      {/* Legend */}
      <div id="canvas-legend" className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-white px-3 py-2 rounded-xl border border-[#E5E7EB] shadow-xs text-[10px] text-[#6B7280]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
          <span>Exec</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span>
          <span>Engineering</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
          <span>Product</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <span>Sales</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
          <span>Marketing</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
          <span>HR</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
          <span>Finance</span>
        </div>
      </div>

      {/* Main SVG workspace */}
      <svg
        id="org-chart-svg"
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none select-none"
      >
        <g id="zoom-container">
          {/* Paths / Links layer */}
          <g id="links-group">
            {links.map(renderLink)}
          </g>

          {/* Cards / Nodes layer */}
          <g id="nodes-group">
            {descendants.map(node => {
              const emp = node.data;
              const isSelected = selectedEmployeeId === emp.id;
              
              // Determine if searched query matches name/title
              const isMatched = searchQuery
                ? (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
                : false;

              // Card Dimensions: W=220, H=90
              const width = 220;
              const height = 90;
              
              // Layout coordinates (swapped if horizontal)
              const posX = orientation === 'vertical' ? node.x - width / 2 : node.y - width / 2;
              const posY = orientation === 'vertical' ? node.y - height / 2 : node.x - height / 2;

              const totalSubordinates = getSubordinateCount(emp.id);
              const directReports = getDirectReportsCount(emp.id);
              const isCollapsed = collapsedIds.has(emp.id);

              return (
                <foreignObject
                  key={`node-${emp.id}`}
                  x={posX}
                  y={posY}
                  width={width}
                  height={height + 25} // extra height for collapse button spacing
                  className="overflow-visible"
                >
                  <div className="flex flex-col items-center w-full relative">
                    <div
                      id={`node-card-${emp.id}`}
                      onClick={() => onSelectEmployee(emp.id)}
                      className={`relative flex flex-col justify-between w-[220px] h-[90px] bg-white rounded-2xl border p-3 cursor-pointer select-none transition-all duration-200 ${
                        isSelected 
                          ? 'border-[#2563EB] ring-2 ring-[#EFF6FF] shadow-sm'
                          : isMatched
                          ? 'border-blue-400 ring-2 ring-blue-50 shadow-sm animate-pulse'
                          : 'border-[#E5E7EB] hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Department Accent Bar on left */}
                      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md ${getDeptColorClass(emp.department).split(' ')[1]}`}></div>

                      <div className="flex items-center gap-2 pl-1 w-full">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full ${emp.avatarColor} text-white font-semibold text-xs flex items-center justify-center shrink-0`}>
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>

                        {/* Title & Role */}
                        <div className="flex flex-col min-w-0 w-full pr-1">
                          <span className="text-xs font-semibold text-[#111827] truncate leading-tight">
                            {emp.name}
                          </span>
                          <span className="text-[10px] text-[#6B7280] font-medium truncate leading-normal" title={emp.role}>
                            {emp.role}
                          </span>
                          <span className={`inline-flex self-start mt-1 text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${getDeptLightColorClass(emp.department)}`}>
                            {emp.department}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Statistics or Controls */}
                      <div className="flex items-center justify-between border-t border-[#FAFAFA] pt-1.5 text-[9px] text-[#6B7280] pl-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-0.5" title="Direct reports">
                            <Users className="w-2.5 h-2.5" />
                            <span>{directReports}</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-0.5" title="Location">
                            <MapPin className="w-2.5 h-2.5 text-gray-400" />
                            <span className="truncate max-w-[70px]">{emp.location.split(',')[0]}</span>
                          </span>
                        </div>

                        {/* Quick Action add reports */}
                        <button
                          id={`node-add-btn-${emp.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddEmployee(emp.id);
                          }}
                          className="p-1 hover:bg-[#EFF6FF] rounded-md hover:text-[#2563EB] transition-colors"
                          title="Add Direct Report"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Collapse / Expand Toggle Button below card */}
                    {directReports > 0 && (
                      <button
                        id={`node-collapse-btn-${emp.id}`}
                        onClick={(e) => toggleCollapse(emp.id, e)}
                        className={`absolute bottom-[10px] z-20 flex items-center justify-center w-5 h-5 rounded-full border bg-white shadow-xs text-[#6B7280] transition-all hover:bg-[#EFF6FF] hover:text-[#2563EB] ${
                          isCollapsed 
                            ? 'border-blue-300 ring-2 ring-blue-50 text-blue-600'
                            : 'border-[#E5E7EB]'
                        }`}
                        title={isCollapsed ? `Expand reports (${totalSubordinates})` : 'Collapse reports'}
                      >
                        {isCollapsed ? (
                          <span className="text-[8px] font-bold">+{directReports}</span>
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </foreignObject>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
};

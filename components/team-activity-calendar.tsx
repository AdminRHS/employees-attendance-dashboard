'use client'

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FilterTag } from './filter-tag';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmployeeCard } from './employee-card';
import type { Report } from '@/types';
import { getUnifiedStatus } from '@/lib/unified-status';
import type { UnifiedStatus } from '@/lib/unified-status';
import { cn } from '@/lib/utils';

type EmployeeTab = 'company' | 'project';

interface TeamActivityCalendarProps {
  reports: Report[];
  initialVerdictFilter?: string;
  initialDate?: Date;
  initialActiveTab?: 'company' | 'project';
}

const STATUS_TOOLTIPS = {
  all: 'Show all employees',
  ok: 'Everything is good - no issues detected',
  hoursProblems: 'Required hours not met',
  reportProblems: 'No report or report too short',
  totalProblems: 'Hours + report issues detected',
  inactive: 'No activity in CRM or Discord',
  leave: 'Employee is on leave',
};

const PROJECT_STATUS_KEYWORDS = ['project', 'part-project', 'project-only', 'project only', 'part project'];

function isProjectStatus(status?: string | null): boolean {
  if (!status) return false;
  const norm = status.toLowerCase();
  return PROJECT_STATUS_KEYWORDS.some((kw) => norm.includes(kw));
}

function getHoursRequirement(rate: number | null | undefined): number | null {
  if (rate == null || isNaN(rate)) return null;
  if (rate >= 1.25) return 10;
  if (rate >= 1.0) return 8;
  if (rate >= 0.75) return 6;
  if (rate >= 0.5) return 4;
  return null;
}

function isValidReportText(text?: string | null): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return trimmed.length >= 40;
}

function getRateClass(rate: number): string {
  if (rate >= 85) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

export function TeamActivityCalendar({ 
  reports, 
  initialVerdictFilter = 'all',
  initialDate,
  initialActiveTab = 'company'
}: TeamActivityCalendarProps) {
  console.log('[DEBUG] Calendar: Received props', { initialVerdictFilter, initialDate, initialActiveTab });
  // Set default date to yesterday
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate ?? getYesterday());
  const [activeTab, setActiveTab] = useState<EmployeeTab>(initialActiveTab);
  const [verdictFilter, setVerdictFilter] = useState<string>(initialVerdictFilter);

  // React to prop changes for programmatic navigation
  useEffect(() => {
    if (initialDate !== undefined) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (initialActiveTab !== undefined) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  useEffect(() => {
    if (initialVerdictFilter !== undefined) {
      console.log('[DEBUG] Calendar: Setting verdictFilter from prop', initialVerdictFilter);
      setVerdictFilter(initialVerdictFilter);
      // Reset other filters when navigating programmatically
      setDepartmentFilters(new Set());
      setProfessionFilters(new Set());
    }
  }, [initialVerdictFilter]);
  const [departmentFilters, setDepartmentFilters] = useState<Set<string>>(new Set());
  const [professionFilters, setProfessionFilters] = useState<Set<string>>(new Set());
  // Filters collapsed by default on mobile/tablet, expanded on desktop
  const [filtersOpen, setFiltersOpen] = useState(true); // Will be set based on screen size
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Set filters expanded on desktop by default, collapsed on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setFiltersOpen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  // Get selected date string
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // Filter reports for selected date
  const reportsForDateRaw = reports.filter(r => r.date === selectedDateStr);

  // Apply company/project tab filter based on Employee Status
  const reportsForDate = reportsForDateRaw.filter((r) => {
    const status = (r.employeeStatus || r.currentStatus || '').toLowerCase();
    const isProject = isProjectStatus(status);
    return activeTab === 'project' ? isProject : !isProject;
  });

  // Get unique departments and professions (sorted alphabetically, excluding 'all')
  const departments = Array.from(new Set(reports.map(r => r.department).filter(Boolean))).sort();
  const professions = Array.from(new Set(reports.map(r => r.profession).filter(Boolean))).sort();

  // Apply all filters
  let filteredReports = reportsForDate;

  // Status filter - using unified status
  if (verdictFilter !== 'all') {
    filteredReports = filteredReports.filter(r => {
      const unifiedStatus = getUnifiedStatus(r, activeTab);
      return unifiedStatus === verdictFilter;
    });
  }

  // Department filter (multi-select)
  if (departmentFilters.size > 0) {
    filteredReports = filteredReports.filter(r => 
      r.department && departmentFilters.has(r.department.toLowerCase())
    );
  }

  // Profession filter (multi-select)
  if (professionFilters.size > 0) {
    filteredReports = filteredReports.filter(r => 
      r.profession && professionFilters.has(r.profession.toLowerCase())
    );
  }

  // Get unique employees from filtered reports
  const uniqueEmployees = filteredReports.reduce((acc, report) => {
    if (!acc.find(r => r.name === report.name)) {
      acc.push(report);
    }
    return acc;
  }, [] as Report[]);

  // Get available dates (dates with data)
  const availableDates = new Set(reports.map(r => r.date));

  // Calculate stats for selected date using unified status
  const dateStats = {
    total: reportsForDate.length,
    unique: new Set(reportsForDate.map(r => r.name)).size,
    ok: reportsForDate.filter(r => getUnifiedStatus(r, activeTab) === 'ok').length,
    hoursProblems: reportsForDate.filter(r => getUnifiedStatus(r, activeTab) === 'hoursProblems').length,
    reportProblems: reportsForDate.filter(r => getUnifiedStatus(r, activeTab) === 'reportProblems').length,
    totalProblems: reportsForDate.filter(r => getUnifiedStatus(r, activeTab) === 'totalProblems').length,
    inactive: reportsForDate.filter(r => getUnifiedStatus(r, activeTab) === 'inactive').length,
    leave: reportsForDate.filter(r => getUnifiedStatus(r, activeTab) === 'leave').length,
  };

  // Build per-employee unified status for current day and tab
  const employeeStatusMap = new Map<string, UnifiedStatus>();
  
  for (const r of reportsForDate) {
    const key = r.name;
    // Compute unified status for each employee report
    const unifiedStatus = getUnifiedStatus(r, activeTab);
    // If employee appears multiple times, keep the first status (or you could implement priority logic)
    if (!employeeStatusMap.has(key)) {
      employeeStatusMap.set(key, unifiedStatus);
    }
  }

  // Get status info for employee cards
  const employeeStatuses = Array.from(employeeStatusMap.entries()).map(([name, status]) => {
    const report = reportsForDate.find(r => r.name === name);
    if (!report) return { name, status, hoursValid: false, reportValid: false, inactive: false };
    
    const rawHours = (report.computedHours != null && !isNaN(report.computedHours))
      ? report.computedHours
      : (parseFloat(report.crmTime || '0') || 0) + (parseFloat(report.discordTime || '0') || 0);
    
    const rateNum = report.rate ?? null;
    const expected = getHoursRequirement(rateNum);
    const hoursValid = expected != null ? rawHours >= expected : false;
    const reportValid = isValidReportText(report.report);
    const inactive = (!rawHours && !parseFloat(report.discordTime || '0') && !reportValid);

    return { name, status, hoursValid, reportValid, inactive };
  });

  const totalEmployees = employeeStatuses.length;
  const statusByName = new Map(employeeStatuses.map((e) => [e.name, e]));

  const hasActiveFilters = verdictFilter !== 'all' || departmentFilters.size > 0 || professionFilters.size > 0;

  const clearAllFilters = () => {
    setVerdictFilter('all');
    setDepartmentFilters(new Set());
    setProfessionFilters(new Set());
  };

  // Toggle department filter
  const toggleDepartmentFilter = (dept: string) => {
    const normalized = dept.toLowerCase();
    setDepartmentFilters(prev => {
      const next = new Set(prev);
      if (next.has(normalized)) {
        next.delete(normalized);
      } else {
        next.add(normalized);
      }
      return next;
    });
  };

  // Toggle profession filter
  const toggleProfessionFilter = (prof: string) => {
    const normalized = prof.toLowerCase();
    setProfessionFilters(prev => {
      const next = new Set(prev);
      if (next.has(normalized)) {
        next.delete(normalized);
      } else {
        next.add(normalized);
      }
      return next;
    });
  };

  // Get active filter labels for summary
  const getActiveFilters = () => {
    const filters: Array<{ label: string; value: string; type: 'status' | 'department' | 'profession' }> = [];
    if (verdictFilter !== 'all') {
      const statusLabel = verdictFilter === 'hoursProblems' ? 'Hours Problems'
        : verdictFilter === 'reportProblems' ? 'Report Problems'
        : verdictFilter === 'totalProblems' ? 'Total Problems'
        : verdictFilter.charAt(0).toUpperCase() + verdictFilter.slice(1);
      filters.push({ label: statusLabel, value: verdictFilter, type: 'status' });
    }
    departmentFilters.forEach(dept => {
      filters.push({ label: dept, value: dept, type: 'department' });
    });
    professionFilters.forEach(prof => {
      filters.push({ label: prof, value: prof, type: 'profession' });
    });
    return filters;
  };

  const activeFilterLabels = getActiveFilters();

  return (
    <Card id="team-activity">
      <CardHeader>
        {/* Header with Title, Company/Project Toggle, and Clear Filters */}
        <div className="space-y-4">
          {/* Top row: Title + Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Title section */}
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight dark:text-[#F3F4F6]">📅 Team Activity Calendar</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                View daily activity by company or project teams.
              </CardDescription>
            </div>

            {/* Right side: Company/Project toggle + Clear Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Company / Project segmented control */}
              <div className="inline-flex rounded-full bg-muted p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('company')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                    activeTab === 'company'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Company
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('project')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                    activeTab === 'project'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Project
                </button>
              </div>

              {/* Clear Filters button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2 text-sm px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors dark:text-[#CBD5E1]"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 dark:text-[#94A3B8]" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Date info */}
          {selectedDate && (
            <div className="text-xs sm:text-sm text-muted-foreground dark:text-[#CBD5E1]">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')} • {uniqueEmployees.length} unique {uniqueEmployees.length === 1 ? 'employee' : 'employees'}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>

        {/* Responsive Layout: Full width on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* Calendar Sidebar - Full width on mobile, left column on desktop */}
          <div className="w-full space-y-4 min-w-0">
            {/* Visual Calendar - Responsive */}
            <div className="w-full min-w-0 overflow-visible">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">Select Date</h3>
              <div className="w-full max-w-full min-w-0 overflow-visible flex justify-center lg:justify-start">
                <div className="w-full max-w-full min-w-0 overflow-visible">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-gray-200 dark:border-[rgba(255,255,255,0.06)] shadow-sm dark:shadow-[0px_4px_20px_rgba(0,0,0,0.35)] bg-white dark:bg-[#1A1F27] w-full max-w-full min-w-0 overflow-visible"
                    modifiers={{
                      available: (date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        return availableDates.has(dateStr);
                      },
                      weekend: (date) => {
                        const day = date.getDay();
                        return day === 0 || day === 6; // Sunday or Saturday
                      },
                    }}
                    modifiersStyles={{
                      available: {
                        fontWeight: 'bold',
                      },
                      weekend: {},
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Daily Stats - Collapsible on mobile/tablet, always visible on desktop */}
            {reportsForDate.length > 0 && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setStatsExpanded(!statsExpanded)}
                  className="flex items-center justify-between w-full mb-2 cursor-pointer hover:opacity-80 transition-opacity lg:cursor-default"
                >
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-[#F3F4F6]">📊 Daily Stats</h3>
                  <span className="lg:hidden">
                    {statsExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-[#94A3B8]" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-[#94A3B8]" />
                    )}
                  </span>
                </button>
                <div className={`space-y-4 ${statsExpanded ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between text-base p-4 dark:p-4 bg-gray-50 dark:bg-[#0F172A] rounded-xl dark:rounded-xl border border-gray-200 dark:border-[rgba(255,255,255,0.06)]">
                    <span className="text-gray-700 dark:text-[#F3F4F6] font-semibold">Total:</span>
                    <Badge variant="outline" className="text-lg font-bold px-2 dark:bg-[rgba(255,255,255,0.1)] dark:text-[#F3F4F6] dark:border-[rgba(255,255,255,0.2)]">{dateStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-4 dark:p-4 bg-green-100 dark:bg-[rgba(34,197,94,0.12)] rounded-xl dark:rounded-xl border border-green-200 dark:border-[#22C55E]">
                    <span className="text-green-600 dark:text-[#22C55E] font-bold">✓ OK:</span>
                    <Badge className="bg-green-200 dark:bg-[rgba(34,197,94,0.25)] text-green-700 dark:text-white border-green-500 dark:border-[#22C55E] text-sm font-bold px-2 rounded-full">{dateStats.ok}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-4 dark:p-4 bg-orange-100 dark:bg-[rgba(251,146,60,0.12)] rounded-xl dark:rounded-xl border border-orange-200 dark:border-[#F97316]">
                    <span className="text-orange-600 dark:text-[#F97316] font-bold">⚠ Hours Problems:</span>
                    <Badge className="bg-orange-200 dark:bg-[rgba(251,146,60,0.25)] text-orange-700 dark:text-white border-orange-500 dark:border-[#F97316] text-sm font-bold px-2 rounded-full">{dateStats.hoursProblems}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-4 dark:p-4 bg-yellow-100 dark:bg-[rgba(234,179,8,0.12)] rounded-xl dark:rounded-xl border border-yellow-200 dark:border-[#FACC15]">
                    <span className="text-yellow-600 dark:text-[#FACC15] font-bold">? Report Problems:</span>
                    <Badge className="bg-yellow-200 dark:bg-[rgba(234,179,8,0.25)] text-yellow-700 dark:text-white border-yellow-500 dark:border-[#FACC15] text-sm font-bold px-2 rounded-full">{dateStats.reportProblems}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-4 dark:p-4 bg-red-100 dark:bg-[rgba(239,68,68,0.12)] rounded-xl dark:rounded-xl border border-red-200 dark:border-[#EF4444]">
                    <span className="text-red-600 dark:text-[#EF4444] font-bold">⚠ Total Problems:</span>
                    <Badge className="bg-red-200 dark:bg-[rgba(239,68,68,0.25)] text-red-700 dark:text-white border-red-500 dark:border-[#EF4444] text-sm font-bold px-2 rounded-full">{dateStats.totalProblems}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-4 dark:p-4 bg-gray-100 dark:bg-[rgba(148,163,184,0.12)] rounded-xl dark:rounded-xl border border-gray-200 dark:border-[#94A3B8]">
                    <span className="text-gray-600 dark:text-[#94A3B8] font-bold">⊘ Inactive:</span>
                    <Badge className="bg-gray-200 dark:bg-[rgba(148,163,184,0.25)] text-gray-700 dark:text-white border-gray-500 dark:border-[#94A3B8] text-sm font-bold px-2 rounded-full">{dateStats.inactive}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-4 dark:p-4 bg-blue-100 dark:bg-[rgba(59,130,246,0.12)] rounded-xl dark:rounded-xl border border-blue-200 dark:border-[#3B82F6]">
                    <span className="text-blue-400 dark:text-[#3B82F6] font-bold">⊘ Leave:</span>
                    <Badge className="bg-blue-200 dark:bg-[rgba(59,130,246,0.25)] text-blue-700 dark:text-white border-blue-400 dark:border-[#3B82F6] text-sm font-bold px-2 rounded-full">{dateStats.leave}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Filters + Employee Cards */}
          <div className="w-full min-w-0">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
                <div className="text-center px-4">
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">Select a date to view team activity</p>
                </div>
              </div>
            ) : reportsForDate.length === 0 ? (
              <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 dark:text-[#64748B]">
                <div className="text-center px-4">
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50 dark:opacity-60" />
                  <p className="text-sm sm:text-base dark:text-[#CBD5E1]">No activity found for {format(selectedDate, 'PPP')}</p>
                  <p className="text-xs sm:text-sm mt-1 dark:text-[#94A3B8]">Try selecting a different date</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Enhanced Filter Card - Collapsible */}
                <Card className="border border-gray-200 dark:border-[rgba(255,255,255,0.06)] rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.35)] bg-white dark:bg-[#1A1F27] mb-4">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-[#1F252F] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-[#94A3B8]" />
                      <h3 className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-[#F3F4F6]">Filters</h3>
                      {hasActiveFilters && (
                        <Badge className="ml-0.5 sm:ml-1 text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-500 text-white border-0 shadow-sm">
                          {activeFilterLabels.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 sm:h-4 sm:w-4 text-gray-500 dark:text-[#94A3B8] transition-transform duration-200 ${
                        filtersOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Selected Filters Summary (shown when collapsed) */}
                  {!filtersOpen && hasActiveFilters && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 px-4 sm:px-5 lg:px-5 pt-3 sm:pt-4 lg:pt-4 pb-3 sm:pb-4 lg:pb-4 border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)]">
                      {activeFilterLabels.map((filter, index) => {
                        if (filter.type === 'status') {
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1"
                            >
                              {filter.label}
                            </Badge>
                          );
                        }
                        return (
                          <FilterTag
                            key={index}
                            label={filter.label}
                            value={filter.value}
                            isSelected={true}
                            onClick={() => {
                              if (filter.type === 'department') {
                                toggleDepartmentFilter(filter.value);
                              } else {
                                toggleProfessionFilter(filter.value);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {filtersOpen && (
                    <div className="p-4 border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)] space-y-3">
                      {/* Status Filter - New Unified Status Categories */}
                      <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-[#F3F4F6] mb-2 flex items-center gap-1">
                          Status:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVerdictFilter('all')}
                            className={cn(
                              'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                              verdictFilter === 'all'
                                ? 'bg-gray-600 dark:bg-[#374151] text-white dark:text-[#E5E7EB] border-gray-600 dark:border-[#4B5563] hover:bg-gray-700 dark:hover:bg-[#4B5563]'
                                : 'text-gray-600 dark:text-[#E5E7EB] border-gray-300 dark:border-[#4B5563] bg-white dark:bg-[#374151] hover:bg-gray-100 dark:hover:bg-[#4B5563] hover:border-gray-400 dark:hover:border-[#4B5563]'
                            )}
                          >
                            All
                          </Button>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVerdictFilter('ok')}
                                onMouseEnter={() => setHoveredFilter('ok')}
                                onMouseLeave={() => setHoveredFilter(null)}
                                className={cn(
                                  'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                                  verdictFilter === 'ok'
                                    ? 'bg-green-500 dark:bg-[rgba(34,197,94,0.2)] text-white dark:text-[#22C55E] border-green-500 dark:border-[#22C55E] hover:bg-green-600 dark:hover:bg-[rgba(34,197,94,0.25)]'
                                    : 'text-green-500 dark:text-[#22C55E] border-green-300 dark:border-[#22C55E] bg-white dark:bg-[rgba(34,197,94,0.12)] hover:bg-green-100 dark:hover:bg-[rgba(34,197,94,0.18)] hover:border-green-400 dark:hover:border-[#22C55E]'
                                )}
                              >
                                OK
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 text-xs" side="top">
                              {STATUS_TOOLTIPS.ok}
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVerdictFilter('hoursProblems')}
                                onMouseEnter={() => setHoveredFilter('hoursProblems')}
                                onMouseLeave={() => setHoveredFilter(null)}
                                className={cn(
                                  'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                                  verdictFilter === 'hoursProblems'
                                    ? 'bg-orange-500 dark:bg-[rgba(251,146,60,0.2)] text-white dark:text-[#F97316] border-orange-500 dark:border-[#F97316] hover:bg-orange-600 dark:hover:bg-[rgba(251,146,60,0.25)]'
                                    : 'text-orange-500 dark:text-[#F97316] border-orange-300 dark:border-[#F97316] bg-white dark:bg-[rgba(251,146,60,0.12)] hover:bg-orange-100 dark:hover:bg-[rgba(251,146,60,0.18)] hover:border-orange-400 dark:hover:border-[#F97316]'
                                )}
                              >
                                Hours Problems
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 text-xs" side="top">
                              {STATUS_TOOLTIPS.hoursProblems}
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVerdictFilter('reportProblems')}
                                onMouseEnter={() => setHoveredFilter('reportProblems')}
                                onMouseLeave={() => setHoveredFilter(null)}
                                className={cn(
                                  'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                                  verdictFilter === 'reportProblems'
                                    ? 'bg-yellow-500 dark:bg-[rgba(234,179,8,0.2)] text-white dark:text-[#FACC15] border-yellow-500 dark:border-[#FACC15] hover:bg-yellow-600 dark:hover:bg-[rgba(234,179,8,0.25)]'
                                    : 'text-yellow-500 dark:text-[#FACC15] border-yellow-300 dark:border-[#FACC15] bg-white dark:bg-[rgba(234,179,8,0.12)] hover:bg-yellow-100 dark:hover:bg-[rgba(234,179,8,0.18)] hover:border-yellow-400 dark:hover:border-[#FACC15]'
                                )}
                              >
                                Report Problems
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 text-xs" side="top">
                              {STATUS_TOOLTIPS.reportProblems}
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVerdictFilter('totalProblems')}
                                onMouseEnter={() => setHoveredFilter('totalProblems')}
                                onMouseLeave={() => setHoveredFilter(null)}
                                className={cn(
                                  'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                                  verdictFilter === 'totalProblems'
                                    ? 'bg-red-500 dark:bg-[rgba(239,68,68,0.2)] text-white dark:text-[#EF4444] border-red-500 dark:border-[#EF4444] hover:bg-red-600 dark:hover:bg-[rgba(239,68,68,0.25)]'
                                    : 'text-red-500 dark:text-[#EF4444] border-red-300 dark:border-[#EF4444] bg-white dark:bg-[rgba(239,68,68,0.12)] hover:bg-red-100 dark:hover:bg-[rgba(239,68,68,0.18)] hover:border-red-400 dark:hover:border-[#EF4444]'
                                )}
                              >
                                Total Problems
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 text-xs" side="top">
                              {STATUS_TOOLTIPS.totalProblems}
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVerdictFilter('inactive')}
                                onMouseEnter={() => setHoveredFilter('inactive')}
                                onMouseLeave={() => setHoveredFilter(null)}
                                className={cn(
                                  'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                                  verdictFilter === 'inactive'
                                    ? 'bg-gray-500 dark:bg-[rgba(148,163,184,0.2)] text-white dark:text-[#94A3B8] border-gray-500 dark:border-[#94A3B8] hover:bg-gray-600 dark:hover:bg-[rgba(148,163,184,0.25)]'
                                    : 'text-gray-500 dark:text-[#94A3B8] border-gray-300 dark:border-[#94A3B8] bg-white dark:bg-[rgba(148,163,184,0.12)] hover:bg-gray-100 dark:hover:bg-[rgba(148,163,184,0.18)] hover:border-gray-400 dark:hover:border-[#94A3B8]'
                                )}
                              >
                                Inactive
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 text-xs" side="top">
                              {STATUS_TOOLTIPS.inactive}
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVerdictFilter('leave')}
                                onMouseEnter={() => setHoveredFilter('leave')}
                                onMouseLeave={() => setHoveredFilter(null)}
                                className={cn(
                                  'px-[14px] py-[6px] rounded-lg font-medium text-xs transition-all',
                                  verdictFilter === 'leave'
                                    ? 'bg-blue-500 dark:bg-[rgba(59,130,246,0.2)] text-white dark:text-[#3B82F6] border-blue-500 dark:border-[#3B82F6] hover:bg-blue-600 dark:hover:bg-[rgba(59,130,246,0.25)]'
                                    : 'text-blue-500 dark:text-[#3B82F6] border-blue-300 dark:border-[#3B82F6] bg-white dark:bg-[rgba(59,130,246,0.12)] hover:bg-blue-100 dark:hover:bg-[rgba(59,130,246,0.18)] hover:border-blue-400 dark:hover:border-[#3B82F6]'
                                )}
                              >
                                Leave
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 text-xs" side="top">
                              {STATUS_TOOLTIPS.leave}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Department Tags Filter */}
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-[#F3F4F6] mb-2">Departments:</p>
                      <div className="flex flex-wrap max-h-[200px] overflow-y-auto p-1" style={{ gap: '8px' }}>
                        {departments.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No departments available</p>
                        ) : (
                          departments.map((dept) => (
                            <FilterTag
                              key={dept}
                              label={dept}
                              value={dept}
                              isSelected={departmentFilters.has(dept.toLowerCase())}
                              onClick={() => toggleDepartmentFilter(dept)}
                            />
                          ))
                        )}
                      </div>
                    </div>

                      {/* Profession Tags Filter */}
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-[#F3F4F6] mb-2">Professions:</p>
                      <div className="flex flex-wrap max-h-[200px] overflow-y-auto p-1" style={{ gap: '8px' }}>
                        {professions.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No professions available</p>
                        ) : (
                          professions.map((prof) => (
                            <FilterTag
                              key={prof}
                              label={prof}
                              value={prof}
                              isSelected={professionFilters.has(prof.toLowerCase())}
                              onClick={() => toggleProfessionFilter(prof)}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    {/* Clear All Filters Button */}
                    {hasActiveFilters && (
                      <div className="pt-2 border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="w-full text-gray-600 dark:text-[#CBD5E1] hover:text-gray-900 dark:hover:text-[#F3F4F6]"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                    </div>
                  )}
                </Card>

                {/* Results */}
                {uniqueEmployees.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <p className="text-sm sm:text-base text-gray-600">No employees match your filters</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 text-xs sm:text-sm"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-t pt-3 sm:pt-4 lg:pt-4">
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900">
                        Team Members ({uniqueEmployees.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-h-[600px] sm:max-h-[700px] lg:max-h-[800px] overflow-y-auto pr-2">
                      {uniqueEmployees.map((log, index) => {
                        const statusInfo = statusByName.get(log.name);
                        return (
                          <EmployeeCard
                            key={`${log.name}-${log.date}-${index}`}
                            {...log}
                            status={log.currentStatus}
                            streak={0}
                            rate={log.rate ?? null}
                            unifiedStatus={statusInfo?.status}
                            hoursValid={statusInfo?.hoursValid}
                            reportValid={statusInfo?.reportValid}
                            overallValid={statusInfo ? (statusInfo.hoursValid && statusInfo.reportValid) : undefined}
                            employee={log}
                            activeTab={activeTab}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client'

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X, ChevronDown, ChevronUp, HelpCircle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmployeeCard } from './employee-card';
import type { Report } from '@/types';
import { getUnifiedStatus } from '@/lib/unified-status';
import type { UnifiedStatus } from '@/lib/unified-status';

type EmployeeTab = 'company' | 'project';

interface TeamActivityCalendarProps {
  reports: Report[];
  initialVerdictFilter?: string;
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

export function TeamActivityCalendar({ reports, initialVerdictFilter = 'all' }: TeamActivityCalendarProps) {
  // Set default date to yesterday
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getYesterday());
  const [activeTab, setActiveTab] = useState<EmployeeTab>('company');
  const [verdictFilter, setVerdictFilter] = useState<string>(initialVerdictFilter);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [professionFilter, setProfessionFilter] = useState<string>('all');
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
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [professionDropdownOpen, setProfessionDropdownOpen] = useState(false);

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

  // Get unique departments and professions (sorted alphabetically)
  const departments = ['all', ...Array.from(new Set(reports.map(r => r.department).filter(Boolean))).sort()];
  const professions = ['all', ...Array.from(new Set(reports.map(r => r.profession).filter(Boolean))).sort()];

  // Apply all filters
  let filteredReports = reportsForDate;

  // Status filter - using unified status
  if (verdictFilter !== 'all') {
    filteredReports = filteredReports.filter(r => {
      const unifiedStatus = getUnifiedStatus(r, activeTab);
      return unifiedStatus === verdictFilter;
    });
  }

  // Department filter
  if (departmentFilter !== 'all') {
    filteredReports = filteredReports.filter(r => r.department === departmentFilter);
  }

  // Profession filter
  if (professionFilter !== 'all') {
    filteredReports = filteredReports.filter(r => r.profession === professionFilter);
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

  const hasActiveFilters = verdictFilter !== 'all' || departmentFilter !== 'all' || professionFilter !== 'all';

  const clearAllFilters = () => {
    setVerdictFilter('all');
    setDepartmentFilter('all');
    setProfessionFilter('all');
  };

  // Get active filter labels for summary
  const getActiveFilters = () => {
    const filters = [];
    if (verdictFilter !== 'all') {
      const statusLabel = verdictFilter === 'hoursProblems' ? 'Hours Problems'
        : verdictFilter === 'reportProblems' ? 'Report Problems'
        : verdictFilter === 'totalProblems' ? 'Total Problems'
        : verdictFilter.charAt(0).toUpperCase() + verdictFilter.slice(1);
      filters.push(statusLabel);
    }
    if (departmentFilter !== 'all') {
      filters.push(departmentFilter);
    }
    if (professionFilter !== 'all') {
      filters.push(professionFilter);
    }
    return filters;
  };

  const activeFilterLabels = getActiveFilters();

  return (
    <Card id="team-activity">
      <CardHeader>
        {/* Responsive Header: Stack on mobile/tablet, horizontal on desktop */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">📅 Team Activity Calendar</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1 lg:mt-1.5">
              {selectedDate
                ? `${format(selectedDate, 'EEEE, MMMM d, yyyy')} • ${uniqueEmployees.length} unique ${uniqueEmployees.length === 1 ? 'employee' : 'employees'}`
                : 'Select a date to view team activity'
              }
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full lg:w-auto gap-2 text-xs sm:text-sm"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Company / Project tabs - Responsive */}
        <div className="mb-4 flex justify-center lg:justify-start">
          <div className="inline-flex rounded-full border border-gray-200 bg-white text-xs overflow-x-auto scrollbar-hide">
            <button
              type="button"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap transition-all ${
                activeTab === 'company' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('company')}
            >
              Company
            </button>
            <button
              type="button"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 border-l border-gray-200 whitespace-nowrap transition-all ${
                activeTab === 'project' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('project')}
            >
              Project
            </button>
          </div>
        </div>

        {/* Responsive Layout: Full width on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
          {/* Calendar Sidebar - Full width on mobile, left column on desktop */}
          <div className="w-full lg:col-span-1 space-y-3 lg:space-y-4 min-w-0">
            {/* Visual Calendar - Responsive */}
            <div className="w-full min-w-0 overflow-visible">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">Select Date</h3>
              <div className="w-full max-w-full min-w-0 overflow-visible flex justify-center lg:justify-start">
                <div className="w-full max-w-full min-w-0 overflow-visible">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border shadow-sm w-full max-w-full min-w-0 overflow-visible"
                    modifiers={{
                      available: (date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        return availableDates.has(dateStr);
                      },
                    }}
                    modifiersStyles={{
                      available: {
                        fontWeight: 'bold',
                        backgroundColor: '#dbeafe',
                      },
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
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-700">📊 Daily Stats</h3>
                  <span className="lg:hidden">
                    {statsExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    )}
                  </span>
                </button>
                <div className={`space-y-1.5 sm:space-y-2 ${statsExpanded ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Total:</span>
                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2">{dateStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Unique:</span>
                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2">{dateStats.unique}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-green-100 rounded">
                    <span className="text-green-500">✓ OK:</span>
                    <Badge className="bg-green-100 text-green-500 border-green-500 text-xs px-1.5 sm:px-2">{dateStats.ok}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-orange-100 rounded">
                    <span className="text-orange-600">⚠ Hours Problems:</span>
                    <Badge className="bg-orange-100 text-orange-600 border-orange-500 text-xs px-1.5 sm:px-2">{dateStats.hoursProblems}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-yellow-100 rounded">
                    <span className="text-yellow-600">? Report Problems:</span>
                    <Badge className="bg-yellow-100 text-yellow-600 border-yellow-500 text-xs px-1.5 sm:px-2">{dateStats.reportProblems}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-red-100 rounded">
                    <span className="text-red-600">⚠ Total Problems:</span>
                    <Badge className="bg-red-100 text-red-600 border-red-500 text-xs px-1.5 sm:px-2">{dateStats.totalProblems}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-gray-100 rounded">
                    <span className="text-gray-600">⊘ Inactive:</span>
                    <Badge className="bg-gray-100 text-gray-600 border-gray-500 text-xs px-1.5 sm:px-2">{dateStats.inactive}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 bg-blue-100 rounded">
                    <span className="text-blue-400">⊘ Leave:</span>
                    <Badge className="bg-blue-100 text-blue-400 border-blue-400 text-xs px-1.5 sm:px-2">{dateStats.leave}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Responsive */}
          <div className="lg:col-span-4 w-full min-w-0">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
                <div className="text-center px-4">
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">Select a date to view team activity</p>
                </div>
              </div>
            ) : reportsForDate.length === 0 ? (
              <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
                <div className="text-center px-4">
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">No activity found for {format(selectedDate, 'PPP')}</p>
                  <p className="text-xs sm:text-sm mt-1">Try selecting a different date</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Enhanced Filter Card - Collapsible */}
                <Card className="border border-gray-200 rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.06)] bg-white">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 lg:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                      <h3 className="font-semibold text-xs sm:text-sm text-gray-700">Filters</h3>
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-xs px-1.5 sm:px-2 py-0 rounded-full bg-gray-200">
                          {activeFilterLabels.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-200 ${
                        filtersOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Selected Filters Summary (shown when collapsed) */}
                  {!filtersOpen && hasActiveFilters && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-4 pb-3 sm:pb-4 lg:pb-4 border-t border-gray-200">
                      {activeFilterLabels.map((label, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {filtersOpen && (
                    <div className="p-3 sm:p-4 lg:p-4 border-t border-gray-200 space-y-2.5 sm:space-y-3 lg:space-y-3">
                      {/* Status Filter - New Unified Status Categories */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          Status:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVerdictFilter('all')}
                            className={
                              verdictFilter === 'all'
                                ? 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 text-xs px-2 sm:px-2.5 lg:px-3'
                                : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50 text-xs px-2 sm:px-2.5 lg:px-3'
                            }
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
                                className={
                                  verdictFilter === 'ok'
                                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600 text-xs px-2 sm:px-2.5 lg:px-3'
                                    : 'text-green-500 border-green-300 bg-white hover:bg-green-50 text-xs px-2 sm:px-2.5 lg:px-3'
                                }
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
                                className={
                                  verdictFilter === 'hoursProblems'
                                    ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 text-xs px-2 sm:px-2.5 lg:px-3'
                                    : 'text-orange-500 border-orange-300 bg-white hover:bg-orange-50 text-xs px-2 sm:px-2.5 lg:px-3'
                                }
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
                                className={
                                  verdictFilter === 'reportProblems'
                                    ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 text-xs px-2 sm:px-2.5 lg:px-3'
                                    : 'text-yellow-500 border-yellow-300 bg-white hover:bg-yellow-50 text-xs px-2 sm:px-2.5 lg:px-3'
                                }
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
                                className={
                                  verdictFilter === 'totalProblems'
                                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 text-xs px-2 sm:px-2.5 lg:px-3'
                                    : 'text-red-500 border-red-300 bg-white hover:bg-red-50 text-xs px-2 sm:px-2.5 lg:px-3'
                                }
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
                                className={
                                  verdictFilter === 'inactive'
                                    ? 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600 text-xs px-2 sm:px-2.5 lg:px-3'
                                    : 'text-gray-500 border-gray-300 bg-white hover:bg-gray-50 text-xs px-2 sm:px-2.5 lg:px-3'
                                }
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
                                className={
                                  verdictFilter === 'leave'
                                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 text-xs px-2 sm:px-2.5 lg:px-3'
                                    : 'text-blue-500 border-blue-300 bg-white hover:bg-blue-50 text-xs px-2 sm:px-2.5 lg:px-3'
                                }
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

                      {/* Department Dropdown Filter */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Department:</p>
                      <Popover open={departmentDropdownOpen} onOpenChange={setDepartmentDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto justify-between min-w-[180px] lg:min-w-[200px] text-xs"
                          >
                            <span className="truncate">
                              {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] lg:w-[250px] p-0" align="start">
                          <div className="max-h-[280px] lg:max-h-[300px] overflow-y-auto p-2">
                            {departments.map((dept) => (
                              <Button
                                key={dept}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-left font-normal text-xs px-2 py-1.5"
                                onClick={() => {
                                  setDepartmentFilter(dept);
                                  setDepartmentDropdownOpen(false);
                                }}
                              >
                                <span className="truncate">
                                  {dept === 'all' ? 'All Departments' : dept}
                                </span>
                                {departmentFilter === dept && (
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Profession Dropdown Filter */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Profession:</p>
                      <Popover open={professionDropdownOpen} onOpenChange={setProfessionDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto justify-between min-w-[180px] lg:min-w-[200px] text-xs"
                          >
                            <span className="truncate">
                              {professionFilter === 'all' ? 'All Professions' : professionFilter}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] lg:w-[250px] p-0" align="start">
                          <div className="max-h-[280px] lg:max-h-[300px] overflow-y-auto p-2">
                            {professions.map((prof) => (
                              <Button
                                key={prof}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-left font-normal text-xs px-2 py-1.5"
                                onClick={() => {
                                  setProfessionFilter(prof);
                                  setProfessionDropdownOpen(false);
                                }}
                              >
                                <span className="truncate">
                                  {prof === 'all' ? 'All Professions' : prof}
                                </span>
                                {professionFilter === prof && (
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Clear All Filters Button */}
                    {hasActiveFilters && (
                      <div className="pt-2 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="w-full text-gray-600 hover:text-gray-900"
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
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6 max-h-[600px] sm:max-h-[700px] lg:max-h-[800px] overflow-y-auto pr-2">
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

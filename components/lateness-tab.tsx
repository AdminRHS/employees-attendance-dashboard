'use client';

import { useMemo, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, AlertTriangle, CheckCircle2, Search, Calendar as CalendarIcon, Filter, ChevronDown, X } from 'lucide-react';
import type { LatenessRecord } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FilterTag } from './filter-tag';
import { EmployeeCard } from './employee-card';
import type { UnifiedStatus } from '@/lib/unified-status';

type DateRange = 'day' | 'week' | 'month' | 'all';

type SortKey = 'date' | 'name' | 'department' | 'status' | 'minutesLate';

interface LatenessTabProps {
  records: LatenessRecord[];
  selectedDate: Date;
  range: DateRange;
}

const PROJECT_STATUS_KEYWORDS = ['project', 'part-project', 'project-only', 'project only', 'part project'];

function isProjectStatus(status?: string | null): boolean {
  if (!status) return false;
  const norm = status.toLowerCase();
  return PROJECT_STATUS_KEYWORDS.some((kw) => norm.includes(kw));
}

/**
 * Convert lateness status to unified status for badge colors
 */
function getLatenessUnifiedStatus(record: LatenessRecord): UnifiedStatus {
  const status = (record.status || '').toLowerCase();
  
  if (status.includes('absent')) {
    return 'inactive'; // Absent employees are treated as inactive
  }
  if (status.includes('late')) {
    return 'hoursProblems'; // Late employees have hours problems
  }
  return 'ok'; // On time employees are OK
}

/**
 * Get lateness warning message for the card
 */
function getLatenessWarning(record: LatenessRecord): string | null {
  const status = (record.status || '').toLowerCase();
  const minutesLate = record.minutesLate ?? 0;
  
  if (status.includes('absent')) {
    return record.checkResult || 'No check-in recorded';
  }
  if (status.includes('late') && minutesLate > 0) {
    const joinTime = record.joinTime ? ` (Joined at ${record.joinTime})` : '';
    return record.checkResult || `Arrived ${minutesLate} minutes late${joinTime}`;
  }
  return null;
}

function parseRecordDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  // Try ISO first
  try {
    const d = parseISO(dateStr);
    if (!isNaN(d.getTime())) return d;
  } catch {
    // ignore
  }
  const ts = Date.parse(dateStr);
  if (!isNaN(ts)) return new Date(ts);
  return null;
}

export function LatenessTab({ records, selectedDate: initialDate, range: initialRange }: LatenessTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [range, setRange] = useState<DateRange>(initialRange);
  const [employeeScope, setEmployeeScope] = useState<'all' | 'company' | 'project'>('all');
  const [departmentFilters, setDepartmentFilters] = useState<Set<string>>(new Set());
  const [professionFilters, setProfessionFilters] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filtered = useMemo(() => {
    const startDate = selectedDate;

    const inRange = (recordDate: Date | null) => {
      if (!recordDate) return false;
      if (range === 'all') return true;
      if (range === 'day') return isSameDay(recordDate, startDate);

      const diffMs = recordDate.getTime() - startDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (range === 'week') {
        return diffDays <= 0 && diffDays >= -6;
      }
      if (range === 'month') {
        return (
          recordDate.getFullYear() === startDate.getFullYear() &&
          recordDate.getMonth() === startDate.getMonth()
        );
      }
      return true;
    };

    const query = searchQuery.trim().toLowerCase();

    return records
      .map((r) => ({
        ...r,
        _parsedDate: parseRecordDate(r.date),
        _isProject: isProjectStatus(r.employeeStatus),
      }))
      .filter((r) => {
        if (employeeScope === 'all') return true;
        return employeeScope === 'project' ? r._isProject : !r._isProject;
      })
      .filter((r) => inRange(r._parsedDate))
      .filter((r) => {
        if (departmentFilters.size === 0) return true;
        return r.department && departmentFilters.has((r.department || '').toLowerCase());
      })
      .filter((r) => {
        if (professionFilters.size === 0) return true;
        return r.profession && professionFilters.has((r.profession || '').toLowerCase());
      })
      .filter((r) => {
        if (statusFilter === 'all') return true;
        return (r.status || '').toLowerCase() === statusFilter;
      })
      .filter((r) => {
        if (!query) return true;
        const haystack = [
          r.name,
          r.department,
          r.profession,
          r.status,
          r.joinTime,
          r.checkResult,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
  }, [records, selectedDate, range, employeeScope, departmentFilters, professionFilters, statusFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'minutesLate') {
        const av = a.minutesLate ?? 0;
        const bv = b.minutesLate ?? 0;
        return (av - bv) * dir;
      }
      if (sortKey === 'name') {
        return ((a.name || '').localeCompare(b.name || '')) * dir;
      }
      if (sortKey === 'department') {
        return ((a.department || '').localeCompare(b.department || '')) * dir;
      }
      if (sortKey === 'status') {
        return ((a.status || '').localeCompare(b.status || '')) * dir;
      }
      // date
      const ad = parseRecordDate(a.date)?.getTime() ?? 0;
      const bd = parseRecordDate(b.date)?.getTime() ?? 0;
      return (ad - bd) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((r) => (r.department || '').trim())
            .filter((v) => v && v !== '-'),
        ),
      ).sort(),
    [records],
  );

  const professions = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .map((r) => (r.profession || '').trim())
            .filter((v) => v && v !== '-'),
        ),
      ).sort(),
    [records],
  );

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

  const hasActiveFilters = departmentFilters.size > 0 || professionFilters.size > 0 || statusFilter !== 'all';

  const clearAllFilters = () => {
    setDepartmentFilters(new Set());
    setProfessionFilters(new Set());
    setStatusFilter('all');
  };

  // Get active filter labels for summary
  const getActiveFilters = () => {
    const filters: Array<{ label: string; value: string; type: 'status' | 'department' | 'profession' }> = [];
    if (statusFilter !== 'all') {
      filters.push({ label: statusFilter, value: statusFilter, type: 'status' });
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

  const summary = useMemo(() => {
    let late = 0;
    let absent = 0;
    let onTime = 0;
    for (const r of filtered) {
      const status = (r.status || '').toLowerCase();
      if (status.includes('absent')) absent += 1;
      else if (status.includes('late')) late += 1;
      else onTime += 1;
    }
    return { late, absent, onTime };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Title + Description */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              ⏰ Lateness Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Track employee lateness, absences, and punctuality for the selected period.
            </p>
          </div>

          {/* Right: Range Switch + Date Picker */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Day / Week / Month / All Time segmented control */}
            <div className="inline-flex rounded-full bg-muted p-1 shadow-sm">
              {[
                { value: 'day' as DateRange, label: 'Day' },
                { value: 'week' as DateRange, label: 'Week' },
                { value: 'month' as DateRange, label: 'Month' },
                { value: 'all' as DateRange, label: 'All Time' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRange(opt.value)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-full transition-all',
                    range === opt.value
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Filters Row - Top Level */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Company / Project / All toggle */}
          <div className="inline-flex rounded-full bg-muted p-0.5 shadow-sm">
            {[
              { value: 'all' as const, label: 'All' },
              { value: 'company' as const, label: 'Company' },
              { value: 'project' as const, label: 'Project' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEmployeeScope(opt.value)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full transition-all',
                  employeeScope === opt.value
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="h-8 w-40 sm:w-56 rounded-md border border-input bg-background px-2 py-1 pl-7 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-8 w-[120px] rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="on time">On Time</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Enhanced Filter Card - Collapsible */}
        <Card className="border border-gray-200 dark:border-[rgba(255,255,255,0.06)] rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.35)] bg-white dark:bg-[#1A1F27] mb-4">
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-[#1F252F] transition-colors"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
              <h3 className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-white">Filters</h3>
              {hasActiveFilters && (
                <Badge className="ml-0.5 sm:ml-1 text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-500 dark:bg-blue-600 text-white border-0 shadow-sm">
                  {activeFilterLabels.length}
                </Badge>
              )}
            </div>
            <ChevronDown 
              className={`h-4 w-4 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
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
              {/* Department Tags Filter */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-white mb-2">Departments:</p>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1" style={{ gap: '8px' }}>
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
                <p className="text-sm font-bold text-gray-700 dark:text-white mb-2">Professions:</p>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1" style={{ gap: '8px' }}>
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
                    className="w-full text-gray-600 dark:text-[#AAB4C0] hover:text-gray-900 dark:hover:text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="group bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out h-full">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>On Time</span>
                </CardTitle>
                <div className="card-help-wrapper" aria-hidden="true">
                  <div className="card-help-icon">?</div>
                  <div className="card-tooltip">
                    Employees who arrived on time or within the allowed tolerance.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-center">
              <div className="text-5xl lg:text-6xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">
                {summary.onTime}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Arrived on time
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="group bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out h-full">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 transition-colors">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>Late Employees</span>
                </CardTitle>
                <div className="card-help-wrapper" aria-hidden="true">
                  <div className="card-help-icon">?</div>
                  <div className="card-tooltip">
                    Employees who arrived after their expected start time.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-center">
              <div className="text-5xl lg:text-6xl font-bold mb-2 text-amber-600 dark:text-amber-400">
                {summary.late}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Employees who arrived late
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="group bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out h-full">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <span>Absentees</span>
                </CardTitle>
                <div className="card-help-wrapper" aria-hidden="true">
                  <div className="card-help-icon">?</div>
                  <div className="card-tooltip">
                    Employees with no recorded check-in for the selected date.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-center">
              <div className="text-5xl lg:text-6xl font-bold mb-2 text-red-600 dark:text-red-400">
                {summary.absent}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                No check-in recorded
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Employee Cards - Using Calendar Page Card Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
          {sorted.map((record, idx) => {
            const unifiedStatus = getLatenessUnifiedStatus(record);
            
            // Map LatenessRecord to EmployeeCard props with lateness-specific data
            return (
              <EmployeeCard
                key={`${record.date}-${record.name}-${idx}`}
                name={record.name || 'Unknown employee'}
                profession={record.profession || 'Unknown role'}
                department={record.department || 'Unknown department'}
                status={record.employeeStatus || record.status || 'Unknown'}
                verdict={record.status || 'Unknown'}
                discordTime="0"
                crmTime="0"
                crmStatus=""
                date={record.date || ''}
                unifiedStatus={unifiedStatus}
                activeTab={employeeScope === 'project' ? 'project' : 'company'}
                latenessData={{
                  joinTime: record.joinTime || undefined,
                  minutesLate: record.minutesLate ?? null,
                  checkResult: record.checkResult || undefined,
                  employeeStatus: record.employeeStatus || undefined,
                  latenessStatus: record.status || undefined,
                }}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}



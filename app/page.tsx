'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AttendanceHeatmap } from '@/components/attendance-heatmap';
import { TeamActivityCalendar } from '@/components/team-activity-calendar';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardTabs } from '@/components/dashboard-tabs';
import { DepartmentPerformance } from '@/components/charts/department-performance';
import { ProfessionPerformance } from '@/components/charts/profession-performance';
import { CRMStatusDistribution } from '@/components/charts/crm-status-distribution';
import type { Report, LatenessRecord } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Trophy,
  Target,
  RefreshCw,
  Clock,
  FileText,
  Calendar as CalendarIcon,
  TimerOff,
  FileX,
  AlertCircle
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Range as DateRange,
  filterReportsByDateAndRange,
  buildEmployees,
  calculateOverviewMetrics,
  getQuickStatsForYesterday,
  getStatusCountsForDate,
  isProjectEmployee,
} from '@/lib/employee-logic';
import { LatenessTab } from '@/components/lateness-tab';

function getRateClass(rate: number): string {
  if (rate >= 85) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

export default function DashboardV2() {
  const [reports, setReports] = useState<Report[]>([]);
  const [latenessRecords, setLatenessRecords] = useState<LatenessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  
  // Main tab navigation state
  const [activeMainTab, setActiveMainTab] = useState<string>('overview');
  
  // Calendar navigation state (for programmatic navigation from Overview cards)
  const [calendarNavKey, setCalendarNavKey] = useState<string>('');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [calendarActiveTab, setCalendarActiveTab] = useState<'company' | 'project' | undefined>(undefined);

  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLateness = async () => {
    try {
      const response = await fetch('/api/lateness');
      if (!response.ok) {
        console.error('Failed to fetch lateness data');
        return;
      }
      const data = await response.json();
      setLatenessRecords(data);
    } catch (error) {
      console.error('Error fetching lateness data:', error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchLateness();
  }, []);

  // Function to handle filter and scroll to Team Activity (legacy, kept for compatibility)
  const handleFilterClick = (filter: string) => {
    setVerdictFilter(filter);
    setActiveMainTab('calendar');
    // Scroll to Team Activity section
    const teamActivitySection = document.getElementById('team-activity');
    if (teamActivitySection) {
      teamActivitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Navigation helper: Open Calendar tab with selected date, Company tab, and status filter
  const openCalendarForStatus = (status: 'hoursProblems' | 'reportProblems' | 'totalProblems' | 'leave') => {
    const targetDate = startOfDay(summaryDate);
    
    console.log('[DEBUG] openCalendarForStatus', { status, targetDate });
    
    setActiveMainTab('calendar');        // Switch Overview → Calendar
    setCalendarDate(targetDate);          // Show selected date
    setCalendarActiveTab('company');     // Ensure Company (not Project)
    setVerdictFilter(status);            // Apply status filter
    
    // Trigger navigation by updating key (forces Calendar to react to new props)
    setCalendarNavKey(`${status}-${targetDate.getTime()}`);
    
    // Scroll to Calendar section after a brief delay to allow tab switch
    setTimeout(() => {
      const teamActivitySection = document.getElementById('team-activity');
      if (teamActivitySection) {
        teamActivitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Overview page state - separate from Team Activity Calendar
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };
  const [summaryDate, setSummaryDate] = useState<Date>(getYesterday());
  const [summaryRange, setSummaryRange] = useState<DateRange>('day');

  // Filter reports for Overview metrics (date-aware, Company employees only)
  const overviewFilteredReports = filterReportsByDateAndRange(reports, summaryDate, summaryRange);
  const overviewEmployees = buildEmployees(overviewFilteredReports, { excludeProjects: true });
  const { totalEmployees, hoursMet, reportsValid, bothMet } = calculateOverviewMetrics(overviewEmployees);

  const hoursRate = totalEmployees ? Math.round((hoursMet / totalEmployees) * 100) : 0;
  const reportRate = totalEmployees ? Math.round((reportsValid / totalEmployees) * 100) : 0;
  const overallPerformanceRate = totalEmployees ? Math.round((bothMet / totalEmployees) * 100) : 0;

  const hoursTotal = totalEmployees;
  const hoursOk = hoursMet;
  const reportTotal = totalEmployees;
  const reportOk = reportsValid;
  const overallTotal = totalEmployees;
  const overallOk = bothMet;

  // Get status counts for selected date using unified status system (company employees only)
  // Note: For day range, this uses summaryDate. For week/month, status cards show the selected day only.
  const { hoursProblems, reportProblems, totalProblems, leave: leaveCount } =
    getStatusCountsForDate(reports, summaryDate);

  // Prepare heatmap data - company employees only, aggregate by date
  // Filter out project employees using the same helper function used elsewhere
  const companyReports = reports.filter((report) => !isProjectEmployee(report));

  // Aggregate by date: track which dates have records

  // TODO refactor: check for all types of verdicts from database
  const heatmapDataByDate = companyReports.reduce((acc, r) => {
    const dateKey = r.date;
    if (!dateKey) return acc;
    if (!acc[dateKey]) {
      acc[dateKey] = { ok: 0, check: 0, suspicious: 0, total: 0, hasRecords: true };
    }
    acc[dateKey].total++;
    acc[dateKey].hasRecords = true;
    if (r.verdict?.includes('OK') || r.verdict?.includes('PROJECT')) acc[dateKey].ok++;
    else if (r.verdict?.includes('CHECK')) acc[dateKey].check++;
    else if (r.verdict?.includes('SUSPICIOUS')) acc[dateKey].suspicious++;
    return acc;
  }, {} as Record<string, { ok: number; check: number; suspicious: number; total: number; hasRecords: boolean }>);

  console.log('[DEBUG] Heatmap Data by date for 21 November:', heatmapDataByDate['2025-11-21']);
  //console.log('[DEBUG] Reports for heatmap:', reports.filter((r) => r.date === '2025-11-21'));


  // Map to heatmap data with proper categorization using blue saturation levels
  const heatmapData = Object.entries(heatmapDataByDate).map(([date, stats]) => {
    // Only days WITH records get buckets 1-4 based on performance
    // Days WITHOUT records (not in this map) will default to bucket 0 in the component
    const ratio = stats.total > 0 ? stats.ok / stats.total : 0;
    let count = 0;
    if (ratio >= 0.91) count = 4; // 91-100% OK - Excellent Activity (dark blue)
    else if (ratio >= 0.61) count = 3; // 61-90% OK - Good Activity (good blue)
    else if (ratio >= 0.21) count = 2; // 21-60% OK - Medium Activity (moderate blue)
    else if (ratio > 0) count = 1; // 1-20% OK - Low Activity (light blue)
    else count = 0; // 0% OK but HAS records - No Activity (very light blue)

    return { date, count, hasRecords: true };
  });

  // Group by employee for leaderboard
  const employeeStats = reports.reduce((acc, report) => {
    if (!report.name || !acc[report.name]) {
      acc[report.name!] = {
        name: report.name,
        profession: report.profession,
        department: report.department,
        totalReports: 0,
        okCount: 0,
        issueCount: 0
      };
    }
    acc[report.name!]!.totalReports++;
    if (report.verdict?.includes('OK') || report.verdict?.includes('PROJECT')) {
      acc[report.name!]!.okCount++;
    }
    if (report.verdict?.includes('SUSPICIOUS') || report.verdict?.includes('CHECK')) {
      acc[report.name!]!.issueCount++;
    }
    return acc;
  }, {} as Record<string, any>);

  const leaderboard = Object.values(employeeStats)
    .map((emp: any) => ({
      ...emp,
      score: Math.round((emp.okCount / emp.totalReports) * 100)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Worst performers - employees with lowest OK percentage
  const worstPerformers = Object.values(employeeStats)
    .map((emp: any) => ({
      ...emp,
      score: Math.round((emp.okCount / emp.totalReports) * 100)
    }))
    .filter((emp: any) => emp.totalReports >= 3) // Only include employees with at least 3 reports
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="p-3 sm:p-4 lg:p-6 xl:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 lg:mb-6 xl:mb-8"
        >
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                🎮 Remote Helpers Dashboard
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-0.5 lg:mt-1">Track performance and celebrate achievements</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />
              <Button
                onClick={() => fetchReports(true)}
                disabled={refreshing}
                size="sm"
                className="gap-1.5 lg:gap-2 text-xs lg:text-sm px-2.5 lg:px-4"
              >
                <RefreshCw className={`h-3 w-3 lg:h-4 lg:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Tabs */}
        <DashboardTabs
          activeTab={activeMainTab}
          onTabChange={setActiveMainTab}
          overviewContent={
            <>
              {/* Overview Header with Title, Range Switch, and Date Picker */}
              <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Title + Description */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                      Overview
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Company-wide performance summary for the selected period.
                    </p>
                  </div>

                  {/* Right: Range Switch + Date Picker */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Day / Week / Month / All Time segmented control */}
                    <div className="inline-flex rounded-full bg-muted p-1 shadow-sm">
                      {([
                        { value: 'day' as DateRange, label: 'Day' },
                        { value: 'week' as DateRange, label: 'Week' },
                        { value: 'month' as DateRange, label: 'Month' },
                        { value: 'all' as DateRange, label: 'All Time' },
                      ]).map((range) => (
                        <button
                          key={range.value}
                          type="button"
                          onClick={() => setSummaryRange(range.value)}
                          className={cn(
                            'px-4 py-1.5 text-sm font-medium rounded-full transition-all',
                            summaryRange === range.value
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {range.label}
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
                            !summaryDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {summaryDate ? format(summaryDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={summaryDate}
                          onSelect={(date) => date && setSummaryDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </header>

              {/* Top KPI Cards - Enhanced Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {/* Hours Rate */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out h-full">
                    <CardHeader className="pb-3 px-6 pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                            <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                          </div>
                          <span>Hours Rate</span>
                      </CardTitle>
                        <div className="card-help-wrapper" aria-hidden="true">
                          <div className="card-help-icon">?</div>
                          <div className="card-tooltip">
                            Percentage of employees who met their target hours.
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 text-center">
                      <div className={`text-5xl lg:text-6xl font-bold mb-2 ${getRateClass(hoursRate)}`}>
                        {hoursRate}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {hoursOk}/{hoursTotal} employees met hours
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Overall Performance Rate */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out h-full">
                    <CardHeader className="pb-3 px-6 pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span>Overall Performance</span>
                      </CardTitle>
                        <div className="card-help-wrapper" aria-hidden="true">
                          <div className="card-help-icon">?</div>
                          <div className="card-tooltip">
                            Employees who met both their hours target and submitted a valid report.
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 text-center">
                      <div className={`text-5xl lg:text-6xl font-bold mb-2 ${getRateClass(overallPerformanceRate)}`}>
                        {overallPerformanceRate}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {overallOk}/{overallTotal} employees with hours + report
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Report Rate */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="sm:col-span-2 lg:col-span-1"
                >
                  <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out h-full">
                    <CardHeader className="pb-3 px-6 pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-3 text-base font-semibold text-gray-800 dark:text-gray-200">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                            <FileText className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                          </div>
                          <span>Report Rate</span>
                      </CardTitle>
                        <div className="card-help-wrapper" aria-hidden="true">
                          <div className="card-help-icon">?</div>
                          <div className="card-tooltip">
                            Percentage of employees who submitted a valid report (minimum 40 characters) for the selected period.
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 text-center">
                      <div className={`text-5xl lg:text-6xl font-bold mb-2 ${getRateClass(reportRate)}`}>
                        {reportRate}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {reportOk}/{reportTotal} employees with valid reports
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

          {/* Secondary Stats - Status Counts for Selected Date (Company Employees Only) - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card
              className="group border-2 border-orange-400 dark:border-orange-600 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg"
              onClick={() => openCalendarForStatus('hoursProblems')}
            >
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-orange-700 dark:text-orange-400 text-base font-semibold flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60 transition-colors">
                      <TimerOff className="h-5 w-5" />
                    </div>
                  Hours Problems
                </CardTitle>
                  <div className="card-help-wrapper" aria-hidden="true">
                    <div className="card-help-icon">?</div>
                    <div className="card-tooltip">
                      Employees who did not meet their target hours due to low CRM/Discord time.
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-center">
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-3">{hoursProblems}</div>
                <Badge className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-400 dark:border-orange-600 text-xs px-3 py-1 mb-2">
                  {summaryRange === 'day' ? format(summaryDate, 'MMM d, yyyy') : 'Selected date'}
                </Badge>
              </CardContent>
            </Card>

            <Card
              className="group border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg"
              onClick={() => openCalendarForStatus('reportProblems')}
            >
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-yellow-700 dark:text-yellow-400 text-base font-semibold flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/60 transition-colors">
                      <FileX className="h-5 w-5" />
                    </div>
                  Report Problems
                </CardTitle>
                  <div className="card-help-wrapper" aria-hidden="true">
                    <div className="card-help-icon">?</div>
                    <div className="card-tooltip">
                      Employees with missing or invalid reports (less than 40 characters).
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-center">
                <div className="text-4xl lg:text-5xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">{reportProblems}</div>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600 text-xs px-3 py-1 mb-2">
                  {summaryRange === 'day' ? format(summaryDate, 'MMM d, yyyy') : 'Selected date'}
                </Badge>
              </CardContent>
            </Card>

            <Card
              className="group border-2 border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg"
              onClick={() => openCalendarForStatus('totalProblems')}
            >
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-red-700 dark:text-red-400 text-base font-semibold flex items-center gap-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  Total Problems
                </CardTitle>
                  <div className="card-help-wrapper" aria-hidden="true">
                    <div className="card-help-icon">?</div>
                    <div className="card-tooltip">
                      Total number of issues flagged across the employees: low hours, missing reports, or inactive statuses.
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-center">
                <div className="text-4xl lg:text-5xl font-bold text-red-600 dark:text-red-400 mb-3">{totalProblems}</div>
                <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-400 dark:border-red-600 text-xs px-3 py-1 mb-2">
                  {summaryRange === 'day' ? format(summaryDate, 'MMM d, yyyy') : 'Selected date'}
                </Badge>
              </CardContent>
            </Card>

            <Card
              className="group border-2 border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-lg"
              onClick={() => openCalendarForStatus('leave')}
            >
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-blue-700 dark:text-blue-400 text-base font-semibold flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                      <Clock className="h-5 w-5" />
                    </div>
                  Leave
                </CardTitle>
                  <div className="card-help-wrapper" aria-hidden="true">
                    <div className="card-help-icon">?</div>
                    <div className="card-tooltip">
                      Employees who are on leave (either full or half day) for the selected date.
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-3">{leaveCount}</div>
                <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600 text-xs px-3 py-1 mb-2">
                  {summaryRange === 'day' ? format(summaryDate, 'MMM d, yyyy') : 'Selected date'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section: Heatmap + Department Performance */}
          <div className="space-y-6 lg:space-y-8 mb-6 lg:mb-8">
          {/* Attendance Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AttendanceHeatmap data={heatmapData} />
          </motion.div>

            {/* Department Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <DepartmentPerformance reports={reports.filter((r) => r.department && r.department !== '-')} />
            </motion.div>
          </div>

          {/* Bottom Section: Top 10 Professions + CRM Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ProfessionPerformance reports={reports.filter((r) => r.profession && r.profession !== '-')} />
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
              <CRMStatusDistribution reports={reports.filter((r) => r.name)} />
          </motion.div>
          </div>
              </div>
              </>
            }
            calendarContent={
              <motion.div
                id="team-activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading team data...</p>
                  </div>
                ) : (
                  <TeamActivityCalendar
                    key={calendarNavKey || 'default'}
                    reports={reports}
                    initialVerdictFilter={verdictFilter}
                    initialDate={calendarDate}
                    initialActiveTab={calendarActiveTab}
                  />
                )}
              </motion.div>
            }
            leaderboardContent={
              <>
                {/* Leaderboard Section - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-yellow-200">
                          <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                          🏆 Top Performers
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">Team members with the best track record</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {leaderboard.map((emp, index) => (
                            <motion.div
                              key={emp.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-yellow-100 dark:border-yellow-900 hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`
                                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                                  ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                                  ${index === 1 ? 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200' : ''}
                                  ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                                  ${index > 2 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
                                `}>
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">{emp.name}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{emp.profession} • {emp.department}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{emp.score}%</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{emp.okCount}/{emp.totalReports} perfect</p>
                                </div>
                                {index === 0 && <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Worst Performers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-red-200">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                          ⚠️ Needs Improvement
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">Team members who need support and guidance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {worstPerformers.length > 0 ? (
                            worstPerformers.map((emp, index) => (
                              <motion.div
                                key={emp.name}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-100 dark:border-red-900 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{emp.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{emp.profession} • {emp.department}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{emp.score}%</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{emp.issueCount}/{emp.totalReports} issues</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                              Great job! All team members are performing well.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </>
            }
            latenessContent={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LatenessTab
                  records={latenessRecords}
                  selectedDate={summaryDate}
                  range={summaryRange}
                />
              </motion.div>
            }
        />
      </div>
    </div>
  );
}

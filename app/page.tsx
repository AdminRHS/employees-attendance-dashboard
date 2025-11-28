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
import type { Report } from '@/types';
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
  Calendar as CalendarIcon
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type DateRange = 'day' | 'week' | 'month' | 'all';

interface EnrichedEmployee {
  name: string;
  isProject: boolean;
  rate: number | null;
  totalHours: number;
  hasValidReport: boolean;
  hoursOk: boolean;
  reportOk: boolean;
  overallOk: boolean;
}

function parseDateSafe(dateStr: string): number {
  if (!dateStr) return 0;
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? 0 : ts;
}

function getHoursRequirement(rate: number | null | undefined): number | null {
  if (rate == null || isNaN(rate)) return null;
  if (rate >= 1.25) return 10;
  if (rate >= 1.0) return 8;
  if (rate >= 0.75) return 6;
  if (rate >= 0.5) return 4;
  return null;
}

function isValidReportText(text: string | undefined | null): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Treat very short reports as invalid (heuristic until a stricter rule is defined)
  return trimmed.length >= 40;
}

function filterReportsByDateAndRange(reports: Report[], selectedDate: Date, range: DateRange): Report[] {
  if (range === 'all') {
    // Filter to only company employees for overview metrics
    return reports.filter(r => !r.isProject);
  }

  const baseDate = new Date(selectedDate);
  baseDate.setHours(0, 0, 0, 0);
  const baseTs = baseDate.getTime();

  let windowStartTs = baseTs;
  if (range === 'week') {
    // Start of week (Monday) containing selectedDate
    const dayOfWeek = (baseDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    windowStartTs = baseTs - dayOfWeek * 24 * 60 * 60 * 1000;
  } else if (range === 'month') {
    // Start of month containing selectedDate
    windowStartTs = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getTime();
  }
  // For 'day', windowStartTs = baseTs (single day)

  let windowEndTs = baseTs;
  if (range === 'week') {
    windowEndTs = windowStartTs + 6 * 24 * 60 * 60 * 1000; // End of week (Sunday)
  } else if (range === 'month') {
    windowEndTs = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getTime(); // Last day of month
  }

  return reports.filter((r) => {
    const ts = parseDateSafe(r.date);
    if (!ts) return false;
    // Only include company employees for overview
    if (r.isProject) return false;
    
    if (range === 'day') return ts === baseTs;
    return ts >= windowStartTs && ts <= windowEndTs;
  });
}


function buildEmployees(reports: Report[]): EnrichedEmployee[] {
  const map = new Map<string, EnrichedEmployee>();

  for (const r of reports) {
    const existing = map.get(r.name);
    const rate = r.rate ?? null;
    const isProject = !!r.isProject;

    const rawComputed =
      r.computedHours != null && !isNaN(r.computedHours)
        ? r.computedHours
        : (parseFloat(r.discordTime || '0') || 0) +
          (parseFloat(r.crmTime || '0') || 0);

    if (!existing) {
      const requirement = getHoursRequirement(rate);
      const hasValidReport = isValidReportText(r.report);
      const hoursOk = requirement != null ? rawComputed >= requirement : false;
      const reportOk = hasValidReport;

      map.set(r.name, {
        name: r.name,
        isProject,
        rate,
        totalHours: rawComputed,
        hasValidReport,
        hoursOk,
        reportOk,
        overallOk: hoursOk && reportOk,
      });
    } else {
      const totalHours = existing.totalHours + rawComputed;
      const hasValidReport = existing.hasValidReport || isValidReportText(r.report);
      const requirement = getHoursRequirement(existing.rate);
      const hoursOk = requirement != null ? totalHours >= requirement : false;
      const reportOk = hasValidReport;

      map.set(r.name, {
        ...existing,
        totalHours,
        hasValidReport,
        hoursOk,
        reportOk,
        overallOk: hoursOk && reportOk,
      });
    }
  }

  return Array.from(map.values());
}

function calculateHoursRate(employees: EnrichedEmployee[]): { rate: number; total: number; ok: number } {
  const relevant = employees.filter((e) => getHoursRequirement(e.rate) != null);
  const total = relevant.length;
  const ok = relevant.filter((e) => e.hoursOk).length;
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0;
  return { rate, total, ok };
}

function calculateReportRate(employees: EnrichedEmployee[]): { rate: number; total: number; ok: number } {
  const total = employees.length;
  const ok = employees.filter((e) => e.reportOk).length;
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0;
  return { rate, total, ok };
}

function calculateOverallRate(employees: EnrichedEmployee[]): { rate: number; total: number; ok: number } {
  const total = employees.length;
  const ok = employees.filter((e) => e.overallOk).length;
  const rate = total > 0 ? Math.round((ok / total) * 100) : 0;
  return { rate, total, ok };
}

function getRateClass(rate: number): string {
  if (rate >= 85) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

export default function DashboardV2() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verdictFilter, setVerdictFilter] = useState<string>('all');

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

  useEffect(() => {
    fetchReports();
  }, []);

  // Function to handle filter and scroll to Team Activity
  const handleFilterClick = (filter: string) => {
    setVerdictFilter(filter);
    // Scroll to Team Activity section
    const teamActivitySection = document.getElementById('team-activity');
    if (teamActivitySection) {
      teamActivitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
  const overviewReports = filterReportsByDateAndRange(reports, summaryDate, summaryRange);
  const overviewEmployees = buildEmployees(overviewReports);

  const { rate: hoursRate, total: hoursTotal, ok: hoursOk } = calculateHoursRate(overviewEmployees);
  const { rate: reportRate, total: reportTotal, ok: reportOk } = calculateReportRate(overviewEmployees);
  const { rate: overallPerformanceRate, total: overallTotal, ok: overallOk } = calculateOverallRate(overviewEmployees);

  // Additional stats for secondary cards (still based on "yesterday" only for now)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const yesterdayReports = reports.filter(r => r.date === yesterdayStr);
  const suspiciousCount = yesterdayReports.filter((r) => r.verdict.includes('SUSPICIOUS')).length;
  const checkRequired = yesterdayReports.filter((r) => r.verdict.includes('CHECK')).length;
  const projectWork = yesterdayReports.filter((r) => r.verdict.includes('PROJECT')).length;
  const okCount = yesterdayReports.filter((r) => r.verdict.includes('OK')).length;

  // Prepare heatmap data - aggregate by date
  const heatmapDataByDate = reports.reduce((acc, r) => {
    const dateKey = r.date;
    if (!acc[dateKey]) {
      acc[dateKey] = { ok: 0, check: 0, suspicious: 0, total: 0 };
    }
    acc[dateKey].total++;
    if (r.verdict.includes('OK') || r.verdict.includes('PROJECT')) acc[dateKey].ok++;
    else if (r.verdict.includes('CHECK')) acc[dateKey].check++;
    else if (r.verdict.includes('SUSPICIOUS')) acc[dateKey].suspicious++;
    return acc;
  }, {} as Record<string, any>);

  const heatmapData = Object.entries(heatmapDataByDate).map(([date, stats]) => {
    // Count based on ratio of OK/good verdicts
    const ratio = stats.ok / stats.total;
    let count = 0;
    if (ratio >= 0.9) count = 4; // 90%+ OK - dark green
    else if (ratio >= 0.7) count = 3; // 70%+ OK - green
    else if (ratio >= 0.5) count = 2; // 50%+ OK - yellow
    else if (ratio >= 0.3) count = 1; // 30%+ OK - light green
    else count = 0; // <30% OK - gray

    return { date, count };
  });

  // Group by employee for leaderboard
  const employeeStats = reports.reduce((acc, report) => {
    if (!acc[report.name]) {
      acc[report.name] = {
        name: report.name,
        profession: report.profession,
        department: report.department,
        totalReports: 0,
        okCount: 0,
        issueCount: 0
      };
    }
    acc[report.name].totalReports++;
    if (report.verdict.includes('OK') || report.verdict.includes('PROJECT')) {
      acc[report.name].okCount++;
    }
    if (report.verdict.includes('SUSPICIOUS') || report.verdict.includes('CHECK')) {
      acc[report.name].issueCount++;
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
          overviewContent={
            <>
              {/* Overview Date Picker and Summary Range Selector */}
              <div className="mb-5 lg:mb-6 xl:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
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
                {/* Summary Range Selector */}
                <div className="flex items-center gap-1 text-xs border border-gray-200 rounded-full bg-white px-2 py-1">
                  {(['day', 'week', 'month', 'all'] as DateRange[]).map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={`px-2 py-0.5 rounded-full capitalize transition-colors ${
                        summaryRange === range
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSummaryRange(range)}
                    >
                      {range === 'all' ? 'All time' : range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4 mb-5 lg:mb-6 xl:mb-8">
                {/* Hours Rate */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 ease-in-out">
                    <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                      <CardTitle className="flex items-center gap-1.5 lg:gap-2 text-sm lg:text-base text-gray-800">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Hours Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                      <div className={`text-3xl lg:text-4xl font-bold ${getRateClass(hoursRate)}`}>
                        {hoursRate}%
                      </div>
                      <p className="text-xs lg:text-sm mt-1.5 lg:mt-2 text-gray-500">
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
                  <Card className="bg-green-50 border border-green-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 ease-in-out">
                    <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                      <CardTitle className="flex items-center gap-1.5 lg:gap-2 text-sm lg:text-base text-gray-800">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Overall Performance Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                      <div className={`text-3xl lg:text-4xl font-bold ${getRateClass(overallPerformanceRate)}`}>
                        {overallPerformanceRate}%
                      </div>
                      <p className="text-xs lg:text-sm mt-1.5 lg:mt-2 text-gray-500">
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
                >
                  <Card className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 ease-in-out">
                    <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                      <CardTitle className="flex items-center gap-1.5 lg:gap-2 text-sm lg:text-base text-gray-800">
                        <FileText className="h-5 w-5 text-purple-500" />
                        Report Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                      <div className={`text-3xl lg:text-4xl font-bold ${getRateClass(reportRate)}`}>
                        {reportRate}%
                      </div>
                      <p className="text-xs lg:text-sm mt-1.5 lg:mt-2 text-gray-500">
                        {reportOk}/{reportTotal} employees with valid reports
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

          {/* Secondary Stats - Clickable Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5 lg:mb-6 xl:mb-8">
            <Card
              className="border-2 border-red-500 bg-red-100 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleFilterClick('suspicious')}
            >
              <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                <CardTitle className="text-red-500 text-sm lg:text-base flex items-center gap-1.5 lg:gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Suspicious Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                <div className="text-2xl lg:text-3xl font-bold text-red-500">{suspiciousCount}</div>
                <Badge className="mt-1.5 lg:mt-2 bg-red-100 text-red-500 border-red-500 text-xs px-1.5 lg:px-2">Yesterday</Badge>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-yellow-500 bg-yellow-100 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleFilterClick('check')}
            >
              <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                <CardTitle className="text-yellow-500 text-sm lg:text-base flex items-center gap-1.5 lg:gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Check Required
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-500">{checkRequired}</div>
                <Badge className="mt-1.5 lg:mt-2 bg-yellow-100 text-yellow-500 border-yellow-500 text-xs px-1.5 lg:px-2">Yesterday</Badge>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-purple-500 bg-purple-100 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleFilterClick('project')}
            >
              <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                <CardTitle className="text-purple-500 text-sm lg:text-base flex items-center gap-1.5 lg:gap-2">
                  <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Project Work
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                <div className="text-2xl lg:text-3xl font-bold text-purple-500">{projectWork}</div>
                <Badge className="mt-1.5 lg:mt-2 bg-purple-100 text-purple-500 border-purple-500 text-xs px-1.5 lg:px-2">Yesterday</Badge>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-green-500 bg-green-100 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleFilterClick('ok')}
            >
              <CardHeader className="pb-2 lg:pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
                <CardTitle className="text-green-500 text-sm lg:text-base flex items-center gap-1.5 lg:gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  All Clear
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                <div className="text-2xl lg:text-3xl font-bold text-green-500">{okCount}</div>
                <Badge className="mt-1.5 lg:mt-2 bg-green-100 text-green-500 border-green-500 text-xs px-1.5 lg:px-2">Yesterday</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-5 lg:mb-6 xl:mb-8"
          >
            <AttendanceHeatmap data={heatmapData} />
          </motion.div>

          {/* New Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-5 lg:mb-6 xl:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <DepartmentPerformance reports={reports} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CRMStatusDistribution reports={reports} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mb-8"
          >
            <ProfessionPerformance reports={reports} />
          </motion.div>
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
                    reports={reports}
                    initialVerdictFilter={verdictFilter}
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
        />
      </div>
    </div>
  );
}

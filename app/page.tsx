'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EmployeeCard } from '@/components/employee-card';
import { AttendanceHeatmap } from '@/components/attendance-heatmap';
import { DateLogsViewer } from '@/components/date-logs-viewer';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Flame,
  Trophy,
  Target,
  RefreshCw
} from 'lucide-react';

interface Report {
  date: string;
  verdict: string;
  issue: string;
  name: string;
  department: string;
  profession: string;
  discordTime: string;
  crmTime: string;
  crmStatus: string;
  currentStatus: string;
  leave: string;
  leaveRate: string;
  report: string;
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

  // Calculate stats
  const totalRecords = reports.length;
  const uniqueEmployees = new Set(reports.map(r => r.name)).size;
  const suspiciousCount = reports.filter((r) => r.verdict.includes('SUSPICIOUS')).length;
  const checkRequired = reports.filter((r) => r.verdict.includes('CHECK')).length;
  const projectWork = reports.filter((r) => r.verdict.includes('PROJECT')).length;
  const okCount = reports.filter((r) => r.verdict.includes('OK')).length;
  const leavesCount = reports.filter((r) => r.verdict.includes('LEAVE') || r.verdict.includes('HALF DAY')).length;

  // Calculate team performance score
  const performanceScore = totalRecords > 0
    ? Math.round(((okCount + projectWork) / totalRecords) * 100)
    : 0;

  // Calculate attendance rate
  const attendanceRate = totalRecords > 0
    ? Math.round(((totalRecords - leavesCount) / totalRecords) * 100)
    : 0;

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

  // Calculate streaks (mock data for now)
  const teamStreak = 5; // Days with no critical issues
  const topPerformer = reports.length > 0 ? reports[0].name : 'N/A';

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

  // Filter reports for Team Activity section
  const filteredReports = verdictFilter === 'all'
    ? reports
    : reports.filter(r => {
        switch (verdictFilter) {
          case 'suspicious':
            return r.verdict.includes('SUSPICIOUS');
          case 'check':
            return r.verdict.includes('CHECK');
          case 'project':
            return r.verdict.includes('PROJECT');
          case 'ok':
            return r.verdict.includes('OK');
          default:
            return true;
        }
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎮 Remote Helpers Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track performance and celebrate achievements</p>
            </div>
            <Button
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Top KPI Cards with Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{uniqueEmployees}</div>
                <Progress value={100} className="mt-3 bg-blue-400" />
                <p className="text-sm mt-2 text-blue-100">{totalRecords} total records</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{performanceScore}%</div>
                <Progress value={performanceScore} className="mt-3 bg-green-400" />
                <p className="text-sm mt-2 text-green-100">
                  {okCount + projectWork} excellent days!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Team Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{teamStreak} days</div>
                <Progress value={(teamStreak / 10) * 100} className="mt-3 bg-orange-400" />
                <p className="text-sm mt-2 text-orange-100">Keep the momentum going!</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{attendanceRate}%</div>
                <Progress value={attendanceRate} className="mt-3 bg-purple-400" />
                <p className="text-sm mt-2 text-purple-100">{leavesCount} days off</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Stats - Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            className="border-2 border-red-200 bg-red-50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFilterClick('suspicious')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700 text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Suspicious Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{suspiciousCount}</div>
              <Badge variant="destructive" className="mt-2">Needs Review</Badge>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-amber-200 bg-amber-50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFilterClick('check')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-700 text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Check Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{checkRequired}</div>
              <Badge variant="secondary" className="mt-2 bg-amber-200">Action Needed</Badge>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-purple-200 bg-purple-50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFilterClick('project')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Project Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{projectWork}</div>
              <Badge variant="secondary" className="mt-2 bg-purple-200">External Projects</Badge>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-green-200 bg-green-50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFilterClick('ok')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-green-700 text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                All Clear
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{okCount}</div>
              <Badge variant="default" className="mt-2 bg-green-200 text-green-800">Perfect Days</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                🏆 Top Performers
              </CardTitle>
              <CardDescription>Team members with the best track record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((emp, index) => (
                  <motion.div
                    key={emp.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-yellow-100 hover:border-yellow-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                        ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                        ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                        ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-600">{emp.profession} • {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{emp.score}%</p>
                        <p className="text-xs text-gray-600">{emp.okCount}/{emp.totalReports} perfect</p>
                      </div>
                      {index === 0 && <Award className="h-6 w-6 text-yellow-600" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <AttendanceHeatmap data={heatmapData} />
        </motion.div>

        {/* Date Logs Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mb-8"
        >
          <DateLogsViewer reports={reports} />
        </motion.div>

        {/* Employee Cards Grid */}
        <motion.div
          id="team-activity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>👥 Team Activity</CardTitle>
                  <CardDescription>
                    {verdictFilter === 'all'
                      ? 'All employee records and performance'
                      : `Filtered: ${verdictFilter.charAt(0).toUpperCase() + verdictFilter.slice(1)} (${filteredReports.length} records)`
                    }
                  </CardDescription>
                </div>
                {verdictFilter !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVerdictFilter('all')}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={verdictFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVerdictFilter('all')}
                >
                  All ({reports.length})
                </Button>
                <Button
                  variant={verdictFilter === 'suspicious' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setVerdictFilter('suspicious')}
                  className="border-red-300"
                >
                  Suspicious ({suspiciousCount})
                </Button>
                <Button
                  variant={verdictFilter === 'check' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVerdictFilter('check')}
                  className="border-amber-300"
                >
                  Check ({checkRequired})
                </Button>
                <Button
                  variant={verdictFilter === 'project' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVerdictFilter('project')}
                  className="border-purple-300"
                >
                  Project ({projectWork})
                </Button>
                <Button
                  variant={verdictFilter === 'ok' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVerdictFilter('ok')}
                  className="border-green-300"
                >
                  OK ({okCount})
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600 mt-4">Loading team data...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No records found for this filter</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setVerdictFilter('all')}
              >
                Show All Records
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report, index) => (
                <EmployeeCard
                  key={`${report.name}-${report.date}-${index}`}
                  {...report}
                  status={report.currentStatus}
                  streak={Math.floor(Math.random() * 10)} // Mock streak data
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

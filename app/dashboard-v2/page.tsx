'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EmployeeCard } from '@/components/employee-card';
import { AttendanceHeatmap } from '@/components/attendance-heatmap';
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

  // Calculate stats
  const totalRecords = reports.length;
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

  // Prepare heatmap data
  const heatmapData = reports.map(r => ({
    date: r.date,
    count: r.verdict.includes('OK') || r.verdict.includes('PROJECT') ? 3 :
           r.verdict.includes('CHECK') ? 2 :
           r.verdict.includes('SUSPICIOUS') ? 1 : 0,
    verdict: r.verdict
  }));

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
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{totalRecords}</div>
                <Progress value={100} className="mt-3 bg-blue-400" />
                <p className="text-sm mt-2 text-blue-100">All team members tracked</p>
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

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-red-500 bg-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-500 text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Suspicious Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{suspiciousCount}</div>
              <Badge className="mt-2 bg-red-100 text-red-500 border-red-500">Needs Review</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500 bg-yellow-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-500 text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Check Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{checkRequired}</div>
              <Badge className="mt-2 bg-yellow-100 text-yellow-500 border-yellow-500">Action Needed</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500 bg-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-500 text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Project Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">{projectWork}</div>
              <Badge className="mt-2 bg-purple-100 text-purple-500 border-purple-500">External Projects</Badge>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500 bg-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-500 text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                All Clear
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{okCount}</div>
              <Badge className="mt-2 bg-green-100 text-green-500 border-green-500">Perfect Days</Badge>
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

        {/* Employee Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>👥 Team Activity</CardTitle>
              <CardDescription>Recent employee records and performance</CardDescription>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600 mt-4">Loading team data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.slice(0, 12).map((report, index) => (
                <EmployeeCard
                  key={index}
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

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { AttendanceCard } from '@/components/attendance/attendance-card';
import { AttendanceFilters } from '@/components/attendance/attendance-filters';
import { DailyStatsSidebar } from '@/components/attendance/daily-stats-sidebar';
import { TopPerformers } from '@/components/leaderboard/top-performers';
import { MostLate } from '@/components/leaderboard/most-late';
import { DepartmentPunctualityChart } from '@/components/charts/department-punctuality-chart';
import { LatenessDistributionChart } from '@/components/charts/lateness-distribution-chart';
// import { AttendanceHeatmap } from '@/components/attendance-heatmap'; // TODO: Update for new data structure
import type { AttendanceData, DailyAttendance, DailyStats, AttendanceStatus } from '@/types';
import { Users, CheckCircle, Clock, Plane, RefreshCw, BarChart3, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

export default function AttendanceDashboard() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | 'all'>('all');

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/attendance');

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on selected filters
  const filteredAttendance = data?.dailyAttendance.filter((record) => {
    if (record.date !== selectedDate) return false;
    if (selectedDepartment !== 'all' && record.department !== selectedDepartment) return false;
    if (selectedStatus !== 'all' && record.status !== selectedStatus) return false;
    return true;
  }) || [];

  // Get unique departments
  const departments = Array.from(new Set(data?.employees.map((e) => e.department) || [])).filter(Boolean);

  // Get daily stats for selected date
  const dailyStats = data?.dailyStats.find((s) => s.date === selectedDate) || null;

  // Get latest available stats for KPI cards (most recent date in data)
  const latestStats = data?.dailyStats?.[0] || null; // dailyStats are sorted by date DESC in processor

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Discord Voice Attendance</h1>
              <p className="text-sm text-muted-foreground">Real-time attendance tracking dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Employees"
                value={data?.employees.length || 0}
                icon={Users}
                gradient="from-blue-500 to-cyan-500"
              />
              <KPICard
                title="On Time Today"
                value={latestStats ? `${latestStats.punctualityRate}%` : 'N/A'}
                subtitle={latestStats ? `${latestStats.onTime} employees` : ''}
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-500"
              />
              <KPICard
                title="Avg Lateness"
                value={latestStats ? `${latestStats.averageLateness} min` : 'N/A'}
                subtitle={latestStats ? format(parseISO(latestStats.date), 'MMM d, yyyy') : ''}
                icon={Clock}
                gradient="from-orange-500 to-red-500"
              />
              <KPICard
                title="On Leave"
                value={latestStats?.onLeave || 0}
                subtitle={latestStats ? format(parseISO(latestStats.date), 'MMM d, yyyy') : ''}
                icon={Plane}
                gradient="from-purple-500 to-pink-500"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <DepartmentPunctualityChart data={data?.departmentStats || []} />
              <LatenessDistributionChart stats={data?.dailyStats || []} />
            </div>

            {/* Heatmap - TODO: Update for new data structure */}
            {/* <AttendanceHeatmap reports={[]} /> */}
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Filters */}
            <AttendanceFilters
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              departments={departments}
            />

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              {/* Employee Cards */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Employees ({filteredAttendance.length})
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                  {filteredAttendance.map((attendance, index) => {
                    const employee = data?.employees.find(
                      (e) => e.discordId === attendance.discordId
                    );
                    return (
                      <AttendanceCard
                        key={attendance.uniqueId}
                        attendance={attendance}
                        employee={employee}
                        index={index}
                      />
                    );
                  })}
                </div>
                {filteredAttendance.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No attendance records found for the selected filters</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Stats Sidebar */}
              <div>
                <DailyStatsSidebar stats={dailyStats} selectedDate={selectedDate} />
              </div>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <TopPerformers performers={data?.employeeStats || []} limit={10} />
              <MostLate performers={data?.employeeStats || []} limit={5} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  gradient: string;
}

function KPICard({ title, value, subtitle, icon: Icon, gradient }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-2">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-full bg-gradient-to-br ${gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

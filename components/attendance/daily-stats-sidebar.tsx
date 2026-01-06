'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, XCircle, Plane, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { DailyStats } from '@/types';

interface DailyStatsSidebarProps {
  stats: DailyStats | null;
  selectedDate: string;
}

export function DailyStatsSidebar({ stats, selectedDate }: DailyStatsSidebarProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const StatItem = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: number | string;
    color: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );

  if (!stats) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="text-lg">Daily Statistics</CardTitle>
          <p className="text-sm text-muted-foreground">{formatDate(selectedDate)}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available for this date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Daily Statistics</CardTitle>
        <p className="text-sm text-muted-foreground">{formatDate(selectedDate)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total Employees */}
        <StatItem
          icon={Users}
          label="Total Employees"
          value={stats.totalEmployees}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />

        {/* On Time */}
        <StatItem
          icon={CheckCircle}
          label="On Time"
          value={stats.onTime}
          color="bg-green-500/10 text-green-600 dark:text-green-400"
        />

        {/* Late (all categories) */}
        {(stats.late1to15 > 0 || stats.late16to30 > 0 || stats.lateOver30 > 0) && (
          <>
            {stats.late1to15 > 0 && (
              <StatItem
                icon={Clock}
                label="Late 1-15 min"
                value={stats.late1to15}
                color="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              />
            )}
            {stats.late16to30 > 0 && (
              <StatItem
                icon={Clock}
                label="Late 16-30 min"
                value={stats.late16to30}
                color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
              />
            )}
            {stats.lateOver30 > 0 && (
              <StatItem
                icon={Clock}
                label="Late >30 min"
                value={stats.lateOver30}
                color="bg-red-500/10 text-red-600 dark:text-red-400"
              />
            )}
          </>
        )}

        {/* On Leave */}
        {stats.onLeave > 0 && (
          <StatItem
            icon={Plane}
            label="On Leave"
            value={stats.onLeave}
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
        )}

        {/* Absent */}
        {stats.absent > 0 && (
          <StatItem
            icon={XCircle}
            label="Absent"
            value={stats.absent}
            color="bg-gray-500/10 text-gray-600 dark:text-gray-400"
          />
        )}

        {/* Punctuality Rate */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">Punctuality Rate</span>
            </div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.punctualityRate}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${stats.punctualityRate}%` }}
            />
          </div>
        </div>

        {/* Average Lateness */}
        {stats.averageLateness > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Avg. Lateness
              </span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {stats.averageLateness} min
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

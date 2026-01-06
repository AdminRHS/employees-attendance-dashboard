'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Clock } from 'lucide-react';
import type { DailyStats } from '@/types';

interface LatenessDistributionChartProps {
  stats: DailyStats[];
}

export function LatenessDistributionChart({ stats }: LatenessDistributionChartProps) {
  // Aggregate data from all daily stats
  const aggregated = stats.reduce(
    (acc, stat) => ({
      onTime: acc.onTime + stat.onTime,
      late1to15: acc.late1to15 + stat.late1to15,
      late16to30: acc.late16to30 + stat.late16to30,
      lateOver30: acc.lateOver30 + stat.lateOver30,
      onLeave: acc.onLeave + stat.onLeave,
      absent: acc.absent + stat.absent,
    }),
    { onTime: 0, late1to15: 0, late16to30: 0, lateOver30: 0, onLeave: 0, absent: 0 }
  );

  const chartData = [
    { name: 'On Time', value: aggregated.onTime, color: '#10b981' },
    { name: 'Late 1-15 min', value: aggregated.late1to15, color: '#eab308' },
    { name: 'Late 16-30 min', value: aggregated.late16to30, color: '#f97316' },
    { name: 'Late >30 min', value: aggregated.lateOver30, color: '#ef4444' },
    { name: 'On Leave', value: aggregated.onLeave, color: '#3b82f6' },
    { name: 'Absent', value: aggregated.absent, color: '#6b7280' },
  ].filter((item) => item.value > 0); // Only show categories with data

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm">
            Count: <span className="font-bold">{data.value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    if (percent < 0.05) return null; // Don't show label if less than 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Breakdown of attendance statuses
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-sm">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No attendance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

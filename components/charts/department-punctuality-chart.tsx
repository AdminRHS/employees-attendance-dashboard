'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Building2 } from 'lucide-react';
import type { DepartmentStats } from '@/types';

interface DepartmentPunctualityChartProps {
  data: DepartmentStats[];
}

export function DepartmentPunctualityChart({ data }: DepartmentPunctualityChartProps) {
  // Sort by punctuality rate
  const sortedData = [...data].sort((a, b) => b.punctualityRate - a.punctualityRate);

  // Color scale based on punctuality rate
  const getColor = (rate: number) => {
    if (rate >= 90) return '#10b981'; // green
    if (rate >= 75) return '#eab308'; // yellow
    if (rate >= 50) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.department}</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            On Time: {data.onTime} ({data.punctualityRate}%)
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Late: {data.late}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Absent: {data.absent}
          </p>
          <p className="text-sm text-muted-foreground border-t mt-1 pt-1">
            Total Records: {data.totalEmployees}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Department Punctuality
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          On-time percentage by department
        </p>
      </CardHeader>
      <CardContent>
        {sortedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="department"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Punctuality %', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="punctualityRate"
                name="Punctuality Rate"
                radius={[8, 8, 0, 0]}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.punctualityRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No department data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

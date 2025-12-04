'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { STATUS_COLORS } from '@/components/ui/status-badge'
import { Report } from '@/types'

interface DepartmentPerformanceProps {
  reports: Report[]
}

export function DepartmentPerformance({ reports }: DepartmentPerformanceProps) {
  // Aggregate data by department
  const deptData = reports.reduce((acc, r) => {
    if (!r.department || r.department === '-') return acc

    if (!acc[r.department]) {
      acc[r.department] = { department: r.department, ok: 0, suspicious: 0, check: 0, project: 0, other: 0, total: 0 }
    }

    acc[r.department].total++

    if (r.verdict.includes('OK')) acc[r.department].ok++
    else if (r.verdict.includes('SUSPICIOUS')) acc[r.department].suspicious++
    else if (r.verdict.includes('CHECK')) acc[r.department].check++
    else if (r.verdict.includes('PROJECT')) acc[r.department].project++
    else acc[r.department].other++

    return acc
  }, {} as Record<string, any>)

  // Convert to array and calculate percentages
  const chartData = Object.values(deptData).map((dept: any) => ({
    name: dept.department,
    OK: Math.round((dept.ok / dept.total) * 100),
    Project: Math.round((dept.project / dept.total) * 100),
    Check: Math.round((dept.check / dept.total) * 100),
    Suspicious: Math.round((dept.suspicious / dept.total) * 100),
    Other: Math.round((dept.other / dept.total) * 100),
  })).sort((a, b) => b.OK - a.OK)

  // Enhanced tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-base mb-2 text-gray-900 dark:text-gray-100">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}%`}
              </p>
            ))}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              Total: {total}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">📊 Department Performance</CardTitle>
        <CardDescription className="text-sm">
          Verdict distribution by department. Shows how each department is performing based on employee verdicts (OK, Check, Suspicious, Project, Other). 
          Hover over bars to see detailed percentages for each status type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              className="text-sm font-medium"
              tick={{ fontSize: 14 }}
              label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5, style: { fontSize: 14 } }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120} 
              className="text-sm font-medium"
              tick={{ fontSize: 14 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            <Bar dataKey="OK" stackId="a" fill={STATUS_COLORS.ok} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Project" stackId="a" fill={STATUS_COLORS.project} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Check" stackId="a" fill={STATUS_COLORS.check} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Suspicious" stackId="a" fill={STATUS_COLORS.suspicious} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Other" stackId="a" fill="#94a3b8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { STATUS_COLORS } from '@/components/ui/status-badge'

interface Report {
  department: string
  verdict: string
}

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Department Performance</CardTitle>
        <CardDescription>Verdict distribution by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis type="number" domain={[0, 100]} className="text-xs" />
            <YAxis type="category" dataKey="name" width={100} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Legend />
            <Bar dataKey="OK" stackId="a" fill={STATUS_COLORS.ok} />
            <Bar dataKey="Project" stackId="a" fill={STATUS_COLORS.project} />
            <Bar dataKey="Check" stackId="a" fill={STATUS_COLORS.check} />
            <Bar dataKey="Suspicious" stackId="a" fill={STATUS_COLORS.suspicious} />
            <Bar dataKey="Other" stackId="a" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Report {
  name: string
  crmStatus: string
}

interface CRMStatusDistributionProps {
  reports: Report[]
}

const COLORS = {
  'Active': '#22c55e', // green-500
  'No CRM Data': '#eab308', // yellow-500
  'No Records': '#ef4444', // red-500
}

export function CRMStatusDistribution({ reports }: CRMStatusDistributionProps) {
  // Get unique employees with their latest CRM status
  const employeeStatus = new Map<string, string>()
  reports.forEach(r => {
    if (!employeeStatus.has(r.name)) {
      employeeStatus.set(r.name, r.crmStatus)
    }
  })

  // Count by status
  const statusCounts = Array.from(employeeStatus.values()).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / employeeStatus.size) * 100)
  }))

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value} (${entry.percentage}%)`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>💼 CRM Status Distribution</CardTitle>
        <CardDescription>Tracking status of {employeeStatus.size} unique employees</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

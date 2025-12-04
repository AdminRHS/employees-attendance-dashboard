'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Report } from '@/types'

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

  // Enhanced tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-base mb-2" style={{ color: data.payload.fill }}>
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Employees: {data.value} ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">💼 CRM Status Distribution</CardTitle>
        <CardDescription className="text-sm">
          Visualizes the distribution of employee CRM activity status. Shows the percentage of employees who are Active in the CRM system 
          versus those with No CRM Data or No Records. Tracking {employeeStatus.size} unique employees. Hover over segments for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              className="hover:opacity-90 transition-opacity"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

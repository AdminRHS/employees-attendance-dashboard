'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUS_COLORS } from '@/components/ui/status-badge'
import { Report } from '@/types'

interface ProfessionPerformanceProps {
  reports: Report[]
}

export function ProfessionPerformance({ reports }: ProfessionPerformanceProps) {
  // Aggregate data by profession
  const profData = reports.reduce((acc, r) => {
    if (!r.profession || r.profession === '-') return acc

    if (!acc[r.profession]) {
      acc[r.profession] = { profession: r.profession, ok: 0, suspicious: 0, check: 0, project: 0, total: 0 }
    }

    acc[r.profession].total++

    if (r.verdict.includes('OK')) acc[r.profession].ok++
    else if (r.verdict.includes('SUSPICIOUS')) acc[r.profession].suspicious++
    else if (r.verdict.includes('CHECK')) acc[r.profession].check++
    else if (r.verdict.includes('PROJECT')) acc[r.profession].project++

    return acc
  }, {} as Record<string, any>)

  // Convert to array, sort by total, and take top 10
  const chartData = Object.values(profData)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10)
    .map((prof: any) => ({
      name: prof.profession.length > 15 ? prof.profession.substring(0, 15) + '...' : prof.profession,
      OK: prof.ok,
      Suspicious: prof.suspicious,
      Check: prof.check,
      Project: prof.project,
    }))

  // Enhanced tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      const percentages = payload.map((entry: any) => ({
        name: entry.name,
        value: entry.value,
        percentage: total > 0 ? Math.round((entry.value / total) * 100) : 0,
        color: entry.color
      }));
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-base mb-2 text-gray-900 dark:text-gray-100">{label}</p>
          <div className="space-y-1">
            {percentages.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value} (${entry.percentage}%)`}
              </p>
            ))}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              Total: {total} reports
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
        <CardTitle className="text-xl font-semibold">🎯 Top 10 Professions</CardTitle>
        <CardDescription className="text-sm">
          Displays the most active professions within the organization ranked by total report count. Shows how well different roles 
          are performing based on verdicts (OK, Project, Check, Suspicious). Bars are color-coded by status type. Hover for detailed counts and percentages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100} 
              className="text-sm font-medium"
              tick={{ fontSize: 13 }}
              interval={0}
            />
            <YAxis 
              className="text-sm font-medium"
              tick={{ fontSize: 14 }}
              label={{ value: 'Number of Reports', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            <Bar 
              dataKey="OK" 
              fill={STATUS_COLORS.ok} 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
            <Bar 
              dataKey="Project" 
              fill={STATUS_COLORS.project} 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
            <Bar 
              dataKey="Check" 
              fill={STATUS_COLORS.check} 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
            <Bar 
              dataKey="Suspicious" 
              fill={STATUS_COLORS.suspicious} 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

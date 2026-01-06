'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUS_COLORS } from '@/components/ui/status-badge'

interface Report {
  profession: string
  verdict: string
}

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Top 10 Professions</CardTitle>
        <CardDescription>Most active roles and their performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="OK" fill={STATUS_COLORS.ok} />
            <Bar dataKey="Project" fill={STATUS_COLORS.project} />
            <Bar dataKey="Check" fill={STATUS_COLORS.check} />
            <Bar dataKey="Suspicious" fill={STATUS_COLORS.suspicious} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

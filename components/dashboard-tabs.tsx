'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Calendar as CalendarIcon, Trophy, AlarmClock } from 'lucide-react'

interface DashboardTabsProps {
  overviewContent: React.ReactNode
  calendarContent: React.ReactNode
  leaderboardContent: React.ReactNode
  latenessContent?: React.ReactNode
  activeTab?: string
  onTabChange?: (value: string) => void
}

export function DashboardTabs({ overviewContent, calendarContent, leaderboardContent, latenessContent, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} defaultValue="overview" className="w-full">
      <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4 mb  -8">
        <TabsTrigger value="overview" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="lateness" className="gap-2">
          <AlarmClock className="h-4 w-4" />
          Lateness
        </TabsTrigger>
        <TabsTrigger value="leaderboard" className="gap-2">
          <Trophy className="h-4 w-4" />
          Leaderboard
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        {overviewContent}
      </TabsContent>

      <TabsContent value="calendar" className="mt-0">
        {calendarContent}
      </TabsContent>

      {latenessContent && (
        <TabsContent value="lateness" className="mt-0">
          {latenessContent}
        </TabsContent>
      )}

      <TabsContent value="leaderboard" className="mt-0">
        {leaderboardContent}
      </TabsContent>
    </Tabs>
  )
}

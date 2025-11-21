'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Calendar as CalendarIcon, Trophy } from 'lucide-react'

interface DashboardTabsProps {
  overviewContent: React.ReactNode
  calendarContent: React.ReactNode
  leaderboardContent: React.ReactNode
}

export function DashboardTabs({ overviewContent, calendarContent, leaderboardContent }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
        <TabsTrigger value="overview" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Calendar
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

      <TabsContent value="leaderboard" className="mt-0">
        {leaderboardContent}
      </TabsContent>
    </Tabs>
  )
}

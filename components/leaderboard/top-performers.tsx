'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, TrendingUp } from 'lucide-react';
import type { EmployeeStats } from '@/types';

interface TopPerformersProps {
  performers: EmployeeStats[];
  limit?: number;
}

export function TopPerformers({ performers, limit = 10 }: TopPerformersProps) {
  const topPerformers = performers.slice(0, limit);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Performers by Punctuality
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Employees with the highest on-time percentage
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => {
            const rank = index + 1;
            const medal = getMedalEmoji(rank);

            return (
              <motion.div
                key={performer.employeeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all
                  ${
                    rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
                      : 'bg-muted/50 hover:bg-muted'
                  }
                `}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className={`bg-gradient-to-br ${getRankColor(rank)} text-white font-semibold text-sm`}>
                    {getInitials(performer.employeeName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {performer.employeeName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {performer.department} • {performer.profession}
                  </p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {performer.punctualityRate}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {performer.onTimeDays}/{performer.totalDays} days
                  </p>
                </div>
              </motion.div>
            );
          })}

          {topPerformers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No performance data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

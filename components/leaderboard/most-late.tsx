'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, Clock } from 'lucide-react';
import type { EmployeeStats } from '@/types';

interface MostLateProps {
  performers: EmployeeStats[];
  limit?: number;
}

export function MostLate({ performers, limit = 5 }: MostLateProps) {
  // Filter and sort by average lateness (highest first)
  const latePerformers = performers
    .filter((p) => p.averageLateness > 0)
    .sort((a, b) => b.averageLateness - a.averageLateness)
    .slice(0, limit);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getSeverityColor = (lateness: number) => {
    if (lateness >= 30) return 'from-red-500 to-red-700';
    if (lateness >= 15) return 'from-orange-500 to-orange-700';
    return 'from-yellow-500 to-yellow-700';
  };

  const getSeverityBg = (lateness: number) => {
    if (lateness >= 30) return 'bg-red-50 dark:bg-red-950/20';
    if (lateness >= 15) return 'bg-orange-50 dark:bg-orange-950/20';
    return 'bg-yellow-50 dark:bg-yellow-950/20';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Needs Improvement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Employees with highest average lateness
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {latePerformers.map((performer, index) => (
            <motion.div
              key={performer.employeeId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${getSeverityBg(performer.averageLateness)} hover:shadow-md
              `}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 text-center">
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className={`bg-gradient-to-br ${getSeverityColor(performer.averageLateness)} text-white font-semibold text-sm`}>
                  {getInitials(performer.employeeName)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                  {performer.employeeName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {performer.department} • {performer.lateDays} late days
                </p>
              </div>

              {/* Lateness */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {performer.averageLateness}m
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">avg late</p>
              </div>
            </motion.div>
          ))}

          {latePerformers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No lateness data available</p>
              <p className="text-xs mt-1">All employees are punctual!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

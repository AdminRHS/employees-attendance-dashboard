'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge, getStatusBorderColor } from './status-badge';
import { Building2, Briefcase, Clock, AlertCircle } from 'lucide-react';
import type { DailyAttendance, Employee } from '@/types';

interface AttendanceCardProps {
  attendance: DailyAttendance;
  employee?: Employee;
  index?: number;
}

export function AttendanceCard({ attendance, employee, index = 0 }: AttendanceCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    // Time is in HH:MM:SS format
    return time.substring(0, 5); // Return HH:MM
  };

  const getBorderColorClass = () => {
    switch (attendance.status) {
      case 'On-time':
        return 'border-l-green-500 dark:border-l-green-400';
      case 'Late (1-15 min)':
        return 'border-l-yellow-500 dark:border-l-yellow-400';
      case 'Late (16-30 min)':
      case 'Late':
        return 'border-l-orange-500 dark:border-l-orange-400';
      case 'Late (>30 min)':
        return 'border-l-red-500 dark:border-l-red-400';
      case 'Legitimate Day Off':
      case 'Partial Day Off':
        return 'border-l-blue-500 dark:border-l-blue-400';
      case 'Unpaid Day Off':
        return 'border-l-purple-500 dark:border-l-purple-400';
      case 'Absent':
        return 'border-l-gray-500 dark:border-l-gray-400';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 ${getBorderColorClass()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(attendance.employeeName)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 className="font-semibold text-base truncate mb-1">
                {attendance.employeeName}
              </h3>

              {/* Department & Profession */}
              <div className="flex flex-col gap-1 mb-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{attendance.department}</span>
                </div>
                {employee?.profession && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{employee.profession}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <StatusBadge status={attendance.status} variant="default" />

              {/* Arrival Time & Late Info */}
              {attendance.arrivalTime && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Arrived: <span className="font-medium text-foreground">{formatTime(attendance.arrivalTime)}</span>
                  </span>
                  {attendance.minutesLate > 0 && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      ({attendance.minutesLate} min late)
                    </span>
                  )}
                </div>
              )}

              {/* Notes */}
              {attendance.notes && (
                <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{attendance.notes}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

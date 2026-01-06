'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  TrendingUp,
  Flame,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeModal } from '@/components/employee-modal';
import type { UnifiedStatus } from '@/lib/unified-status';
import { getUnifiedStatus, getStatusBadgeConfig, getStatusMessage } from '@/lib/unified-status';
import type { Report } from '@/types';

interface EmployeeCardProps {
  name: string;
  profession: string;
  department: string;
  status: string;
  verdict: string;
  discordTime: string;
  discordId?: string;
  crmTime: string;
  crmStatus: string;
  issue: string;
  report: string;
  date: string;
  streak?: number;
  // Optional derived metrics for calendar/overview pages
  rate?: number | null;
  unifiedStatus?: UnifiedStatus; // New unified status
  hoursValid?: boolean;
  reportValid?: boolean;
  overallValid?: boolean;
  // Employee data for status computation
  employee?: Partial<Report>; // Full employee data for status computation
  activeTab?: 'company' | 'project'; // For status computation context
}

export function EmployeeCard({
  name,
  profession,
  department,
  status,
  verdict,
  discordTime,
  discordId,
  crmTime,
  crmStatus,
  issue,
  report,
  date,
  streak = 0,
  rate,
  unifiedStatus: providedStatus,
  hoursValid,
  reportValid,
  overallValid,
  employee,
  activeTab = 'company',
}: EmployeeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Compute unified status if not provided
  const unifiedStatus: UnifiedStatus = providedStatus || (employee ? getUnifiedStatus(employee as Report, activeTab) : 'ok');
  
  // Get status badge configuration
  const statusConfig = getStatusBadgeConfig(unifiedStatus);
  const statusMessage = getStatusMessage(unifiedStatus);

  const parseTime = (timeStr: string): number => {
    const time = parseFloat(timeStr);
    return isNaN(time) ? 0 : time;
  };

  const totalHours = parseTime(discordTime) + parseTime(crmTime);
  const productivityScore = Math.min((totalHours / 8) * 100, 100);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card
          className={`relative overflow-hidden ${statusConfig.bg} border border-gray-200 rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0px_4px_12px_rgba(0,0,0,0.10)] cursor-pointer h-full flex flex-col`}
          onClick={() => setIsModalOpen(true)}
        >
          {/* Top Accent Status Bar */}
          <div className={`h-1 ${statusConfig.accentBar}`} />

        <CardHeader className="pb-2.5 lg:pb-3 pt-4 lg:pt-5 px-4 lg:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 lg:gap-3 flex-1">
              <Avatar className="h-10 w-10 lg:h-12 lg:w-12 border-2 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs lg:text-sm">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <h3 className="font-bold text-sm lg:text-base text-gray-900 truncate">{name}</h3>
                  {discordId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-5 lg:h-6 px-1.5 lg:px-2 hover:bg-indigo-50 hover:border-indigo-400 rounded-md flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`discord://discordapp.com/users/${discordId}`, '_blank');
                      }}
                      title="Open in Discord"
                    >
                      <MessageCircle className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-indigo-600" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 lg:mt-1">
                  <p className="text-xs lg:text-[13px] text-gray-600 truncate">{profession}</p>
                  {rate != null && !isNaN(rate) && (
                    <Badge variant="custom" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5 rounded-full">
                      RATE {rate.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] lg:text-xs text-gray-500 truncate">{department}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 min-w-0 flex-shrink-0">
              <StatusBadge
                status={unifiedStatus}
                className="max-w-[120px] lg:max-w-[140px] text-[10px] lg:text-xs"
              />
              {streak > 0 && (
                <Badge variant="custom" className="flex items-center gap-1 bg-orange-50 rounded-full px-2 lg:px-2.5 py-0.5 lg:py-1 text-[10px] lg:text-xs whitespace-nowrap">
                  <Flame className="h-2.5 w-2.5 lg:h-3 lg:w-3 flex-shrink-0" />
                  {streak}d
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow px-4 lg:px-5 pb-4 lg:pb-5">
          <div className="space-y-3 lg:space-y-4">
            {/* Status */}
            {status && (
              <div className="flex items-center justify-between text-xs lg:text-[13px]">
                <span className="text-gray-600">Status:</span>
                <Badge variant="custom" className="rounded-md text-[10px] lg:text-xs px-1.5 lg:px-2">{status}</Badge>
              </div>
            )}

            {/* Unified status / warnings - Only show for non-ok, non-leave, non-project statuses */}
            {unifiedStatus !== 'ok' && unifiedStatus !== 'leave' && unifiedStatus !== 'project' && statusMessage && (
              <div
                className={`rounded-md border text-[10px] lg:text-xs px-2 py-1.5 lg:px-2.5 lg:py-2 flex items-center gap-1.5 lg:gap-2 ${
                  unifiedStatus === 'hoursProblems'
                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                    : unifiedStatus === 'reportProblems'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : unifiedStatus === 'totalProblems'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : unifiedStatus === 'inactive'
                    ? 'bg-gray-50 border-gray-200 text-gray-600'
                    : ''
                }`}
              >
                {unifiedStatus === 'hoursProblems' && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                {unifiedStatus === 'reportProblems' && <HelpCircle className="h-3 w-3 flex-shrink-0" />}
                {unifiedStatus === 'totalProblems' && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                {unifiedStatus === 'inactive' && <Clock className="h-3 w-3 flex-shrink-0" />}
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Time tracking */}
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center justify-between text-xs lg:text-[13px]">
                <span className="text-gray-600">💬 Voice Time:</span>
                <span className="font-semibold text-gray-900">{discordTime}h</span>
              </div>
              <div className="flex items-center justify-between text-xs lg:text-[13px]">
                <span className="text-gray-600">💼 CRM Time:</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{crmTime}h</span>
                  {crmStatus && (
                    <span className="text-[10px] lg:text-xs text-gray-500 block mt-0.5">{crmStatus}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Productivity score */}
            <div className="space-y-1.5 lg:space-y-2">
              <div className="flex items-center justify-between text-xs lg:text-[13px]">
                <span className="text-gray-600 flex items-center gap-1 lg:gap-1.5">
                  <TrendingUp className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                  Productivity
                </span>
                <span className="font-semibold text-gray-900">{productivityScore.toFixed(0)}%</span>
              </div>
              <Progress value={productivityScore} className="h-1.5 rounded-full" />
            </div>

            {/* Issue - Only show if not project status */}
            {issue && unifiedStatus !== 'project' && (
              <div className="pt-2.5 lg:pt-3 border-t border-gray-100">
                <div className="bg-red-50 rounded-lg p-2 lg:p-3">
                  <p className="text-[10px] lg:text-xs text-red-600 font-medium flex items-center gap-1 lg:gap-1.5">
                    <AlertTriangle className="h-3 w-3 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
                    <span className="line-clamp-2">{issue}</span>
                  </p>
                </div>
              </div>
            )}

            {report && !issue && (
              <div className="pt-2.5 lg:pt-3 border-t border-gray-100">
                <p className="text-[10px] lg:text-xs text-gray-600 line-clamp-2 leading-relaxed">{report}</p>
              </div>
            )}
          </div>

          {/* Footer - Date (Always at bottom) */}
          <div className="mt-auto pt-2.5 lg:pt-3 border-t border-gray-100">
            <div className="text-[10px] lg:text-xs text-gray-400 text-right">
              {date}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={{
          name,
          profession,
          department,
          status,
          verdict,
          discordTime,
          discordId,
          crmTime,
          crmStatus,
          issue,
          report,
          date,
          rate: rate ?? null,
        }}
        unifiedStatus={unifiedStatus}
        activeTab={activeTab}
      />
    </>
  );
}

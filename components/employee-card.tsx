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
  MessageCircle,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeModal } from '@/components/employee-modal';
import type { UnifiedStatus } from '@/lib/unified-status';
import { getUnifiedStatus, getStatusBadgeConfig, getStatusMessage } from '@/lib/unified-status';
import { getDepartmentForProfession, getDepartmentColors } from '@/lib/filter-colors';
import { useTheme } from 'next-themes';
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
  issue?: string;
  report?: string;
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
  // Lateness-specific fields
  latenessData?: {
    joinTime?: string;
    minutesLate?: number | null;
    checkResult?: string;
    employeeStatus?: string | null;
    latenessStatus?: string; // "Late", "Absent", "On Time"
  };
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
  latenessData,
}: EmployeeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get department category and colors for avatar and badge
  const departmentCategory = getDepartmentForProfession(profession);
  const departmentColors = getDepartmentColors(profession, isDark);
  
  // Department badge colors mapping
  const departmentBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    designers: { bg: 'rgba(168,85,247,0.12)', text: '#A855F7', border: 'rgba(168,85,247,0.3)' },
    developers: { bg: 'rgba(22,163,74,0.12)', text: '#16A34A', border: 'rgba(22,163,74,0.3)' },
    managers: { bg: 'rgba(220,38,38,0.12)', text: '#DC2626', border: 'rgba(220,38,38,0.3)' },
    marketers: { bg: 'rgba(236,72,153,0.12)', text: '#EC4899', border: 'rgba(236,72,153,0.3)' },
    videographers: { bg: 'rgba(249,115,22,0.12)', text: '#F97316', border: 'rgba(249,115,22,0.3)' },
    all: { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', border: 'rgba(156,163,175,0.3)' },
  };
  
  const badgeColors = departmentBadgeColors[departmentCategory] || departmentBadgeColors.all;

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
          className={`relative overflow-hidden ${statusConfig.bg} border border-gray-200 dark:border-[rgba(255,255,255,0.06)] rounded-2xl shadow-[0px_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-all hover:shadow-lg dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:border-gray-300 dark:hover:border-gray-600/40 hover:-translate-y-0.5 hover:bg-gray-50/50 dark:hover:bg-[#1F252F] cursor-pointer h-full flex flex-col dark:bg-[#111827] focus-visible:ring-2 focus-visible:ring-indigo-400`}
          onClick={() => setIsModalOpen(true)}
        >
          {/* Top Accent Status Bar */}
          <div className={`h-1 ${statusConfig.accentBar}`} />

        <CardHeader className="pb-4 pt-5 px-5 dark:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-[rgba(255,255,255,0.1)] shadow-md">
                <AvatarFallback 
                  className="text-white font-bold text-sm"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${departmentColors.default} 0%, ${departmentColors.active} 100%)`
                      : `linear-gradient(135deg, ${departmentColors.default} 0%, ${departmentColors.active} 100%)`
                  }}
                >
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F9FAFB] truncate">{name}</h3>
                  {discordId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-5 px-1.5 hover:bg-indigo-50 dark:hover:bg-[rgba(99,102,241,0.1)] hover:border-indigo-400 dark:hover:border-indigo-500 rounded-md flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`discord://discordapp.com/users/${discordId}`, '_blank');
                      }}
                      title="Open in Discord"
                    >
                      <MessageCircle className="h-3 w-3 text-indigo-600 dark:text-[#CBD5E1]" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-sm text-gray-600 dark:text-[#CBD5E1] truncate">{profession}</p>
                  {rate != null && !isNaN(rate) && (
                    <Badge 
                      variant="custom" 
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: isDark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.1)',
                        color: isDark ? '#38BDF8' : '#0EA5E9',
                        borderColor: isDark ? 'rgba(56,189,248,0.3)' : 'rgba(14,165,233,0.3)',
                      }}
                    >
                      RATE {rate.toFixed(2)}
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5">
                  <Badge
                    variant="custom"
                    className="rounded-full px-3 py-0.5 text-xs font-medium border"
                    style={{
                      backgroundColor: badgeColors.bg,
                      color: badgeColors.text,
                      borderColor: badgeColors.border,
                    }}
                  >
                    {department}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 min-w-0 flex-shrink-0">
              <StatusBadge
                status={unifiedStatus}
                className="max-w-[140px] text-sm"
              />
              {streak > 0 && (
                <Badge variant="custom" className="flex items-center gap-1 bg-orange-50 rounded-full px-2 py-0.5 text-xs whitespace-nowrap">
                  <Flame className="h-3 w-3 flex-shrink-0" />
                  {streak}d
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow px-5 pb-5 dark:px-6">
          <div className="space-y-4">
            {/* Unified status / warnings - Only show for non-ok, non-leave, non-project statuses */}
            {unifiedStatus !== 'ok' && unifiedStatus !== 'leave' && unifiedStatus !== 'project' && statusMessage && (
              <div
                className={`rounded-full border text-sm px-4 py-1.5 flex items-center gap-2 transition-all ${
                  unifiedStatus === 'hoursProblems'
                    ? 'bg-orange-50 dark:bg-[rgba(234,179,8,0.15)] border-orange-200 dark:border-[rgba(234,179,8,0.35)] text-orange-700 dark:text-[#FACC15] hover:bg-orange-100 dark:hover:bg-[rgba(234,179,8,0.25)] dark:hover:border-[rgba(234,179,8,0.55)]'
                    : unifiedStatus === 'reportProblems'
                    ? 'bg-yellow-50 dark:bg-[rgba(234,179,8,0.15)] border-yellow-200 dark:border-[rgba(234,179,8,0.35)] text-yellow-700 dark:text-[#FACC15] hover:bg-yellow-100 dark:hover:bg-[rgba(234,179,8,0.25)] dark:hover:border-[rgba(234,179,8,0.55)]'
                    : unifiedStatus === 'totalProblems'
                    ? 'bg-red-50 dark:bg-[rgba(239,68,68,0.12)] border-red-200 dark:border-[rgba(239,68,68,0.35)] text-red-700 dark:text-[#F87171]'
                    : unifiedStatus === 'inactive'
                    ? 'bg-gray-50 dark:bg-[rgba(148,163,184,0.12)] border-gray-200 dark:border-[rgba(148,163,184,0.3)] text-gray-600 dark:text-[#94A3B8]'
                    : ''
                }`}
              >
                {unifiedStatus === 'hoursProblems' && <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-orange-600 dark:text-[#FACC15]" />}
                {unifiedStatus === 'reportProblems' && <HelpCircle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-600 dark:text-[#FACC15]" />}
                {unifiedStatus === 'totalProblems' && <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-600 dark:text-[#F87171]" />}
                {unifiedStatus === 'inactive' && <Clock className="h-3.5 w-3.5 flex-shrink-0 text-gray-600 dark:text-[#94A3B8]" />}
                <span className="font-medium">{statusMessage}</span>
              </div>
            )}

            {/* Separator */}
            <div className="border-b border-gray-200 dark:border-gray-700/40 my-3" />

            {/* Metrics Section */}
            <div className="bg-gray-50 dark:bg-[#1E293B] rounded-lg p-4 space-y-3">
              {/* Time tracking */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-[#94A3B8]">💬 Voice Time</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]">{discordTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-[#94A3B8]">💼 CRM Time</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]">{crmTime}h</span>
                    {crmStatus && (
                      <span className="text-xs text-gray-500 dark:text-[#64748B] block mt-0.5">{crmStatus}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200 dark:border-gray-700/40" />

              {/* Productivity score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-gray-600 dark:text-[#94A3B8] flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-gray-600 dark:text-[#94A3B8]" />
                    Productivity
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]">{productivityScore.toFixed(0)}%</span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#1F2937]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${productivityScore}%`,
                      backgroundColor: productivityScore >= 80 ? '#22C55E' : productivityScore < 50 ? '#EF4444' : '#FACC15',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            {(issue || report || latenessData) && <div className="border-b border-gray-200 dark:border-gray-700/40 my-3" />}

            {/* Lateness Info Block - Show before warnings if lateness data exists */}
            {latenessData && (
              <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-4 border border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
                <h4 className="text-xs uppercase tracking-wide text-gray-600 dark:text-[#94A3B8] mb-3 font-semibold">⏰ Lateness Info</h4>
                <div className="space-y-2">
                  {latenessData.joinTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-[#AAB4C0] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-[#9CA3AF]" />
                        Joined At:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{latenessData.joinTime}</span>
                    </div>
                  )}
                  {latenessData.minutesLate !== null && latenessData.minutesLate !== undefined && latenessData.minutesLate > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-[#AAB4C0] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-[#9CA3AF]" />
                        Minutes Late:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">+{latenessData.minutesLate} min</span>
                    </div>
                  )}
                  {latenessData.checkResult && (
                    <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-200 dark:border-[rgba(255,255,255,0.06)]">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-[#9CA3AF] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-white flex-1">{latenessData.checkResult}</span>
                    </div>
                  )}
                  {latenessData.employeeStatus && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-[rgba(255,255,255,0.06)]">
                      <span className="text-gray-600 dark:text-[#AAB4C0] flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-600 dark:text-[#3B82F6]" />
                        Status:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{latenessData.employeeStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Absence Warning Block - Show if absent */}
            {latenessData?.latenessStatus?.toLowerCase().includes('absent') && (
              <div className="bg-red-50 dark:bg-[rgba(239,68,68,0.12)] rounded-lg p-3 border border-red-200 dark:border-[rgba(239,68,68,0.35)] mt-3">
                <p className="text-sm text-red-600 dark:text-[#F87171] font-medium flex items-start gap-2">
                  <div className="rounded-md bg-[rgba(239,68,68,0.20)] px-2 py-1 mt-0.5 flex-shrink-0">
                    <AlertTriangle className="h-3 w-3 text-red-600 dark:text-[#F87171]" />
                  </div>
                  <span className="flex-1">
                    <span className="font-semibold">❌ Absent</span>
                    <br />
                    <span className="text-xs mt-1 block">Not in Voice yet</span>
                  </span>
                </p>
              </div>
            )}

            {/* Issue - Only show if not project status and not lateness card */}
            {issue && unifiedStatus !== 'project' && !latenessData && (
              <div className="bg-red-50 dark:bg-[rgba(239,68,68,0.12)] rounded-lg p-3 border border-red-200 dark:border-[rgba(239,68,68,0.35)]">
                <p className="text-sm text-red-600 dark:text-[#F87171] font-medium flex items-start gap-2">
                  <div className="rounded-md bg-[rgba(239,68,68,0.20)] px-2 py-1 mt-0.5 flex-shrink-0">
                    <AlertTriangle className="h-3 w-3 text-red-600 dark:text-[#F87171]" />
                  </div>
                  <span className="flex-1 line-clamp-2">{issue}</span>
                </p>
              </div>
            )}

            {report && !issue && !latenessData && (
              <div className="bg-yellow-50 dark:bg-[rgba(234,179,8,0.10)] rounded-lg p-3 border border-yellow-200 dark:border-[rgba(234,179,8,0.35)]">
                <p className="text-sm text-yellow-700 dark:text-[#FACC15] font-medium flex items-start gap-2">
                  <div className="rounded-md bg-[rgba(234,179,8,0.20)] px-2 py-1 mt-0.5 flex-shrink-0">
                    <HelpCircle className="h-3 w-3 text-yellow-600 dark:text-[#FACC15]" />
                  </div>
                  <span className="flex-1 leading-relaxed line-clamp-2">{report}</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer - Date (Always at bottom) */}
          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700/40">
            <div className="text-xs text-gray-400 dark:text-[#64748B] text-right" style={{ opacity: 0.75 }}>
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

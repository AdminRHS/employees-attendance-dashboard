'use client'

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, TrendingUp, AlertTriangle, CheckCircle2, Briefcase, HelpCircle, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import type { UnifiedStatus } from '@/lib/unified-status';
import { getUnifiedStatus, getStatusBadgeConfig, getStatusMessage } from '@/lib/unified-status';
import type { Report } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getDepartmentColors } from '@/lib/filter-colors';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
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
    leave?: string;
    leaveRate?: string;
    rate?: number | null;
  };
  unifiedStatus?: UnifiedStatus;
  activeTab?: 'company' | 'project';
}

export function EmployeeModal({ isOpen, onClose, employee, unifiedStatus: providedStatus, activeTab = 'company' }: EmployeeModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get profession colors for avatar
  const professionColors = getDepartmentColors(employee.profession, isDark);
  
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Compute unified status if not provided
  const employeeData: Partial<Report> = {
    name: employee.name,
    crmTime: employee.crmTime,
    discordTime: employee.discordTime,
    report: employee.report,
    leave: employee.leave,
    leaveRate: employee.leaveRate,
    rate: employee.rate,
    employeeStatus: employee.status,
    currentStatus: employee.status,
  };
  const unifiedStatus: UnifiedStatus = providedStatus || getUnifiedStatus(employeeData as Report, activeTab);
  const statusConfig = getStatusBadgeConfig(unifiedStatus);

  const parseTime = (timeStr: string): number => {
    const time = parseFloat(timeStr);
    return isNaN(time) ? 0 : time;
  };

  const discordHours = parseTime(employee.discordTime);
  const crmHours = parseTime(employee.crmTime);
  const totalHours = discordHours + crmHours;

  // Productivity indicator (3-dot system)
  const getProductivityLevel = () => {
    if (totalHours >= 8) return 3;
    if (totalHours >= 6) return 2;
    if (totalHours >= 4) return 1;
    return 0;
  };

  const productivityLevel = getProductivityLevel();

  // Parse CRM logs and Discord logs (if available in future)
  const crmLogs = employee.crmStatus ? [employee.crmStatus] : [];
  const discordLogs = employee.discordTime ? [`Voice time: ${employee.discordTime}h`] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[540px] md:w-[600px] bg-white dark:bg-[#1E1E1E] shadow-2xl dark:shadow-[0px_8px_24px_rgba(0,0,0,0.5)] border-l border-gray-200 dark:border-[rgba(255,255,255,0.08)] z-50 overflow-y-auto rounded-l-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 ${statusConfig.bg} dark:bg-[#262626] border-b-2 ${statusConfig.border} dark:border-[rgba(255,255,255,0.08)] p-6 z-10`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-14 w-14 border-2 border-white dark:border-[rgba(255,255,255,0.1)] shadow-md">
                    <AvatarFallback 
                      className="text-white font-bold text-lg"
                      style={{ 
                        background: isDark 
                          ? `linear-gradient(135deg, ${professionColors.default} 0%, ${professionColors.active} 100%)`
                          : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                      }}
                    >
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                      {employee.discordId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 hover:bg-indigo-50 dark:hover:bg-[rgba(59,130,246,0.2)] hover:border-indigo-400 dark:hover:border-[#3B82F6] dark:border-[rgba(255,255,255,0.1)]"
                          onClick={() => window.open(`discord://discordapp.com/users/${employee.discordId}`, '_blank')}
                          title="Open in Discord"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-[#3B82F6]" />
                        </Button>
                      )}
                    </div>
                    <p className="text-base text-gray-700 dark:text-[#AAB4C0] font-medium">{employee.profession}</p>
                    <p className="text-sm text-gray-600 dark:text-[#9CA3AF]">{employee.department}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-white/50 dark:hover:bg-[rgba(255,255,255,0.1)] dark:text-[#AAB4C0]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge
                  status={unifiedStatus}
                  className="flex items-center gap-1"
                />
                {employee.status && (
                  <Badge variant="outline" className="bg-white dark:bg-[#1A1F27] dark:border-[rgba(255,255,255,0.1)] dark:text-[#AAB4C0]">
                    {employee.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5" style={{ gap: '20px' }}>
              {/* Productivity Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">📊 Productivity Summary</h3>
                <Card className="dark:bg-[#111111] dark:border-[rgba(255,255,255,0.05)]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4 dark:mb-4 pb-3 dark:pb-3 border-b dark:border-[rgba(255,255,255,0.06)]">
                      <span className="text-sm text-gray-600 dark:text-[#AAB4C0] flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-600 dark:text-[#3B82F6]" />
                        Activity Level
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((dot) => (
                          <div
                            key={dot}
                            className={`w-2.5 h-2.5 rounded-full ${
                              dot <= productivityLevel
                                ? 'bg-green-500 dark:bg-[#22C55E]'
                                : 'bg-gray-300 dark:bg-[rgba(255,255,255,0.1)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3 dark:space-y-3">
                      <div className="flex items-center justify-between text-sm py-2 hover:bg-gray-50 dark:hover:bg-[rgba(255,255,255,0.03)] rounded px-2 transition-colors">
                        <span className="text-gray-600 dark:text-[#AAB4C0] flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-gray-600 dark:text-[#3B82F6]" />
                          Voice Time:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{employee.discordTime}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-2 hover:bg-gray-50 dark:hover:bg-[rgba(255,255,255,0.03)] rounded px-2 transition-colors">
                        <span className="text-gray-600 dark:text-[#AAB4C0] flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-600 dark:text-[#3B82F6]" />
                          CRM Time:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{employee.crmTime}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-3 border-t dark:border-[rgba(255,255,255,0.06)]">
                        <span className="text-gray-700 dark:text-white font-medium">Total Hours:</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{totalHours.toFixed(1)}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CRM Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">💼 CRM Activity</h3>
                <Card className="dark:bg-[#111111] dark:border-[rgba(255,255,255,0.05)]">
                  <CardContent className="p-4 dark:p-4">
                    {crmLogs.length > 0 ? (
                      <div className="space-y-2 dark:space-y-2 max-h-48 overflow-y-auto">
                        {crmLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-[#9CA3AF] mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-white">{log}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-[#9CA3AF] italic">No CRM activity recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Discord Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">💬 Discord Activity</h3>
                <Card className="dark:bg-[#111111] dark:border-[rgba(255,255,255,0.05)]">
                  <CardContent className="p-4 dark:p-4">
                    {discordLogs.length > 0 ? (
                      <div className="space-y-2 dark:space-y-2 max-h-48 overflow-y-auto">
                        {discordLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <MessageCircle className="h-4 w-4 text-indigo-400 dark:text-[#3B82F6] mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-white">{log}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-[#9CA3AF] italic">No Discord activity recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Daily Report */}
              {employee.report && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">📝 Daily Report</h3>
                  <Card className="dark:bg-[#111111] dark:border-[rgba(255,255,255,0.05)]">
                    <CardContent className="p-4 dark:p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:leading-relaxed prose-p:my-2 prose-p:text-gray-700 dark:prose-p:text-white prose-li:my-1 prose-ul:my-2 prose-ol:my-2 prose-code:text-xs prose-code:bg-gray-100 dark:prose-code:bg-[rgba(255,255,255,0.1)] prose-code:text-gray-800 dark:prose-code:text-white prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {employee.report}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Warnings - Only show for problem statuses, not for leave/project */}
              {unifiedStatus !== 'ok' && unifiedStatus !== 'leave' && unifiedStatus !== 'project' && getStatusMessage(unifiedStatus) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">⚠️ Warnings</h3>
                  <Card className={`relative ${
                    unifiedStatus === 'totalProblems' 
                      ? 'border-l-4 border-l-[#EF4444] dark:border-l-[#EF4444] bg-red-50 dark:bg-[rgba(239,68,68,0.1)] border-red-200 dark:border-[rgba(255,255,255,0.05)]'
                      : unifiedStatus === 'hoursProblems'
                      ? 'border-l-4 border-l-[#FB923C] dark:border-l-[#FB923C] bg-orange-50 dark:bg-[rgba(251,146,60,0.1)] border-orange-200 dark:border-[rgba(255,255,255,0.05)]'
                      : unifiedStatus === 'reportProblems'
                      ? 'border-l-4 border-l-[#FB923C] dark:border-l-[#FB923C] bg-yellow-50 dark:bg-[rgba(251,146,60,0.1)] border-yellow-200 dark:border-[rgba(255,255,255,0.05)]'
                      : unifiedStatus === 'inactive'
                      ? 'border-l-4 border-l-[#9CA3AF] dark:border-l-[#9CA3AF] bg-gray-50 dark:bg-[rgba(156,163,175,0.1)] border-gray-200 dark:border-[rgba(255,255,255,0.05)]'
                      : 'border-l-4 border-l-[#EF4444] dark:border-l-[#EF4444] bg-red-50 dark:bg-[rgba(239,68,68,0.1)] border-red-200 dark:border-[rgba(255,255,255,0.05)]'
                  }`}>
                    <CardContent className="p-4 dark:p-4">
                      <div className="flex items-start gap-3 dark:gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          unifiedStatus === 'totalProblems' 
                            ? 'text-red-600 dark:text-[#EF4444]'
                            : unifiedStatus === 'hoursProblems'
                            ? 'text-orange-600 dark:text-[#FB923C]'
                            : unifiedStatus === 'reportProblems'
                            ? 'text-yellow-600 dark:text-[#FB923C]'
                            : unifiedStatus === 'inactive'
                            ? 'text-gray-600 dark:text-[#9CA3AF]'
                            : 'text-red-600 dark:text-[#EF4444]'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            unifiedStatus === 'totalProblems' 
                              ? 'text-red-900 dark:text-white'
                              : unifiedStatus === 'hoursProblems'
                              ? 'text-orange-900 dark:text-white'
                              : unifiedStatus === 'reportProblems'
                              ? 'text-yellow-900 dark:text-white'
                              : unifiedStatus === 'inactive'
                              ? 'text-gray-900 dark:text-white'
                              : 'text-red-900 dark:text-white'
                          }`}>
                            {unifiedStatus === 'totalProblems' ? 'Total Problems'
                              : unifiedStatus === 'hoursProblems' ? 'Hours Problems'
                              : unifiedStatus === 'reportProblems' ? 'Report Problems'
                              : unifiedStatus === 'inactive' ? 'Inactive'
                              : 'Issue Detected'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            unifiedStatus === 'totalProblems' 
                              ? 'text-red-700 dark:text-[#AAB4C0]'
                              : unifiedStatus === 'hoursProblems'
                              ? 'text-orange-700 dark:text-[#AAB4C0]'
                              : unifiedStatus === 'reportProblems'
                              ? 'text-yellow-700 dark:text-[#AAB4C0]'
                              : unifiedStatus === 'inactive'
                              ? 'text-gray-700 dark:text-[#AAB4C0]'
                              : 'text-red-700 dark:text-[#AAB4C0]'
                          }`}>
                            {getStatusMessage(unifiedStatus)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Leave Information */}
              {employee.leave && employee.leave !== '-' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">🏖️ Leave Information</h3>
                  <Card className="border-blue-200 dark:border-[rgba(59,130,246,0.3)] bg-blue-50 dark:bg-[rgba(59,130,246,0.1)]">
                    <CardContent className="p-4 dark:p-4">
                      <div className="space-y-2 dark:space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 dark:text-[#AAB4C0]">Leave Type:</span>
                          <span className="font-semibold text-blue-900 dark:text-white">{employee.leave}</span>
                        </div>
                        {employee.leaveRate && employee.leaveRate !== '-' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700 dark:text-[#AAB4C0]">Leave Rate:</span>
                            <span className="font-semibold text-blue-900 dark:text-white">{employee.leaveRate}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)] p-4 dark:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#6B7280]">
                  <Calendar className="h-3.5 w-3.5" />
                  {employee.date}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

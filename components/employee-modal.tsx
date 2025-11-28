'use client'

import { useEffect } from 'react';
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
    issue: string;
    report: string;
    date: string;
    leave?: string;
    leaveRate?: string;
    rate?: number | null;
  };
  unifiedStatus?: UnifiedStatus;
  activeTab?: 'company' | 'project';
}

export function EmployeeModal({ isOpen, onClose, employee, unifiedStatus: providedStatus, activeTab = 'company' }: EmployeeModalProps) {
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
            className="fixed top-0 right-0 h-full w-full sm:w-[540px] md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 ${statusConfig.bg} border-b-2 ${statusConfig.border} p-6 z-10`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                      {employee.discordId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 hover:bg-indigo-50 hover:border-indigo-400"
                          onClick={() => window.open(`discord://discordapp.com/users/${employee.discordId}`, '_blank')}
                          title="Open in Discord"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-indigo-600" />
                        </Button>
                      )}
                    </div>
                    <p className="text-base text-gray-700 font-medium">{employee.profession}</p>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-white/50"
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
                  <Badge variant="outline" className="bg-white">
                    {employee.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Productivity Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Productivity Summary</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Activity Level</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((dot) => (
                          <div
                            key={dot}
                            className={`w-2.5 h-2.5 rounded-full ${
                              dot <= productivityLevel
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">💬 Voice Time:</span>
                        <span className="font-semibold">{employee.discordTime}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">💼 CRM Time:</span>
                        <span className="font-semibold">{employee.crmTime}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-gray-700 font-medium">Total Hours:</span>
                        <span className="font-bold text-lg">{totalHours.toFixed(1)}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CRM Activity */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">💼 CRM Activity</h3>
                <Card>
                  <CardContent className="p-4">
                    {crmLogs.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {crmLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{log}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No CRM activity recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Discord Activity */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 Discord Activity</h3>
                <Card>
                  <CardContent className="p-4">
                    {discordLogs.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {discordLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <MessageCircle className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{log}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No Discord activity recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Daily Report */}
              {employee.report && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 Daily Report</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-p:leading-relaxed prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2 prose-code:text-xs prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
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
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">⚠️ Warnings</h3>
                  <Card className={`${
                    unifiedStatus === 'totalProblems' 
                      ? 'border-red-200 bg-red-50'
                      : unifiedStatus === 'hoursProblems'
                      ? 'border-orange-200 bg-orange-50'
                      : unifiedStatus === 'reportProblems'
                      ? 'border-yellow-200 bg-yellow-50'
                      : unifiedStatus === 'inactive'
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          unifiedStatus === 'totalProblems' 
                            ? 'text-red-600'
                            : unifiedStatus === 'hoursProblems'
                            ? 'text-orange-600'
                            : unifiedStatus === 'reportProblems'
                            ? 'text-yellow-600'
                            : unifiedStatus === 'inactive'
                            ? 'text-gray-600'
                            : 'text-red-600'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            unifiedStatus === 'totalProblems' 
                              ? 'text-red-900'
                              : unifiedStatus === 'hoursProblems'
                              ? 'text-orange-900'
                              : unifiedStatus === 'reportProblems'
                              ? 'text-yellow-900'
                              : unifiedStatus === 'inactive'
                              ? 'text-gray-900'
                              : 'text-red-900'
                          }`}>
                            {unifiedStatus === 'totalProblems' ? 'Total Problems'
                              : unifiedStatus === 'hoursProblems' ? 'Hours Problems'
                              : unifiedStatus === 'reportProblems' ? 'Report Problems'
                              : unifiedStatus === 'inactive' ? 'Inactive'
                              : 'Issue Detected'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            unifiedStatus === 'totalProblems' 
                              ? 'text-red-700'
                              : unifiedStatus === 'hoursProblems'
                              ? 'text-orange-700'
                              : unifiedStatus === 'reportProblems'
                              ? 'text-yellow-700'
                              : unifiedStatus === 'inactive'
                              ? 'text-gray-700'
                              : 'text-red-700'
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
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">🏖️ Leave Information</h3>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700">Leave Type:</span>
                          <span className="font-semibold text-blue-900">{employee.leave}</span>
                        </div>
                        {employee.leaveRate && employee.leaveRate !== '-' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">Leave Rate:</span>
                            <span className="font-semibold text-blue-900">{employee.leaveRate}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
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

import type { Report } from '@/types';
import { getTargetHours, getTimeData, isReportValid, isLeave, isProjectEmployee } from './employee-logic';

/**
 * Unified status system replacing old verdict logic
 */
export type UnifiedStatus =
  | 'ok'
  | 'hoursProblems'
  | 'reportProblems'
  | 'totalProblems'
  | 'inactive'
  | 'leave'
  | 'project';

/**
 * Status priority order (higher priority first)
 */
const STATUS_PRIORITY: UnifiedStatus[] = [
  'leave',
  'project',
  'inactive',
  'totalProblems',
  'hoursProblems',
  'reportProblems',
  'ok',
];

/**
 * Get status color mapping
 */
export function getStatusColor(status: UnifiedStatus): string {
  switch (status) {
    case 'ok':
      return 'green';
    case 'hoursProblems':
      return 'orange';
    case 'reportProblems':
      return 'yellow';
    case 'totalProblems':
      return 'red';
    case 'inactive':
      return 'gray';
    case 'leave':
      return 'blue';
    case 'project':
      return 'gray';
    default:
      return 'gray';
  }
}

import { CheckCircle2, AlertTriangle, HelpCircle, Briefcase, Clock } from 'lucide-react';

/**
 * Get status badge configuration
 */
export function getStatusBadgeConfig(status: UnifiedStatus) {
  switch (status) {
    case 'ok':
      return {
        icon: CheckCircle2,
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-500',
        accentBar: 'bg-green-500',
        label: 'OK',
      };
    case 'hoursProblems':
      return {
        icon: AlertTriangle,
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-500',
        accentBar: 'bg-orange-500',
        label: 'Hours Problems',
      };
    case 'reportProblems':
      return {
        icon: HelpCircle,
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-500',
        accentBar: 'bg-yellow-500',
        label: 'Report Problems',
      };
    case 'totalProblems':
      return {
        icon: AlertTriangle,
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-500',
        accentBar: 'bg-red-500',
        label: 'Total Problems',
      };
    case 'inactive':
      return {
        icon: Clock,
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-500',
        accentBar: 'bg-gray-500',
        label: 'Inactive',
      };
    case 'leave':
      return {
        icon: Clock,
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-500',
        accentBar: 'bg-blue-500',
        label: 'Leave',
      };
    case 'project':
      return {
        icon: Briefcase,
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-400',
        accentBar: 'bg-gray-400',
        label: 'Project',
      };
    default:
      return {
        icon: HelpCircle,
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-500',
        accentBar: 'bg-gray-500',
        label: 'Unknown',
      };
  }
}

/**
 * Get status message for warnings
 */
export function getStatusMessage(status: UnifiedStatus): string {
  switch (status) {
    case 'ok':
      return 'OK: hours and report look good.';
    case 'hoursProblems':
      return 'Required hours not met';
    case 'reportProblems':
      return 'No report / report too short';
    case 'totalProblems':
      return 'Hours + report issues detected';
    case 'inactive':
      return 'No activity in CRM or Discord';
    case 'leave':
      return '';
    case 'project':
      return '';
    default:
      return '';
  }
}

/**
 * Calculate unified status for an employee based on business rules
 * 
 * Project employees are now treated the same as normal employees.
 * They are validated by hours + report like everyone else.
 * 
 * Priority order:
 * 1. Leave
 * 2. Inactive
 * 3. Total Problems
 * 4. Hours Problems
 * 5. Report Problems
 * 6. OK
 */
export function getUnifiedStatus(
  employee: Report,
  activeTab: 'company' | 'project' = 'company'
): UnifiedStatus {
  const { crmTime, discordTime, targetHours } = getTimeData(employee);
  const { isFullLeave, isHalfDay } = isLeave(employee);
  const isProject = isProjectEmployee(employee);
  const hasValidReport = isReportValid(employee);

  const totalHours = crmTime + discordTime;
  const hoursOk = targetHours > 0 && totalHours >= targetHours;
  const crmOk = targetHours > 0 && crmTime >= targetHours;
  const discordOk = targetHours > 0 && discordTime >= targetHours;

  // 1. LEAVE (always highest priority)
  if (isFullLeave || isHalfDay) {
    return 'leave';
  }

  // For project tab, project employees only need reports (no hours requirement)
  if (activeTab === 'project' && isProject) {
    return hasValidReport ? 'ok' : 'reportProblems';
  }

  // Note: Project employees on company tab are now treated the same as normal employees
  // They are validated by hours + report like everyone else
  // No special "project" status - they just get OK/Hours Problems/Report Problems/etc.

  // 2. INACTIVE (no CRM, no Discord, no leave)
  if (crmTime === 0 && discordTime === 0) {
    return 'inactive';
  }

  // Check for specific activity issues
  if (crmTime === 0 && discordOk) {
    // No CRM but Discord OK → Total Problems (red)
    return 'totalProblems';
  }

  if (discordTime === 0 && crmOk) {
    // No Discord but CRM OK → Total Problems (red)
    return 'totalProblems';
  }

  // Check hours and report status
  // For project employees on company tab, still validate hours (treat like normal)
  const hasHoursProblems = !hoursOk && (crmTime < targetHours || discordTime < targetHours);
  const hasReportProblems = !hasValidReport;

  // 3. TOTAL PROBLEMS (both hours and report issues)
  if (hasHoursProblems && hasReportProblems) {
    return 'totalProblems';
  }

  // 4. HOURS PROBLEMS
  if (hasHoursProblems) {
    return 'hoursProblems';
  }

  // 5. REPORT PROBLEMS
  if (hasReportProblems) {
    return 'reportProblems';
  }

  // 6. OK
  return 'ok';
}

/**
 * Check if hours are valid for an employee
 */
export function getHoursValidity(employee: Report): boolean {
  const { crmTime, discordTime, targetHours } = getTimeData(employee);
  const totalHours = crmTime + discordTime;
  return targetHours > 0 && totalHours >= targetHours;
}

/**
 * Check if report is valid for an employee
 */
export function getReportValidity(employee: Report): boolean {
  return isReportValid(employee);
}

/**
 * Get overall performance (both hours and report valid)
 */
export function getOverallPerformance(employee: Report): boolean {
  return getHoursValidity(employee) && getReportValidity(employee);
}

/**
 * Employee time metrics
 */
export interface EmployeeTimeMetrics {
  crmTime: number;
  discordTime: number;
  totalHours: number;
  targetHours: number;
  hoursValid: boolean;
  reportValid: boolean;
  overallValid: boolean;
}

/**
 * Get employee time metrics
 */
export function getEmployeeTimeMetrics(employee: Report): EmployeeTimeMetrics {
  const { crmTime, discordTime, targetHours } = getTimeData(employee);
  const totalHours = crmTime + discordTime;
  const hoursValid = getHoursValidity(employee);
  const reportValid = getReportValidity(employee);
  const overallValid = hoursValid && reportValid;

  return {
    crmTime,
    discordTime,
    totalHours,
    targetHours,
    hoursValid,
    reportValid,
    overallValid,
  };
}


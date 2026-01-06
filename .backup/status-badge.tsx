import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerdictKey } from '@/lib/employee-logic';
import type { UnifiedStatus } from '@/lib/unified-status';
import { getStatusBadgeConfig } from '@/lib/unified-status';

export type StatusType = VerdictKey | UnifiedStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

const STATUS_CONFIG = {
  ok: {
    icon: CheckCircle2,
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-500',
    accentBar: 'bg-green-500',
    label: 'OK',
  },
  work: {
    icon: Briefcase,
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-500',
    accentBar: 'bg-green-500',
    label: 'Work',
  },
  check: {
    icon: HelpCircle,
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-500',
    accentBar: 'bg-yellow-500',
    label: 'Check Required',
  },
  leave: {
    icon: Clock,
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-400',
    accentBar: 'bg-blue-400',
    label: 'On Leave',
  },
  'half-day': {
    icon: Clock,
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-500',
    accentBar: 'bg-purple-500',
    label: 'Half Day',
  },
  project: {
    icon: Briefcase,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-400',
    accentBar: 'bg-gray-400',
    label: 'Project Work',
  },
  'no-crm': {
    icon: AlertTriangle,
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-500',
    accentBar: 'bg-red-500',
    label: 'No CRM Activity',
  },
  'no-discord': {
    icon: AlertTriangle,
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-500',
    accentBar: 'bg-red-500',
    label: 'No Discord Activity',
  },
  'low-crm': {
    icon: AlertTriangle,
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-500',
    accentBar: 'bg-orange-500',
    label: 'Low CRM Hours',
  },
  'low-discord': {
    icon: AlertTriangle,
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-500',
    accentBar: 'bg-orange-500',
    label: 'Low Discord',
  },
  'low-both': {
    icon: AlertTriangle,
    bg: 'bg-red-200',
    text: 'text-red-700',
    border: 'border-red-600',
    accentBar: 'bg-red-600',
    label: 'Low CRM & Discord',
  },
  'no-report': {
    icon: HelpCircle,
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-500',
    label: 'No Report',
  },
  inactive: {
    icon: Clock,
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    border: 'border-gray-600',
    label: 'Inactive',
  },
  'project-inactive': {
    icon: Clock,
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-300',
    label: 'Project Inactive',
  },
} as const;

export function StatusBadge({
  status,
  className,
  showIcon = true,
  children,
}: StatusBadgeProps) {
  // Check if this is a unified status
  const unifiedStatuses: UnifiedStatus[] = ['ok', 'hoursProblems', 'reportProblems', 'totalProblems', 'inactive', 'leave', 'project'];
  const isUnifiedStatus = unifiedStatuses.includes(status as UnifiedStatus);
  
  if (isUnifiedStatus) {
    const unifiedConfig = getStatusBadgeConfig(status as UnifiedStatus);
    const Icon = unifiedConfig.icon;
    
    return (
      <Badge
        variant="custom"
        className={cn(
          'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
          unifiedConfig.bg,
          unifiedConfig.text,
          unifiedConfig.border,
          className
        )}
      >
        {showIcon && <Icon className="h-3 w-3 flex-shrink-0" />}
        <span className="truncate">{children || unifiedConfig.label}</span>
      </Badge>
    );
  }
  
  // Fall back to old verdict system
  const verdictKey = status as VerdictKey;
  if (!(verdictKey in STATUS_CONFIG)) {
    // If status doesn't exist in old system, default to 'check'
    const config = STATUS_CONFIG['check'];
    const Icon = config.icon;
    return (
      <Badge
        variant="custom"
        className={cn(
          'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
          config.bg,
          config.text,
          config.border,
          className
        )}
      >
        {showIcon && <Icon className="h-3 w-3 flex-shrink-0" />}
        <span className="truncate">{children || config.label}</span>
      </Badge>
    );
  }
  const config = STATUS_CONFIG[verdictKey];
  const Icon = config.icon;

  return (
    <Badge
      variant="custom"
      className={cn(
        'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 flex-shrink-0" />}
      <span className="truncate">{children || config.label}</span>
    </Badge>
  );
}

export function getStatusConfig(status: StatusType) {
  // Check if unified status, return its config
  const unifiedStatuses: UnifiedStatus[] = ['ok', 'hoursProblems', 'reportProblems', 'totalProblems', 'inactive', 'leave', 'project'];
  if (unifiedStatuses.includes(status as UnifiedStatus)) {
    return getStatusBadgeConfig(status as UnifiedStatus);
  }
  // Fall back to old verdict system
  const verdictKey = status as VerdictKey;
  if (verdictKey in STATUS_CONFIG) {
    return STATUS_CONFIG[verdictKey];
  }
  // Default to check if not found
  return STATUS_CONFIG['check'];
}

/**
 * Converts a verdict string (from spreadsheet) to a VerdictKey status type.
 * This function maps common verdict patterns to their corresponding status keys.
 */
export function getStatusFromVerdict(verdict: string): StatusType {
  if (!verdict) return 'check';
  
  const upper = verdict.toUpperCase();
  
  // LEAVE (always highest priority)
  if (upper.includes('LEAVE') && !upper.includes('HALF')) {
    return 'leave';
  }
  
  // HALF DAY
  if (upper.includes('HALF DAY') || upper.includes('HALF-DAY')) {
    return 'half-day';
  }
  
  // PROJECT
  if (upper.includes('PROJECT')) {
    return 'project';
  }
  
  // NO REPORT
  if (upper.includes('NO REPORT')) {
    return 'no-report';
  }
  
  // CHECK REQUIRED
  if (upper.includes('CHECK')) {
    return 'check';
  }
  
  // OK
  if (upper.includes('OK')) {
    return 'ok';
  }
  
  // WORK
  if (upper.includes('WORK')) {
    return 'work';
  }
  
  // SUSPICIOUS / PROBLEM STATUSES
  // These are generally mapped to 'check' since they require investigation
  if (upper.includes('SUSPICIOUS')) {
    return 'check';
  }
  
  // Default fallback
  return 'check';
}

// Minimal color palette for charts and legends
export const STATUS_COLORS = {
  ok: '#22c55e', // green-500
  check: '#eab308', // yellow-500
  suspicious: '#ef4444', // red-500
  leave: '#60a5fa', // blue-400
  project: '#a855f7', // purple-500
} as const;

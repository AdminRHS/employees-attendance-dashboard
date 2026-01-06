import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, XCircle, Plane, Calendar } from 'lucide-react';
import type { AttendanceStatus } from '@/types';

interface StatusBadgeProps {
  status: AttendanceStatus;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
}

export function StatusBadge({ status, variant = 'default', showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case 'On-time':
        return {
          label: 'On Time',
          icon: CheckCircle,
          className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        };
      case 'Late (1-15 min)':
        return {
          label: variant === 'compact' ? 'Late 1-15m' : 'Late (1-15 min)',
          icon: Clock,
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        };
      case 'Late (16-30 min)':
        return {
          label: variant === 'compact' ? 'Late 16-30m' : 'Late (16-30 min)',
          icon: Clock,
          className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
        };
      case 'Late (>30 min)':
        return {
          label: variant === 'compact' ? 'Late >30m' : 'Late (>30 min)',
          icon: AlertCircle,
          className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        };
      case 'Late':
        return {
          label: 'Late',
          icon: Clock,
          className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
        };
      case 'Legitimate Day Off':
        return {
          label: variant === 'compact' ? 'Day Off' : 'Legitimate Day Off',
          icon: Plane,
          className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        };
      case 'Partial Day Off':
        return {
          label: variant === 'compact' ? 'Partial Off' : 'Partial Day Off',
          icon: Calendar,
          className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
        };
      case 'Unpaid Day Off':
        return {
          label: variant === 'compact' ? 'Unpaid Off' : 'Unpaid Day Off',
          icon: Calendar,
          className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
        };
      case 'Absent':
        return {
          label: 'Absent',
          icon: XCircle,
          className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  );
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'On-time':
      return 'green';
    case 'Late (1-15 min)':
      return 'yellow';
    case 'Late (16-30 min)':
    case 'Late':
      return 'orange';
    case 'Late (>30 min)':
      return 'red';
    case 'Legitimate Day Off':
    case 'Partial Day Off':
      return 'blue';
    case 'Unpaid Day Off':
      return 'purple';
    case 'Absent':
      return 'gray';
    default:
      return 'gray';
  }
}

export function getStatusBorderColor(status: AttendanceStatus): string {
  const color = getStatusColor(status);
  return `border-${color}-500`;
}

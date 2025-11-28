import type { Report } from '@/types';

export interface EmployeeTimeData {
  crmTime: number;     // decimal hours
  discordTime: number; // decimal hours
  targetHours: number; // expected hours based on rate / special rules
}

export type VerdictKey =
  | 'ok'
  | 'work'
  | 'leave'
  | 'half-day'
  | 'project'
  | 'no-crm'
  | 'no-discord'
  | 'low-crm'
  | 'low-discord'
  | 'low-both'
  | 'no-report'
  | 'check'
  | 'inactive'
  | 'project-inactive';

/** Parse a numeric string into a decimal hour value, with safe fallback. */
function parseHours(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (!value) return 0;
  const num = parseFloat(value.toString().replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

/** RATE → target hours, with special override for "Iuliia K". */
export function getTargetHours(employee: Pick<Report, 'name' | 'rate'>): number {
  if (employee.name === 'Iuliia K') return 4;

  switch (employee.rate) {
    case 1:
    case 1.0:
      return 8;
    case 0.5:
      return 4;
    case 0.75:
      return 6;
    case 1.25:
      return 10;
    default:
      return 8; // sensible fallback
  }
}

export function getTimeData(employee: Report): EmployeeTimeData {
  const crmTime = parseHours(employee.crmTime ?? employee.computedHours ?? 0);
  const discordTime = parseHours(employee.discordTime);
  const targetHours = getTargetHours({ name: employee.name, rate: employee.rate ?? null });

  return { crmTime, discordTime, targetHours };
}

export function isReportValid(employee: Pick<Report, 'report'>): boolean {
  if (!employee.report) return false;
  const trimmed = employee.report.trim();
  if (!trimmed) return false;
  // Very short reports are considered invalid/noise
  return trimmed.length >= 40;
}

export function isLeave(employee: Pick<Report, 'leave' | 'leaveRate'>): {
  isFullLeave: boolean;
  isHalfDay: boolean;
} {
  const leaveRateNum = parseHours(employee.leaveRate);
  const isFullLeave = leaveRateNum >= 1;
  const isHalfDay = leaveRateNum > 0 && leaveRateNum < 1;
  return { isFullLeave, isHalfDay };
}

export function isProjectEmployee(employee: Pick<Report, 'isProject' | 'employeeStatus' | 'currentStatus'>): boolean {
  if (employee.isProject) return true;
  const status = (employee.employeeStatus || employee.currentStatus || '').toLowerCase();
  if (!status) return false;
  return (
    status.includes('project') ||
    status.includes('part-project') ||
    status.includes('part project')
  );
}

interface VerdictContext extends EmployeeTimeData {
  hasValidReport: boolean;
  isFullLeave: boolean;
  isHalfDay: boolean;
  isProject: boolean;
}

function buildVerdictContext(employee: Report): VerdictContext {
  const { crmTime, discordTime, targetHours } = getTimeData(employee);
  const { isFullLeave, isHalfDay } = isLeave(employee);
  const isProject = isProjectEmployee(employee);
  const hasValidReport = isReportValid(employee);
  return { crmTime, discordTime, targetHours, isFullLeave, isHalfDay, isProject, hasValidReport };
}

/**
 * Compute the business verdict for a single employee report, using
 * the full priority rules from the specification.
 */
export function getVerdict(employee: Report): VerdictKey {
  const ctx = buildVerdictContext(employee);
  const { crmTime, discordTime, targetHours, isFullLeave, isHalfDay, isProject, hasValidReport } = ctx;

  const hoursOk = targetHours > 0 && crmTime >= targetHours;
  const discordOk = targetHours > 0 && discordTime >= targetHours;
  const hasAnyActivity = crmTime > 0 || discordTime > 0;

  // LEAVE (always highest priority)
  if (isFullLeave) return 'leave';

  // HALF DAY
  if (isHalfDay) return 'half-day';

  // PROJECT / PROJECT INACTIVE
  if (isProject) {
    if (!hasAnyActivity) return 'project-inactive';
    return 'project';
  }

  // INACTIVE (no CRM, no Discord, no leave, no project)
  if (crmTime === 0 && discordTime === 0) {
    return 'inactive';
  }

  // NO CRM ACTIVITY
  if (crmTime === 0 && discordOk) {
    return 'no-crm';
  }

  // NO DISCORD ACTIVITY
  if (discordTime === 0 && hoursOk) {
    return 'no-discord';
  }

  const crmLow = crmTime < targetHours;
  const discordLow = discordTime < targetHours;

  // LOW CRM & DISCORD
  if (crmLow && discordLow) {
    return 'low-both';
  }

  // LOW CRM HOURS
  if (crmLow) {
    return 'low-crm';
  }

  // LOW DISCORD HOURS
  if (discordLow) {
    return 'low-discord';
  }

  // NO REPORT
  if (hoursOk && discordOk && !hasValidReport) {
    return 'no-report';
  }

  // OK / WORK
  const status = (employee.employeeStatus || employee.currentStatus || '').toLowerCase();
  if (status.includes('work')) {
    return 'work';
  }
  if (hoursOk && hasValidReport) {
    return 'ok';
  }

  // CHECK (fallback for strange / edge cases)
  return 'check';
}



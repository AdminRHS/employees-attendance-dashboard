import type { Report } from '@/types';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  isSameDay,
} from 'date-fns';
import type { UnifiedStatus } from './unified-status';
import { getUnifiedStatus } from './unified-status';

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
  let crmTime = parseHours(employee.crmTime ?? employee.computedHours ?? 0);
  let discordTime = parseHours(employee.discordTime);

  if (Number.isNaN(crmTime) || Number.isNaN(discordTime)) {
    console.warn('INVALID TIME VALUES in getTimeData', {
      name: employee.name,
      crmTime: employee.crmTime,
      discordTime: employee.discordTime,
    });
    crmTime = 0;
    discordTime = 0;
  }
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

/**
 * Range type for overview metrics
 */
export type Range = 'day' | 'week' | 'month' | 'all';

/**
 * Safely parse a date string into a timestamp
 */
function parseDateSafeLocal(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? 0 : ts;
}

/**
 * Filter reports by date + range for Overview metrics
 * Does NOT exclude project employees by itself (that is handled in buildEmployees opts).
 */
export function filterReportsByDateAndRange(
  reports: Report[],
  anchorDate: Date,
  range: Range,
): Report[] {
  if (range === 'all') return reports;

  const anchor = startOfDay(anchorDate);

  let start: Date;
  let end: Date;

  switch (range) {
    case 'day':
      start = anchor;
      end = endOfDay(anchor);
      break;
    case 'week':
      // Monday–Sunday week
      start = startOfWeek(anchor, { weekStartsOn: 1 });
      end = endOfWeek(anchor, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(anchor);
      end = endOfMonth(anchor);
      break;
    default:
      start = anchor;
      end = endOfDay(anchor);
  }

  return reports.filter((r) => {
    const ts = parseDateSafeLocal(r.date);
    if (!ts) return false;
    const d = new Date(ts);
    return d >= start && d <= end;
  });
}

// -----------------------
// Overview Aggregation
// -----------------------

export interface EmployeeAggregate {
  id: string;             // e.g. name or name+department+profession
  name: string;
  department: string;
  profession: string;
  isProject: boolean;
  days: Report[];         // reports in the selected range
}

export function buildEmployees(
  reports: Report[],
  opts?: { excludeProjects?: boolean },
): EmployeeAggregate[] {
  const byKey = new Map<string, EmployeeAggregate>();

  for (const r of reports) {
    const name = (r as any).employeeName || r.name || '';
    if (!name) continue;

    const lowerStatus = (r.employeeStatus || r.currentStatus || '').toLowerCase();
    const isProject =
      r.verdict === '📦 PROJECT' ||
      r.verdict === '💤 Project Inactive' ||
      lowerStatus.includes('project');

    if (opts?.excludeProjects && isProject) continue;

    const dept = r.department || '';
    const prof = r.profession || '';
    const key = `${name}::${dept}::${prof}`;

    let agg = byKey.get(key);
    if (!agg) {
      agg = {
        id: key,
        name,
        department: dept,
        profession: prof,
        isProject,
        days: [],
      };
      byKey.set(key, agg);
    }

    agg.days.push(r);
  }

  return Array.from(byKey.values());
}

export function getTargetHoursForReport(r: Report): number {
  const name = (r as any).employeeName || r.name || '';
  if (name === 'Iuliia K') return 4;

  if (typeof r.targetTime === 'number' && r.targetTime > 0) {
    return r.targetTime;
  }

  if (typeof r.rate === 'number' && r.rate > 0) {
    switch (r.rate) {
      case 1:   return 8;
      case 0.5: return 4;
      default:  return r.rate * 8;
    }
  }

  return 8;
}

export interface EmployeeMetrics {
  targetHours: number;
  totalCrmHours: number;
  hasValidReport: boolean;
}

export function getEmployeeMetrics(agg: EmployeeAggregate): EmployeeMetrics {
  let targetHours = 0;
  let totalCrmHours = 0;
  let hasValidReport = false;

  for (const r of agg.days) {
    const crm = Number(r.crmTime) || 0;
    const reportText = r.report?.trim() ?? '';

    totalCrmHours += crm;
    targetHours += getTargetHoursForReport(r);

    if (reportText.length > 0) {
      hasValidReport = true;
    }
  }

  return { targetHours, totalCrmHours, hasValidReport };
}

export interface OverviewMetrics {
  totalEmployees: number;
  hoursMet: number;
  reportsValid: number;
  bothMet: number;
}

export function calculateOverviewMetrics(
  employees: EmployeeAggregate[],
): OverviewMetrics {
  console.log('EMPLOYEE AGGREGATES', employees.length, employees.map(e => e.id));
  
  let totalEmployees = 0;
  let hoursMet = 0;
  let reportsValid = 0;
  let bothMet = 0;

  for (const agg of employees) {
    const { targetHours, totalCrmHours, hasValidReport } = getEmployeeMetrics(agg);

    // employees that have no target at all (0 hours) are ignored from stats
    if (targetHours <= 0) continue;

    totalEmployees += 1;

    const meetsHours = totalCrmHours >= targetHours - 0.1; // small tolerance
    const meetsReport = hasValidReport;

    if (meetsHours) hoursMet += 1;
    if (meetsReport) reportsValid += 1;
    if (meetsHours && meetsReport) bothMet += 1;
  }

  return { totalEmployees, hoursMet, reportsValid, bothMet };
}

export function getQuickStatsForYesterday(reports: Report[]): {
  suspicious: number;
  checkRequired: number;
  project: number;
  ok: number;
} {
  const yesterday = startOfDay(addDays(new Date(), -1));
  const dayReports = filterReportsByDateAndRange(reports, yesterday, 'day');

  let suspicious = 0;
  let checkRequired = 0;
  let project = 0;
  let ok = 0;

  for (const r of dayReports) {
    switch (r.verdict) {
      case '🚨 LOW CRM & DISCORD':
      case '🚨 NO CRM ACTIVITY':
      case '🚨 NO DISCORD ACTIVITY':
        suspicious++;
        break;
      case '⚠️ NO REPORT':
      case '❓ CHECK':
        checkRequired++;
        break;
      case '📦 PROJECT':
      case '💤 Project Inactive':
        project++;
        break;
      case '✅ OK':
      case '✅ WORK':
        ok++;
        break;
      default:
        break;
    }
  }

  return { suspicious, checkRequired, project, ok };
}

// Helper to choose the worst status when an employee has multiple reports in a day
function chooseWorseStatus(current: UnifiedStatus | null, newStatus: UnifiedStatus): UnifiedStatus {
  if (!current) return newStatus;
  
  const priority: Record<UnifiedStatus, number> = {
    'leave': 1,
    'totalProblems': 2,
    'inactive': 3,
    'hoursProblems': 4,
    'reportProblems': 5,
    'ok': 6,
    'project': 7, // Ignored for company metrics
  };
  
  return (priority[current] ?? 99) < (priority[newStatus] ?? 99) ? current : newStatus;
}

export interface StatusCountsForDate {
  hoursProblems: number;
  reportProblems: number;
  totalProblems: number;
  leave: number;
}

export function getStatusCountsForDate(
  reports: Report[],
  date: Date,
): StatusCountsForDate {
  const target = startOfDay(date);

  // 1) Filter only reports for the target date
  const dayReports = reports.filter((r) => {
    if (!r.date) return false;
    const d = new Date(r.date);
    return isSameDay(d, target);
  });

  // 2) Group by employee (use same key logic as buildEmployees)
  const byKey = new Map<string, Report[]>();

  for (const r of dayReports) {
    const name = ((r as any).employeeName || r.name || '').trim();
    if (!name) continue;

    // 3) Exclude project employees from company metrics
    const isProject = isProjectEmployee(r);
    if (isProject) continue;

    const discord = (r.discordId || '').toString().trim();
    const key = discord ? `discord:${discord}` : `name:${name.toLowerCase()}`;

    const arr = byKey.get(key) ?? [];
    arr.push(r);
    byKey.set(key, arr);
  }

  // 4) Compute unified status per employee and count
  let hoursProblems = 0;
  let reportProblems = 0;
  let totalProblems = 0;
  let leave = 0;

  for (const [, empReports] of byKey) {
    // If multiple reports for same employee, pick the worst status
    let worstStatus: UnifiedStatus | null = null;

    for (const r of empReports) {
      const status = getUnifiedStatus(r, 'company');
      worstStatus = chooseWorseStatus(worstStatus, status);
    }

    if (!worstStatus) continue;

    switch (worstStatus) {
      case 'hoursProblems':
        hoursProblems += 1;
        break;
      case 'reportProblems':
        reportProblems += 1;
        break;
      case 'totalProblems':
      case 'inactive': // Treat inactive as total problems
        totalProblems += 1;
        break;
      case 'leave':
        leave += 1;
        break;
      default:
        // Ignore 'ok' and 'project' statuses for these counts
        break;
    }
  }

  return { hoursProblems, reportProblems, totalProblems, leave };
}

// Legacy function name for backward compatibility - uses yesterday
export function getYesterdayStatusCounts(reports: Report[]): StatusCountsForDate {
  const yesterday = startOfDay(addDays(new Date(), -1));
  return getStatusCountsForDate(reports, yesterday);
}


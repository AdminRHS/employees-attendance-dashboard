// ============================================
// EMPLOYEE DATA
// ============================================

export interface Employee {
  id: number;
  name: string;
  discordId: string;
  hours: number; // shift hours: 4 or 8
  department: string;
  profession: string;
  shift: 'Day' | 'Night';
  status: 'Work' | 'Available' | 'Sick' | 'Vacation';
}

// ============================================
// ATTENDANCE DATA
// ============================================

export type AttendanceStatus =
  | 'On-time'
  | 'Late (1-15 min)'
  | 'Late (16-30 min)'
  | 'Late (>30 min)'
  | 'Late'
  | 'Legitimate Day Off'
  | 'Partial Day Off'
  | 'Unpaid Day Off'
  | 'Absent';

export interface DailyAttendance {
  uniqueId: string;
  date: string; // YYYY-MM-DD format
  employeeName: string;
  discordId: string;
  department: string;
  arrivalTime: string | null; // HH:MM:SS format or null
  minutesLate: number;
  status: AttendanceStatus;
  notes: string | null;
}

// ============================================
// LEAVE DATA
// ============================================

export interface Leave {
  date: string; // YYYY-MM-DD format
  employeeId: number;
  employeeName: string;
  hours: number; // 4 or 8
}

// ============================================
// VOICE LOGS (for future features)
// ============================================

export interface VoiceLog {
  userId: string;
  username: string;
  action: 'JOINED' | 'LEFT';
  channel: string;
  timestamp: string; // ISO 8601 format
}

export interface VoiceSession {
  userId: string;
  username: string;
  channel: string;
  joinedAt: string;
  leftAt: string | null;
  duration: number; // in minutes
}

// ============================================
// STATISTICS & AGGREGATIONS
// ============================================

export interface DailyStats {
  date: string;
  totalEmployees: number;
  onTime: number;
  late1to15: number;
  late16to30: number;
  lateOver30: number;
  onLeave: number;
  absent: number;
  averageLateness: number; // in minutes
  punctualityRate: number; // percentage 0-100
}

export interface DepartmentStats {
  department: string;
  totalEmployees: number;
  onTime: number;
  late: number;
  absent: number;
  punctualityRate: number;
}

export interface EmployeeStats {
  employeeId: number;
  employeeName: string;
  department: string;
  profession: string;
  totalDays: number;
  onTimeDays: number;
  lateDays: number;
  absentDays: number;
  averageLateness: number;
  punctualityRate: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AttendanceData {
  employees: Employee[];
  dailyAttendance: DailyAttendance[];
  leaves: Leave[];
  dailyStats: DailyStats[];
  departmentStats: DepartmentStats[];
  employeeStats: EmployeeStats[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// FILTER TYPES
// ============================================

export interface AttendanceFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  department?: string;
  status?: AttendanceStatus | 'all';
  shift?: 'Day' | 'Night' | 'all';
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface StatusBadgeProps {
  status: AttendanceStatus;
  variant?: 'default' | 'compact';
}

export interface AttendanceCardProps {
  attendance: DailyAttendance;
  employee?: Employee;
}

export interface LeaderboardEntry {
  rank: number;
  employeeName: string;
  department: string;
  profession: string;
  score: number;
  metric: string;
}

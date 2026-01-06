import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { format } from 'date-fns';
import type {
  Employee,
  DailyAttendance,
  Leave,
  AttendanceData,
  DailyStats,
  DepartmentStats,
  EmployeeStats,
  AttendanceStatus,
} from '@/types';

/**
 * Processes attendance data from Google Sheets
 */
export class GoogleSheetsAttendanceProcessor {
  private doc: GoogleSpreadsheet;
  private employees: Employee[] = [];
  private dailyAttendance: DailyAttendance[] = [];
  private leaves: Leave[] = [];

  constructor(spreadsheetId: string, serviceAccountEmail: string, privateKey: string) {
    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    this.doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  }

  /**
   * Load and authenticate with Google Sheets
   */
  async loadDoc(): Promise<void> {
    await this.doc.loadInfo();
  }

  /**
   * Process Employees sheet
   */
  async processEmployees(): Promise<Employee[]> {
    const sheet = this.doc.sheetsByTitle['Employees'];
    if (!sheet) {
      throw new Error('Employees sheet not found');
    }

    const rows = await sheet.getRows();

    this.employees = rows.map((row) => ({
      id: Number(row.get('Employee ID')) || 0,
      name: String(row.get('Employee Name') || '').trim(),
      discordId: String(row.get('Discord ID') || '').trim(),
      hours: Number(row.get('Hours')) || 8,
      department: String(row.get('Department') || '').trim(),
      profession: String(row.get('Profession') || '').trim(),
      shift: (row.get('Shift') === 'Night' ? 'Night' : 'Day') as 'Day' | 'Night',
      status: (row.get('Status') || 'Available') as 'Work' | 'Available' | 'Sick' | 'Vacation',
    }));

    return this.employees;
  }

  /**
   * Process Daily_Attendance sheet
   */
  async processDailyAttendance(): Promise<DailyAttendance[]> {
    const sheet = this.doc.sheetsByTitle['Daily_Attendance'];
    if (!sheet) {
      throw new Error('Daily_Attendance sheet not found');
    }

    const rows = await sheet.getRows();

    this.dailyAttendance = rows.map((row) => {
      const dateValue = row.get('Date');
      const dateStr = this.parseDate(dateValue);

      const arrivalValue = row.get('Arrival Time');
      const arrivalTime = this.parseTime(arrivalValue);

      return {
        uniqueId: String(row.get('Unique_ID') || '').trim(),
        date: dateStr,
        employeeName: String(row.get('Employee Name') || '').trim(),
        discordId: String(row.get('Discord ID') || '').trim(),
        department: String(row.get('Department') || '').trim(),
        arrivalTime,
        minutesLate: Number(row.get('Minutes Late')) || 0,
        status: (row.get('Status') || 'Absent') as AttendanceStatus,
        notes: row.get('Notes') ? String(row.get('Notes')).trim() : null,
      };
    });

    return this.dailyAttendance;
  }

  /**
   * Process Leaves sheet
   */
  async processLeaves(): Promise<Leave[]> {
    const sheet = this.doc.sheetsByTitle['Leaves'];
    if (!sheet) {
      throw new Error('Leaves sheet not found');
    }

    const rows = await sheet.getRows();

    this.leaves = rows.map((row) => {
      const dateValue = row.get('Date');
      const dateStr = this.parseDate(dateValue);

      return {
        date: dateStr,
        employeeId: Number(row.get('Employee ID')) || 0,
        employeeName: String(row.get('Employee Name') || '').trim(),
        hours: Number(row.get('Hours')) || 0,
      };
    });

    return this.leaves;
  }

  /**
   * Parse date from Google Sheets (can be string or Date object)
   */
  private parseDate(dateValue: any): string {
    if (!dateValue) return format(new Date(), 'yyyy-MM-dd');

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return format(dateValue, 'yyyy-MM-dd');
    }

    // If it's a string
    const dateStr = String(dateValue).trim();

    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Try DD.MM.YYYY
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month}-${day}`;
    }

    // Try DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }

    // Try parsing as a date string
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch (e) {
      // Continue to fallback
    }

    // Fallback to current date
    return format(new Date(), 'yyyy-MM-dd');
  }

  /**
   * Parse time from various formats
   */
  private parseTime(timeValue: any): string | null {
    if (!timeValue || timeValue === '-') return null;

    // If it's already a string time (HH:MM:SS or HH:MM)
    if (typeof timeValue === 'string') {
      const trimmed = timeValue.trim();
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        return trimmed;
      }
    }

    return null;
  }

  /**
   * Generate daily statistics
   */
  generateDailyStats(dateFilter?: string): DailyStats[] {
    const statsMap = new Map<string, DailyStats>();

    const filteredAttendance = dateFilter
      ? this.dailyAttendance.filter((a) => a.date === dateFilter)
      : this.dailyAttendance;

    filteredAttendance.forEach((attendance) => {
      if (!statsMap.has(attendance.date)) {
        statsMap.set(attendance.date, {
          date: attendance.date,
          totalEmployees: 0,
          onTime: 0,
          late1to15: 0,
          late16to30: 0,
          lateOver30: 0,
          onLeave: 0,
          absent: 0,
          averageLateness: 0,
          punctualityRate: 0,
        });
      }

      const stats = statsMap.get(attendance.date)!;
      stats.totalEmployees++;

      switch (attendance.status) {
        case 'On-time':
          stats.onTime++;
          break;
        case 'Late (1-15 min)':
          stats.late1to15++;
          break;
        case 'Late (16-30 min)':
          stats.late16to30++;
          break;
        case 'Late (>30 min)':
        case 'Late':
          stats.lateOver30++;
          break;
        case 'Legitimate Day Off':
        case 'Partial Day Off':
        case 'Unpaid Day Off':
          stats.onLeave++;
          break;
        case 'Absent':
          stats.absent++;
          break;
      }
    });

    statsMap.forEach((stats) => {
      const workingEmployees = stats.totalEmployees - stats.onLeave;
      if (workingEmployees > 0) {
        stats.punctualityRate = Math.round((stats.onTime / workingEmployees) * 100);
      }

      const lateAttendance = filteredAttendance.filter(
        (a) => a.date === stats.date && a.minutesLate > 0
      );
      if (lateAttendance.length > 0) {
        const totalLateness = lateAttendance.reduce((sum, a) => sum + a.minutesLate, 0);
        stats.averageLateness = Math.round(totalLateness / lateAttendance.length);
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Generate department statistics
   */
  generateDepartmentStats(): DepartmentStats[] {
    const statsMap = new Map<string, DepartmentStats>();

    this.dailyAttendance.forEach((attendance) => {
      if (!statsMap.has(attendance.department)) {
        statsMap.set(attendance.department, {
          department: attendance.department,
          totalEmployees: 0,
          onTime: 0,
          late: 0,
          absent: 0,
          punctualityRate: 0,
        });
      }

      const stats = statsMap.get(attendance.department)!;
      stats.totalEmployees++;

      if (attendance.status === 'On-time') {
        stats.onTime++;
      } else if (attendance.status.startsWith('Late')) {
        stats.late++;
      } else if (attendance.status === 'Absent') {
        stats.absent++;
      }
    });

    statsMap.forEach((stats) => {
      const workingDays = stats.totalEmployees;
      if (workingDays > 0) {
        stats.punctualityRate = Math.round((stats.onTime / workingDays) * 100);
      }
    });

    return Array.from(statsMap.values()).sort(
      (a, b) => b.punctualityRate - a.punctualityRate
    );
  }

  /**
   * Generate employee statistics
   */
  generateEmployeeStats(): EmployeeStats[] {
    const statsMap = new Map<string, EmployeeStats>();

    this.dailyAttendance.forEach((attendance) => {
      const key = attendance.discordId || attendance.employeeName;

      if (!statsMap.has(key)) {
        const employee = this.employees.find(
          (e) => e.discordId === attendance.discordId || e.name === attendance.employeeName
        );

        statsMap.set(key, {
          employeeId: employee?.id || 0,
          employeeName: attendance.employeeName,
          department: attendance.department,
          profession: employee?.profession || '',
          totalDays: 0,
          onTimeDays: 0,
          lateDays: 0,
          absentDays: 0,
          averageLateness: 0,
          punctualityRate: 0,
        });
      }

      const stats = statsMap.get(key)!;

      if (attendance.status === 'Legitimate Day Off' ||
          attendance.status === 'Partial Day Off' ||
          attendance.status === 'Unpaid Day Off') {
        return;
      }

      stats.totalDays++;

      if (attendance.status === 'On-time') {
        stats.onTimeDays++;
      } else if (attendance.status.startsWith('Late')) {
        stats.lateDays++;
      } else if (attendance.status === 'Absent') {
        stats.absentDays++;
      }
    });

    statsMap.forEach((stats, key) => {
      if (stats.totalDays > 0) {
        stats.punctualityRate = Math.round((stats.onTimeDays / stats.totalDays) * 100);
      }

      const lateRecords = this.dailyAttendance.filter(
        (a) =>
          (a.discordId || a.employeeName) === key &&
          a.minutesLate > 0 &&
          a.status !== 'Legitimate Day Off' &&
          a.status !== 'Partial Day Off' &&
          a.status !== 'Unpaid Day Off'
      );

      if (lateRecords.length > 0) {
        const totalLateness = lateRecords.reduce((sum, a) => sum + a.minutesLate, 0);
        stats.averageLateness = Math.round(totalLateness / lateRecords.length);
      }
    });

    return Array.from(statsMap.values())
      .filter((stats) => stats.totalDays > 0)
      .sort((a, b) => b.punctualityRate - a.punctualityRate);
  }

  /**
   * Process all data and return structured result
   */
  async processAll(): Promise<AttendanceData> {
    await this.loadDoc();
    await this.processEmployees();
    await this.processDailyAttendance();
    await this.processLeaves();

    return {
      employees: this.employees,
      dailyAttendance: this.dailyAttendance,
      leaves: this.leaves,
      dailyStats: this.generateDailyStats(),
      departmentStats: this.generateDepartmentStats(),
      employeeStats: this.generateEmployeeStats(),
    };
  }
}

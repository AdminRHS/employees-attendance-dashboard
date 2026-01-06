import * as XLSX from 'xlsx';
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
 * Reads and processes Excel file containing attendance data
 */
export class AttendanceDataProcessor {
  private workbook: XLSX.WorkBook | null = null;
  private employees: Employee[] = [];
  private dailyAttendance: DailyAttendance[] = [];
  private leaves: Leave[] = [];

  /**
   * Read Excel file from path
   */
  readExcelFile(filePath: string): void {
    this.workbook = XLSX.readFile(filePath);
  }

  /**
   * Read Excel file from buffer (for API routes)
   */
  readExcelBuffer(buffer: Buffer): void {
    this.workbook = XLSX.read(buffer);
  }

  /**
   * Process Employees sheet
   */
  processEmployees(): Employee[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded. Call readExcelFile first.');
    }

    const employeesSheet = this.workbook.Sheets['Employees'];
    if (!employeesSheet) {
      throw new Error('Employees sheet not found in workbook');
    }

    const rawData: any[] = XLSX.utils.sheet_to_json(employeesSheet);

    this.employees = rawData.map((row) => ({
      id: Number(row['Employee ID']),
      name: String(row['Employee Name'] || '').trim(),
      discordId: String(row['Discord ID'] || '').trim(),
      hours: Number(row['Hours']) || 8,
      department: String(row['Department'] || '').trim(),
      profession: String(row['Profession'] || '').trim(),
      shift: (row['Shift'] === 'Night' ? 'Night' : 'Day') as 'Day' | 'Night',
      status: (row['Status'] || 'Available') as 'Work' | 'Available' | 'Sick' | 'Vacation',
    }));

    return this.employees;
  }

  /**
   * Process Daily_Attendance sheet
   */
  processDailyAttendance(): DailyAttendance[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded. Call readExcelFile first.');
    }

    const attendanceSheet = this.workbook.Sheets['Daily_Attendance'];
    if (!attendanceSheet) {
      throw new Error('Daily_Attendance sheet not found in workbook');
    }

    const rawData: any[] = XLSX.utils.sheet_to_json(attendanceSheet);

    this.dailyAttendance = rawData.map((row) => {
      // Parse date
      let dateStr: string;
      if (row['Date'] instanceof Date) {
        dateStr = format(row['Date'], 'yyyy-MM-dd');
      } else {
        dateStr = this.parseDate(row['Date']);
      }

      // Parse arrival time
      const arrivalTime = this.parseTime(row['Arrival Time']);

      return {
        uniqueId: String(row['Unique_ID'] || '').trim(),
        date: dateStr,
        employeeName: String(row['Employee Name'] || '').trim(),
        discordId: String(row['Discord ID'] || '').trim(),
        department: String(row['Department'] || '').trim(),
        arrivalTime,
        minutesLate: Number(row['Minutes Late']) || 0,
        status: (row['Status'] || 'Absent') as AttendanceStatus,
        notes: row['Notes'] ? String(row['Notes']).trim() : null,
      };
    });

    return this.dailyAttendance;
  }

  /**
   * Process Leaves sheet
   */
  processLeaves(): Leave[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded. Call readExcelFile first.');
    }

    const leavesSheet = this.workbook.Sheets['Leaves'];
    if (!leavesSheet) {
      throw new Error('Leaves sheet not found in workbook');
    }

    const rawData: any[] = XLSX.utils.sheet_to_json(leavesSheet);

    this.leaves = rawData.map((row) => {
      let dateStr: string;
      if (row['Date'] instanceof Date) {
        dateStr = format(row['Date'], 'yyyy-MM-dd');
      } else {
        dateStr = this.parseDate(row['Date']);
      }

      return {
        date: dateStr,
        employeeId: Number(row['Employee ID']),
        employeeName: String(row['Employee Name'] || '').trim(),
        hours: Number(row['Hours']) || 0,
      };
    });

    return this.leaves;
  }

  /**
   * Parse date from various formats including Excel serial numbers
   */
  private parseDate(dateValue: any): string {
    if (!dateValue) return format(new Date(), 'yyyy-MM-dd');

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return format(dateValue, 'yyyy-MM-dd');
    }

    // If it's an Excel serial number (number)
    if (typeof dateValue === 'number') {
      // Excel date serial number: days since 1899-12-30
      const excelEpoch = new Date(1899, 11, 30);
      const msPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + dateValue * msPerDay);
      return format(date, 'yyyy-MM-dd');
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

    // Fallback to current date
    return format(new Date(), 'yyyy-MM-dd');
  }

  /**
   * Parse time from Excel serial number
   */
  private parseTime(timeValue: any): string | null {
    if (!timeValue || timeValue === '-') return null;

    // If it's already a string time (HH:MM:SS)
    if (typeof timeValue === 'string') {
      return timeValue.trim();
    }

    // If it's an Excel time serial number (fraction of a day)
    if (typeof timeValue === 'number' && timeValue < 1) {
      const totalSeconds = Math.round(timeValue * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return null;
  }

  /**
   * Generate daily statistics
   */
  generateDailyStats(dateFilter?: string): DailyStats[] {
    const statsMap = new Map<string, DailyStats>();

    // Filter attendance data
    const filteredAttendance = dateFilter
      ? this.dailyAttendance.filter((a) => a.date === dateFilter)
      : this.dailyAttendance;

    // Group by date
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
        case 'Late': // Generic late status
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

    // Calculate averages and rates
    statsMap.forEach((stats) => {
      const workingEmployees = stats.totalEmployees - stats.onLeave;
      if (workingEmployees > 0) {
        stats.punctualityRate = Math.round((stats.onTime / workingEmployees) * 100);
      }

      // Calculate average lateness
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

    // Calculate punctuality rates
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

      // Skip days off for stats calculation
      if (attendance.status === 'Legitimate Day Off') {
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

    // Calculate rates and averages
    statsMap.forEach((stats, key) => {
      if (stats.totalDays > 0) {
        stats.punctualityRate = Math.round((stats.onTimeDays / stats.totalDays) * 100);
      }

      // Calculate average lateness
      const lateRecords = this.dailyAttendance.filter(
        (a) =>
          (a.discordId || a.employeeName) === key &&
          a.minutesLate > 0 &&
          a.status !== 'Legitimate Day Off'
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
  processAll(): AttendanceData {
    this.processEmployees();
    this.processDailyAttendance();
    this.processLeaves();

    return {
      employees: this.employees,
      dailyAttendance: this.dailyAttendance,
      leaves: this.leaves,
      dailyStats: this.generateDailyStats(),
      departmentStats: this.generateDepartmentStats(),
      employeeStats: this.generateEmployeeStats(),
    };
  }

  /**
   * Get data with filters applied
   */
  getFilteredData(filters: {
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    department?: string;
    status?: AttendanceStatus | 'all';
  }): AttendanceData {
    let filteredAttendance = [...this.dailyAttendance];

    // Apply date filter
    if (filters.date) {
      filteredAttendance = filteredAttendance.filter((a) => a.date === filters.date);
    } else if (filters.dateFrom && filters.dateTo) {
      filteredAttendance = filteredAttendance.filter(
        (a) => a.date >= filters.dateFrom! && a.date <= filters.dateTo!
      );
    }

    // Apply department filter
    if (filters.department && filters.department !== 'all') {
      filteredAttendance = filteredAttendance.filter(
        (a) => a.department === filters.department
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filteredAttendance = filteredAttendance.filter((a) => a.status === filters.status);
    }

    // Return filtered data with recalculated stats
    return {
      employees: this.employees,
      dailyAttendance: filteredAttendance,
      leaves: this.leaves,
      dailyStats: this.generateDailyStats(filters.date),
      departmentStats: this.generateDepartmentStats(),
      employeeStats: this.generateEmployeeStats(),
    };
  }
}

/**
 * Helper function to process Excel file and return data
 */
export function processAttendanceFile(filePath: string): AttendanceData {
  const processor = new AttendanceDataProcessor();
  processor.readExcelFile(filePath);
  return processor.processAll();
}

/**
 * Helper function to process Excel buffer and return data
 */
export function processAttendanceBuffer(buffer: Buffer): AttendanceData {
  const processor = new AttendanceDataProcessor();
  processor.readExcelBuffer(buffer);
  return processor.processAll();
}

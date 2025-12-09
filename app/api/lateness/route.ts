import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { LatenessRecord } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      return NextResponse.json(
        {
          error: 'Missing Google Sheets credentials',
          message:
            'Please check your environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID)',
        },
        { status: 500 },
      );
    }

    const auth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo();

    // Try different case variants for Daily_Lateness tab
    let sheet =
      doc.sheetsByTitle['Daily_Lateness'] ||
      doc.sheetsByTitle['daily_lateness'] ||
      doc.sheetsByTitle['DAILY_LATENESS'] ||
      doc.sheetsByTitle['Daily Lateness'];

    if (!sheet) {
      const availableSheets = Object.keys(doc.sheetsByTitle);
      return NextResponse.json(
        {
          error: 'Sheet "Daily_Lateness" not found',
          message:
            'Please ensure your Google Sheet has a tab named "Daily_Lateness" (case-sensitive)',
          availableSheets,
        },
        { status: 404 },
      );
    }

    // Load headers FIRST before getting rows - this is critical for column name mapping
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues || [];
    console.log('📋 Daily_Lateness Sheet Headers:', headers);

    const rows = await sheet.getRows();

    // Debug: Log first row to identify column names
    if (rows.length > 0) {
      try {
        const firstRow = rows[0];
        // Try to get first row as object
        const firstRowObj = typeof firstRow.toObject === 'function' ? firstRow.toObject() : firstRow;
        console.log('📋 First Row Keys:', Object.keys(firstRowObj));
        console.log('📋 First Row Data:', firstRowObj);
      } catch (e) {
        console.warn('Failed to log first row:', e);
      }
    }

    const records: LatenessRecord[] = rows.map((row: any, index: number) => {
      const getCell = (...keys: string[]): any => {
        for (const key of keys) {
          // Try row.get() method first (case-sensitive)
          try {
            const viaGet = typeof row.get === 'function' ? row.get(key) : undefined;
            if (viaGet !== undefined && viaGet !== null && viaGet !== '') return viaGet;
          } catch (e) {
            // Ignore errors from row.get()
          }
          
          // Try direct property access (case-sensitive)
          if (row && Object.prototype.hasOwnProperty.call(row, key)) {
            const direct = (row as any)[key];
            if (direct !== undefined && direct !== null && direct !== '') return direct;
          }
          
          // Try case-insensitive property access
          if (row && typeof row === 'object') {
            const lowerKey = key.toLowerCase().trim();
            for (const prop in row) {
              if (prop && prop.toLowerCase().trim() === lowerKey) {
                const value = (row as any)[prop];
                if (value !== undefined && value !== null && value !== '') return value;
              }
            }
          }
          
          // Try accessing via toObject() if available
          try {
            if (typeof row.toObject === 'function') {
              const rowObj = row.toObject();
              if (rowObj && Object.prototype.hasOwnProperty.call(rowObj, key)) {
                const value = rowObj[key];
                if (value !== undefined && value !== null && value !== '') return value;
              }
              // Case-insensitive search in object
              const lowerKey = key.toLowerCase().trim();
              for (const prop in rowObj) {
                if (prop && prop.toLowerCase().trim() === lowerKey) {
                  const value = rowObj[prop];
                  if (value !== undefined && value !== null && value !== '') return value;
                }
              }
            }
          } catch (e) {
            // Ignore errors
          }
        }
        return '';
      };

      const rawStatus = (getCell('Status', 'Lateness Status', 'LATE/ABSENT', 'Late Status') || '').toString();
      const joinTime = (getCell('Join Time', 'JoinTime', 'Join_Time') || '').toString();
      const checkResult = (getCell('Check Result', 'Result', 'Check_Result') || '').toString();

      // Derive minutes late from checkResult when possible, e.g. "+431 min late"
      let minutesLate: number | null = null;
      const match = checkResult.match(/([+-]?\d+)\s*min/i);
      if (match) {
        const parsed = Number(match[1]);
        minutesLate = Number.isNaN(parsed) ? null : parsed;
      }

      let status = rawStatus.trim();
      const upper = status.toUpperCase();
      if (!status) {
        if (!joinTime && !checkResult) {
          status = 'Absent';
        } else if (minutesLate !== null && minutesLate > 0) {
          status = 'Late';
        } else {
          status = 'On Time';
        }
      } else if (upper.includes('ABSENT')) {
        status = 'Absent';
      } else if (upper.includes('LATE')) {
        status = 'Late';
      } else if (upper.includes('ON TIME') || upper.includes('ONTIME')) {
        status = 'On Time';
      }

      // Try multiple variations for employee name
      let employeeName = getCell('Employee', 'Employee Name', 'Name', 'EMPLOYEE', 'employee', 'employee name');
      
      // If still not found, try to find any column containing "employee" or "name"
      if (!employeeName) {
        try {
          const rowObj = typeof row.toObject === 'function' ? row.toObject() : row;
          for (const key in rowObj) {
            const lowerKey = key.toLowerCase();
            if ((lowerKey.includes('employee') || lowerKey.includes('name')) && 
                !lowerKey.includes('status') && 
                !lowerKey.includes('time') &&
                !lowerKey.includes('date') &&
                !lowerKey.includes('department') &&
                !lowerKey.includes('profession')) {
              const value = (rowObj as any)[key];
              if (value && value.toString().trim()) {
                if (index === 0) {
                  console.log(`🔍 Found potential employee name column: "${key}" = "${value}"`);
                }
                employeeName = value.toString();
                break;
              }
            }
          }
        } catch (e) {
          // Ignore
        }
      }
      
      // Debug first row to see what we're getting
      if (index === 0) {
        try {
          const rowObj = typeof row.toObject === 'function' ? row.toObject() : row;
          console.log('🔍 First row employee name lookup:', {
            'Trying "Employee":': row.get ? row.get('Employee') : (rowObj as any).Employee,
            'Trying "Employee Name":': row.get ? row.get('Employee Name') : (rowObj as any)['Employee Name'],
            'Trying "Name":': row.get ? row.get('Name') : (rowObj as any).Name,
            'Found value': employeeName,
            'All row keys': Object.keys(rowObj),
            'All headers': headers,
          });
        } catch (e) {
          console.warn('Failed to debug:', e);
        }
      }

      const record: LatenessRecord = {
        date: (getCell('Date', 'DATE', 'date') || '').toString(),
        name: employeeName.toString(),
        department: (getCell('Department', 'DEPARTMENT', 'department') || '').toString(),
        profession: (getCell('Profession', 'Role', 'PROFESSION', 'profession') || '').toString(),
        status,
        employeeStatus: (getCell('Employee Status', 'Current Status', 'Status', 'EMPLOYEE STATUS') || '').toString(),
        joinTime,
        checkResult,
        minutesLate,
      };

      return record;
    });

    // Sort newest date first when possible
    const parseDate = (dateStr: string | undefined): number => {
      if (!dateStr) return 0;
      const ts = Date.parse(dateStr);
      return Number.isNaN(ts) ? 0 : ts;
    };

    records.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching lateness data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch lateness data',
        message: errorMessage,
        hint: 'Check if the Daily_Lateness tab exists and the service account has access',
      },
      { status: 500 },
    );
  }
}



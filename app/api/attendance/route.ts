import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { AttendanceDataProcessor } from '@/lib/data-processor';
import type { ApiResponse, AttendanceData, AttendanceFilters } from '@/types';

// Path to the Excel file
const EXCEL_FILE_PATH = path.join(
  process.cwd(),
  '..',
  'Voice_listener_log.xlsx'
);

/**
 * GET /api/attendance
 * Returns attendance data with optional filters
 *
 * Query parameters:
 * - date: specific date (YYYY-MM-DD)
 * - dateFrom: start date range
 * - dateTo: end date range
 * - department: filter by department
 * - status: filter by attendance status
 */
export async function GET(request: NextRequest) {
  try {
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Excel file not found at ${EXCEL_FILE_PATH}`,
        },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: AttendanceFilters = {
      date: searchParams.get('date') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      department: searchParams.get('department') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      shift: (searchParams.get('shift') as any) || undefined,
    };

    // Process the Excel file
    const processor = new AttendanceDataProcessor();
    processor.readExcelFile(EXCEL_FILE_PATH);
    processor.processEmployees();
    processor.processDailyAttendance();
    processor.processLeaves();

    // Get filtered data
    const data = processor.getFilteredData(filters);

    // Return response
    return NextResponse.json<ApiResponse<AttendanceData>>(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error processing attendance data:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/refresh
 * Manually trigger data refresh (for future use)
 */
export async function POST(request: NextRequest) {
  try {
    // This endpoint could be used to manually trigger data refresh
    // or to upload a new Excel file in the future

    return NextResponse.json<ApiResponse<{ message: string }>>(
      {
        success: true,
        data: { message: 'Data refresh triggered' },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

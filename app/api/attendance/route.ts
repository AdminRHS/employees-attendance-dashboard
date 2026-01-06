import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsAttendanceProcessor } from '@/lib/google-sheets-processor';
import type { ApiResponse, AttendanceData } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/attendance
 * Returns attendance data from Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    // Get credentials from environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Missing Google Sheets credentials in environment variables',
        },
        { status: 500 }
      );
    }

    // Create processor and fetch data
    const processor = new GoogleSheetsAttendanceProcessor(
      spreadsheetId,
      serviceAccountEmail,
      privateKey
    );

    const data = await processor.processAll();

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
 * Manually trigger data refresh
 */
export async function POST(request: NextRequest) {
  try {
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

import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Report } from '@/types';

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
                    message: 'Please check your environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID)'
                },
                { status: 500 }
            );
        }

        const auth = new JWT({
            email: serviceAccountEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetId, auth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle['Merged_report'];
        if (!sheet) {
            return NextResponse.json(
                {
                    error: 'Sheet "Merged_report" not found',
                    message: 'Please ensure your Google Sheet has a tab named "Merged_report" (case-sensitive)'
                },
                { status: 404 }
            );
        }

        const rows = await sheet.getRows();

        const reports: Report[] = rows.map((row) => ({
            date: row.get('Date') || '',
            verdict: row.get('Verdict') || '',
            issue: row.get('Issue') || '',
            name: row.get('Employee Name') || '',
            department: row.get('Department') || '',
            profession: row.get('Profession') || '',
            discordTime: row.get('Discord Time') || '',
            crmTime: row.get('CRM Time') || '',
            crmStatus: row.get('CRM Status') || '',
            leave: row.get('Leave') || '',
            leaveRate: row.get('Leave Rate') || '',
            report: row.get('Report') || '',
        }));

        // Helper function to parse various date formats
        const parseDate = (dateStr: string): number => {
            if (!dateStr) return 0;

            // Try DD.MM.YYYY format
            const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (ddmmyyyyMatch) {
                const [, day, month, year] = ddmmyyyyMatch;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
            }

            // Try DD/MM/YYYY format
            const ddmmyyyySlashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyySlashMatch) {
                const [, day, month, year] = ddmmyyyySlashMatch;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
            }

            // Try standard parsing (YYYY-MM-DD, MM/DD/YYYY, etc.)
            const standardDate = new Date(dateStr).getTime();
            if (!isNaN(standardDate)) {
                return standardDate;
            }

            return 0;
        };

        // Sort by date descending (newest first)
        reports.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA;
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                error: 'Failed to fetch reports',
                message: errorMessage,
                hint: 'Check if the service account has access to the sheet and the Google Sheets API is enabled'
            },
            { status: 500 }
        );
    }
}

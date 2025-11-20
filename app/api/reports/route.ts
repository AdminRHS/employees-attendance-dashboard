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
                { error: 'Missing Google Sheets credentials' },
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
                { error: 'Sheet "Merged_report" not found' },
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

        // Sort by date descending (newest first)
        // Assuming date format allows string sorting or is ISO. 
        // If format is DD.MM.YYYY or similar, might need parsing. 
        // For now, simple string sort or assuming ISO/sortable.
        // Let's try to parse if possible, but string sort is safer if format unknown.
        // User didn't specify format. I'll stick to simple reverse for now or just return as is if order in sheet is important.
        // Prompt said: "Sort the data by date descending (newest first)."
        // I'll try to parse Date.

        reports.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA;
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}

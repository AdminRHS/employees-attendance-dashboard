# HR Analytics Dashboard

A modern, real-time HR analytics dashboard built with Next.js 14, powered by Google Sheets as a database. This dashboard provides comprehensive insights into employee attendance, suspicious activity detection, and leave management.

## Features

### Current MVP Features
- **Real-time Data Sync** - Fetches data from Google Sheets via API
- **KPI Cards** - Total records, suspicious activity, official leaves, check required
- **Advanced Data Table** - Sortable, searchable, with color-coded verdicts
- **Manual Refresh** - Update data on-demand without page reload
- **Pagination** - Handle large datasets efficiently (10/20/50 records per page)
- **CSV Export** - Download filtered data for offline analysis
- **Date Range Filtering** - Filter records by custom date ranges
- **Analytics Charts** - Visualize trends and patterns:
  - Trend chart: Daily verdict distribution
  - Bar chart: Department-wise suspicious activity
  - Pie chart: Overall verdict breakdown
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - User-friendly feedback for actions

### Upcoming Features
- Calendar view with detailed logs
- Enhanced visual design
- Advanced analytics and insights
- Custom reporting tools

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Tremor](https://www.tremor.so/) v3.16+ for charts and cards
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: Google Sheets API via `google-spreadsheet` library
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or higher
- npm or yarn package manager
- A Google Cloud Platform account
- A Google Sheets spreadsheet with HR data

## Google Sheets Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `hr-dashboard` (or any name you prefer)
   - Role: Select "Editor" or create a custom role
4. Click "Done"

### 3. Generate a Private Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the JSON file (keep it secure!)

### 4. Share Your Google Sheet

1. Open your Google Sheets document
2. Click "Share" in the top right
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it "Editor" permissions

### 5. Prepare Your Spreadsheet

Your Google Sheet must have a tab named **`Merged_Report`** with these exact column headers:

| Date | Verdict | Issue | Employee Name | Department | Profession | Discord Time | CRM Time | CRM Status | Leave | Leave Rate | Report |
|------|---------|-------|---------------|------------|------------|--------------|----------|------------|-------|------------|--------|

**Supported Date Formats:**
- DD.MM.YYYY (e.g., 20.11.2025)
- DD/MM/YYYY (e.g., 20/11/2025)
- YYYY-MM-DD (e.g., 2025-11-20)
- MM/DD/YYYY (e.g., 11/20/2025)

**Verdict Values:**
- `🚨 SUSPICIOUS` - Red badge, requires immediate attention
- `❓ CHECK CRM` - Yellow badge, manual verification needed
- `✅ OK` - Green badge, all clear
- `🏖️ LEAVE` or `HALF DAY` - Blue badge, official leave

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AdminRHS/employees-attendance-dashboard.git
cd employees-attendance-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in your Google credentials:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id_here
```

**Finding your Spreadsheet ID:**
From your Google Sheets URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

**Important:**
- Keep the `\n` characters in the private key
- The private key must be wrapped in double quotes
- Never commit `.env.local` to version control

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub (see instructions below)

2. Go to [Vercel](https://vercel.com/) and sign in

3. Click "New Project" and import your GitHub repository

4. Configure Environment Variables in Vercel:
   - Go to "Settings" > "Environment Variables"
   - Add all three variables from your `.env.local` file:
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `GOOGLE_SHEET_ID`

5. Deploy! Vercel will automatically build and deploy your app

6. Your dashboard will be live at `https://your-project.vercel.app`

### Pushing to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: HR Analytics Dashboard MVP"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/AdminRHS/employees-attendance-dashboard.git

# Push to GitHub
git push -u origin main
```

**Note:** If you encounter authentication issues, you may need to:
1. Generate a Personal Access Token (PAT) on GitHub
2. Use the token as your password when pushing

## Project Structure

```
hr-dashboard/
├── app/
│   ├── api/
│   │   └── reports/
│   │       └── route.ts        # Google Sheets API endpoint
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard page
├── types/
│   └── index.ts                # TypeScript type definitions
├── .env.local                  # Environment variables (not in git)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
└── README.md                   # This file
```

## Usage

### Dashboard Overview

**KPI Cards (Top Section):**
- **Total Records**: Shows the total number of employee records
- **Suspicious Activity**: Count of records flagged as suspicious
- **Official Leaves**: Count of approved leaves and half-days
- **Check Required**: Count of records needing manual verification

**Main Data Table:**
- **Search**: Filter by employee name, department, or profession
- **Date Filter**: Select a date range to view specific periods
- **Pagination**: Navigate through large datasets
- **CSV Export**: Download the current view as a CSV file
- **Refresh**: Manually update data from Google Sheets

**Analytics Charts:**
- **Trend Chart**: Daily distribution of verdicts over time
- **Department Bar Chart**: Which departments have the most suspicious activity
- **Verdict Pie Chart**: Overall breakdown of all verdict types

## Troubleshooting

### "Failed to fetch data" Error

**Possible causes:**
1. Google Sheets API not enabled
2. Service account doesn't have access to the sheet
3. Incorrect credentials in `.env.local`
4. Wrong spreadsheet ID
5. Sheet tab is not named `Merged_Report`

**Solutions:**
1. Check your Google Cloud Console to ensure API is enabled
2. Verify the service account email has Editor access to the sheet
3. Double-check your environment variables
4. Verify the spreadsheet ID in your `.env.local`
5. Rename your sheet tab to exactly `Merged_Report`

### Date Sorting Not Working

The dashboard supports multiple date formats. If dates aren't sorting correctly:
1. Ensure your dates follow one of the supported formats
2. Check that the "Date" column header is spelled exactly as shown
3. Verify there are no empty date cells

### Charts Not Displaying

If analytics charts aren't showing:
1. Ensure you have data in your sheet
2. Check browser console for errors
3. Verify Tremor components are properly installed: `npm install @tremor/react`

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Security

- **Never commit** `.env.local` or any file containing your Google Service Account credentials
- The `.gitignore` file is configured to exclude sensitive files
- When deploying, always use environment variables in your hosting platform
- Regularly rotate your service account keys
- Monitor your Google Cloud Console for unusual API usage

## Contributing

This is a private project, but if you have suggestions or find bugs:
1. Create an issue describing the problem
2. If you have a fix, fork the repo and submit a pull request

## License

Private - All Rights Reserved

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review the [Next.js documentation](https://nextjs.org/docs)
- Review the [Google Sheets API documentation](https://developers.google.com/sheets/api)
- Review the [Tremor documentation](https://www.tremor.so/docs)

---

**Built with ❤️ for Remote Helpers by AdminRHS**

Last Updated: November 2025

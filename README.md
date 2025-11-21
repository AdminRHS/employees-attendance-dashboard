# 🎮 HR Analytics Dashboard - Gamified Edition v2.1

A modern, gamified HR analytics dashboard built with Next.js 14, powered by Google Sheets as a database. Transform HR data into an engaging experience with dark theme, interactive charts, and beautiful visualizations.

## ✨ Features

### 🎯 Gamification & UI
- **🌙 Dark Theme** - Toggle between light and dark modes with smooth transitions
- **📑 Tab Navigation** - Three organized tabs: Overview, Calendar, and Leaderboard
- **🏆 Leaderboard** - Top performers with medals and rankings
- **🔥 Streak Counters** - Track consecutive perfect days
- **🎖️ Achievement Badges** - Visual status indicators
- **📊 Progress Bars** - Productivity scores and goal tracking
- **✨ Smooth Animations** - Engaging Framer Motion transitions

### 📊 Analytics & Visualizations
- **Department Performance** - Stacked bar chart showing verdict distribution by department
- **Profession Performance** - Top 10 most active roles with grouped bars
- **CRM Status Distribution** - Donut chart of Active/No CRM Data/No Records
- **Attendance Heatmap** - GitHub-style calendar visualization (6 months)
- **Interactive Charts** - Built with Recharts for responsive, beautiful visualizations

### 📅 Calendar Features
- **Visual Calendar** - Full month view with selectable dates
- **Yesterday Default** - Automatically shows previous day's data
- **Multi-Level Filters** - Filter by Verdict, Department, and Profession
- **Unique Employees** - Shows one card per employee (no duplicates)
- **Daily Statistics** - Sidebar with real-time stats for selected date

### 📈 Core Features
- **Real-time Data Sync** - Fetches data from Google Sheets API
- **Gradient KPI Cards** - Beautiful stats showing yesterday's metrics
- **Employee Card Grid** - Engaging profile cards with animations
- **Manual Refresh** - Update data on-demand without reload
- **Team Analytics** - Performance metrics and attendance rates
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Loading States** - Animated loaders for better UX

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Modern, customizable components
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) - Perfect dark mode
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Smooth transitions
- **Calendar**: [@uiw/react-heat-map](https://uiwjs.github.io/react-heat-map/) - GitHub-style heatmap
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon library
- **Backend**: Google Sheets API via `google-spreadsheet`
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Google Cloud Platform account
- Google Sheets spreadsheet with HR data

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/AdminRHS/employees-attendance-dashboard.git
cd employees-attendance-dashboard
npm install
```

### 2. Google Sheets Setup

#### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project and enable **Google Sheets API**
3. Create Service Account with Editor role
4. Download JSON credentials file
5. Share your Google Sheet with the service account email

#### Spreadsheet Requirements

Your sheet must have a tab named **`Merged_Report`** with these columns:

| Date | Verdict | Issue | Employee Name | Department | Profession | Discord Time | CRM Time | CRM Status | Current Status | Leave | Leave Rate | Report |
|------|---------|-------|---------------|------------|------------|--------------|----------|------------|----------------|-------|------------|--------|

**Supported Date Formats:**
- DD.MM.YYYY (20.11.2025)
- DD/MM/YYYY (20/11/2025)
- YYYY-MM-DD (2025-11-20)
- MM/DD/YYYY (11/20/2025)

**Verdict Values:**
- `🚨 SUSPICIOUS` - Requires attention
- `❓ CHECK CRM` - Manual verification
- `✅ OK` - All clear
- `📦 PROJECT` - External project work
- `🏖️ LEAVE` - Official leave
- `🌗 HALF DAY` - Half day leave

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id
```

**Finding Spreadsheet ID:** From URL `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Dashboard Guide

### Overview Tab

**Top KPI Cards** (showing yesterday's data):
- **Total Employees** - Unique employee count
- **Performance Score** - Percentage of OK + PROJECT verdicts
- **Team Streak** - Consecutive days with no critical issues
- **Attendance Rate** - Percentage of working days

**Secondary Stats** (yesterday's data):
- **Suspicious Activity** - Click to filter Calendar tab
- **Check Required** - Needs manual verification
- **Project Work** - External projects
- **All Clear** - Perfect records

**Analytics Charts:**
- **Attendance Heatmap** - 6-month GitHub-style calendar
- **Department Performance** - Verdict distribution by department
- **CRM Status Distribution** - Tracking status pie chart
- **Profession Performance** - Top 10 most active roles

### Calendar Tab

- **Visual Calendar** - Click any date to view employees
- **Date Filters** - Defaults to yesterday
- **Verdict Filters** - All, OK, Suspicious, Check, Project
- **Department Filters** - Filter by team
- **Profession Filters** - Filter by role
- **Daily Stats** - Sidebar showing selected date metrics
- **Unique Display** - One card per employee (no duplicates)

### Leaderboard Tab

- **Top 5 Performers** - Ranked by OK percentage
- **Medals** - 🥇 🥈 🥉 for top 3
- **Score** - Perfect day percentage
- **Department & Profession** - Team and role info

### Dark Theme

- Click the **Sun/Moon icon** in the header
- Seamless transition between themes
- Preference saved in localStorage
- All components fully themed

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type checking
```

### Project Structure

```
hr-dashboard/
├── app/
│   ├── api/reports/route.ts    # Google Sheets API
│   ├── globals.css             # Global styles + dark mode
│   ├── layout.tsx              # Root layout with ThemeProvider
│   └── page.tsx                # Main dashboard with tabs
├── components/
│   ├── charts/                 # Analytics chart components
│   │   ├── crm-status-distribution.tsx
│   │   ├── department-performance.tsx
│   │   └── profession-performance.tsx
│   ├── ui/                     # shadcn/ui components
│   ├── attendance-heatmap.tsx  # 6-month calendar
│   ├── dashboard-tabs.tsx      # Tab navigation
│   ├── employee-card.tsx       # Employee card component
│   ├── team-activity-calendar.tsx  # Calendar tab
│   ├── theme-provider.tsx      # next-themes wrapper
│   └── theme-toggle.tsx        # Dark mode button
├── types/index.ts              # TypeScript definitions
├── .env.local                  # Environment variables
└── README.md                   # This file
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub:**

```bash
git add .
git commit -m "Your message"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all three vars from `.env.local`:
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `GOOGLE_SHEET_ID`

4. **Deploy:** Vercel builds and deploys automatically

5. **Live URL:** `https://your-project.vercel.app`

### Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

## 🔒 Security

- ✅ `.env.local` excluded from Git
- ✅ Use environment variables in production
- ✅ Rotate service account keys regularly
- ✅ Monitor Google Cloud Console for unusual activity
- ✅ Keep dependencies updated: `npm audit`

## 🐛 Troubleshooting

### "Failed to fetch data"

**Causes:**
1. Google Sheets API not enabled
2. Service account lacks access
3. Wrong credentials in `.env.local`
4. Incorrect spreadsheet ID
5. Sheet tab not named `Merged_Report`

**Solutions:**
1. Enable API in Google Cloud Console
2. Share sheet with service account email
3. Double-check environment variables
4. Verify spreadsheet ID format
5. Rename tab to exactly `Merged_Report`

### Charts Not Displaying

1. Check browser console for errors
2. Verify data format in spreadsheet
3. Ensure recharts is installed: `npm install recharts`

### Dark Theme Issues

1. Clear browser cache and localStorage
2. Check that `next-themes` is installed
3. Verify ThemeProvider in layout.tsx

### Date Format Issues

- Use one of the supported formats consistently
- No empty date cells in spreadsheet
- Date column header must be exactly "Date"

## 📊 Data Format

### Report Object Structure

```typescript
interface Report {
  date: string              // YYYY-MM-DD format
  verdict: string           // Status verdict
  issue: string             // Issue description
  name: string              // Employee name
  department: string        // Department name
  profession: string        // Job title
  discordTime: string       // Discord hours (decimal)
  crmTime: string           // CRM hours (decimal)
  crmStatus: string         // Active, No CRM Data, No Records
  currentStatus: string     // Current work status
  leave: string             // Leave status
  leaveRate: string         // Leave percentage
  report: string            // Daily report text
}
```

## 🎨 Customization

### Change Theme Colors

Edit `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    /* ... more variables */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... dark mode variables */
  }
}
```

### Add New Charts

1. Create component in `components/charts/`
2. Use Recharts components
3. Import and add to Overview tab in `app/page.tsx`

### Modify Tab Content

Edit `app/page.tsx`:
- `overviewContent` - Overview tab
- `calendarContent` - Calendar tab
- `leaderboardContent` - Leaderboard tab

## 📝 Changelog

### v2.0.0 - November 2025
- 🌙 Added dark theme with toggle
- 📑 Implemented tab navigation
- 📊 Added 3 new analytics charts
- 📅 Enhanced calendar with visual date picker
- ✨ Yesterday's data in KPI cards
- 🎨 Full dark mode support
- 🐛 Fixed heatmap date format
- 📦 Added recharts and next-themes

### v1.0.0 - November 2025
- 🎮 Initial gamified dashboard
- 📊 Basic analytics and tables
- 🏆 Leaderboard feature
- 📈 Attendance heatmap
- ✅ Google Sheets integration

## 🤝 Contributing

This is a private project. For issues or suggestions, create an issue on GitHub.

## 📄 License

Private - All Rights Reserved

## 🙏 Support

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [next-themes](https://github.com/pacocoursey/next-themes)

---

**Built with ❤️ by AdminRHS for Remote Helpers**

**Live Dashboard:** https://hr-dashboard-cik7ikc6n-remote-helpers.vercel.app

Last Updated: November 21, 2025

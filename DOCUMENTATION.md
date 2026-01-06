# Discord Voice Attendance Dashboard - Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [Components](#components)
5. [API Endpoints](#api-endpoints)
6. [Data Processing](#data-processing)
7. [Development](#development)
8. [Deployment](#deployment)
9. [Migration Notes](#migration-notes)

---

## 🎯 Overview

This is a modernized attendance tracking dashboard that monitors employee punctuality based on Discord voice channel activity. The system automatically tracks when employees join voice channels and calculates lateness, generating comprehensive attendance reports.

### Key Features

- **Real-time Attendance Tracking**: Monitors Discord voice channel joins
- **Automated Lateness Detection**: Calculates minutes late based on expected arrival times
- **Department Analytics**: Performance metrics by department
- **Employee Leaderboards**: Top performers and those needing improvement
- **Interactive Filtering**: Filter by date, department, and status
- **Dark Mode Support**: Full theming with light/dark modes
- **Responsive Design**: Works on desktop, tablet, and mobile

### Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Data Processing**: xlsx, date-fns
- **Deployment**: Vercel

---

## 🏗️ Architecture

### Project Structure

```
hr-dashboard/
├── app/
│   ├── api/
│   │   └── attendance/
│   │       └── route.ts              # Main API endpoint
│   ├── globals.css                   # Global styles & theme
│   ├── layout.tsx                    # Root layout with providers
│   └── page.tsx                      # Main dashboard page
│
├── components/
│   ├── attendance/                   # Attendance-specific components
│   │   ├── attendance-card.tsx       # Employee attendance card
│   │   ├── attendance-filters.tsx    # Date/dept/status filters
│   │   ├── daily-stats-sidebar.tsx   # Daily statistics panel
│   │   └── status-badge.tsx          # Status indicator badges
│   │
│   ├── charts/                       # Data visualization
│   │   ├── department-punctuality-chart.tsx
│   │   └── lateness-distribution-chart.tsx
│   │
│   ├── leaderboard/                  # Ranking components
│   │   ├── top-performers.tsx        # Top 10 punctual employees
│   │   └── most-late.tsx             # Top 5 late employees
│   │
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── calendar.tsx
│   │   └── ...
│   │
│   ├── theme-provider.tsx            # next-themes wrapper
│   └── theme-toggle.tsx              # Dark mode toggle
│
├── lib/
│   ├── data-processor.ts             # Excel file processing
│   └── utils.ts                      # Utility functions
│
├── types/
│   └── index.ts                      # TypeScript definitions
│
├── scripts/
│   ├── test-processor.js             # Data processor tests
│   └── test-ts-processor.ts          # TypeScript tests
│
└── public/
    └── data/                         # Generated JSON data (future)
```

---

## 🔄 Data Flow

### 1. Data Collection (External)

Discord bot monitors voice channel activity and writes to Excel file:

```
Voice_listener_log.xlsx
├── Voice_Logs        # Raw JOIN/LEFT events
├── Employees         # Employee master data
├── Leaves            # Day off requests
└── Daily_Attendance  # Processed attendance records
```

### 2. Data Processing

```
Excel File → AttendanceDataProcessor → Structured Data
    ↓
    ├─ Parse dates (Excel serial numbers → YYYY-MM-DD)
    ├─ Parse times (0.333... → 08:00:00)
    ├─ Process employees, attendance, leaves
    └─ Generate statistics (daily, department, employee)
```

### 3. API Layer

```
GET /api/attendance
    ↓
    ├─ Read Excel file
    ├─ Process data
    ├─ Apply filters (optional)
    └─ Return JSON
```

### 4. Frontend Display

```
Dashboard Components
    ↓
    ├─ KPI Cards (overview metrics)
    ├─ Charts (visualizations)
    ├─ Employee Cards (detailed view)
    └─ Leaderboards (rankings)
```

---

## 🧩 Components

### Main Dashboard (`app/page.tsx`)

**Purpose**: Root component managing entire dashboard state and layout

**Key Features**:
- Tab navigation (Overview, Attendance, Leaderboard)
- Data fetching and state management
- Error and loading states
- Responsive layout

**State**:
```typescript
- data: AttendanceData | null          // All attendance data
- loading: boolean                     // Loading state
- error: string | null                 // Error message
- selectedDate: string                 // Filter: date
- selectedDepartment: string           // Filter: department
- selectedStatus: AttendanceStatus     // Filter: status
```

---

### Attendance Components

#### `AttendanceCard`

Displays individual employee attendance information.

**Props**:
```typescript
{
  attendance: DailyAttendance;         // Attendance record
  employee?: Employee;                 // Employee details
  index?: number;                      // Animation delay
}
```

**Visual Features**:
- Color-coded left border based on status
- Avatar with initials
- Department and profession info
- Arrival time display
- Minutes late indicator
- Notes section

**Status Colors**:
- 🟢 Green: On-time
- 🟡 Yellow: Late 1-15 min
- 🟠 Orange: Late 16-30 min
- 🔴 Red: Late >30 min
- 🔵 Blue: Day off
- 🟣 Purple: Unpaid day off
- ⚫ Gray: Absent

#### `AttendanceFilters`

Filter controls for attendance view.

**Props**:
```typescript
{
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedStatus: AttendanceStatus | 'all';
  onStatusChange: (status: AttendanceStatus | 'all') => void;
  departments: string[];
}
```

**Features**:
- Date picker with calendar
- Department dropdown
- Status dropdown
- Reset filters button

#### `DailyStatsSidebar`

Statistics panel for selected date.

**Props**:
```typescript
{
  stats: DailyStats | null;
  selectedDate: string;
}
```

**Displays**:
- Total employees
- On-time count
- Late counts (by category)
- On leave count
- Absent count
- Punctuality rate (%)
- Average lateness (minutes)

#### `StatusBadge`

Visual status indicator.

**Props**:
```typescript
{
  status: AttendanceStatus;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
}
```

**Variants**:
- `default`: Full status text with icon
- `compact`: Shortened text

---

### Chart Components

#### `DepartmentPunctualityChart`

Bar chart showing punctuality percentage by department.

**Props**:
```typescript
{
  data: DepartmentStats[];
}
```

**Features**:
- Color-coded bars (green = good, red = poor)
- Sorted by punctuality rate
- Interactive tooltips
- Responsive sizing

#### `LatenessDistributionChart`

Pie chart showing attendance status distribution.

**Props**:
```typescript
{
  stats: DailyStats[];
}
```

**Features**:
- Aggregates all daily stats
- Color-coded segments
- Percentage labels
- Interactive legend

---

### Leaderboard Components

#### `TopPerformers`

Displays top employees by punctuality.

**Props**:
```typescript
{
  performers: EmployeeStats[];
  limit?: number;                      // Default: 10
}
```

**Features**:
- Medal emojis for top 3 (🥇🥈🥉)
- Punctuality percentage
- Days on-time / total days
- Department and profession info
- Gradient avatars

#### `MostLate`

Shows employees with highest average lateness.

**Props**:
```typescript
{
  performers: EmployeeStats[];
  limit?: number;                      // Default: 5
}
```

**Features**:
- Severity-based coloring
- Average lateness in minutes
- Late days count
- Filtered to only show employees with lateness > 0

---

## 🔌 API Endpoints

### `GET /api/attendance`

Fetches attendance data from Excel file.

**Query Parameters** (all optional):
```
?date=2026-01-06              # Specific date (YYYY-MM-DD)
?dateFrom=2026-01-01          # Date range start
?dateTo=2026-01-31            # Date range end
?department=DGN               # Department filter
?status=On-time               # Status filter
?shift=Day                    # Shift filter
```

**Response**:
```typescript
{
  success: boolean;
  data?: {
    employees: Employee[];
    dailyAttendance: DailyAttendance[];
    leaves: Leave[];
    dailyStats: DailyStats[];
    departmentStats: DepartmentStats[];
    employeeStats: EmployeeStats[];
  };
  error?: string;
}
```

**Error Codes**:
- `404`: Excel file not found
- `500`: Processing error

---

## ⚙️ Data Processing

### `AttendanceDataProcessor` Class

Main class for processing Excel attendance data.

#### Methods

**`readExcelFile(filePath: string): void`**
- Reads Excel file from filesystem
- Loads workbook into memory

**`processEmployees(): Employee[]`**
- Processes "Employees" sheet
- Maps columns to Employee type
- Returns array of employees

**`processDailyAttendance(): DailyAttendance[]`**
- Processes "Daily_Attendance" sheet
- Converts Excel dates and times
- Maps to DailyAttendance type

**`processLeaves(): Leave[]`**
- Processes "Leaves" sheet
- Returns leave requests

**`generateDailyStats(dateFilter?: string): DailyStats[]`**
- Aggregates attendance by date
- Calculates punctuality rates
- Computes average lateness

**`generateDepartmentStats(): DepartmentStats[]`**
- Groups by department
- Calculates department metrics

**`generateEmployeeStats(): EmployeeStats[]`**
- Per-employee statistics
- Calculates individual punctuality rates
- Computes average lateness per employee

**`processAll(): AttendanceData`**
- Convenience method to process everything
- Returns complete dataset

---

### Date/Time Parsing

#### Excel Serial Numbers

Excel stores dates as numbers (days since 1899-12-30):
```typescript
// Date: 46028 → 2026-01-06
const excelEpoch = new Date(1899, 11, 30);
const date = new Date(excelEpoch.getTime() + dateValue * msPerDay);
```

#### Time Conversion

Excel stores times as fractions of a day:
```typescript
// Time: 0.333... → 08:00:00
const totalSeconds = timeValue * 24 * 60 * 60;
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
```

---

## 📊 Data Types

### Core Types

```typescript
interface Employee {
  id: number;
  name: string;
  discordId: string;
  hours: number;                       // Shift hours: 4 or 8
  department: string;
  profession: string;
  shift: 'Day' | 'Night';
  status: 'Work' | 'Available' | 'Sick' | 'Vacation';
}

interface DailyAttendance {
  uniqueId: string;                    // {date}_{employeeId}
  date: string;                        // YYYY-MM-DD
  employeeName: string;
  discordId: string;
  department: string;
  arrivalTime: string | null;          // HH:MM:SS or null
  minutesLate: number;
  status: AttendanceStatus;
  notes: string | null;
}

type AttendanceStatus =
  | 'On-time'
  | 'Late (1-15 min)'
  | 'Late (16-30 min)'
  | 'Late (>30 min)'
  | 'Late'
  | 'Legitimate Day Off'
  | 'Partial Day Off'
  | 'Unpaid Day Off'
  | 'Absent';

interface Leave {
  date: string;
  employeeId: number;
  employeeName: string;
  hours: number;
}
```

### Statistics Types

```typescript
interface DailyStats {
  date: string;
  totalEmployees: number;
  onTime: number;
  late1to15: number;
  late16to30: number;
  lateOver30: number;
  onLeave: number;
  absent: number;
  averageLateness: number;             // minutes
  punctualityRate: number;             // 0-100
}

interface DepartmentStats {
  department: string;
  totalEmployees: number;
  onTime: number;
  late: number;
  absent: number;
  punctualityRate: number;             // 0-100
}

interface EmployeeStats {
  employeeId: number;
  employeeName: string;
  department: string;
  profession: string;
  totalDays: number;
  onTimeDays: number;
  lateDays: number;
  absentDays: number;
  averageLateness: number;             // minutes
  punctualityRate: number;             // 0-100
}
```

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Excel file: `Voice_listener_log.xlsx` (in parent directory)

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing Data Processor

```bash
# JavaScript test
node scripts/test-processor.js

# TypeScript test
npx tsx scripts/test-ts-processor.ts
```

### Environment Variables

Not required for local development (Excel file is read directly from filesystem).

For production with different Excel file location, update:
```typescript
// app/api/attendance/route.ts
const EXCEL_FILE_PATH = path.join(process.cwd(), '..', 'Voice_listener_log.xlsx');
```

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Important**: Ensure Excel file is accessible to the deployment environment.

### Environment Considerations

The application expects `Voice_listener_log.xlsx` to be in the parent directory of the project root. For production:

1. Upload Excel file to deployment environment
2. Update `EXCEL_FILE_PATH` in `app/api/attendance/route.ts`
3. Or implement alternative data source (database, API)

---

## 📝 Migration Notes

### From v1 (CRM-based) to v2 (Discord-based)

**What Changed**:
- ❌ Removed all CRM data integration
- ❌ Removed Google Sheets API dependency
- ❌ Removed old verdict system
- ✅ Added Excel file processing
- ✅ New attendance status types
- ✅ Simplified data model
- ✅ Discord voice tracking focus

**Breaking Changes**:
- Old `Report` type replaced with `DailyAttendance`
- `/api/reports` endpoint removed (now `/api/attendance`)
- Different status values (see `AttendanceStatus`)
- New component architecture

**Old Files Preserved**:
All v1 files moved to `.backup/` folder:
- Old page versions
- CRM-related components
- Legacy charts
- Google Sheets integration

---

## 🎨 Customization

### Adding New Status Types

1. Update `AttendanceStatus` type in `types/index.ts`
2. Add color/icon config in `components/attendance/status-badge.tsx`
3. Update switch cases in `lib/data-processor.ts` (generateDailyStats)

### Adding New Charts

1. Create component in `components/charts/`
2. Use Recharts for consistency
3. Import and add to Overview tab in `app/page.tsx`

### Customizing Theme

Edit `app/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

---

## 🐛 Troubleshooting

### Excel File Not Found

**Error**: `Excel file not found at /path/to/file`

**Solution**:
1. Check file exists in parent directory
2. Verify file name is exactly `Voice_listener_log.xlsx`
3. Update path in `app/api/attendance/route.ts` if needed

### Build Errors

**Error**: Type errors during build

**Solution**:
1. Ensure all old components moved to `.backup/`
2. Run `npm install` to update dependencies
3. Check TypeScript version compatibility

### Data Not Displaying

**Checklist**:
- [ ] Excel file has required sheets (Employees, Daily_Attendance, Leaves)
- [ ] Column names match expected format
- [ ] Dates are in supported format
- [ ] Browser console shows no errors
- [ ] API endpoint returns data (`/api/attendance`)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

Private - All Rights Reserved

---

**Last Updated**: January 6, 2026
**Version**: 2.0.0
**Authors**: Remote Helpers Team

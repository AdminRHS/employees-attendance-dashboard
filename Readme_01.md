# HR Attendance & Performance Dashboard (Unified Status System)

A modern HR analytics dashboard for tracking daily attendance, hours, and report quality across remote teams.  
Built with **Next.js 14**, **React**, **Tailwind CSS**, and **framer-motion**, backed by **Google Sheets**.

---

## ✨ Key Features

- **Unified Status System**
  - Normalized statuses: **OK**, **Hours Problems**, **Report Problems**, **Total Problems**, **Inactive**, **Leave**, **Project** (internal only)
  - Status is computed from rate, CRM hours, Discord hours, and report validity
  - Consistent color mapping across cards, modals, filters, and stats

- **Overview Page**
  - **Summary KPIs**:
    - **Hours Rate** – % of employees who met target hours
    - **Report Rate** – % of employees with a valid markdown report
    - **Overall Performance** – % who meet both hours + report requirements
  - **Date Picker + Period Switcher**
    - Date picker to choose the **anchor day**
    - Range selector: **Day | Week | Month | All Time**
      - Day: metrics for the selected date
      - Week: Monday–Sunday week containing the selected date
      - Month: calendar month of the selected date
      - All Time: all available data
    - **Company-only metrics**: project employees are excluded from Overview stats
  - **Secondary cards** with quick “yesterday” filters (suspicious, check required, project, OK)
  - **Attendance Heatmap** and analytical charts:
    - Department performance
    - Profession performance
    - CRM status distribution

- **Team Activity Calendar (Day-Only)**
  - Dedicated **Company / Project** toggle (only on this page)
  - Own **calendar date picker** (`activityDate`) – always shows **one day**
  - **Filters**:
    - Status chips based on unified statuses:
      - All, OK, Hours Problems, Report Problems, Total Problems, Inactive, Leave
    - Department filter
    - Profession filter
  - **Employee cards**:
    - Unified status badge with consistent colors
    - Voice time (Discord), CRM time, productivity bar
    - Short issue/report preview and date footer
    - Clicking a card opens a **right-side drawer modal**

- **Employee Modal (Drawer)**
  - Right-side drawer (full screen on mobile, ~540–600px on desktop)
  - Header:
    - Avatar + name + profession + department
    - **Unified status badge**
  - Time section:
    - Discord Time
    - CRM Time
    - Total Hours
  - Activity sections:
    - Full CRM logs for the day
    - Full Discord/voice activity logs
  - Daily report:
    - Beautiful markdown rendering (headings, lists, code, links, emphasis)
  - Warnings:
    - Hours Problems → “Required hours not met”
    - Report Problems → “No report / report too short”
    - Total Problems → “Hours + report issues detected”
    - Inactive → “No activity in CRM or Discord”
    - No warnings for **Leave** or **Project**

- **Leaderboard**
  - Tab for top performers and “needs improvement” list
  - Rankings based on **OK vs. total reports**

---

## 🧠 Unified Status Logic

All statuses are derived from a single, consistent business rules engine in `lib/unified-status.ts`.

### Core Inputs

From each `Report` row:

- `rate` – numeric rate (0.5, 0.75, 1.0, 1.25, ...)
- `crmTime` – cleaned CRM hours (decimal)
- `discordTime` – total Discord voice hours
- `leave` / `leaveRate` – leave type and fraction
- `report` – markdown report text
- `isProject` / `employeeStatus` / `currentStatus` – project vs. company grouping

### Target Hours (Rate → Hours)

```ts
function getTargetHours(emp) {
  if (emp.name === "Iuliia K") return 4; // special rule

  switch (emp.rate) {
    case 1: return 8;
    case 0.5: return 4;
    case 0.75: return 6;
    case 1.25: return 10;
    default: return 8;
  }
}
```

### UnifiedStatus Values

```ts
type UnifiedStatus =
  | 'ok'
  | 'hoursProblems'
  | 'reportProblems'
  | 'totalProblems'
  | 'inactive'
  | 'leave'
  | 'project'; // used only internally; UI generally avoids showing this directly
```

### Priority Rules

1. **Leave**
2. **Inactive** (no CRM, no Discord, no leave)
3. **Total Problems**
4. **Hours Problems**
5. **Report Problems**
6. **OK**

Project employees are **treated like normal employees** (same validations), except:

- On the **Team Activity Calendar / Project tab**, we can apply simplified rules if needed
- Overview **excludes** project employees entirely from Company stats

---

## 🗂 State Separation

The dashboard deliberately avoids shared global state for filters between pages.

### Overview

Local state only:

```ts
const [summaryDate, setSummaryDate] = useState<Date>(getYesterday());
const [summaryRange, setSummaryRange] = useState<'day' | 'week' | 'month' | 'all'>('day');
```

- Used **only** to compute Overview metrics via `filterReportsByDateAndRange()`
- Does **not** affect Team Activity Calendar or Leaderboard

### Team Activity Calendar

Local state only:

```ts
const [selectedDate, setSelectedDate] = useState<Date | undefined>(getYesterday());
const [activeTab, setActiveTab] = useState<'company' | 'project'>('company');
const [verdictFilter, setVerdictFilter] = useState<string>('all');
const [departmentFilter, setDepartmentFilter] = useState<string>('all');
const [professionFilter, setProfessionFilter] = useState<string>('all');
```

- Controls **only** calendar-based daily view and filters
- Not influenced by Overview’s `summaryDate` or `summaryRange`

### Leaderboard

- Currently uses full data set (or easily adjustable)
- No date-dependency unless explicitly added later

---

## 🧮 Overview Metrics (Date + Range Aware)

For the Overview page:

1. Filter reports for **Company** employees only (exclude `isProject`).
2. Apply `summaryDate` and `summaryRange` via `filterReportsByDateAndRange()`.
3. Build per-employee aggregates with `buildEmployees()`.

Formulas:

```ts
hoursRate      = employeesMeetingHours  / companyEmployeesInRange * 100
reportRate     = employeesWithValidReport / companyEmployeesInRange * 100
overallRate    = employeesMeetingBoth / companyEmployeesInRange * 100
```

Where:

- `employeesMeetingHours` = employees whose total hours ≥ target
- `employeesWithValidReport` = employees with valid markdown reports
- `employeesMeetingBoth` = intersection of the two

---

## 🎛 Filters & UI Behavior

### Overview

- Date picker + range selector control **only**:
  - Hours Rate
  - Report Rate
  - Overall Performance
- Secondary cards (Suspicious, Check Required, Project Work, All Clear) still show **yesterday-based** quick counts and scroll the page to the Team Activity section when clicked.

### Team Activity Calendar

- **Company/Project** toggle lives **only** here.
- Filters:
  - Status: All, OK, Hours Problems, Report Problems, Total Problems, Inactive, Leave
  - Department
  - Profession
- Collapsible filter block with chevron and active filter count badge

---

## 🧩 Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**:
  - Tailwind CSS
  - shadcn/ui primitives (Tabs, Card, Badge, Popover, Calendar, etc.)
  - framer-motion for subtle animations
- **Data**:
  - `/api/reports` pulls data from Google Sheets into `Report` objects
  - Unified logic centralised in `lib/employee-logic.ts` and `lib/unified-status.ts`

---

## 📁 Key Files

- `app/page.tsx`  
  Main dashboard entry: header, Overview, Calendar tab, Leaderboard tab

- `components/team-activity-calendar.tsx`  
  Day-only calendar page, Company/Project tabs, filters, employee grid

- `components/employee-card.tsx`  
  Compact employee summary cards powered by unified status and metrics

- `components/employee-modal.tsx`  
  Right-side drawer with full details, logs, warnings, and markdown report

- `lib/employee-logic.ts`  
  Low-level parsing functions (time, rate, leave) and data helpers

- `lib/unified-status.ts`  
  Unified status type, status computation, badge configs, and helpers

---

## 🚀 Running the Project

```bash
pnpm install
pnpm dev
# or
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## ✅ Roadmap Ideas

- Add explicit **project-only** summary metrics tab (separate from Company)
- Introduce **multi-day** selection for Team Activity Calendar
- Deeper drill-down for each status type (per-department, per-role)
- Exportable CSV/Excel reports for HR audits
- Notification hooks when status escalates to Total Problems or repeated Inactive

---

This README is meant to sit **alongside** the existing one, focusing specifically on the **unified status system**, **date-aware Overview**, and **Team Activity Calendar** behavior without overwriting the original project README.



# HR Analytics Dashboard - Feature Plan 📊

## Current Data Overview

**Dataset Stats:**
- 📊 Total records: 204
- 👥 Unique employees: 73
- 📅 Date range: 2025-11-18 to 2025-11-20 (3 days)

**Available Data Fields:**
- 6 Departments (Designers, Developers, Managers, Marketers, Videographers)
- 18 Professions (Developers, Designers, Managers, etc.)
- 10 Verdict types (OK, SUSPICIOUS, CHECK CRM, PROJECT, etc.)
- 3 CRM Statuses (Active, No CRM Data, No Records)

---

## Proposed Tab Structure 🗂️

### Tab 1: Overview (Current Dashboard)
**Purpose:** High-level metrics and trends

**Keep existing:**
- ✅ Top KPI cards (Total Employees, Performance Score, Team Streak, Attendance Rate)
- ✅ Secondary stats (Suspicious, Check Required, Project Work, All Clear) - showing yesterday's data
- ✅ Leaderboard
- ✅ Attendance Heatmap

**Add new visualizations:**

#### 1. **Department Performance Breakdown** 📊
**Chart Type:** Horizontal Stacked Bar Chart
**Data:** Each department shows breakdown by verdict
- X-axis: Percentage (0-100%)
- Y-axis: Department names
- Colors: Green (OK), Orange (CHECK), Red (SUSPICIOUS), Purple (PROJECT), Blue (LEAVE)
- **Insight:** Which departments have the most issues vs perfect performance

#### 2. **Profession Performance Matrix** 🎯
**Chart Type:** Grouped Bar Chart
**Data:** Top 10 professions by activity count
- X-axis: Profession names
- Y-axis: Count of records
- Grouped bars: OK, Suspicious, Check, Project
- **Insight:** Which roles are most active and which need attention

#### 3. **CRM Status Distribution** 📈
**Chart Type:** Donut Chart
**Data:** Active vs No CRM Data vs No Records
- Show percentage for each status
- Total in center
- **Insight:** How many employees are properly tracked in CRM

#### 4. **Daily Trend Line** 📉
**Chart Type:** Multi-line Chart
**Data:** Last 7 days (when available)
- Lines: OK count, Suspicious count, Check count
- X-axis: Dates
- Y-axis: Count
- **Insight:** Are issues increasing or decreasing over time

---

### Tab 2: Calendar View 📅
**Purpose:** Detailed daily inspection with visual calendar

**Features:**
- ✅ Full visual calendar (already implemented)
- ✅ Yesterday's date selected by default
- ✅ Unique employees per date
- ✅ Multi-level filters (Verdict, Department, Profession)
- ✅ Daily stats sidebar

**Additional enhancements:**
- 📊 Mini bar chart showing verdict distribution for selected date
- 🎨 Color-coded dates in calendar:
  - Green border: 90%+ OK
  - Yellow border: 70-90% OK
  - Orange border: 50-70% OK
  - Red border: <50% OK

---

### Tab 3: Leaderboard 🏆
**Purpose:** Gamification and performance tracking

**Sections:**

#### 1. **Top Performers** (already exists)
- Top 5 employees by OK percentage
- Medals for 1st, 2nd, 3rd place
- Score and perfect day count

#### 2. **Department Rankings** 🏅
**Chart Type:** Leaderboard Table
- Rank departments by:
  - Average OK rate
  - Total employees
  - Suspicious rate
  - Response rate (reports submitted)

#### 3. **Profession Rankings** 💼
**Chart Type:** Leaderboard Table
- Rank professions by:
  - Average OK rate
  - Total professionals
  - Average working hours (Discord + CRM time)

#### 4. **Most Improved** 📈
**Chart Type:** Card Grid
- Show top 3 employees with biggest improvement week-over-week
- Delta indicator (↑ +15%)

#### 5. **Perfect Streaks** 🔥
**Chart Type:** Card Grid
- Employees with longest consecutive OK days
- Flame icon with day count

---

## CRM Status Analysis 💼

### Current CRM Status Values:
- **Active** - Employee is properly tracked
- **No CRM Data** - Employee missing from CRM
- **No Records** - Employee exists but no activity

### Proposed Visualizations:

#### 1. **CRM Status Overview Card**
**Type:** Info Card with Icon
- 🟢 Active: XX employees (XX%)
- 🟡 No CRM Data: XX employees (XX%)
- 🔴 No Records: XX employees (XX%)
- Click to filter by status

#### 2. **CRM Status by Department**
**Chart Type:** Stacked Column Chart
- X-axis: Departments
- Y-axis: Employee count
- Stack: Active, No CRM Data, No Records
- **Insight:** Which departments have CRM tracking issues

#### 3. **Employees Needing CRM Setup** ⚠️
**Type:** Alert List
- Table of employees with "No CRM Data" or "No Records"
- Columns: Name, Department, Profession, Status, Action button
- **Insight:** Actionable list for HR to fix

---

## Dark Theme Implementation 🌙

### Theme Toggle Button
**Location:** Top-right header (next to Refresh button)
**Icon:** Sun/Moon icon
**Persistence:** localStorage

### Color Scheme:

#### Light Mode (current)
- Background: Gradient from slate-50 via blue-50 to purple-50
- Cards: White
- Text: Gray-900/800
- KPI gradients: Current vibrant colors

#### Dark Mode (new)
- Background: Gradient from gray-900 via slate-900 to gray-900
- Cards: Gray-800/850
- Text: Gray-100/200
- KPI gradients: Darker versions with adjusted opacity
  - Blue: from-blue-600 to-blue-700
  - Green: from-green-600 to-emerald-700
  - Orange: from-orange-600 to-red-700
  - Purple: from-purple-600 to-pink-700

### Implementation:
- Use `next-themes` package for theme management
- Add `ThemeProvider` in layout
- Update Tailwind config for dark mode classes
- Add dark: prefix to all components

---

## Implementation Priority 🎯

### Phase 1: Quick Wins (30 min)
1. ✅ Fix CalendarIcon error
2. ✅ Show yesterday's stats in KPI cards
3. Add theme toggle and dark mode support

### Phase 2: Tab Structure (1 hour)
1. Create tab navigation component
2. Move existing content to "Overview" tab
3. Move calendar to "Calendar" tab
4. Move leaderboard to "Leaderboard" tab

### Phase 3: New Visualizations (2 hours)
1. Department Performance Breakdown (Overview)
2. Profession Performance Matrix (Overview)
3. CRM Status Distribution (Overview)
4. Enhanced calendar date colors (Calendar tab)
5. Department & Profession Rankings (Leaderboard tab)

### Phase 4: Advanced Features (1 hour)
1. Daily Trend Line (Overview)
2. Most Improved section (Leaderboard)
3. Perfect Streaks section (Leaderboard)
4. CRM Status by Department chart

---

## Recommended Libraries 📚

- **Tabs:** shadcn/ui Tabs component (already available)
- **Charts:** `recharts` (lightweight, React-friendly)
  - Bar charts
  - Line charts
  - Donut/Pie charts
- **Theme:** `next-themes` (Next.js optimized)
- **Icons:** lucide-react (already in use)

---

## Next Steps 🚀

Would you like me to:
1. Start with implementing the tab structure?
2. Add dark theme support first?
3. Begin with specific visualizations?
4. Do all in order?

Let me know your preference and I'll proceed! 💪

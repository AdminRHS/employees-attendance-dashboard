# Remote Helpers Dashboard - Chart Documentation

This document provides a comprehensive overview of all charts and metrics displayed on the Remote Helpers Dashboard, including their data sources, calculation logic, and interpretation guidelines.

---

## 1. Hours Rate Card

### Purpose
Shows the percentage of employees who have met their target hours for the selected period (day, week, month, or all-time).

### Data Source
- **CRM Time**: Time logged in the CRM system
- **Discord Time**: Time logged in Discord
- **Rate**: Employee's work rate (Rate 1 = 8 hours, Rate 0.5 = 4 hours, Rate 0.75 = 6 hours, Rate 1.25 = 10 hours)
- **Special Case**: "Iuliia K" has a fixed target of 4 hours regardless of rate

### Calculation Logic
1. For each employee, calculate total hours: `totalCrmHours = CRM Time + Discord Time`
2. Determine target hours based on employee's rate using `getTargetHours()` function
3. An employee "meets hours" if: `totalCrmHours >= targetHours - 0.1` (small tolerance for rounding)
4. Hours Rate = `(employees who met hours / total employees) × 100`

### Display
- **Percentage**: Large, color-coded (green ≥85%, yellow ≥60%, red <60%)
- **Count**: Shows "X/Y employees met hours"
- **Description**: "Percentage of employees who met their target hours (based on their rate: Rate 1 = 8h, Rate 0.5 = 4h, etc.)"

### Color Coding
- Green (≥85%): Excellent performance
- Yellow (60-84%): Needs improvement
- Red (<60%): Critical attention required

---

## 2. Report Rate Card

### Purpose
Shows the percentage of employees who have submitted valid reports for the selected period.

### Data Source
- **Report Field**: Employee's daily report submission
- **Validation**: Reports must be at least 40 characters long (after trimming whitespace)

### Calculation Logic
1. For each employee, check if report exists and is valid using `isReportValid()` function
2. A report is valid if:
   - Report field exists and is not empty
   - Trimmed report length ≥ 40 characters
3. Report Rate = `(employees with valid reports / total employees) × 100`

### Display
- **Percentage**: Large, color-coded (green ≥85%, yellow ≥60%, red <60%)
- **Count**: Shows "X/Y employees with valid reports"
- **Description**: "Percentage of employees who submitted a valid report (minimum 40 characters) for the selected period"

### Color Coding
- Green (≥85%): Excellent compliance
- Yellow (60-84%): Needs improvement
- Red (<60%): Critical attention required

---

## 3. Overall Performance Rate Card

### Purpose
Combines Hours Rate and Report Rate into a single performance metric showing employees who meet both requirements.

### Data Source
- **Hours Met**: From Hours Rate calculation
- **Report Valid**: From Report Rate calculation

### Calculation Logic
1. An employee has "overall performance" if they meet BOTH conditions:
   - Met their hours target (from Hours Rate)
   - Submitted a valid report (from Report Rate)
2. Overall Performance Rate = `(employees who met both / total employees) × 100`

### Display
- **Percentage**: Large, color-coded (green ≥85%, yellow ≥60%, red <60%)
- **Count**: Shows "X/Y employees with hours + report"
- **Description**: "Combined performance: employees who met both their hours target and submitted a valid report"

### Color Coding
- Green (≥85%): Excellent overall performance
- Yellow (60-84%): Needs improvement
- Red (<60%): Critical attention required

---

## 4. Hours Problems Card

### Purpose
Shows the count of employees who have hours-related issues (below target hours) for the selected date.

### Data Source
- **Status Counts**: From `getStatusCountsForDate()` function
- **Unified Status**: Uses 'hoursProblems' status type
- **Date Filter**: Only includes reports for the selected date

### Calculation Logic
1. Filter reports to selected date (company employees only, excludes project employees)
2. Group by employee and calculate unified status
3. Count employees with 'hoursProblems' status (low CRM/Discord time)
4. Display total count

### Display
- **Count**: Large number in orange
- **Date Badge**: Shows selected date or "Selected date" for week/month ranges
- **Description**: "Employees with hours below their target (low CRM/Discord time)"
- **Interactive**: Click to navigate to Calendar tab filtered by hours problems

---

## 5. Report Problems Card

### Purpose
Shows the count of employees who have report-related issues (missing or invalid reports) for the selected date.

### Data Source
- **Status Counts**: From `getStatusCountsForDate()` function
- **Unified Status**: Uses 'reportProblems' status type
- **Date Filter**: Only includes reports for the selected date

### Calculation Logic
1. Filter reports to selected date (company employees only)
2. Group by employee and calculate unified status
3. Count employees with 'reportProblems' status (missing or invalid reports)
4. Display total count

### Display
- **Count**: Large number in yellow
- **Date Badge**: Shows selected date or "Selected date" for week/month ranges
- **Description**: "Employees with missing or invalid reports (less than 40 characters)"
- **Interactive**: Click to navigate to Calendar tab filtered by report problems

---

## 6. Total Problems Card

### Purpose
Shows the total count of all problems (hours, reports, and other issues) across all employees for the selected date.

### Data Source
- **Status Counts**: From `getStatusCountsForDate()` function
- **Unified Status**: Uses 'totalProblems' status type
- **Date Filter**: Only includes reports for the selected date

### Calculation Logic
1. Filter reports to selected date (company employees only)
2. Group by employee and calculate unified status
3. Count employees with 'totalProblems' status (any type of issue)
4. Display total count

### Display
- **Count**: Large number in red
- **Date Badge**: Shows selected date or "Selected date" for week/month ranges
- **Description**: "Total issues flagged: low hours, missing reports, or inactive statuses"
- **Interactive**: Click to navigate to Calendar tab filtered by total problems

---

## 7. Leave Card

### Purpose
Shows the count of employees on leave (full day or half day) for the selected date.

### Data Source
- **Status Counts**: From `getStatusCountsForDate()` function
- **Unified Status**: Uses 'leave' status type
- **Leave Rate**: Employee's leave rate (≥1 = full day, >0 and <1 = half day)

### Calculation Logic
1. Filter reports to selected date (company employees only)
2. Check leave status using `isLeave()` function
3. Count employees with 'leave' status (full or half day)
4. Display total count

### Display
- **Count**: Large number in blue
- **Date Badge**: Shows selected date or "Selected date" for week/month ranges
- **Description**: "Employees on leave (full day or half day) for the selected date"
- **Interactive**: Click to navigate to Calendar tab filtered by leave status

---

## 8. Attendance Heatmap

### Purpose
Visual calendar showing daily attendance patterns and activity levels over the past 12 months.

### Data Source
- **Company Reports**: All reports filtered to exclude project employees
- **Date Aggregation**: Groups reports by date
- **Verdict Analysis**: Categorizes each day's reports by verdict (OK, CHECK, SUSPICIOUS, PROJECT)

### Calculation Logic
1. Filter reports to company employees only (exclude project employees)
2. Aggregate by date: count OK, CHECK, SUSPICIOUS, and PROJECT verdicts per day
3. Calculate performance ratio: `OK count / Total count` for each day
4. Assign activity level based on ratio:
   - **Level 4 (Excellent)**: 91-100% OK → Dark Blue (#1565C0)
   - **Level 3 (Good)**: 61-90% OK → Good Blue (#1E88E5)
   - **Level 2 (Medium)**: 21-60% OK → Moderate Blue (#42A5F5)
   - **Level 1 (Low)**: 1-20% OK → Light Blue (#90CAF9)
   - **Level 0 (No Activity)**: 0% OK or no records → Very Light Blue (#E3F2FD)

### Display
- **Visual**: GitHub-style contribution heatmap with 7 columns (Sun-Sat)
- **Colors**: Blue saturation scale indicating activity intensity
- **Navigation**: Previous/Next buttons to navigate through 12-month windows
- **Tooltips**: Hover over any day to see date, activity status, and verdict details
- **Description**: "Visual calendar showing daily attendance patterns. Color intensity indicates activity level. Hover over any day to see details."

### Interpretation
- **Darker blue**: More employees meeting targets that day
- **Lighter blue**: Fewer employees meeting targets or no activity
- **Patterns**: Look for streaks of dark blue (consistent performance) or light blue (potential issues)

---

## 9. Department Performance Chart

### Purpose
Shows how each department is performing based on verdict distribution (OK, Project, Check, Suspicious, Other).

### Data Source
- **Reports**: All reports with valid department (excludes '-' departments)
- **Verdicts**: OK, PROJECT, CHECK, SUSPICIOUS, or Other
- **Aggregation**: Groups by department and counts verdicts

### Calculation Logic
1. Filter reports to those with valid departments (not '-')
2. Group by department
3. Count verdicts per department:
   - OK: Reports containing 'OK'
   - Project: Reports containing 'PROJECT'
   - Check: Reports containing 'CHECK'
   - Suspicious: Reports containing 'SUSPICIOUS'
   - Other: All other verdicts
4. Calculate percentages: `(verdict count / total reports in department) × 100`
5. Sort departments by OK percentage (highest first)

### Display
- **Chart Type**: Horizontal stacked bar chart
- **X-Axis**: Percentage (0-100%)
- **Y-Axis**: Department names
- **Colors**: 
  - OK: Green (#22c55e)
  - Project: Purple (#a855f7)
  - Check: Yellow (#eab308)
  - Suspicious: Red (#ef4444)
  - Other: Gray (#94a3b8)
- **Tooltips**: Hover to see exact percentages for each status type and total
- **Description**: "Verdict distribution by department. Shows how each department is performing based on employee verdicts. Hover over bars to see detailed percentages."

### Interpretation
- **More green (OK)**: Department performing well
- **More yellow/red (Check/Suspicious)**: Department needs attention
- **Stacked bars**: Show relative distribution of statuses within each department

---

## 10. CRM Status Distribution Chart

### Purpose
Visualizes the distribution of employee CRM activity status (Active, No CRM Data, No Records).

### Data Source
- **Reports**: All reports with employee names
- **CRM Status**: Latest CRM status per employee (Active, No CRM Data, No Records)
- **Deduplication**: Uses most recent status per employee

### Calculation Logic
1. Create a map of unique employees with their latest CRM status
2. Count employees by status:
   - Active: Employees actively working in CRM
   - No CRM Data: Employees with missing CRM data
   - No Records: Employees with no CRM records
3. Calculate percentages: `(status count / total employees) × 100`

### Display
- **Chart Type**: Pie chart
- **Colors**:
  - Active: Green (#22c55e)
  - No CRM Data: Yellow (#eab308)
  - No Records: Red (#ef4444)
- **Labels**: Show status name, count, and percentage
- **Tooltips**: Hover to see detailed employee count and percentage
- **Description**: "Visualizes the distribution of employee CRM activity status. Shows the percentage of employees who are Active in the CRM system versus those with No CRM Data or No Records."

### Interpretation
- **Larger green segment**: More employees actively using CRM
- **Larger yellow/red segments**: More employees need CRM support or training
- **Balance**: Aim for high percentage of Active employees

---

## 11. Top 10 Professions Chart

### Purpose
Displays the most active professions ranked by total report count, showing performance breakdown by verdict type.

### Data Source
- **Reports**: All reports with valid profession (excludes '-' professions)
- **Verdicts**: OK, PROJECT, CHECK, SUSPICIOUS
- **Aggregation**: Groups by profession and counts verdicts

### Calculation Logic
1. Filter reports to those with valid professions (not '-')
2. Group by profession
3. Count verdicts per profession:
   - OK: Reports containing 'OK'
   - Project: Reports containing 'PROJECT'
   - Check: Reports containing 'CHECK'
   - Suspicious: Reports containing 'SUSPICIOUS'
4. Sort by total report count (highest first)
5. Take top 10 professions
6. Truncate profession names > 15 characters for display

### Display
- **Chart Type**: Vertical grouped bar chart
- **X-Axis**: Profession names (truncated if > 15 chars)
- **Y-Axis**: Number of reports
- **Colors**:
  - OK: Green (#22c55e)
  - Project: Purple (#a855f7)
  - Check: Yellow (#eab308)
  - Suspicious: Red (#ef4444)
- **Tooltips**: Hover to see exact counts, percentages, and total reports
- **Description**: "Displays the most active professions ranked by total report count. Shows how well different roles are performing based on verdicts. Hover for detailed counts and percentages."

### Interpretation
- **Taller bars**: More active profession (more reports)
- **More green (OK)**: Profession performing well
- **More yellow/red (Check/Suspicious)**: Profession needs attention
- **Comparison**: Compare performance across different roles

---

## Data Flow Summary

### Overview Metrics (Top Cards)
1. **Filter Reports**: By date range and exclude project employees
2. **Build Employees**: Aggregate reports by employee
3. **Calculate Metrics**: Hours met, reports valid, both met
4. **Display Rates**: Calculate percentages and display

### Status Counts (Secondary Cards)
1. **Filter Reports**: By selected date only
2. **Group by Employee**: Create employee aggregates
3. **Calculate Unified Status**: Determine status per employee
4. **Count by Status Type**: Aggregate counts for each status

### Charts
1. **Filter Reports**: By relevant criteria (department, profession, etc.)
2. **Aggregate Data**: Group and count by relevant dimension
3. **Calculate Percentages**: Where applicable
4. **Render Charts**: Using Recharts library with custom tooltips

---

## Color Scheme Consistency

All charts use consistent color coding:
- **OK/Success**: Green (#22c55e)
- **Warning/Check**: Yellow (#eab308)
- **Error/Suspicious**: Red (#ef4444)
- **Info/Project**: Purple (#a855f7)
- **Neutral/Other**: Gray (#94a3b8)

---

## Interactive Features

1. **Hover Tooltips**: All charts show detailed information on hover
2. **Click Navigation**: Status cards (Hours Problems, Report Problems, Total Problems, Leave) navigate to Calendar tab with filters
3. **Date Range Selection**: Overview metrics can be filtered by Day, Week, Month, or All Time
4. **Heatmap Navigation**: Previous/Next buttons to navigate through time periods

---

## Best Practices for Interpretation

1. **Look for Patterns**: Consistent colors across time indicate stable performance
2. **Compare Metrics**: Cross-reference Hours Rate, Report Rate, and Overall Performance
3. **Drill Down**: Click on problem cards to see specific employees
4. **Context Matters**: Consider date ranges and department/profession context
5. **Trend Analysis**: Use heatmap to identify trends over time

---

## Technical Notes

- All calculations exclude project employees from company metrics
- Date filtering uses `startOfDay` for consistency
- Employee grouping uses Discord ID when available, falls back to name
- Report validation requires minimum 40 characters
- Hours calculation includes small tolerance (0.1 hours) for rounding


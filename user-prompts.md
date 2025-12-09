Please fix this error:

**Error in app/globals.css:**
- **Line 377:** Unknown at rule @apply
- **Severity:** Warning
- **Code:** unknownAtRules

Provide a solution that resolves this issue. @globals.css 




@page.tsx (153-167) 


explain the algorithm here step by step



You are tasked with **re-designing** the **Remote Helpers Dashboard** to **improve the visual design and overall user experience** while maintaining its current structure and functionality. Focus on **interface layout**, **spacing**, **font sizes**, **card alignment**, and **interaction flow**.

### 1. **General Layout Improvements**
- **Goal**: Make the layout more **clean**, **modern**, and **intuitive**.
- **Solution**:
  - Use **consistent grid** and **flex layouts** to ensure spacing and alignment are balanced.
  - Make use of **white space** effectively around sections to prevent the page from feeling cramped.
  - Place important metrics like **Overall Performance Rate**, **Report Rate**, etc., in a **horizontal layout** for better flow and a clearer hierarchy.
  - Place the **heatmap** and **department performance** graph **below the top metrics**, ensuring they don’t feel disconnected from the rest of the page.
  - Move the **Top 10 Professions** chart below the **Department Performance** section to group related data.

  Example Layout:
  - **Top Section**: Summary cards (Hours Rate, Report Rate, etc.)
  - **Middle Section**: Heatmap + Department Performance
  - **Bottom Section**: Top 10 Professions + CRM Status Distribution

---

### 2. **Employee Metrics Cards (Hours Rate, Report Rate, Overall Performance, etc.)**
- **Goal**: Enhance visibility and clarity of key metrics.
- **Solution**:
  - The **summary cards** should be **cleaner and larger** to make key metrics more prominent.
  - Use **rounded corners** (8px) and a **soft shadow** effect for a modern feel.
  - Add **hover effects** to each card to make them feel interactive when hovered over.
  - The **icons** inside the cards should be **centered** and have a **consistent size (24px)** for better visual harmony.
  - Add **subtle separators** or borders to divide each card for a structured look.
  - Include **percentage labels** inside the cards with a **larger font size (18px)** to ensure they stand out.

---

### 3. **Heatmap Enhancements**
- **Goal**: Improve clarity and readability of the **Attendance Heatmap**.
- **Solution**:
  - Make sure the heatmap is **centered** on the page with **consistent spacing** around it.
  - **Adjust the calendar layout** to ensure **each week has 7 days**, and the **month headers** (Jan, Feb, etc.) are clearly aligned with the days below.
  - **Use consistent font size** for the date numbers and make sure they are large enough to read without feeling overwhelming (**16px font size for date numbers**).
  - Improve the **color scheme** to clearly differentiate the levels of activity (No Activity, Low Activity, Medium, Good, Excellent).
  - Add a **hover tooltip** on each day of the heatmap showing a short description of activity for that day (e.g., “2 hours in CRM, 30 minutes in Discord”).

---

### 4. **Department Performance Graphs**
- **Goal**: Enhance the visual structure of the **Department Performance** section.
- **Solution**:
  - Adjust the **bar graph** to ensure it is **easier to read**, with **bolder labels** and **larger fonts**.
  - Add **interactive tooltips** on hover to show exact numbers when hovering over the bars (e.g., “Videographers: 20% OK, 15% Check”).
  - Use **consistent spacing** between bars for a less cluttered look.

---

### 5. **Top 10 Professions Section**
- **Goal**: Improve readability of the **Top 10 Professions** graph.
- **Solution**:
  - Update the bar chart layout to ensure the **bars** are well-spaced and **not overcrowded**.
  - Increase the **font size** for the **profession names** and **percentages** to make the chart more legible.
  - Add **hover effects** to the bars, displaying exact percentages and any potential warnings (e.g., “Low Activity”).
  - Ensure the **legend** is properly aligned, with distinct color coding for each status.

---

### 6. **Improved Navigation and Responsiveness**
- **Goal**: Improve the responsiveness and layout flow for mobile and tablet views.
- **Solution**:
  - On **mobile screens** (≤640px):
    - Stack cards vertically and ensure that the **key metrics** remain the focal point of the screen.
    - Make the **heatmap scrollable horizontally** when it exceeds the screen width.
    - Ensure the **department performance graph** and **top professions chart** stack vertically for easy scrolling.
  - On **tablet screens** (641px–1024px):
    - Show **2-3 cards** horizontally and stack graphs vertically to optimize the available space.
    - Ensure that the **heatmap** and **graphs** fit within the screen and remain responsive.
  - On **desktop screens** (1025px+):
    - Maintain the current layout with **cards horizontally aligned** at the top, heatmap below them, and graphs beneath.

---

### 7. **General Design Enhancements**
- **Goal**: Create a more modern, clean, and cohesive design.
- **Solution**:
  - Use **consistent padding** and **margins** to create a **balanced layout**.
  - Ensure there are **consistent visual breaks** between each section (e.g., heatmap, graphs, department performance).
  - Add a **subtle shadow effect** behind key sections (e.g., cards, heatmap) for depth.
  - Use **rounded corners (8px)** for all interactive elements (cards, buttons, etc.).
  - Include **consistent hover states** on all cards and clickable items to improve interactivity.
  - Ensure all **icons** are uniform in size, centered, and clearly visible.

---

### 8. **What You Must Implement**
1. **Redesign the layout** to make the dashboard visually cleaner and more structured.
2. **Improve the heatmap** by fixing alignment, color logic, and hover interactions.
3. **Enhance the department performance graph** for better readability.
4. **Adjust the top professions chart** to be more accessible and interactive.
5. Ensure that all components are **responsive** for mobile and tablet screens.
6. Return all the **updated JSX**, **CSS**, and any changes to ensure a better user experience.

**Return the following**:
1. Full code diff with the updated layout and design changes.
2. Updated **CSS** for grid layouts, font sizes, and colors.
3. Updated **JSX** for interactive elements like hover tooltips and cards.
4. Explanation of all changes and their impact on user experience.






You are tasked with analyzing the logic for each chart displayed inside the cards on the **Remote Helpers Dashboard**. Review the data each chart represents and ensure that it accurately reflects its intended purpose. Provide a **short description for each chart** so users can easily understand what the chart represents and how to interpret the data.

### 1. **Hours Rate Chart**
- **Current Functionality**: This chart shows the percentage of employees who have met their **hours target** for the selected day, week, month, or all-time.
- **Data Source**: 
  - **CRM Time** and **Discord Time** data are used to check if an employee has met the target based on their **Rate** (e.g., Rate 1 = 8 hours, Rate 0.5 = 4 hours).
  - Calculate the percentage of employees who have met their respective hourly target.
- **Short Description**:
  - "This chart represents the percentage of employees who have met their target hours (based on their rate). It provides a quick overview of how well employees are meeting their expected working hours."

### 2. **Report Rate Chart**
- **Current Functionality**: This chart shows the percentage of employees who have submitted valid **reports** for the selected period.
- **Data Source**:
  - The chart pulls from **report submissions** data, checking if an employee has provided a report that is complete and within the specified guidelines.
  - Calculate the percentage of employees who have valid reports submitted.
- **Short Description**:
  - "This chart shows the percentage of employees who have submitted a valid report for the day, week, or month. It helps monitor reporting compliance."

### 3. **Overall Performance Rate Chart**
- **Current Functionality**: This chart combines the **Hours Rate** and **Report Rate** into a single performance metric to show how well employees are performing overall.
- **Data Source**:
  - Combine **Hours Rate** and **Report Rate** data. Calculate an average or weighted average based on how both factors impact overall performance.
  - An employee is considered to have good overall performance if they meet both their hours target and have submitted a valid report.
- **Short Description**:
  - "This chart shows the combined performance of employees based on both hours worked and report submission. It represents overall employee productivity and task completion."

### 4. **Total Problems Chart**
- **Current Functionality**: This chart indicates the **total number of problems** flagged across the entire employee pool for the selected day, week, month, or all-time period.
- **Data Source**:
  - This is calculated by adding up the total **problematic statuses** (e.g., low hours, no report, etc.).
  - Each problem type is given a specific weight and counts towards the total problems score.
- **Short Description**:
  - "This chart indicates the total number of issues flagged across the employee base, such as low hours, missing reports, or inactive statuses. It provides insight into overall compliance and task completion issues."

### 5. **Department Performance Chart**
- **Current Functionality**: This chart displays the **performance of employees across different departments** in terms of their verdicts (OK, Check, Suspicious, etc.).
- **Data Source**:
  - **Verdicts** (e.g., OK, Check, Suspicious, etc.) are calculated for each employee within each department.
  - The chart aggregates this data to show the total number of employees per department for each verdict type.
- **Short Description**:
  - "This chart shows how each department is performing based on verdicts. It provides a visual representation of department-wide performance, including employees who are meeting expectations and those flagged for issues."

### 6. **CRM Status Distribution Chart**
- **Current Functionality**: This chart shows the **distribution of employees’ CRM statuses** (Active, No CRM Data, No Records).
- **Data Source**:
  - **CRM Status** data is pulled from employee activity in the CRM system.
  - The chart breaks down the distribution of employees who are marked as **Active**, have **No CRM Data**, or **No Records** for a given period.
- **Short Description**:
  - "This chart visualizes the distribution of employee CRM activity, showing the percentage of employees actively working in the CRM system versus those with missing or no data."

### 7. **Top 10 Professions Chart**
- **Current Functionality**: This chart shows the **most active professions** in terms of hours worked and status completion across the entire employee base.
- **Data Source**:
  - Data is gathered for each **profession** (e.g., Lead Generator, UI/UX Designer) to show the number of hours worked and how many of those employees have met the required performance criteria.
  - The chart is divided into professions and tracks how they perform in terms of **activity and status**, with color-coded bars indicating performance levels (Check, OK, Suspicious).
- **Short Description**:
  - "This chart displays the most active professions within the organization. It shows how well different roles are performing based on hours worked, task completion, and overall status."

---

### General Tasks:
1. **Ensure the visual consistency of each chart**:
   - Maintain uniformity in the **chart colors**, fonts, and overall design.
   - Ensure the **data points** are **clearly labeled** and that each chart is **easy to interpret**.
   - Add **tooltips** on hover to provide **detailed information** about each data point.

2. **Provide descriptions for each chart**:
   - For each chart, ensure a **short description** is visible, either as a tooltip or beneath the chart, explaining what the chart represents and how it should be interpreted by the user.

---

### Expected Output:
- Short descriptions for each chart explaining its purpose and data representation.
- A breakdown of **data sources** for each chart.
- Code adjustments to ensure the **clarity and interactivity** of each chart (e.g., tooltips, hover effects, etc.).




You are tasked with improving the **Remote Helpers Dashboard** by replacing the static descriptions on the cards with **tooltips** that appear when the user hovers over a **question mark icon (?)**. This will make the UI cleaner while still providing users with the necessary information.

### 1. **Add Question Mark Icons (?) for Each Card Description**
- **Goal**: Clean up the interface by hiding the descriptive text behind a **question mark icon**.
- **Solution**: 
  - For each summary card (e.g., Hours Rate, Overall Performance, Report Rate, etc.), replace the description text with a **small question mark icon** placed in the top-right corner of the card.
  - The icon should be clickable or hoverable, with the tooltip appearing when the user hovers over the question mark.

### 2. **Tooltips for Each Description**
- **Goal**: Display a tooltip with the relevant description when the user hovers over the question mark icon.
- **Solution**: 
  - When hovering over the **question mark icon**, show a **tooltip** with the card's explanation.
  - Ensure the tooltip appears above or beside the icon, with a slight **fade-in effect** to create a smooth user experience.
  
  **Descriptions to be shown in the tooltip**:
  - **Hours Rate**:
    - Tooltip: "Percentage of employees who met their target hours (based on their rate: Rate 1 = 8h, Rate 0.5 = 4h, etc.)."
  - **Overall Performance**:
    - Tooltip: "Employees who met both their hours target and submitted a valid report."
  - **Report Rate**:
    - Tooltip: "Percentage of employees who submitted a valid report (minimum 40 characters) for the selected period."
  - **Hours Problems**:
    - Tooltip: "Employees who did not meet their target hours due to low CRM/Discord time."
  - **Report Problems**:
    - Tooltip: "Employees with missing or invalid reports (less than 40 characters)."
  - **Total Problems**:
    - Tooltip: "Total number of issues flagged across the employees: low hours, missing reports, or inactive statuses."
  - **Leave**:
    - Tooltip: "Employees who are on leave (either full or half day) for the selected date."

### 3. **Style the Tooltip**
- **Solution**: 
  - The tooltip should have a **soft background color** (e.g., `rgba(0, 0, 0, 0.8)`) with **white text** for better contrast and readability.
  - The tooltip should have a **border-radius** of **4px** to match the rounded corners of the cards.
  - Use **CSS transitions** to smoothly show and hide the tooltip.

  Example CSS:
  ```css
  .tooltip {
    visibility: hidden;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 4px;
    padding: 8px;
    font-size: 12px;
    max-width: 200px;
    transition: opacity 0.3s ease-in-out;
    opacity: 0;
    z-index: 100;
  }

  .tooltip-visible {
    visibility: visible;
    opacity: 1;
  }

  .card-icon:hover + .tooltip {
    visibility: visible;
    opacity: 1;
  }
4. Interactive Hover Effect for the Icon
Solution:

When the user hovers over the question mark icon, change its color (e.g., to light gray or a subtle animation like a slight rotation) to make it visually clear that it’s interactive.

Example CSS for hover effect:

css
Copy code
.card-icon {
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.card-icon:hover {
  transform: rotate(180deg);
  color: #ccc; /* Light gray on hover */
}
5. Return Updated Code
Provide full code updates for:

Adding the question mark icon to each summary card.

Displaying tooltips when the user hovers over the icon.

Styling the tooltip for consistent design and readability.

Adding hover effects for the question mark icon to improve interactivity.

Files to Update:

SummaryCards.tsx (or similar file where the cards are rendered)

Tooltips.css or global stylesheet for tooltips styling.

Ensure the tooltip is consistent across all cards.

Return the following:

Updated JSX code for integrating question mark icons and tooltips.

CSS changes for styling tooltips and hover effects.

Detailed explanation of changes made.



do the tooltips wighter








Task: Add a New "Lateness" Tab for Employees
Overview

A new tab will be added to the HR Dashboard specifically for employees who are late. The data will be retrieved from the Daily_Lateness tab of the existing spreadsheet. This will allow HR to track employees’ lateness and view details on their arrival times and departments.

Step-by-Step Task Details
1. Create a "Lateness" Tab in the Dashboard

Location: Add the Lateness tab in the main dashboard alongside Company, Project, and other key sections.

Purpose: This tab will specifically track employees who have been late or absent based on the Daily_Lateness data.

Data Source: Pull data from the Daily_Lateness tab in the provided spreadsheet.

2. Design and UI Updates

Employee Cards:

Each employee in the Lateness Tab will be shown in a card layout with the following information:

Employee Name

Employee Status (Work, Available, etc.)

Status (e.g., "Late" or "Absent")

Join Time (The time when the employee joined)

Check Result (e.g., "Arrived at 16:26 (+431 min late)")

Department

Profession

If the employee is on time, the card should show OK with a green checkmark.

If the employee is late, the card should show a yellow warning with the number of minutes late, and if absent, it should show a red warning.

Add color coding to the cards to visually indicate the status:

Green for "On Time"

Yellow for "Late"

Red for "Absent"

Hovering Effect: When the user hovers over the employee card, it should show a tooltip with additional details such as the exact arrival time and late minutes.

3. Display Employee Lateness Data

Display lateness in a table-like format with the following columns:

Date

Employee Name

Status (Late, Absent, On Time)

Join Time

Late/On Time Duration

Department

Profession

The table should be sortable based on the date, employee, department, and lateness status.

4. Lateness Summary

Summary Statistics:

Add a summary card showing total employees who were late, total absentees, and total on-time employees for the selected date.

Display the total number of late employees in a box, and next to it, show the total number of absentees and on-time employees as smaller, secondary numbers.

5. Functionality of the Lateness Tab

Filters:

Allow the user to filter the lateness data by Date (e.g., Daily, Weekly, Monthly).

Users should also be able to filter by Department or Profession to view lateness stats specific to certain roles or teams.

Data Handling:

For late employees, calculate and display how many minutes the employee was late based on their Join Time and Check Result (e.g., "Arrived at 16:26 (+431 min late)").

Employees who arrive late should have the status of "Late" and the number of minutes late displayed. If there is no check-in time, display Absent with a red warning.

6. Integration with Existing Metrics

Interaction with Other Tabs:

The Lateness Tab should not impact the metrics shown in the Team Activity Calendar or other existing tabs.

Ensure that the lateness data updates automatically from the Daily_Lateness tab on the spreadsheet, and it is displayed accordingly without affecting other charts.

7. Data Synchronization

Data Syncing: Ensure that the system automatically pulls the latest lateness data from the Daily_Lateness tab and updates the dashboard accordingly.

Set up daily synchronization or real-time updates for the lateness records to ensure that the latest employee data (arrival times, lateness, etc.) is always shown.

8. User Interaction

Interactivity:

Users can click on the employee cards to see more details, including:

Time of arrival

Status (Late, Absent, etc.)

Department and Profession

Add a search functionality at the top of the lateness tab to allow users to search for employees by name or ID.

9. Additional Features for Lateness Tab

Export Option: Add the ability for the HR team to export the lateness data (for a specific date range) as CSV or Excel format for reporting purposes.

Notification System: If possible, set up a reminder notification system to notify managers or HR about employees who frequently appear in the Lateness Tab.

Final Deliverables

New "Lateness Tab" in the dashboard.

Employee Cards with late/absent statuses.

Filters for sorting by date, department, and profession.

Interactive Table showing employee lateness data.

Summary Statistics for lateness and absenteeism.

Data Synchronization with the Daily_Lateness tab in the spreadsheet.

Export Option for lateness data.

User Interface and Experience Improvements for better interaction and usability.

Code Considerations:

Ensure the data retrieval logic pulls data only from the Daily_Lateness tab.

Implement error handling for cases when data is missing or improperly formatted.

Use CSS/JS for card hover effects, tooltips, and dynamic table sorting.

Consider tailwindCSS for responsive and easy-to-maintain UI components.






./components/lateness-tab.tsx:8:1
Module not found: Can't resolve '@/components/ui/input'
   6 | import { Badge } from '@/components/ui/badge';
   7 | import { Button } from '@/components/ui/button';
>  8 | import { Input } from '@/components/ui/input';
     | ^
   9 | import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  10 | import { ArrowDownWideNarrow, ArrowUpWideNarrow, Download, Clock, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
  11 | import type { LatenessRecord } from '@/types';

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/page.tsx 





components\lateness-tab.tsx (419:14) @ HelpCircle

  417 |           <CardTitle className="text-sm font-semibold flex items-center gap-2">
  418 |             Detailed Lateness Table
> 419 |             <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
      |              ^
  420 |           </CardTitle>
  421 |           <CardDescription className="text-xs">
  422 |             Sort columns to analyse lateness by date, employee, department, or minutes late.







Task: Add Calendar and Filter Options to Lateness Tab, Hide Detailed Table, and Improve Layout
Overview:

The Lateness Tab in the HR Dashboard should be enhanced to include a date picker (calendar) for users to view the lateness status of employees for a specific day. The project employees and company employees should be separated, and the existing lateness summary cards should be preserved. Additionally, the detailed lateness table should be hidden by default and revealed upon a user action (like clicking a button).

Steps for Implementation:
1. Add Calendar to Lateness Tab

Purpose: Allow HR managers to select a specific date using the calendar and view the lateness data for that date.

Design:

The calendar widget should be placed at the top of the Lateness Tab, just below the summary cards (Late Employees, Absent Employees, On Time Employees).

The user can select a date from the calendar, and the table will dynamically update to show data for that specific day.

Functionality:

When the user clicks on a date in the calendar, it should filter the lateness data and display employees who were late, absent, or on time for that specific day.

The calendar should support switching between Day, Week, Month views.

2. Maintain the Lateness Summary Cards

Purpose: Keep the summary cards (Late Employees, Absent Employees, On Time Employees) as they are for a quick overview.

Design:

The cards should display:

Late Employees (Total number of employees who were late on the selected date).

Absent Employees (Total number of employees who were absent).

On Time Employees (Total number of employees who joined on time).

Do not change their layout or design; these should remain as is for easy accessibility.

3. Add Filtering Option for Project and Company Employees

Purpose: Allow HR managers to filter and separate project employees from company employees, similar to the filters available on the calendar page.

Design:

Filter Options: Add a filter at the top of the Lateness Tab with options to select:

Company Employees

Project Employees

All Employees (Default)

This should be a tab-like toggle, similar to the Company/Project toggle found in the Team Activity Calendar page.

Functionality:

The filter should only show company employees or project employees based on the selection. The table should update dynamically to reflect the filtered data.

Ensure that project employees are not included in the global lateness statistics when viewing company employees (and vice versa).

4. Keep Existing Export and Search Features

Purpose: Keep the existing Export button and Search Employee functionality for convenience.

Design:

Keep the Export button in its current location for easy download of the lateness data.

Keep the Search Employee input field for quick lookup of individual employees.

5. Hide Detailed Lateness Table

Purpose: Hide the detailed lateness table by default and allow it to be revealed only when needed, to keep the page cleaner and more user-friendly.

Design:

Table Section: The detailed lateness table should be placed below the summary cards and hidden by default.

Revealing Action: Add a button (e.g., "Show Detailed Table") that, when clicked, reveals the detailed lateness data for employees on the selected date.

Functionality:

Clicking the button should toggle the visibility of the detailed lateness table.

The table should display:

Employee Name

Employee Status

Status (Late, Absent, On Time)

Join Time

Late Duration

Department

Profession

6. Final Layout and Testing

Ensure that the layout is responsive for different screen sizes (desktop, tablet, mobile).

Test the calendar interaction to ensure that it properly filters the lateness data by date.

Test the filter toggle for project and company employees to ensure it works as expected and separates the data correctly.

Test the visibility toggle for the detailed lateness table to ensure that it can be hidden and revealed seamlessly.

Expected Outcome:

The Lateness Tab should allow HR managers to:

Select specific dates using the calendar.

View the summary of late employees, absentees, and on-time employees.

Filter employees based on their project or company status.

View detailed lateness data on employees for the selected date, which is hidden by default and can be shown by clicking a button.

Export lateness data and search employees seamlessly.



do a research of how the calender page look like and do something the same with Lateness page



iled to load resource: the server responded with a status of 404 (Not Found)Understand this error
page.css:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
:3000/_next/static/chunks/webpack.js?v=1764858012763:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
:3000/_next/static/chunks/main-app.js?v=1764858012763:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
:3000/_next/static/chunks/app-pages-internals.js:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
:3000/_next/static/chunks/app/page.js:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
layout.css:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
page.css:1  Failed to load resource: the server responded with a status of 404 (Not Found)



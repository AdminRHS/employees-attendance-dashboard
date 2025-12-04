export interface Report {
    // Core fields (now optional to be resilient to schema changes)
    date?: string;
    verdict?: string;
    issue?: string;
    name?: string;
    department?: string;
    profession?: string;

    // Time fields (store as numbers where possible)
    discordTime?: number | string;
    discordId?: string;
    crmTime?: number | string;
    crmStatus?: string;

    // Status fields
    currentStatus?: string;
    /**
     * Raw employee status string from the sheet (e.g. "Available", "Project", "Work").
     */
    employeeStatus?: string | null;

    // Leave / rate / targets
    leave?: string;
    leaveRate?: string | number;
    /**
     * Employee rate used to determine expected hours (e.g. 1.25 → 10h, 1.0 → 8h).
     * Optional because legacy rows may not have this populated.
     */
    rate?: number | null;
    /**
     * Target time (hours) from the sheet, if provided.
     */
    targetTime?: number | null;

    // Text report
    report?: string;

    /**
     * Final computed hours for this report (from CRM or merged sources).
     * If not provided by the sheet, the UI may fall back to discordTime + crmTime.
     */
    computedHours?: number | null;
    /**
     * Whether this employee/report belongs to the project group rather than company.
     * Used to separate metrics between Company vs Project views.
     */
    isProject?: boolean;

    // Optional additional fields from new schema
    firstCheckIn?: string;
    lastCheckOut?: string;
}

export interface LatenessRecord {
    date?: string;
    name?: string;
    department?: string;
    profession?: string;
    /**
     * High-level lateness status for the record, e.g. "Late", "Absent", "On Time".
     */
    status?: string;
    /**
     * Raw employee status (e.g. Work, Available) if present in the sheet.
     */
    employeeStatus?: string | null;
    /**
     * Time the employee actually joined (string as provided by the sheet).
     */
    joinTime?: string;
    /**
     * Check result text from the sheet (e.g. "Arrived at 16:26 (+431 min late)").
     */
    checkResult?: string;
    /**
     * Parsed minutes late. 0 or null means on time or unknown.
     */
    minutesLate?: number | null;
}
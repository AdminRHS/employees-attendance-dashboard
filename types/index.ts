export interface Report {
    date: string;
    verdict: string;
    issue: string;
    name: string;
    department: string;
    profession: string;
    discordTime: string;
    discordId?: string;
    crmTime: string;
    crmStatus: string;
    currentStatus: string;
    /**
     * Raw employee status string from the sheet (e.g. "Available", "Project", "Work").
     */
    employeeStatus?: string | null;
    leave: string;
    leaveRate: string;
    report: string;
    /**
     * Employee rate used to determine expected hours (e.g. 1.25 → 10h, 1.0 → 8h).
     * Optional because legacy rows may not have this populated.
     */
    rate?: number | null;
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
}

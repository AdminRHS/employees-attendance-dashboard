'use client'

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmployeeCard } from './employee-card';

interface Report {
  date: string;
  verdict: string;
  issue: string;
  name: string;
  department: string;
  profession: string;
  discordTime: string;
  crmTime: string;
  crmStatus: string;
  currentStatus: string;
  leave: string;
  leaveRate: string;
  report: string;
}

interface TeamActivityCalendarProps {
  reports: Report[];
  initialVerdictFilter?: string;
}

export function TeamActivityCalendar({ reports, initialVerdictFilter = 'all' }: TeamActivityCalendarProps) {
  // Set default date to yesterday
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getYesterday());
  const [verdictFilter, setVerdictFilter] = useState<string>(initialVerdictFilter);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [professionFilter, setProfessionFilter] = useState<string>('all');

  // Get selected date string
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // Filter reports for selected date
  const reportsForDate = reports.filter(r => r.date === selectedDateStr);

  // Get unique departments and professions
  const departments = ['all', ...new Set(reports.map(r => r.department).filter(Boolean))];
  const professions = ['all', ...new Set(reports.map(r => r.profession).filter(Boolean))];

  // Apply all filters
  let filteredReports = reportsForDate;

  // Verdict filter
  if (verdictFilter !== 'all') {
    filteredReports = filteredReports.filter(r => {
      switch (verdictFilter) {
        case 'suspicious':
          return r.verdict.includes('SUSPICIOUS');
        case 'check':
          return r.verdict.includes('CHECK');
        case 'project':
          return r.verdict.includes('PROJECT');
        case 'ok':
          return r.verdict.includes('OK');
        default:
          return true;
      }
    });
  }

  // Department filter
  if (departmentFilter !== 'all') {
    filteredReports = filteredReports.filter(r => r.department === departmentFilter);
  }

  // Profession filter
  if (professionFilter !== 'all') {
    filteredReports = filteredReports.filter(r => r.profession === professionFilter);
  }

  // Get unique employees from filtered reports
  const uniqueEmployees = filteredReports.reduce((acc, report) => {
    if (!acc.find(r => r.name === report.name)) {
      acc.push(report);
    }
    return acc;
  }, [] as Report[]);

  // Get available dates (dates with data)
  const availableDates = new Set(reports.map(r => r.date));

  // Calculate stats for selected date
  const dateStats = {
    total: reportsForDate.length,
    unique: new Set(reportsForDate.map(r => r.name)).size,
    ok: reportsForDate.filter(r => r.verdict.includes('OK') || r.verdict.includes('PROJECT')).length,
    suspicious: reportsForDate.filter(r => r.verdict.includes('SUSPICIOUS')).length,
    check: reportsForDate.filter(r => r.verdict.includes('CHECK')).length,
    leave: reportsForDate.filter(r => r.verdict.includes('LEAVE') || r.verdict.includes('HALF DAY')).length,
  };

  const hasActiveFilters = verdictFilter !== 'all' || departmentFilter !== 'all' || professionFilter !== 'all';

  const clearAllFilters = () => {
    setVerdictFilter('all');
    setDepartmentFilter('all');
    setProfessionFilter('all');
  };

  return (
    <Card id="team-activity">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>📅 Team Activity Calendar</CardTitle>
            <CardDescription>
              {selectedDate
                ? `${format(selectedDate, 'EEEE, MMMM d, yyyy')} • ${uniqueEmployees.length} unique ${uniqueEmployees.length === 1 ? 'employee' : 'employees'}`
                : 'Select a date to view team activity'
              }
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Visual Calendar */}
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3">📆 Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow-sm"
                modifiers={{
                  available: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return availableDates.has(dateStr);
                  },
                }}
                modifiersStyles={{
                  available: {
                    fontWeight: 'bold',
                    backgroundColor: '#dbeafe',
                  },
                }}
              />
            </div>

            {/* Daily Stats */}
            {reportsForDate.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">📊 Daily Stats</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Total:</span>
                    <Badge variant="outline">{dateStats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Unique:</span>
                    <Badge variant="outline">{dateStats.unique}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded">
                    <span className="text-green-600">✓ OK:</span>
                    <Badge className="bg-green-200 text-green-800">{dateStats.ok}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                    <span className="text-red-600">⚠ Suspicious:</span>
                    <Badge variant="destructive">{dateStats.suspicious}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-amber-50 rounded">
                    <span className="text-amber-600">? Check:</span>
                    <Badge className="bg-amber-200 text-amber-800">{dateStats.check}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                    <span className="text-blue-600">⊘ Leave:</span>
                    <Badge className="bg-blue-200 text-blue-800">{dateStats.leave}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a date to view team activity</p>
                </div>
              </div>
            ) : reportsForDate.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No activity found for {format(selectedDate, 'PPP')}</p>
                  <p className="text-sm mt-1">Try selecting a different date</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-sm text-gray-700">Filters</h3>
                  </div>

                  {/* Verdict Filter */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Verdict:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={verdictFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVerdictFilter('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant={verdictFilter === 'ok' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVerdictFilter('ok')}
                        className="border-green-300"
                      >
                        OK
                      </Button>
                      <Button
                        variant={verdictFilter === 'suspicious' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => setVerdictFilter('suspicious')}
                        className="border-red-300"
                      >
                        Suspicious
                      </Button>
                      <Button
                        variant={verdictFilter === 'check' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVerdictFilter('check')}
                        className="border-amber-300"
                      >
                        Check
                      </Button>
                      <Button
                        variant={verdictFilter === 'project' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVerdictFilter('project')}
                        className="border-purple-300"
                      >
                        Project
                      </Button>
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Department:</p>
                    <div className="flex flex-wrap gap-2">
                      {departments.slice(0, 6).map(dept => (
                        <Button
                          key={dept}
                          variant={departmentFilter === dept ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDepartmentFilter(dept)}
                        >
                          {dept === 'all' ? 'All' : dept}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Profession Filter */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Profession:</p>
                    <div className="flex flex-wrap gap-2">
                      {professions.slice(0, 6).map(prof => (
                        <Button
                          key={prof}
                          variant={professionFilter === prof ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setProfessionFilter(prof)}
                        >
                          {prof === 'all' ? 'All' : prof}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results */}
                {uniqueEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No employees match your filters</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-t pt-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Team Members ({uniqueEmployees.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto pr-2">
                      {uniqueEmployees.map((log, index) => (
                        <EmployeeCard
                          key={`${log.name}-${log.date}-${index}`}
                          {...log}
                          status={log.currentStatus}
                          streak={0}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

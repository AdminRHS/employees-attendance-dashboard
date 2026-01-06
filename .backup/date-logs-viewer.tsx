'use client'

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { EmployeeCard } from './employee-card';
import { cn } from '@/lib/utils';

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

interface DateLogsViewerProps {
  reports: Report[];
}

export function DateLogsViewer({ reports }: DateLogsViewerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter reports for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const logsForDate = reports.filter(r => r.date === selectedDateStr);

  // Get available dates (dates with data)
  const availableDates = new Set(reports.map(r => r.date));

  // Calculate stats for selected date
  const dateStats = {
    total: logsForDate.length,
    ok: logsForDate.filter(r => r.verdict.includes('OK') || r.verdict.includes('PROJECT')).length,
    suspicious: logsForDate.filter(r => r.verdict.includes('SUSPICIOUS')).length,
    check: logsForDate.filter(r => r.verdict.includes('CHECK')).length,
    leave: logsForDate.filter(r => r.verdict.includes('LEAVE') || r.verdict.includes('HALF DAY')).length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Daily Logs Viewer</CardTitle>
        <CardDescription>
          Select a date to view all employee logs for that day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
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
              </PopoverContent>
            </Popover>

            {/* Date Stats */}
            {logsForDate.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Daily Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Logs:</span>
                    <span className="font-bold text-gray-900">{dateStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ OK:</span>
                    <span className="font-bold text-green-700">{dateStats.ok}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600">⚠ Suspicious:</span>
                    <span className="font-bold text-red-700">{dateStats.suspicious}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-600">? Check:</span>
                    <span className="font-bold text-amber-700">{dateStats.check}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">⊘ Leave:</span>
                    <span className="font-bold text-blue-700">{dateStats.leave}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logs Section */}
          <div className="lg:col-span-3">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a date to view logs</p>
                </div>
              </div>
            ) : logsForDate.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No logs found for {format(selectedDate, 'PPP')}</p>
                  <p className="text-sm mt-1">Try selecting a different date</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  Logs for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({logsForDate.length} {logsForDate.length === 1 ? 'log' : 'logs'})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {logsForDate.map((log, index) => (
                    <EmployeeCard
                      key={`${log.name}-${log.date}-${index}`}
                      {...log}
                      status={log.currentStatus}
                      streak={0} // Don't show streak in daily view
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/types';

interface AttendanceFiltersProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  selectedStatus: AttendanceStatus | 'all';
  onStatusChange: (status: AttendanceStatus | 'all') => void;
  departments: string[];
}

export function AttendanceFilters({
  selectedDate,
  onDateChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  departments,
}: AttendanceFiltersProps) {
  const statusOptions: Array<{ value: AttendanceStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Statuses' },
    { value: 'On-time', label: 'On Time' },
    { value: 'Late (1-15 min)', label: 'Late (1-15 min)' },
    { value: 'Late (16-30 min)', label: 'Late (16-30 min)' },
    { value: 'Late (>30 min)', label: 'Late (>30 min)' },
    { value: 'Late', label: 'Late' },
    { value: 'Legitimate Day Off', label: 'Day Off' },
    { value: 'Partial Day Off', label: 'Partial Day Off' },
    { value: 'Unpaid Day Off', label: 'Unpaid Day Off' },
    { value: 'Absent', label: 'Absent' },
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(parseISO(selectedDate), 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parseISO(selectedDate)}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Department Filter */}
      <div className="relative">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="h-10 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[150px] appearance-none pr-8"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as AttendanceStatus | 'all')}
          className="h-10 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px] appearance-none pr-8"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Reset Filters Button */}
      {(selectedDepartment !== 'all' || selectedStatus !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDepartmentChange('all');
            onStatusChange('all');
          }}
          className="h-10"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
}

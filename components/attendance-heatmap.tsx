'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import HeatMap from '@uiw/react-heat-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  addMonths, 
  startOfDay, 
  parseISO, 
  format, 
  isBefore, 
  eachDayOfInterval, 
  startOfWeek, 
  subMonths,
  startOfMonth,
  endOfMonth,
  isAfter,
  differenceInCalendarDays,
} from 'date-fns';

interface AttendanceData {
  date: string;   // 'YYYY-MM-DD'
  count: number;  // 0–4 bucketed score
  verdict?: string;
  hasRecords?: boolean; // true if this day has actual records
}

interface AttendanceHeatmapProps {
  data: AttendanceData[];
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-4 w-4 rounded-sm flex-shrink-0 border border-gray-300 dark:border-gray-600"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-muted-foreground" style={{ fontSize: '14px' }}>
        {label}
      </span>
    </div>
  );
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  
  // Navigation state - tracks the start of the visible 6-month window
  const [windowOffset, setWindowOffset] = useState(0);

  // --- 1. Compute base date range (from first data date, +12 months, including future dates) ---
  // IMPORTANT: Library ALWAYS starts weeks on Sunday internally, so we need to align with that

  const { baseStartDate, baseEndDate, firstDataDate } = useMemo(() => {
    const today = startOfDay(new Date());
    const twelveMonthsAgo = addMonths(today, -12);

    if (!data.length) {
      return { baseStartDate: twelveMonthsAgo, baseEndDate: today, firstDataDate: null };
    }

    // Parse all valid dates from data that has records
    const parsedDates = data
      .filter((item) => item.hasRecords !== false)
      .map((item) => {
        try {
          return startOfDay(parseISO(item.date));
        } catch {
          return null;
        }
      })
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

    if (!parsedDates.length) {
      return { baseStartDate: twelveMonthsAgo, baseEndDate: today, firstDataDate: null };
    }

    // Find earliest date with data
    const minDate = parsedDates.reduce(
      (min, d) => (isBefore(d, min) ? d : min),
      parsedDates[0]
    );

    // CRITICAL: Library forces Sunday-start internally, so we align with that.
    // Start from Sunday of the week containing the first data date.
    const start = startOfWeek(minDate, { weekStartsOn: 0 }); // Sunday (0)
    
    // Base end date: start date + 12 months (can extend into future)
    const twelveMonthsFromStart = addMonths(start, 12);
    const end = twelveMonthsFromStart;

    return { baseStartDate: start, baseEndDate: end, firstDataDate: minDate };
  }, [data]);

  // Calculate displayed date range based on navigation offset
  const displayedStartDate = useMemo(() => {
    if (windowOffset === 0) {
      return baseStartDate;
    }
    return addMonths(baseStartDate, windowOffset);
  }, [baseStartDate, windowOffset]);

  const displayedEndDate = useMemo(() => {
    // Show a full 12-month window from the current start date
    return addMonths(displayedStartDate, 12);
  }, [displayedStartDate]);

  // Navigation handlers
  const canGoPrevious = useMemo(() => {
    if (!firstDataDate) return false;
    // Prevent navigating to a window that starts before the first data date
    const prevWindowStart = subMonths(displayedStartDate, 12);
    return !isBefore(prevWindowStart, firstDataDate);
  }, [displayedStartDate, firstDataDate]);
  
  const canGoNext = useMemo(() => {
    const today = startOfDay(new Date());
    return isBefore(displayedEndDate, today);
  }, [displayedEndDate]);

  const handlePreviousMonth = () => {
    if (canGoPrevious) {
      setWindowOffset((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setWindowOffset((prev) => prev + 1);
    }
  };

  // --- 2. Transform data for HeatMap (YYYY/MM/DD format) with all days in range ---

  const transformedData = useMemo(() => {
    // Create a map of date -> count for quick lookup
    const dataMap = new Map<string, number>();
    data.forEach((item) => {
      if (item.hasRecords !== false && item.count >= 0 && item.count <= 4) {
        dataMap.set(item.date, item.count);
      }
    });

    // Generate all days in the displayed range
    const allDays = eachDayOfInterval({ 
      start: displayedStartDate, 
      end: displayedEndDate 
    });
    
    return allDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dateStrSlash = format(day, 'yyyy/MM/dd'); // HeatMap format
      
      // CRITICAL: Days without records should be 0 (very light blue/No Activity)
      // Days with records should have their assigned count (1-4)
      // Ensure all days without data show as "No Activity" color (#E3F2FD)
      const count = dataMap.has(dateStr) ? dataMap.get(dateStr)! : 0;
      
      return {
        date: dateStrSlash,
        count,
      };
    });
  }, [data, displayedStartDate, displayedEndDate]);

  // --- 3. Responsive width based on container ---

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        setWidth(newWidth > 0 ? newWidth : undefined);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // --- 3.5. Apply direct styles to SVG after render and ensure full height ---

  useEffect(() => {
    if (!width) return;

    const applyStyles = () => {
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) return;

      // Calculate required height: 7 rows * (rectSize + space) + padding
      // rectSize = 24, space = 5, topPad = 40 (for month labels with more spacing)
      const rectSize = 24;
      const space = 5;
      const topPad = 40;
      const requiredHeight = topPad + (7 * (rectSize + space)) + 30; // Extra padding at bottom

      // Force container and SVG to expand to show all 7 rows
      const container = containerRef.current;
      if (container) {
        container.style.minHeight = `${requiredHeight}px`;
        container.style.height = 'auto';
        container.style.maxHeight = 'none';
        container.style.overflowY = 'visible';
        container.style.overflowX = 'auto';
      }

      // Ensure SVG can display at full height
      svg.style.minHeight = `${requiredHeight}px`;
      svg.style.height = 'auto';
      svg.style.maxHeight = 'none';
      svg.style.overflow = 'visible';

      // Center the SVG
      svg.style.margin = '0 auto';
      svg.style.display = 'block';

      // Add spacing between weekdays and months
      const allGroups = svg.querySelectorAll('g');
      const textElements = svg.querySelectorAll('text');

      // Make weekday labels 14px and verify all 7 are present
      const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let foundWeekdays: string[] = [];

      textElements.forEach((text) => {
        const textElement = text as SVGTextElement;
        const textContent = textElement.textContent?.trim() || '';

        // Style weekday labels - 16px for better readability
        if (weekdayLabels.includes(textContent)) {
          textElement.style.fontSize = '16px';
          textElement.style.fontWeight = '500';
          textElement.style.fill = 'hsl(var(--foreground))';
          foundWeekdays.push(textContent);
        }

        // Style month labels to be more prominent - 16px
        if (monthLabels.includes(textContent)) {
          textElement.style.fontSize = '16px';
          textElement.style.fontWeight = '600';
          textElement.style.fill = 'hsl(var(--foreground))';
        }
        
        // Style date numbers - 16px for better readability
        const isDateNumber = /^\d+$/.test(textContent) && parseInt(textContent) >= 1 && parseInt(textContent) <= 31;
        if (isDateNumber) {
          textElement.style.fontSize = '16px';
          textElement.style.fontWeight = '400';
          textElement.style.fill = 'hsl(var(--muted-foreground))';
        }
      });

      // Log warning if not all 7 weekdays are found
      if (foundWeekdays.length !== 7) {
        console.warn(`Heatmap: Expected 7 weekday labels, found ${foundWeekdays.length}:`, foundWeekdays);
      }

      // Ensure all 7 weekday rows are visible - check for all rect elements
      const allRects = svg.querySelectorAll('rect');
      const uniqueYPositions = new Set(Array.from(allRects).map(rect => rect.getAttribute('y')));

      if (uniqueYPositions.size < 7) {
        console.warn(`Heatmap: Expected at least 7 unique Y positions for rows, found ${uniqueYPositions.size}`);
      }

      // Add more spacing between month labels and day cells
      if (allGroups.length > 0) {
        const monthGroup = Array.from(allGroups).find((g) => {
          const texts = g.querySelectorAll('text');
          return Array.from(texts).some((t) =>
            monthLabels.includes(t.textContent?.trim() || '')
          );
        });

        if (monthGroup) {
          const currentTransform = monthGroup.getAttribute('transform') || '';
          if (!currentTransform.includes('translate')) {
            monthGroup.setAttribute('transform', 'translate(0, -5)');
          }
        }
      }
    };

    // Apply styles after a short delay to ensure SVG is rendered
    const timeoutId = setTimeout(applyStyles, 100);

    // Also apply on window resize and after data changes
    window.addEventListener('resize', applyStyles);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', applyStyles);
    };
  }, [width, transformedData]);

  // --- 4. Color palette - Blue Saturation Scheme ---

  const panelColors: Record<number, string> = {
    0: '#E3F2FD', // Very Light Blue - NO ACTIVITY (0% activity) 
    1: '#90CAF9', // Light Blue - LOW ACTIVITY (1-20% activity)
    2: '#42A5F5', // Moderate Blue - MEDIUM ACTIVITY (21-60% activity)
    3: '#1E88E5', // Good Blue - GOOD ACTIVITY (61-90% activity)
    4: '#1565C0', // Dark Blue - EXCELLENT ACTIVITY (91-100% activity)
  };

  const legendItems = [
    { level: 0, label: 'No Activity', color: panelColors[0] },
    { level: 1, label: 'Low Activity', color: panelColors[1] },
    { level: 2, label: 'Medium Activity', color: panelColors[2] },
    { level: 3, label: 'Good Activity', color: panelColors[3] },
    { level: 4, label: 'Excellent Activity', color: panelColors[4] },
  ];

  // --- 5. Format date for tooltip ---

  const formatTooltipDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr.replace(/\//g, '-'));
      return format(date, 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // --- 6. Tooltip labels matching buckets exactly ---

  const getActivityStatus = (count: number, dateStr?: string): string => {
    // Find the original data for this date to get detailed stats
    const dateKey = dateStr?.replace(/\//g, '-');
    const originalData = data.find((item) => item.date === dateKey);
    
    let baseStatus = '';
    switch (count) {
      case 0:
        baseStatus = 'No Activity (0% activity)';
        break;
      case 1:
        baseStatus = 'Low Activity (1-20% activity)';
        break;
      case 2:
        baseStatus = 'Medium Activity (21-60% activity)';
        break;
      case 3:
        baseStatus = 'Good Activity (61-90% activity)';
        break;
      case 4:
        baseStatus = 'Excellent Activity (91-100% activity)';
        break;
      default:
        baseStatus = 'Unknown';
    }
    
    // Add additional context if available
    if (originalData && originalData.verdict) {
      return `${baseStatus}\nStatus: ${originalData.verdict}`;
    }
    
    return baseStatus;
  };

  // --- 7. Month labels ---

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // --- 8. Week labels - 7 columns for all days (Sun-Sat to match library's internal Sunday-first) ---
  const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month range display
  const firstMonth = format(displayedStartDate, 'MMM yyyy');
  const lastMonth = format(subMonths(displayedEndDate, 1), 'MMM yyyy');
  const monthRangeDisplay = firstMonth !== lastMonth
    ? `${firstMonth} - ${lastMonth}`
    : firstMonth;

  // --- 9. Compute required width for full-year view (so weeks don't get cut) ---
  const rectSize = 24;
  const space = 5;
  const totalDays = differenceInCalendarDays(displayedEndDate, displayedStartDate) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);
  const requiredWidth = totalWeeks * (rectSize + space);

  const getRectFill = (count: number) => {
    return panelColors[count];
  };

  return (
    <Card className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" style={{ overflow: 'visible', height: 'auto', maxHeight: 'none' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">📅 Attendance Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Visual calendar showing daily attendance patterns for company employees over the past 12 months. Color intensity indicates activity level: 
          darker blue = higher percentage of employees meeting targets (91-100% = Excellent, 61-90% = Good, 21-60% = Medium, 1-20% = Low, 0% = No Activity). 
          Hover over any day to see the exact date and activity status.
        </p>
      </CardHeader>
      <CardContent className="!overflow-visible !h-auto" style={{ overflow: 'visible', height: 'auto', maxHeight: 'none', minHeight: 'auto' }}>
        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0 disabled:opacity-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-base font-semibold text-foreground min-w-[200px] text-center">
            {monthRangeDisplay}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="h-8 w-8 p-0 disabled:opacity-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Centered Heatmap Container */}
        <div className="w-full flex justify-center items-start py-4">
          <div
            ref={containerRef}
            className="attendance-heatmap-container w-full overflow-x-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
            style={{ 
              maxWidth: '98%',
              margin: '0 auto',
              height: 'auto',
              minHeight: 'auto',
              overflowY: 'visible',
            }}
          >
            {width && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <HeatMap
                  value={transformedData}
                  width={Math.max(width, requiredWidth)}
                  startDate={displayedStartDate}
                  endDate={displayedEndDate}
                  panelColors={panelColors}
                  monthLabels={monthLabels}
                  weekLabels={weekLabels}
                  rectProps={{
                    rx: 3,
                    className: 'cursor-pointer transition-opacity hover:opacity-80',
                  }}
                  rectSize={rectSize}
                  space={space}
                  legendCellSize={0}
                  rectRender={(props, dataItem) => {
                    const dateStr =
                      typeof dataItem.date === 'string'
                        ? dataItem.date
                        : String(dataItem.date || '');
                    // Ensure days with no data always show as count 0 (No Activity color)
                    const count =
                      typeof dataItem.count === 'number' ? dataItem.count : 0;

                    const formattedDate = formatTooltipDate(dateStr);
                    const activityStatus = getActivityStatus(count, dateStr);

                    return (
                      <rect 
                        {...props} 
                        fill={getRectFill(count)}
                        className="cursor-pointer transition-all duration-200 hover:opacity-80 hover:stroke-2 hover:stroke-blue-400"
                      >
                        <title>{`Date: ${formattedDate}\n${activityStatus}`}</title>
                      </rect>
                    );
                  }}
                  style={{
                    fontFamily: 'inherit',
                    margin: '0 auto',
                    display: 'block',
                    ['--rhm-rect' as any]: '#E3F2FD', // Ensure base/no-data color matches legend
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Custom Legend with 14px font size */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {legendItems.map((item) => (
            <LegendItem key={item.level} color={item.color} label={item.label} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

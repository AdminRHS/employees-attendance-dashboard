'use client'

import HeatMap from '@uiw/react-heat-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceData {
  date: string;
  count: number;
  verdict?: string;
}

interface AttendanceHeatmapProps {
  data: AttendanceData[];
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

  const endDate = new Date();

  // Transform data to match HeatMap expected format
  // HeatMap expects format: { date: '2024/11/21', count: 2 }
  const transformedData = data.map(item => ({
    date: item.date.replace(/-/g, '/'), // Convert YYYY-MM-DD to YYYY/MM/DD
    count: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Attendance Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track daily attendance patterns over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <HeatMap
          value={transformedData}
          width="100%"
          startDate={startDate}
          endDate={endDate}
          panelColors={{
            0: '#ebedf0',      // Gray - less than 30% OK
            1: '#fecaca',      // Light red - 30-50% OK
            2: '#fed7aa',      // Orange - 50-70% OK
            3: '#86efac',      // Light green - 70-90% OK
            4: '#22c55e',      // Green - 90%+ OK
          }}
          rectProps={{
            rx: 3,
          }}
          legendCellSize={12}
          rectSize={14}
          space={4}
        />
      </CardContent>
    </Card>
  );
}

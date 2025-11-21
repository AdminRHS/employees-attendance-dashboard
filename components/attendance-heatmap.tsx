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
          value={data}
          width="100%"
          startDate={startDate}
          endDate={endDate}
          panelColors={{
            0: '#ebedf0',
            1: '#9be9a8',
            2: '#40c463',
            3: '#30a14e',
            4: '#216e39',
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

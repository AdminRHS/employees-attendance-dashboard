'use client';

import { useEffect, useState } from 'react';
import { Card, Metric, Text, Title, BarList, Flex, Grid, Badge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, TextInput } from '@tremor/react';
import { Search, AlertTriangle, CheckCircle, HelpCircle, Clock } from 'lucide-react';
import { Report } from '@/types';

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredReports(
        reports.filter((r) =>
          r.name.toLowerCase().includes(lowerQuery) ||
          r.department.toLowerCase().includes(lowerQuery) ||
          r.profession.toLowerCase().includes(lowerQuery)
        )
      );
    } else {
      setFilteredReports(reports);
    }
  }, [searchQuery, reports]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalRecords = reports.length;
  const suspiciousActivity = reports.filter((r) => r.verdict.includes('SUSPICIOUS')).length;
  const officialLeaves = reports.filter((r) => r.verdict.includes('LEAVE') || r.verdict.includes('HALF DAY')).length;
  const checkRequired = reports.filter((r) => r.verdict.includes('CHECK')).length;

  const getVerdictBadge = (verdict: string) => {
    if (verdict.includes('SUSPICIOUS')) return <Badge color="red" icon={AlertTriangle}>{verdict}</Badge>;
    if (verdict.includes('CHECK')) return <Badge color="yellow" icon={HelpCircle}>{verdict}</Badge>;
    if (verdict.includes('LEAVE') || verdict.includes('HALF DAY')) return <Badge color="blue" icon={Clock}>{verdict}</Badge>;
    if (verdict.includes('OK')) return <Badge color="green" icon={CheckCircle}>{verdict}</Badge>;
    return <Badge color="gray">{verdict}</Badge>;
  };

  return (
    <main className="p-6 sm:p-10 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <Title className="text-3xl font-bold text-slate-900">Remote Helpers Control Center</Title>
        <Text className="text-slate-500">HR Audit Dashboard</Text>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-8">
        <Card decoration="top" decorationColor="indigo">
          <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
            <Metric>{totalRecords}</Metric>
            <Text>Total Records</Text>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="red">
          <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
            <Metric className="text-red-600">{suspiciousActivity}</Metric>
            <Text>Suspicious Activity</Text>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
            <Metric className="text-blue-600">{officialLeaves}</Metric>
            <Text>Official Leaves</Text>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="yellow">
          <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
            <Metric className="text-yellow-600">{checkRequired}</Metric>
            <Text>Check Required</Text>
          </Flex>
        </Card>
      </Grid>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Title>Audit Logs</Title>
          <div className="w-full md:w-72">
            <TextInput
              icon={Search}
              placeholder="Search by Employee Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading data...</div>
        ) : (
          <Table className="mt-5">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Verdict</TableHeaderCell>
                <TableHeaderCell>Voice Time</TableHeaderCell>
                <TableHeaderCell>CRM Time</TableHeaderCell>
                <TableHeaderCell>Issue / Context</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.profession} | {item.department}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getVerdictBadge(item.verdict)}
                  </TableCell>
                  <TableCell>{item.discordTime}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{item.crmTime}</span>
                      <span className="text-xs text-slate-400">{item.crmStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.issue ? (
                      <span className="text-red-600 font-medium">{item.issue}</span>
                    ) : (
                      <span className="text-slate-400 italic">No issues</span>
                    )}
                    {item.report && (
                      <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={item.report}>
                        {item.report}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </main>
  );
}

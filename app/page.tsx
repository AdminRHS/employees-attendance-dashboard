'use client';

import { useEffect, useState } from 'react';
import {
  Card, Metric, Text, Title, Badge, Table, TableHead, TableRow,
  TableHeaderCell, TableBody, TableCell, TextInput, Flex, Grid,
  LineChart, BarChart, DonutChart, DateRangePicker, DateRangePickerValue,
  Select, SelectItem, Button
} from '@tremor/react';
import {
  Search, AlertTriangle, CheckCircle, HelpCircle, Clock,
  RefreshCw, Download, X, CheckCircle2, AlertCircle, Info, Briefcase
} from 'lucide-react';
import { Report } from '@/types';

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = type === 'success' ? 'border-green-500' : type === 'error' ? 'border-red-500' : 'border-blue-500';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} border-l-4 ${borderColor} p-4 rounded shadow-lg z-50 max-w-md`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${textColor} mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <button onClick={onClose} className={`ml-3 ${textColor} hover:opacity-70`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Loading skeleton component
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4 py-4 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}

// Helper function to format time values
function formatTime(timeStr: string): string {
  if (!timeStr) return '0h';

  const minutes = parseInt(timeStr);
  if (isNaN(minutes)) return timeStr;

  const hours = (minutes / 60).toFixed(1);
  return `${hours}h`;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: undefined,
    to: undefined,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, reports, dateRange]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchReports = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/reports');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch data');
      }

      setReports(data);
      setFilteredReports(data);
      setErrorDetails('');

      if (isRefresh) {
        showToast('Data refreshed successfully!', 'success');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch data';
      setErrorDetails(errorMsg);
      showToast(`Error: ${errorMsg}`, 'error');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.department.toLowerCase().includes(lowerQuery) ||
        r.profession.toLowerCase().includes(lowerQuery)
      );
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((r) => {
        const reportDate = parseDate(r.date);
        const fromDate = dateRange.from!.getTime();
        const toDate = dateRange.to!.getTime();
        return reportDate >= fromDate && reportDate <= toDate;
      });
    }

    setFilteredReports(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 0;

    // Try DD.MM.YYYY format
    const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
    }

    // Try DD/MM/YYYY format
    const ddmmyyyySlashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyySlashMatch) {
      const [, day, month, year] = ddmmyyyySlashMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
    }

    // Try standard parsing
    const standardDate = new Date(dateStr).getTime();
    if (!isNaN(standardDate)) {
      return standardDate;
    }

    return 0;
  };

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Employee Name', 'Department', 'Profession', 'Status', 'Verdict', 'Discord Time', 'CRM Time', 'CRM Status', 'Leave', 'Leave Rate', 'Issue', 'Report'];
      const csvContent = [
        headers.join(','),
        ...paginatedReports.map(r => [
          r.date,
          `"${r.name}"`,
          `"${r.department}"`,
          `"${r.profession}"`,
          `"${r.currentStatus}"`,
          `"${r.verdict}"`,
          formatTime(r.discordTime),
          formatTime(r.crmTime),
          `"${r.crmStatus}"`,
          r.leave,
          r.leaveRate,
          `"${r.issue}"`,
          `"${r.report}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `hr-audit-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showToast(`Exported ${paginatedReports.length} records to CSV`, 'success');
    } catch (error) {
      showToast('Failed to export CSV', 'error');
    }
  };

  // KPI Calculations
  const totalRecords = reports.length;
  const suspiciousActivity = reports.filter((r) => r.verdict.includes('SUSPICIOUS')).length;
  const officialLeaves = reports.filter((r) => r.verdict.includes('LEAVE') || r.verdict.includes('HALF DAY')).length;
  const checkRequired = reports.filter((r) => r.verdict.includes('CHECK')).length;
  const projectBased = reports.filter((r) => r.verdict.includes('PROJECT')).length;
  const noReport = reports.filter((r) => r.verdict.includes('NO REPORT')).length;

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Chart data preparation
  const prepareChartData = () => {
    // Trend chart: Group by date and verdict
    const dateVerdictMap: { [date: string]: { [verdict: string]: number } } = {};

    reports.forEach(r => {
      if (!dateVerdictMap[r.date]) {
        dateVerdictMap[r.date] = {};
      }
      const verdictType = r.verdict.includes('SUSPICIOUS') ? 'Suspicious' :
                         r.verdict.includes('CHECK') ? 'Check Required' :
                         r.verdict.includes('PROJECT') ? 'Project' :
                         r.verdict.includes('NO REPORT') ? 'No Report' :
                         r.verdict.includes('LEAVE') || r.verdict.includes('HALF DAY') ? 'Leave' : 'OK';
      dateVerdictMap[r.date][verdictType] = (dateVerdictMap[r.date][verdictType] || 0) + 1;
    });

    const trendData = Object.entries(dateVerdictMap)
      .map(([date, verdicts]) => ({
        date,
        'Suspicious': verdicts['Suspicious'] || 0,
        'Check Required': verdicts['Check Required'] || 0,
        'Project': verdicts['Project'] || 0,
        'No Report': verdicts['No Report'] || 0,
        'Leave': verdicts['Leave'] || 0,
        'OK': verdicts['OK'] || 0,
      }))
      .sort((a, b) => parseDate(a.date) - parseDate(b.date))
      .slice(-30); // Last 30 days

    // Department bar chart
    const deptMap: { [dept: string]: number } = {};
    reports.filter(r => r.verdict.includes('SUSPICIOUS')).forEach(r => {
      deptMap[r.department] = (deptMap[r.department] || 0) + 1;
    });

    const deptData = Object.entries(deptMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Verdict pie chart
    const verdictData = [
      { name: 'Suspicious', value: suspiciousActivity, color: 'red' },
      { name: 'Check Required', value: checkRequired, color: 'yellow' },
      { name: 'Project', value: projectBased, color: 'purple' },
      { name: 'No Report', value: noReport, color: 'orange' },
      { name: 'Leave', value: officialLeaves, color: 'blue' },
      { name: 'OK', value: totalRecords - suspiciousActivity - checkRequired - projectBased - noReport - officialLeaves, color: 'green' },
    ].filter(v => v.value > 0);

    return { trendData, deptData, verdictData };
  };

  const { trendData, deptData, verdictData } = prepareChartData();

  const getVerdictBadge = (verdict: string) => {
    if (verdict.includes('SUSPICIOUS')) return <Badge color="red" icon={AlertTriangle}>{verdict}</Badge>;
    if (verdict.includes('CHECK')) return <Badge color="yellow" icon={HelpCircle}>{verdict}</Badge>;
    if (verdict.includes('PROJECT')) return <Badge color="purple" icon={Briefcase}>{verdict}</Badge>;
    if (verdict.includes('NO REPORT')) return <Badge color="orange" icon={AlertTriangle}>{verdict}</Badge>;
    if (verdict.includes('LEAVE') || verdict.includes('HALF DAY')) return <Badge color="blue" icon={Clock}>{verdict}</Badge>;
    if (verdict.includes('OK')) return <Badge color="green" icon={CheckCircle}>{verdict}</Badge>;
    return <Badge color="gray">{verdict}</Badge>;
  };

  return (
    <main className="p-4 sm:p-6 lg:p-10 bg-slate-50 min-h-screen">
      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-8">
        <Title className="text-2xl sm:text-3xl font-bold text-slate-900">Remote Helpers Control Center</Title>
        <Text className="text-slate-500">HR Audit Dashboard</Text>
      </div>

      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={6} className="gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        <Card decoration="top" decorationColor="purple">
          <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
            <Metric className="text-purple-600">{projectBased}</Metric>
            <Text>Project Work</Text>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="orange">
          <Flex justifyContent="start" alignItems="baseline" className="space-x-2">
            <Metric className="text-orange-600">{noReport}</Metric>
            <Text>No Report</Text>
          </Flex>
        </Card>
      </Grid>

      {/* Analytics Charts */}
      {!loading && reports.length > 0 && (
        <Grid numItems={1} numItemsLg={3} className="gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="lg:col-span-2">
            <Title>Activity Trend (Last 30 Days)</Title>
            <LineChart
              className="mt-6 h-80"
              data={trendData}
              index="date"
              categories={['Suspicious', 'Check Required', 'Project', 'No Report', 'Leave', 'OK']}
              colors={['red', 'yellow', 'purple', 'orange', 'blue', 'green']}
              yAxisWidth={40}
            />
          </Card>
          <Card>
            <Title>Verdict Distribution</Title>
            <DonutChart
              className="mt-6 h-80"
              data={verdictData}
              category="value"
              index="name"
              colors={['red', 'yellow', 'purple', 'orange', 'blue', 'green']}
            />
          </Card>
        </Grid>
      )}

      {!loading && deptData.length > 0 && (
        <Card className="mb-6 sm:mb-8">
          <Title>Top Departments with Suspicious Activity</Title>
          <BarChart
            className="mt-6 h-80"
            data={deptData}
            index="name"
            categories={['value']}
            colors={['red']}
            yAxisWidth={48}
          />
        </Card>
      )}

      {/* Main Data Table */}
      <Card>
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Title>Audit Logs</Title>
            <Button
              icon={RefreshCw}
              variant="secondary"
              onClick={() => fetchReports(true)}
              loading={refreshing}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TextInput
              icon={Search}
              placeholder="Search by name, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <DateRangePicker
              value={dateRange}
              onValueChange={setDateRange}
              placeholder="Select date range..."
              className="max-w-md"
            />
            <Select value={itemsPerPage.toString()} onValueChange={(val) => setItemsPerPage(Number(val))}>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </Select>
            <Button
              icon={Download}
              variant="secondary"
              onClick={exportToCSV}
              disabled={paginatedReports.length === 0}
            >
              Export CSV
            </Button>
          </div>

          {/* Results count */}
          <Text className="text-sm text-slate-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} records
            {searchQuery || dateRange.from ? ' (filtered)' : ''}
          </Text>
        </div>

        {/* Error state */}
        {errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Failed to load data</p>
                <p className="text-sm text-red-600 mt-1">{errorDetails}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <TableSkeleton />
        ) : filteredReports.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No records found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || dateRange.from
                ? 'Try adjusting your filters or search query'
                : 'No data available. Check your Google Sheets connection.'}
            </p>
            {(searchQuery || dateRange.from) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setDateRange({ from: undefined, to: undefined });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="mt-5">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Employee</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Verdict</TableHeaderCell>
                    <TableHeaderCell>Voice Time</TableHeaderCell>
                    <TableHeaderCell>CRM Time</TableHeaderCell>
                    <TableHeaderCell>Issue / Context</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedReports.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{item.name}</span>
                          <span className="text-xs text-slate-500">{item.profession} | {item.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">{item.currentStatus}</span>
                      </TableCell>
                      <TableCell>
                        {getVerdictBadge(item.verdict)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatTime(item.discordTime)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatTime(item.crmTime)}</span>
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <Text className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
}

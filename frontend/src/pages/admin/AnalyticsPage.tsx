import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserMinus, DollarSign, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { analyticsService, AnalyticsSummary, AttendanceTrend, DepartmentDistribution } from '../../services/analyticsService';
import { StatsCard } from '../../components/dashboard/StatsCard';

export function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [distribution, setDistribution] = useState<DepartmentDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryData, trendsData, distData] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getAttendanceTrends(),
          analyticsService.getDepartmentDistribution()
        ]);
        setSummary(summaryData);
        setTrends(trendsData);
        setDistribution(distData);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500">Overview of organization metrics and performance</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Employees"
            value={summary.employeeCount}
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Active Today"
            value={summary.activeEmployees}
            icon={UserCheck}
            variant="success"
          />
          <StatsCard
            title="On Leave"
            value={summary.onLeaveToday}
            icon={UserMinus}
            variant="warning"
          />
          <StatsCard
            title="Total Payroll"
            value={`$${(summary.totalPayroll / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            variant="info"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Trends Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-primary-600" size={20} />
              Weekly Attendance Trends
            </h2>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {trends.map((day) => (
              <div key={day.date} className="w-full flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col-reverse h-full gap-1">
                  <div 
                    className="w-full bg-green-500 rounded-t opacity-80 group-hover:opacity-100 transition-all"
                    style={{ height: `${(day.present / 150) * 100}%` }}
                    title={`Present: ${day.present}`}
                  />
                  <div 
                    className="w-full bg-red-400 rounded-sm opacity-80 group-hover:opacity-100 transition-all"
                    style={{ height: `${(day.absent / 150) * 100}%` }}
                    title={`Absent: ${day.absent}`}
                  />
                   <div 
                    className="w-full bg-yellow-400 rounded-b opacity-80 group-hover:opacity-100 transition-all"
                    style={{ height: `${(day.leave / 150) * 100}%` }}
                    title={`Leave: ${day.leave}`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Present</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-full"></div> Absent</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> On Leave</div>
          </div>
        </div>

        {/* Department Distribution Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="text-primary-600" size={20} />
              Employee Distribution
            </h2>
          </div>
          
          <div className="space-y-4">
            {distribution.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{dept.department}</span>
                  <span className="text-gray-500">{dept.count} Employees</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${(dept.count / 150) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

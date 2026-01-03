import React, { useEffect, useState } from 'react';
import { dashboardService, EmployeeStats } from '../../services/dashboardService';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { FileText, Clock, CheckCircle, Plus, Calendar, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getEmployeeStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500">Manage your leaves and view history</p>
        </div>
        <div className="flex gap-3">
          <Link to="/employee/leaves">
            <Button>
              Apply Leave <Plus className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Leave Balance"
          value={stats.leaveBalance}
          icon={Wallet}
          variant="info"
        />
        <StatsCard
          title="Total Applied"
          value={stats.leavesApplied}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingLeaves}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Approved"
          value={stats.approvedLeaves}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/employee/apply-leave">
            <Button className="w-full justify-center h-auto py-4 text-base" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Apply for Leave
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-center h-auto py-4 text-base" size="lg">
            <Calendar className="mr-2 h-5 w-5" />
            View History
          </Button>
        </div>

        {/* Recent Requests */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
              <Link to="/employee/leaves" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentRequests.length > 0 ? (
                stats.recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        request.status === 'approved' ? 'bg-green-500' :
                        request.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.type}</p>
                        <p className="text-xs text-gray-500">{request.startDate} - {request.endDate}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No recent leave requests</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

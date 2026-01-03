import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { dashboardService, AdminStats } from '../../services/dashboardService';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getAdminStats();
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of leave management system</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/leaves">
            <Button>
              Manage Leaves <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          variant="info"
          trend={{ value: 12, label: "vs last month", isPositive: true }}
        />
        <StatsCard
          title="Pending"
          value={stats.pendingRequests}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Approved"
          value={stats.approvedRequests}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejectedRequests}
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions Panel */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/admin/leaves" className="block">
              <div className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50 hover:border-primary-200">
                <div className="rounded-full bg-primary-100 p-2 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Review Requests</p>
                  <p className="text-sm text-gray-500">Process pending leaves</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/employees" className="block">
              <div className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50 hover:border-primary-200">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Employees</p>
                  <p className="text-sm text-gray-500">Manage staff details</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/admin/leaves" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-500' :
                    activity.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.type} • {activity.date}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                  activity.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

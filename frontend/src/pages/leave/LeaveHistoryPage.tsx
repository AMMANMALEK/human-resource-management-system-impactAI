import React, { useEffect, useState } from 'react';
import { leaveService, LeaveRequest } from '../../services/leaveService';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { FileText, Plus, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function LeaveHistoryPage() {
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaveService.getLeaveHistory();
      // Sort by created date descending
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setHistory(sortedData);
    } catch (err) {
      setError('Failed to load leave history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  const truncateReason = (reason: string, maxLength: number = 50) => {
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading History</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={fetchHistory} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave History</h3>
        <p className="text-gray-500 mb-6">You haven't submitted any leave requests yet.</p>
        <Link to="/employee/apply-leave">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-500">View and track your past leave requests</p>
        </div>
        <Link to="/employee/apply-leave">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Desktop/Tablet View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">From Date</th>
                <th className="px-6 py-4">To Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((request) => (
                <tr 
                  key={request.id} 
                  className="hover:bg-gray-50 transition-colors duration-150 group"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        request.leaveType === 'Sick' ? "bg-red-500" :
                        request.leaveType === 'Casual' ? "bg-blue-500" : "bg-green-500"
                      )} />
                      {request.leaveType}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(request.fromDate)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(request.toDate)}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs">
                    <div className="relative group/tooltip cursor-help">
                      <span className="truncate block">
                        {truncateReason(request.reason)}
                      </span>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        {request.reason}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {history.map((request) => (
          <div 
            key={request.id} 
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  request.leaveType === 'Sick' ? "bg-red-500" :
                  request.leaveType === 'Casual' ? "bg-blue-500" : "bg-green-500"
                )} />
                <span className="font-semibold text-gray-900">{request.leaveType}</span>
              </div>
              <StatusBadge status={request.status} />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(request.fromDate)} - {formatDate(request.toDate)}</span>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-medium text-gray-900">Reason: </span>
                {request.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="bg-gray-50 h-12 border-b border-gray-200" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center p-4 border-b border-gray-100 last:border-0">
            <div className="w-1/5 h-4 bg-gray-200 rounded animate-pulse mr-4" />
            <div className="w-1/5 h-4 bg-gray-200 rounded animate-pulse mr-4" />
            <div className="w-1/5 h-4 bg-gray-200 rounded animate-pulse mr-4" />
            <div className="w-1/5 h-4 bg-gray-200 rounded animate-pulse mr-4" />
            <div className="w-1/5 h-6 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 h-40 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-6 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-12 w-full bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

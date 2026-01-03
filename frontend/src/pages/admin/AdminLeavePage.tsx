import { useEffect, useState } from 'react';
import { leaveService, LeaveRequest } from '../../services/leaveService';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LeaveActionModal } from '../../components/leave/LeaveActionModal';
import { Check, X, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export function AdminLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaveService.getAllLeaveRequests();
      // Sort by Pending first, then by date desc
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setRequests(sorted);
    } catch (err) {
      setError('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setModalOpen(true);
  };

  const handleConfirmAction = async (id: string, comment: string) => {
    if (actionType === 'approve') {
      await leaveService.approveLeaveRequest(id, comment);
    } else {
      await leaveService.rejectLeaveRequest(id, comment);
    }

    // Optimistic update
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: actionType === 'approve' ? 'APPROVED' : 'REJECTED'
        };
      }
      return req;
    }));
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  });

  const truncateReason = (reason: string) => {
    if (reason.length <= 50) return reason;
    return reason.substring(0, 50) + '...';
  };

  if (isLoading) return <AdminLeaveSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Error Loading Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchRequests}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Review and process employee leave requests</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                filter === f
                  ? "bg-primary-50 text-primary-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="text-gray-500">There are no leave requests matching your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Employee</th>
                  <th className="px-6 py-4 whitespace-nowrap">Leave Type</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dates</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {req.employeeName || 'Unknown Employee'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          req.leaveType === 'Sick' ? "bg-red-500" :
                            req.leaveType === 'Casual' ? "bg-blue-500" : "bg-green-500"
                        )} />
                        {req.leaveType}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {req.fromDate} <span className="text-gray-400 mx-1">to</span> {req.toDate}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="relative group/tooltip cursor-help">
                        <span className="truncate block text-gray-600">
                          {truncateReason(req.reason)}
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-20 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none">
                          {req.reason}
                          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            onClick={() => handleAction(req, 'approve')}
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleAction(req, 'reject')}
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeaveActionModal
        isOpen={modalOpen}
        onClose={() => {
          console.log('Modal closed via onClose');
          setModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmAction}
        request={selectedRequest}
        action={actionType}
      />
    </div>
  );
}

function AdminLeaveSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

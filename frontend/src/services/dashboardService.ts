import { apiClient } from '../api/client';

export interface AdminStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  recentActivity: {
    id: string;
    user: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
  }[];
}

export interface EmployeeStats {
  leavesApplied: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  leaveBalance: number;
  recentRequests: {
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    startDate: string;
    endDate: string;
  }[];
}

const MOCK_ADMIN_STATS: AdminStats = {
  totalRequests: 124,
  pendingRequests: 12,
  approvedRequests: 89,
  rejectedRequests: 23,
  recentActivity: [
    { id: '1', user: 'Sarah Wilson', type: 'Annual Leave', status: 'pending', date: '2024-03-10' },
    { id: '2', user: 'Mike Johnson', type: 'Sick Leave', status: 'approved', date: '2024-03-09' },
    { id: '3', user: 'Emily Davis', type: 'Remote Work', status: 'rejected', date: '2024-03-08' },
  ]
};

const MOCK_EMPLOYEE_STATS: EmployeeStats = {
  leavesApplied: 15,
  pendingLeaves: 2,
  approvedLeaves: 12,
  rejectedLeaves: 1,
  leaveBalance: 14,
  recentRequests: [
    { id: '1', type: 'Annual Leave', status: 'pending', startDate: '2024-04-01', endDate: '2024-04-05' },
    { id: '2', type: 'Sick Leave', status: 'approved', startDate: '2024-02-15', endDate: '2024-02-16' },
  ]
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 800;

export const dashboardService = {
  getAdminStats: async (): Promise<AdminStats> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_ADMIN_STATS), DELAY_MS));
    }
    try {
      const response = await apiClient.get<AdminStats>('/dashboard/admin-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  },

  getEmployeeStats: async (): Promise<EmployeeStats> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_EMPLOYEE_STATS), DELAY_MS));
    }
    try {
      const response = await apiClient.get<EmployeeStats>('/dashboard/employee-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employee stats');
    }
  }
};

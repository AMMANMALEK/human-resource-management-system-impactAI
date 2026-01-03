import { apiClient } from '../api/client';

export interface AnalyticsSummary {
  employeeCount: number;
  activeEmployees: number;
  onLeaveToday: number;
  totalPayroll: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

export interface DepartmentDistribution {
  department: string;
  count: number;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 1000;

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            employeeCount: 150,
            activeEmployees: 142,
            onLeaveToday: 8,
            totalPayroll: 12500000
          });
        }, DELAY_MS);
      });
    }
    try {
      const response = await apiClient.get<AnalyticsSummary>('/analytics/summary');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics summary');
    }
  },

  getAttendanceTrends: async (): Promise<AttendanceTrend[]> => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              { date: 'Mon', present: 140, absent: 5, leave: 5 },
              { date: 'Tue', present: 138, absent: 7, leave: 5 },
              { date: 'Wed', present: 142, absent: 3, leave: 5 },
              { date: 'Thu', present: 139, absent: 6, leave: 5 },
              { date: 'Fri', present: 135, absent: 10, leave: 5 },
            ]);
          }, DELAY_MS);
        });
    }
    try {
      const response = await apiClient.get<AttendanceTrend[]>('/analytics/attendance-trends');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance trends');
    }
  },

  getDepartmentDistribution: async (): Promise<DepartmentDistribution[]> => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              { department: 'Engineering', count: 60 },
              { department: 'Sales', count: 30 },
              { department: 'Marketing', count: 20 },
              { department: 'HR', count: 10 },
              { department: 'Finance', count: 15 },
              { department: 'Support', count: 15 },
            ]);
          }, DELAY_MS);
        });
    }
    try {
      const response = await apiClient.get<DepartmentDistribution[]>('/analytics/department-distribution');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch department distribution');
    }
  }
};

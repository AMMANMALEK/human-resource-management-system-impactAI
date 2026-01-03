import { apiClient } from '../api/client';

export interface LeaveRequest {
  id: string;
  leaveType: 'Casual' | 'Sick' | 'Paid';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  employeeName?: string; // Optional for admin view
}

export interface CreateLeaveRequest {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

const MOCK_LEAVES: LeaveRequest[] = [
  { id: '1', leaveType: 'Casual', fromDate: '2024-04-01', toDate: '2024-04-02', reason: 'Personal work', status: 'PENDING', createdAt: '2024-03-20', employeeName: 'John Doe' },
  { id: '2', leaveType: 'Sick', fromDate: '2024-03-15', toDate: '2024-03-16', reason: 'Fever', status: 'APPROVED', createdAt: '2024-03-14', employeeName: 'John Doe' },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 800;

export const leaveService = {
  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_LEAVES), DELAY_MS));
    }
    try {
      const response = await apiClient.get<LeaveRequest[]>('/leave/all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave requests');
    }
  },

  approveLeaveRequest: async (id: string, comment?: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const leave = MOCK_LEAVES.find(l => l.id === id);
          if (leave) leave.status = 'APPROVED';
          resolve();
        }, DELAY_MS);
      });
    }
    try {
      await apiClient.post(`/leave/${id}/approve`, { comment });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve leave request');
    }
  },

  rejectLeaveRequest: async (id: string, reason: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const leave = MOCK_LEAVES.find(l => l.id === id);
          if (leave) leave.status = 'REJECTED';
          resolve();
        }, DELAY_MS);
      });
    }
    try {
      await apiClient.post(`/leave/${id}/reject`, { reason });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject leave request');
    }
  },

  applyLeave: async (data: CreateLeaveRequest): Promise<LeaveRequest> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newLeave: LeaveRequest = {
            id: Math.random().toString(36).substr(2, 9),
            leaveType: data.leaveType as any,
            fromDate: data.fromDate,
            toDate: data.toDate,
            reason: data.reason,
            status: 'PENDING',
            createdAt: new Date().toISOString().split('T')[0]
          };
          MOCK_LEAVES.unshift(newLeave);
          resolve(newLeave);
        }, DELAY_MS);
      });
    }
    try {
      // Backend expects: startDay, endDay, reason
      const payload = {
        startDay: data.fromDate,
        endDay: data.toDate,
        reason: `${data.leaveType}: ${data.reason}`
      };
      const response = await apiClient.post<LeaveRequest>('/leave/apply', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit leave request');
    }
  },

  validateLeaveRequest: (data: CreateLeaveRequest): Record<string, string> => {
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromDate = new Date(data.fromDate);
    const toDate = new Date(data.toDate);

    // Leave Type Validation
    if (!data.leaveType) {
      errors.leaveType = 'Please select a leave type';
    }

    // Date Validations
    if (!data.fromDate) {
      errors.fromDate = 'Start date is required';
    } else if (fromDate < today) {
      errors.fromDate = 'Start date cannot be in the past';
    }

    if (!data.toDate) {
      errors.toDate = 'End date is required';
    } else if (toDate < fromDate) {
      errors.toDate = 'End date cannot be before start date';
    } else {
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
      if (diffDays > 30) {
        errors.toDate = 'Leave duration cannot exceed 30 days';
      }
    }

    // Reason Validation
    if (!data.reason) {
      errors.reason = 'Reason is required';
    } else if (data.reason.length < 20) {
      errors.reason = 'Reason must be at least 20 characters';
    } else if (data.reason.length > 500) {
      errors.reason = 'Reason cannot exceed 500 characters';
    }

    return errors;
  },

  getLeaveHistory: async (): Promise<LeaveRequest[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_LEAVES), DELAY_MS));
    }
    try {
      const response = await apiClient.get<LeaveRequest[]>('/leave/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave history');
    }
  }
};

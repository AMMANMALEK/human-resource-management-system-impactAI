export interface LeaveRequest {
  id: string;
  leaveType: 'Casual' | 'Sick' | 'Paid';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  employeeName?: string; // Optional for admin view
}

export interface CreateLeaveRequest {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

const DELAY_MS = 1000;

export const leaveService = {
  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRequests: LeaveRequest[] = [
          {
            id: 'REF-001',
            leaveType: 'Casual',
            fromDate: '2026-02-10',
            toDate: '2026-02-12',
            reason: 'Visiting family out of town for a wedding ceremony and family gathering.',
            status: 'Approved',
            createdAt: '2026-01-15T10:00:00Z',
            employeeName: 'Sarah Wilson'
          },
          {
            id: 'REF-002',
            leaveType: 'Sick',
            fromDate: '2026-01-20',
            toDate: '2026-01-21',
            reason: 'High fever and flu symptoms.',
            status: 'Rejected',
            createdAt: '2026-01-19T08:30:00Z',
            employeeName: 'Mike Johnson'
          },
          {
            id: 'REF-003',
            leaveType: 'Paid',
            fromDate: '2026-03-01',
            toDate: '2026-03-05',
            reason: 'Annual vacation trip to mountains.',
            status: 'Pending',
            createdAt: '2026-02-25T09:15:00Z',
            employeeName: 'Emily Davis'
          },
          {
            id: 'REF-004',
            leaveType: 'Casual',
            fromDate: '2025-12-24',
            toDate: '2025-12-26',
            reason: 'Christmas celebration with family.',
            status: 'Approved',
            createdAt: '2025-12-10T11:20:00Z',
            employeeName: 'John Doe'
          },
          {
            id: 'REF-005',
            leaveType: 'Sick',
            fromDate: '2026-03-10',
            toDate: '2026-03-12',
            reason: 'Scheduled dental surgery.',
            status: 'Pending',
            createdAt: '2026-03-01T14:20:00Z',
            employeeName: 'Sarah Wilson'
          }
        ];
        resolve(mockRequests);
      }, DELAY_MS);
    });
  },

  approveLeaveRequest: async (id: string, comment?: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, DELAY_MS);
    });
  },

  rejectLeaveRequest: async (id: string, reason: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, DELAY_MS);
    });
  },

  applyLeave: async (data: CreateLeaveRequest): Promise<LeaveRequest> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random failure (10% chance)
        if (Math.random() < 0.1) {
          reject(new Error('Failed to submit leave request. Please try again.'));
          return;
        }

        const newRequest: LeaveRequest = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          leaveType: data.leaveType as LeaveRequest['leaveType'],
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        resolve(newRequest);
      }, DELAY_MS);
    });
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHistory: LeaveRequest[] = [
          {
            id: 'REF-001',
            leaveType: 'Casual',
            fromDate: '2026-02-10',
            toDate: '2026-02-12',
            reason: 'Visiting family out of town for a wedding ceremony and family gathering.',
            status: 'Approved',
            createdAt: '2026-01-15T10:00:00Z'
          },
          {
            id: 'REF-002',
            leaveType: 'Sick',
            fromDate: '2026-01-20',
            toDate: '2026-01-21',
            reason: 'High fever and flu symptoms.',
            status: 'Rejected',
            createdAt: '2026-01-19T08:30:00Z'
          },
          {
            id: 'REF-003',
            leaveType: 'Paid',
            fromDate: '2026-03-01',
            toDate: '2026-03-05',
            reason: 'Annual vacation trip to mountains.',
            status: 'Pending',
            createdAt: '2026-02-25T09:15:00Z'
          },
          {
            id: 'REF-004',
            leaveType: 'Casual',
            fromDate: '2025-12-24',
            toDate: '2025-12-26',
            reason: 'Christmas celebration with family.',
            status: 'Approved',
            createdAt: '2025-12-10T11:20:00Z'
          }
        ];
        resolve(mockHistory);
      }, DELAY_MS);
    });
  }
};

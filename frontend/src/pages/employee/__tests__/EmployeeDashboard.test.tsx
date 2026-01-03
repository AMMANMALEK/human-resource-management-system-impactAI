import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeDashboard } from '../EmployeeDashboard';
import { dashboardService } from '../../../services/dashboardService';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../services/dashboardService', () => ({
  dashboardService: {
    getEmployeeStats: vi.fn(),
  },
}));

const renderDashboard = () => {
  render(
    <BrowserRouter>
      <EmployeeDashboard />
    </BrowserRouter>
  );
};

describe('EmployeeDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats after loading', async () => {
    (dashboardService.getEmployeeStats as any).mockResolvedValue({
      leavesApplied: 10,
      pendingLeaves: 2,
      approvedLeaves: 8,
      rejectedLeaves: 0,
      leaveBalance: 12,
      recentRequests: []
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // Balance
    });
  });

  it('shows error message on failure', async () => {
    (dashboardService.getEmployeeStats as any).mockRejectedValue(new Error('Failed'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });
});

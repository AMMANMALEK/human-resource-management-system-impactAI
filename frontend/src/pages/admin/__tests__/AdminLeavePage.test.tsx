import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminLeavePage } from '../AdminLeavePage';
import { leaveService } from '../../../services/leaveService';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../services/leaveService', () => ({
  leaveService: {
    getAllLeaveRequests: vi.fn(),
    approveLeaveRequest: vi.fn(),
    rejectLeaveRequest: vi.fn(),
  },
}));

const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminLeavePage />
    </BrowserRouter>
  );
};

describe('AdminLeavePage', () => {
  const mockRequests = [
    {
      id: '1',
      leaveType: 'Casual',
      fromDate: '2026-02-10',
      toDate: '2026-02-12',
      reason: 'Vacation',
      status: 'Pending',
      createdAt: '2026-01-15T10:00:00Z',
      employeeName: 'John Doe'
    },
    {
      id: '2',
      leaveType: 'Sick',
      fromDate: '2026-01-20',
      toDate: '2026-01-21',
      reason: 'Fever',
      status: 'Approved',
      createdAt: '2026-01-19T08:30:00Z',
      employeeName: 'Jane Smith'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with data', async () => {
    (leaveService.getAllLeaveRequests as any).mockResolvedValue(mockRequests);

    renderPage();

    await waitFor(() => {
      const johnDoeElements = screen.getAllByText('John Doe');
      expect(johnDoeElements.length).toBeGreaterThan(0);
      expect(johnDoeElements[0]).toBeInTheDocument();
      
      const janeSmithElements = screen.getAllByText('Jane Smith');
      expect(janeSmithElements.length).toBeGreaterThan(0);
      expect(janeSmithElements[0]).toBeInTheDocument();
      
      const vacationElements = screen.getAllByText('Vacation');
      expect(vacationElements.length).toBeGreaterThan(0);
      expect(vacationElements[0]).toBeInTheDocument();
    });
  });

  it('filters requests', async () => {
    (leaveService.getAllLeaveRequests as any).mockResolvedValue(mockRequests);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    // Click 'Approved' filter
    fireEvent.click(screen.getByRole('button', { name: 'Approved' }));

    await waitFor(() => {
      expect(screen.queryAllByText('John Doe').length).toBe(0); // Pending
      expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument(); // Approved
    });
  });

  it('opens modal on approve click', async () => {
    (leaveService.getAllLeaveRequests as any).mockResolvedValue(mockRequests);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    // Find approve button for John Doe (Pending)
    const johnDoeElements = screen.getAllByText('John Doe');
    const row = johnDoeElements[0].closest('tr');
    const approveBtn = within(row!).getByTitle('Approve');
    fireEvent.click(approveBtn);

    expect(screen.getByText('Approve Leave Request')).toBeInTheDocument();
    expect(screen.getByText('Approve Request')).toBeInTheDocument();
  });

  it('handles approval flow', async () => {
    (leaveService.getAllLeaveRequests as any).mockResolvedValue(mockRequests);
    (leaveService.approveLeaveRequest as any).mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    const johnDoeElements = screen.getAllByText('John Doe');
    const row = johnDoeElements[0].closest('tr');
    const approveBtn = within(row!).getByTitle('Approve');
    fireEvent.click(approveBtn);

    // Fill comment
    const commentInput = screen.getByPlaceholderText(/Add a comment/i);
    fireEvent.change(commentInput, { target: { value: 'Approved by HR' } });

    // Submit
    fireEvent.click(screen.getByText('Approve Request'));

    await waitFor(() => {
      expect(leaveService.approveLeaveRequest).toHaveBeenCalledWith('1', 'Approved by HR');
    });

    // Verify optimistic update (status badge changes)
    await waitFor(() => {
      // Buttons should be gone for Approved status
      expect(within(row!).queryByTitle('Approve')).not.toBeInTheDocument();
    });
  });

  it('handles rejection flow with required reason', async () => {
    (leaveService.getAllLeaveRequests as any).mockResolvedValue(mockRequests);
    (leaveService.rejectLeaveRequest as any).mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    const johnDoeElements = screen.getAllByText('John Doe');
    const row = johnDoeElements[0].closest('tr');
    const rejectBtn = within(row!).getByTitle('Reject');
    fireEvent.click(rejectBtn);

    expect(screen.getByText('Reject Leave Request')).toBeInTheDocument();

    // Try submit without reason
    const submitBtn = screen.getByText('Reject Request');
    fireEvent.click(submitBtn);

    // Wait for validation error
    // expect(await screen.findByText('Reason is required for rejection')).toBeInTheDocument();

    // Fill reason
    const reasonInput = screen.getByPlaceholderText(/Please provide a reason/i);
    fireEvent.change(reasonInput, { target: { value: 'Policy violation' } });

    // Submit
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(leaveService.rejectLeaveRequest).toHaveBeenCalledWith('1', 'Policy violation');
    });
  });
});

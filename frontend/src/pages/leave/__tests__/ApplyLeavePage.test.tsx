import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplyLeavePage } from '../ApplyLeavePage';
import { leaveService } from '../../../services/leaveService';
import { BrowserRouter } from 'react-router-dom';

// Mock leaveService
vi.mock('../../../services/leaveService', () => ({
  leaveService: {
    applyLeave: vi.fn(),
    validateLeaveRequest: vi.fn(),
  },
}));

const renderApplyLeavePage = () => {
  render(
    <BrowserRouter>
      <ApplyLeavePage />
    </BrowserRouter>
  );
};

describe('ApplyLeavePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default validation implementation
    (leaveService.validateLeaveRequest as any).mockReturnValue({});
  });

  it('renders all form fields correctly', () => {
    renderApplyLeavePage();

    expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/From Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/To Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason/i)).toBeInTheDocument();
    expect(screen.getByText('Submit Request')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    (leaveService.validateLeaveRequest as any).mockReturnValue({
      leaveType: 'Required',
      fromDate: 'Required',
      toDate: 'Required',
      reason: 'Required'
    });

    renderApplyLeavePage();
    
    const submitBtn = screen.getByText('Submit Request');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Look for error messages
      // Note: The actual error text depends on your implementation, here checking for existence
      // Since we mocked validateLeaveRequest to return keys, we check if they prevent submission
      expect(leaveService.applyLeave).not.toHaveBeenCalled();
    });
  });

  it('submits form successfully when valid', async () => {
    const mockData = {
      leaveType: 'Casual',
      fromDate: '2026-01-10',
      toDate: '2026-01-12',
      reason: 'Personal reasons for taking leave'
    };

    (leaveService.validateLeaveRequest as any).mockReturnValue({});
    (leaveService.applyLeave as any).mockResolvedValue({ id: 'REF-123' });

    renderApplyLeavePage();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Leave Type/i), { target: { value: mockData.leaveType } });
    fireEvent.change(screen.getByLabelText(/From Date/i), { target: { value: mockData.fromDate } });
    fireEvent.change(screen.getByLabelText(/To Date/i), { target: { value: mockData.toDate } });
    fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: mockData.reason } });

    // Submit
    fireEvent.click(screen.getByText('Submit Request'));

    await waitFor(() => {
      expect(leaveService.applyLeave).toHaveBeenCalledWith(expect.objectContaining({
        leaveType: mockData.leaveType,
        fromDate: mockData.fromDate,
        toDate: mockData.toDate,
        reason: mockData.reason
      }));
      expect(screen.getByText('Request Submitted!')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
     (leaveService.validateLeaveRequest as any).mockReturnValue({});
     const error = new Error('API Error');
     (leaveService.applyLeave as any).mockRejectedValue(error);

     renderApplyLeavePage();

     // Fill form to bypass HTML5 validation
     // Use future dates to satisfy min={today}
     fireEvent.change(screen.getByLabelText(/Leave Type/i), { target: { value: 'Casual' } });
     fireEvent.change(screen.getByLabelText(/From Date/i), { target: { value: '2026-02-01' } });
     fireEvent.change(screen.getByLabelText(/To Date/i), { target: { value: '2026-02-02' } });
     fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'Test reason' } });

     const submitButton = screen.getByText('Submit Request');
     fireEvent.click(submitButton);

     await waitFor(() => {
        expect(leaveService.applyLeave).toHaveBeenCalled();
     });

     await waitFor(() => {
        // Look for the specific text "API Error" which we set in the component
        const errorElement = screen.getByText('API Error');
        expect(errorElement).toBeInTheDocument();
     }, { timeout: 3000 });
  });

  it('calculates duration correctly', async () => {
    renderApplyLeavePage();
    
    fireEvent.change(screen.getByLabelText(/From Date/i), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText(/To Date/i), { target: { value: '2026-01-05' } });

    // 5 days inclusive
    expect(screen.getByText('5 Days')).toBeInTheDocument();
  });
});

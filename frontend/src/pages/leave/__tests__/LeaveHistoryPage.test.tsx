import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaveHistoryPage } from '../LeaveHistoryPage';
import { leaveService } from '../../../services/leaveService';
import { BrowserRouter } from 'react-router-dom';

// Mock leaveService
vi.mock('../../../services/leaveService', () => ({
  leaveService: {
    getLeaveHistory: vi.fn(),
  },
}));

const renderPage = () => {
  render(
    <BrowserRouter>
      <LeaveHistoryPage />
    </BrowserRouter>
  );
};

describe('LeaveHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    // Mock a pending promise to keep it in loading state
    (leaveService.getLeaveHistory as any).mockReturnValue(new Promise(() => {}));
    
    renderPage();
    
    // Check for skeleton elements (using class check or structure)
    // Since skeleton doesn't have text, we check if main content is absent or skeleton specific classes present
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders history table when data is loaded', async () => {
    const mockData = [
      {
        id: '1',
        leaveType: 'Casual',
        fromDate: '2026-02-10',
        toDate: '2026-02-12',
        reason: 'Test reason',
        status: 'Approved',
        createdAt: '2026-01-15T10:00:00Z'
      }
    ];

    (leaveService.getLeaveHistory as any).mockResolvedValue(mockData);

    renderPage();

    // Use findByText which waits automatically
    expect(await screen.findByRole('heading', { name: /Leave History/i })).toBeInTheDocument();
    
    // Elements appear twice (Desktop + Mobile view)
    expect(screen.getAllByText('Casual')).toHaveLength(2);
    expect(screen.getAllByText('Approved')).toHaveLength(2);
    // Reason appears 3 times: Desktop Cell, Desktop Tooltip, Mobile Card
    expect(screen.getAllByText('Test reason')).toHaveLength(3);
  });

  it('renders empty state when no history', async () => {
    (leaveService.getLeaveHistory as any).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No Leave History')).toBeInTheDocument();
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    (leaveService.getLeaveHistory as any).mockRejectedValue(new Error('API Error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Error Loading History')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('retries loading when try again is clicked', async () => {
    (leaveService.getLeaveHistory as any)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Error Loading History')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(leaveService.getLeaveHistory).toHaveBeenCalledTimes(2);
    });
  });
});

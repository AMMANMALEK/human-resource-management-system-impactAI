# Leave History Feature Documentation

## Overview
The Leave History feature provides employees with a comprehensive view of their past and current leave requests. It supports responsive design (table for desktop, cards for mobile), real-time status tracking, and error handling.

## Components

### LeaveHistoryPage
- **Path**: `src/pages/leave/LeaveHistoryPage.tsx`
- **Description**: The main container component that fetches and displays leave history.
- **Features**:
  - Fetches data from `leaveService`.
  - Displays a responsive table for desktop and cards for mobile.
  - Handles loading (Skeleton), empty, and error states.
  - Sorts requests by date (newest first).

### StatusBadge
- **Path**: `src/components/shared/StatusBadge.tsx`
- **Description**: Reusable component to display leave status (Pending, Approved, Rejected) with consistent styling and icons.
- **Props**:
  - `status`: 'Pending' | 'Approved' | 'Rejected' (case-insensitive).
  - `className`: Optional additional classes.

## Data Integration

### leaveService.getLeaveHistory
- **Method**: `GET` (mocked)
- **Returns**: `Promise<LeaveRequest[]>`
- **Mock Data**: Simulates a network delay and returns a list of leave requests.

## Responsive Behavior

- **Desktop (>768px)**:
  - Full width table.
  - Columns: Leave Type, From Date, To Date, Reason (truncated with tooltip), Status.
  - Hover effects on rows.

- **Mobile (<768px)**:
  - Card-based layout.
  - Stacked information: Leave Type & Status header, Date range, Reason.

## Testing

Unit tests are located in `src/pages/leave/__tests__/LeaveHistoryPage.test.tsx`.
Run tests with:
```bash
npx vitest run src/pages/leave/__tests__/LeaveHistoryPage.test.tsx
```

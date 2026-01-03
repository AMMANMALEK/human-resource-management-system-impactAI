# Apply Leave Feature Documentation

## Overview
The Apply Leave feature allows employees to request leave by filling out a form with leave type, dates, and reason. It includes real-time validation, responsive design, and mock API integration.

## Components

### ApplyLeavePage
- **Path**: `src/pages/leave/ApplyLeavePage.tsx`
- **Description**: The main container component that handles form state, validation, and submission.
- **Dependencies**: `leaveService`, `Button`, `Input`, `Select`, `Textarea`, `SuccessModal`.

### Reusable UI Components
- **Input**: `src/components/ui/Input.tsx` - Text/Date input with label and error support.
- **Select**: `src/components/ui/Select.tsx` - Dropdown with label and error support.
- **Textarea**: `src/components/ui/Textarea.tsx` - Multi-line input with character counter and error support.
- **Button**: `src/components/ui/Button.tsx` - Button with loading state support.

### SuccessModal
- **Path**: `src/components/leave/SuccessModal.tsx`
- **Description**: Modal dialog shown upon successful submission with reference ID.

## Validation Rules

Validation is handled in `leaveService.ts` and applied in real-time.

1. **Leave Type**: Required.
2. **From Date**:
   - Required.
   - Must not be in the past (minimum: today).
3. **To Date**:
   - Required.
   - Must not be before From Date.
   - Duration must not exceed 30 days.
4. **Reason**:
   - Required.
   - Minimum 20 characters.
   - Maximum 500 characters.

## API Contract (Mock)

### POST /api/apply-leave

**Request Body**:
```json
{
  "leaveType": "Casual" | "Sick" | "Paid",
  "fromDate": "YYYY-MM-DD", // ISO8601 Date String
  "toDate": "YYYY-MM-DD",   // ISO8601 Date String
  "reason": "String (20-500 chars)"
}
```

**Success Response (200 OK)**:
```json
{
  "id": "REF-xyz123",
  "leaveType": "Casual",
  "fromDate": "2026-01-10",
  "toDate": "2026-01-12",
  "reason": "...",
  "status": "Pending",
  "createdAt": "2026-01-03T..."
}
```

**Error Response (Mocked Rejection)**:
- Random 10% failure rate for testing error handling.
- Returns `Error: Failed to submit leave request. Please try again.`

## Usage

To use the Apply Leave form:
1. Navigate to `/employee/apply-leave`.
2. Select a Leave Type.
3. Choose From and To dates (ensure From is >= Today and To >= From).
4. Enter a reason (min 20 chars).
5. Click "Submit Request".

## Testing

Unit tests are located in `src/pages/leave/__tests__/ApplyLeavePage.test.tsx`.
Run tests with:
```bash
npx vitest run src/pages/leave/__tests__/ApplyLeavePage.test.tsx
```

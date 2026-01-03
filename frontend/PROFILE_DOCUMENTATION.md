# Profile & Account Management Documentation

## 1. Overview

The Profile module allows users to view their account details and update editable information (Full Name). It is designed to be consistent with the application's visual style and role-based access control.

## 2. Architecture

### Component: `ProfilePage`
- **Location**: `src/pages/profile/ProfilePage.tsx`
- **Route**: `/admin/profile` and `/employee/profile`
- **Responsibilities**:
  - Fetch user data on mount.
  - Display read-only fields (Email, Role).
  - Manage "Edit Mode" state.
  - Handle form validation and submission.
  - Display success/error notifications.

### Service: `userService`
- **Location**: `src/services/userService.ts`
- **Purpose**: Abstraction layer for user-related API calls.
- **Methods**:
  - `getProfile(email)`: Fetches full user profile including avatar.
  - `updateProfile(email, data)`: Updates allowed fields.

## 3. Data Flow

1. **Initialization**:
   - `ProfilePage` reads `user.email` from `AuthContext`.
   - Calls `userService.getProfile(email)`.
   - Sets local `profile` state.

2. **Editing**:
   - User clicks "Edit Profile".
   - `isEditing` state becomes `true`.
   - Name field converts to `Input`.
   - Email/Role remain read-only with lock icons.

3. **Submission**:
   - Validation checks (Name required, length > 2).
   - Calls `userService.updateProfile()`.
   - On success: Updates local state, shows toast, exits edit mode.
   - On error: Shows error alert.

## 4. UI/UX Details

- **Avatar**: Auto-generated using UI Avatars service based on name if not provided.
- **Loading States**: Full-page loader on initial fetch; button loader on save.
- **Responsiveness**:
  - Header stacks vertically on mobile.
  - Form remains single-column for readability.
- **Accessibility**:
  - Auto-focus on name input when editing.
  - ARIA labels on inputs.
  - Keyboard navigation support.

## 5. Security

- **Read-Only Fields**: Email and Role are strictly disabled in the UI.
- **Authorization**: The page is protected by `ProtectedRoute` (inherited from parent route).
- **Validation**: Client-side validation mirrors expected server-side rules.

## 6. Extending

To add more editable fields (e.g., Phone, Bio):
1. Update `UserProfile` and `UpdateProfileData` interfaces in `userService.ts`.
2. Update `mockUsers` handling in `userService.ts`.
3. Add `Input` or `Textarea` fields to `ProfilePage.tsx`.
4. Update `validateForm` logic.

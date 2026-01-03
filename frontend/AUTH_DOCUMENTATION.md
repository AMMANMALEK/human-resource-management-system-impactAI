# Authentication & Security Documentation

## 1. Authentication Flow

The application uses a centralized authentication system powered by React Context and a mock backend service.

### Login Flow
1. **User Input**: User enters credentials on `/login`.
2. **Validation**: Client-side validation ensures email format and password requirements (min 8 chars, uppercase).
3. **API Call**: `authService.login()` is called.
   - **Mock**: Simulates network delay (1s) and validates against mock data.
   - **Success**: Returns `User` object and `token`.
   - **Storage**: User data and token are stored in `localStorage` for persistence (mock session).
4. **Context Update**: `AuthProvider` updates global state (`user`, `isAuthenticated`).
5. **Redirection**:
   - Checks for `location.state.from` (intended destination).
   - If none, redirects based on role:
     - **Admin** -> `/admin/dashboard`
     - **Employee** -> `/employee/dashboard`

### Signup Flow
1. **User Input**: User enters details on `/signup`.
2. **Validation**: Checks password match and strength.
3. **API Call**: `authService.signup()` creates a new user (mock).
4. **Auto-Login**: Automatically logs the user in after successful signup.
5. **Redirection**: Redirects to role-specific dashboard.

### Logout Flow
1. **Action**: User clicks Logout in Sidebar.
2. **Cleanup**: `authService.logout()` clears `localStorage`.
3. **Context Update**: `AuthProvider` resets state.
4. **Redirection**: User is sent to `/login`.

---

## 2. Role-Based Access Control (RBAC)

We use a hierarchical and route-based approach to security.

### Roles
Defined in `src/constants/roles.ts`:
- `admin`: Full access to system management.
- `employee`: Access to personal leave management.

### Route Protection Components

#### `ProtectedRoute`
- **Location**: `src/components/security/ProtectedRoute.tsx`
- **Purpose**: Ensures user is logged in.
- **Behavior**:
  - If unauthenticated: Redirects to `/login`.
  - Saves current URL in `location.state.from` for post-login redirect.
  - If authenticated: Renders children.

#### `RoleGuard`
- **Location**: `src/components/security/RoleGuard.tsx`
- **Purpose**: Ensures authenticated user has the correct permission.
- **Props**: `allowedRoles: Role[]`
- **Behavior**:
  - If user role is NOT in `allowedRoles`: Redirects to their default dashboard.
  - If user role IS in `allowedRoles`: Renders children.

### Route Structure (`App.tsx`)

```tsx
<Route path="/admin" element={
  <ProtectedRoute>
    <RoleGuard allowedRoles={['admin']}>
      <Layout />
    </RoleGuard>
  </ProtectedRoute>
}>
  {/* Admin child routes */}
</Route>

<Route path="/employee" element={
  <ProtectedRoute>
    <RoleGuard allowedRoles={['employee']}>
      <Layout />
    </RoleGuard>
  </ProtectedRoute>
}>
  {/* Employee child routes */}
</Route>
```

---

## 3. Extending Roles

To add a new role (e.g., `MANAGER`):

1. **Update Constants** (`src/constants/roles.ts`):
   ```typescript
   export const ROLES = {
     ADMIN: 'admin',
     EMPLOYEE: 'employee',
     MANAGER: 'manager', // Add this
   } as const;

   export const DEFAULT_REDIRECTS = {
     // ... existing
     [ROLES.MANAGER]: '/manager/dashboard',
   };
   ```

2. **Update Types**: The `Role` type automatically updates via `typeof ROLES`.

3. **Create Dashboard**: Create `src/pages/manager/ManagerDashboard.tsx`.

4. **Add Routes** (`App.tsx`):
   ```tsx
   <Route path="/manager" element={
     <ProtectedRoute>
       <RoleGuard allowedRoles={[ROLES.MANAGER]}>
         <Layout />
       </RoleGuard>
     </ProtectedRoute>
   }>
     <Route path="dashboard" element={<ManagerDashboard />} />
   </Route>
   ```

5. **Update Sidebar** (`src/components/layout/Sidebar.tsx`):
   - Create `MANAGER_NAV_ITEMS`.
   - Update `navItems` logic to include manager case.

---

## 4. Error Handling

- **Form Errors**: Displayed inline below input fields using `text-red-500`.
- **Authentication Errors**: Displayed as alerts or messages on Login/Signup forms.
- **Unauthorized Access**:
  - Unauthenticated -> Redirect to Login.
  - Unauthorized Role -> Redirect to Authorized Dashboard (Fail-safe).
- **Network Errors**: Handled in `try/catch` blocks within services and components.

## 5. Security Considerations

- **JWT Storage**: Currently using `localStorage` for the mock. In production, consider `HttpOnly` cookies to prevent XSS.
- **Route Guards**: Client-side guards are for UX only. **API endpoints must also be secured** with backend role checks.
- **Session Timeout**: Currently mock-only. Real implementation should handle 401 responses from API by triggering `logout()`.
- **Input Sanitization**: React escapes output by default, but inputs should be validated on both client (Zod/Yup) and server.

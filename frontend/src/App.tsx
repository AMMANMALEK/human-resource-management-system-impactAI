import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ProtectedRoute } from './components/security/ProtectedRoute';
import { RoleGuard } from './components/security/RoleGuard';
import { AuthProvider } from './contexts/AuthContext';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { AdminLeavePage } from './pages/admin/AdminLeavePage';
import { AdminPayrollPage } from './pages/admin/AdminPayrollPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { AttendancePage } from './pages/employee/AttendancePage';
import { PayrollPage } from './pages/employee/PayrollPage';
import { ApplyLeavePage } from './pages/leave/ApplyLeavePage';
import { LeaveHistoryPage } from './pages/leave/LeaveHistoryPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ROLES } from './constants/roles';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <Layout />
              </RoleGuard>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="leaves" element={<AdminLeavePage />} />
            <Route path="payroll" element={<AdminPayrollPage />} />
            <Route path="settings" element={<div className="p-4">Admin Settings</div>} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[ROLES.EMPLOYEE]}>
                <Layout />
              </RoleGuard>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="apply-leave" element={<ApplyLeavePage />} />
            <Route path="leaves" element={<LeaveHistoryPage />} />
            <Route path="settings" element={<div className="p-4">My Settings</div>} />
          </Route>

          {/* Root Redirect - Sends to login or dashboard based on auth/role (handled by ProtectedRoute/RoleGuard logic effectively via login redirect) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

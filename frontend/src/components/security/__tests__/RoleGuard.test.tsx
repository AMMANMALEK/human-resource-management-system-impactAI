import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleGuard } from '../RoleGuard';
import { AuthProvider } from '../../../contexts/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ROLES } from '../../../constants/roles';
import { authService } from '../../../services/authService';

vi.mock('../../../services/authService', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  },
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactNode, initialEntries = ['/protected']) => {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
            <Route path="/employee/dashboard" element={<div>Employee Dashboard</div>} />
            <Route path="/protected" element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  };

  it('renders children if user has required role', () => {
    (authService.isAuthenticated as any).mockReturnValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '1',
      role: ROLES.ADMIN,
      email: 'admin@test.com',
      name: 'Admin',
    });

    renderWithAuth(
      <RoleGuard allowedRoles={[ROLES.ADMIN]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to admin dashboard if admin tries to access employee route', () => {
    (authService.isAuthenticated as any).mockReturnValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '1',
      role: ROLES.ADMIN,
      email: 'admin@test.com',
      name: 'Admin',
    });

    renderWithAuth(
      <RoleGuard allowedRoles={[ROLES.EMPLOYEE]}>
        <div>Employee Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Employee Content')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects to employee dashboard if employee tries to access admin route', () => {
    (authService.isAuthenticated as any).mockReturnValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '2',
      role: ROLES.EMPLOYEE,
      email: 'employee@test.com',
      name: 'Employee',
    });

    renderWithAuth(
      <RoleGuard allowedRoles={[ROLES.ADMIN]}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', () => {
    (authService.isAuthenticated as any).mockReturnValue(false);
    (authService.getCurrentUser as any).mockReturnValue(null);

    renderWithAuth(
      <RoleGuard allowedRoles={[ROLES.ADMIN]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});

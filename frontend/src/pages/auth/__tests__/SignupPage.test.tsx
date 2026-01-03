import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignupPage } from '../SignupPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../../services/authService';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock authService
vi.mock('../../../services/authService', () => ({
  authService: {
    signup: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getCurrentUser: vi.fn().mockReturnValue(null),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const renderSignupPage = () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderSignupPage();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    renderSignupPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const passwordInput = screen.getByLabelText(/^password/i);
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    renderSignupPage();
    
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } });

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    (authService.signup as any).mockResolvedValue({
      user: { id: '1', email: 'test@test.com', name: 'Test User', role: 'employee' },
      token: 'fake-token'
    });

    renderSignupPage();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'employee' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        role: 'employee',
        password: 'Password123',
        confirmPassword: 'Password123'
      });
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';

// Mock the auth service
vi.mock('../../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authService.isAuthenticated as any).mockReturnValue(false);
    (authService.getCurrentUser as any).mockReturnValue(null);
  });

  const renderLoginPage = () => {
    return render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );
  };

  it('renders login form correctly', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates email input', async () => {
    renderLoginPage();
    const emailInput = screen.getByLabelText(/email/i);
    
    // Invalid email
    await userEvent.type(emailInput, 'invalid-email');
    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    // Valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });
  });

  it('validates password input', async () => {
    renderLoginPage();
    const passwordInput = screen.getByLabelText(/password/i);

    // Short password
    await userEvent.type(passwordInput, '123');
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    // Valid password
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'password123');
    await waitFor(() => {
      expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    renderLoginPage();
    (authService.login as any).mockResolvedValue({
      user: { role: 'admin' },
      token: 'mock-token'
    });

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@company.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).not.toBeDisabled();
    
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin@company.com',
        password: 'Password123'
      });
    });
  });

  it('shows error on failed login', async () => {
    renderLoginPage();
    (authService.login as any).mockRejectedValue(new Error('Invalid credentials'));

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@email.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPass123');
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});

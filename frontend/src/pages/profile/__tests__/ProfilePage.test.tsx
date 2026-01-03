import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from '../ProfilePage';
import { userService } from '../../../services/userService';
import { AuthProvider } from '../../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock userService
vi.mock('../../../services/userService', () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

// Mock auth context values
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@company.com',
  role: 'employee'
};

// We need to mock the useAuth hook return value, but since it's used inside the component
// via a context provider, we can just mock the context or the module.
// However, since we are using the real AuthProvider in the render, we need to mock the underlying authService login if we were logging in,
// BUT here we can just supply a mocked auth context if we wanted, OR we can mock the authService module that AuthProvider uses.
// A simpler way for this specific test is to mock the module `useAuth`.
vi.mock('../../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    }),
  };
});

const renderProfilePage = () => {
  render(
    <BrowserRouter>
      <ProfilePage />
    </BrowserRouter>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile information correctly', async () => {
    (userService.getProfile as any).mockResolvedValue({
      ...mockUser,
      avatar: 'avatar-url'
    });

    renderProfilePage();

    await waitFor(() => {
      // Name might appear multiple times (header + details)
      expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
      expect(screen.getAllByText('test@company.com').length).toBeGreaterThan(0);
      expect(screen.getByText('employee')).toBeInTheDocument();
    });
  });

  it('switches to edit mode when edit button is clicked', async () => {
    (userService.getProfile as any).mockResolvedValue(mockUser);
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('validates name input', async () => {
    (userService.getProfile as any).mockResolvedValue(mockUser);
    renderProfilePage();

    await waitFor(() => screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Edit Profile'));

    const input = screen.getByLabelText('Full Name');
    fireEvent.change(input, { target: { value: '' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(screen.getByText('Full Name is required')).toBeInTheDocument();
  });

  it('updates profile successfully', async () => {
    (userService.getProfile as any).mockResolvedValue(mockUser);
    (userService.updateProfile as any).mockResolvedValue({
      ...mockUser,
      name: 'Updated Name'
    });

    renderProfilePage();

    await waitFor(() => screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Edit Profile'));

    const input = screen.getByLabelText('Full Name');
    fireEvent.change(input, { target: { value: 'Updated Name' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalledWith('test@company.com', {
        name: 'Updated Name'
      });
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument(); // Should exit edit mode
    });
  });
});

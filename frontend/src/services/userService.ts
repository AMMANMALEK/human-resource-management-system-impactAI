import { User, UserRole } from '../types/auth';
import { apiClient } from '../api/client';

export interface UserProfile extends User {
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

const mockUsers: Record<string, UserProfile> = {
  'admin@company.com': {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
    department: 'Administration',
    position: 'System Administrator',
    phone: '+1 (555) 123-4567',
    address: '123 Admin St, Tech City, TC 90210',
    joinDate: '2023-01-01'
  },
  'employee@company.com': {
    id: '2',
    name: 'John Doe',
    email: 'employee@company.com',
    role: 'EMPLOYEE',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1 (555) 987-6543',
    address: '456 Dev Lane, Code Valley, CV 12345',
    joinDate: '2024-03-15'
  }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 800;

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Mock behavior for testing without backend
          // We can't use email here anymore for mock lookup without passing it,
          // but usually in mock mode we might just return a default user or use a stored token.
          // For simplicity in refactor, we'll return a hardcoded user or the first mock user.
          resolve(Object.values(mockUsers)[0]);
        }, DELAY_MS);
      });
    }

    try {
      // Always fetch current user profile
      const response = await apiClient.get<UserProfile>('/users/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'User not found');
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Mock update logic
          resolve({} as UserProfile);
        }, DELAY_MS);
      });
    }

    try {
      // Update current user profile
      const response = await apiClient.put<UserProfile>('/users/me', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Admin: Update any user
  updateUser: async (id: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    if (USE_MOCK) {
      // Mock impl...
      return Promise.resolve({} as UserProfile);
    }
    try {
      const response = await apiClient.put<UserProfile>(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(Object.values(mockUsers));
        }, DELAY_MS);
      });
    }

    try {
      const response = await apiClient.get<UserProfile[]>('/users');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  createUser: async (userData: UserProfile): Promise<UserProfile> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newUser = {
            ...userData,
            id: Math.random().toString(36).substr(2, 9),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
          };
          mockUsers[userData.email] = newUser;
          resolve(newUser);
        }, DELAY_MS);
      });
    }

    try {
      const response = await apiClient.post<UserProfile>('/users', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock delete
          resolve();
        }, DELAY_MS);
      });
    }

    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }
};

import { User, UserRole } from '../contexts/AuthContext';
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
    role: 'admin',
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
    role: 'employee',
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
  getProfile: async (email: string): Promise<UserProfile> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = mockUsers[email];
          if (user) {
            resolve({ ...user });
          } else {
            // Fallback for demo users not in list
             resolve({
                id: '99',
                name: 'Demo User',
                email: email,
                role: 'employee',
                avatar: `https://ui-avatars.com/api/?name=Demo+User&background=random`,
                department: 'General',
                position: 'Employee',
                phone: '',
                address: '',
                joinDate: new Date().toISOString().split('T')[0]
             });
          }
        }, DELAY_MS);
      });
    }

    try {
      // Assuming endpoint accepts email as query param or part of path
      // Or we can just use /users/me if the token identifies the user
      // For now, let's stick to the existing signature
      const response = await apiClient.get<UserProfile>(`/users/profile/${email}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'User not found');
    }
  },

  updateProfile: async (email: string, data: UpdateProfileData): Promise<UserProfile> => {
    if (USE_MOCK) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const user = mockUsers[email];
            if (user) {
              mockUsers[email] = { 
                ...user, 
                ...data,
                name: data.name || user.name
              };
              if (data.name) {
                mockUsers[email].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
              }
              resolve({ ...mockUsers[email] });
            } else {
               // For demo user, just return updated data merged
               resolve({
                id: '99',
                name: data.name || 'Demo User',
                email: email,
                role: 'employee',
                ...data
               } as UserProfile);
            }
          }, DELAY_MS);
        });
    }

    try {
      const response = await apiClient.put<UserProfile>(`/users/profile/${email}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
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

  deleteUser: async (email: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          delete mockUsers[email];
          resolve();
        }, DELAY_MS);
      });
    }

    try {
      await apiClient.delete(`/users/${email}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }
};

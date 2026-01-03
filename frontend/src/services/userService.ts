import { User, UserRole } from '../contexts/AuthContext';

export interface UserProfile extends User {
  avatar?: string;
}

export interface UpdateProfileData {
  name: string;
}

const DELAY_MS = 800;

// Mock current user data store (in memory for demo)
let mockUsers: Record<string, UserProfile> = {
  'admin@company.com': {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
  },
  'employee@company.com': {
    id: '2',
    name: 'Sarah Wilson',
    email: 'employee@company.com',
    role: 'employee',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=random'
  }
};

export const userService = {
  getProfile: async (email: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers[email];
        if (user) {
          resolve({ ...user });
        } else {
          reject(new Error('User not found'));
        }
      }, DELAY_MS);
    });
  },

  updateProfile: async (email: string, data: UpdateProfileData): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers[email];
        if (user) {
          // Update mock store
          mockUsers[email] = { ...user, name: data.name };
          // Update avatar if name changed
          mockUsers[email].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
          
          resolve({ ...mockUsers[email] });
        } else {
          reject(new Error('User not found'));
        }
      }, DELAY_MS);
    });
  }
};

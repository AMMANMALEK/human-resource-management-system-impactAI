import { AuthResponse, LoginCredentials, SignupCredentials, UserRole, User } from "../types/auth";
import { apiClient } from "../api/client";

const MOCK_USERS: Record<string, User> = {
  'admin@company.com': {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin'
  },
  'employee@company.com': {
    id: '2',
    name: 'John Doe',
    email: 'employee@company.com',
    role: 'employee'
  }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 800;

export const authService = {
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const user: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: credentials.name,
            email: credentials.email,
            role: credentials.role
          };
          
          const response = {
            token: 'mock-jwt-token',
            user
          };

          localStorage.setItem("auth_token", response.token);
          localStorage.setItem("user_role", response.user.role);
          localStorage.setItem("auth_user", JSON.stringify(response.user));
          
          resolve(response);
        }, DELAY_MS);
      });
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', credentials);
      const data = response.data;
      
      // Auto-login after signup
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_role", data.user.role);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = MOCK_USERS[credentials.email];
          if (user) {
            const response = {
              token: 'mock-jwt-token',
              user
            };
            
            localStorage.setItem("auth_token", response.token);
            localStorage.setItem("user_role", response.user.role);
            localStorage.setItem("auth_user", JSON.stringify(response.user));
            
            resolve(response);
          } else {
            // Allow any login for demo purposes if not in mock list, default to employee
            // or reject strictly. Let's be strict for known demo accounts but allow others as employee for ease
            if (credentials.email.includes('admin')) {
               reject(new Error("Invalid credentials"));
               return;
            }
            
            const demoUser: User = {
                id: '99',
                name: 'Demo User',
                email: credentials.email,
                role: 'employee'
            };
             const response = {
              token: 'mock-jwt-token',
              user: demoUser
            };
            
            localStorage.setItem("auth_token", response.token);
            localStorage.setItem("user_role", response.user.role);
            localStorage.setItem("auth_user", JSON.stringify(response.user));
            resolve(response);
          }
        }, DELAY_MS);
      });
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;
      
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_role", data.user.role);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Invalid credentials. Please try again.");
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_user");
    // Optional: Call logout endpoint if exists
    // apiClient.post('/auth/logout');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },

  getUserRole: (): UserRole | null => {
    return localStorage.getItem("user_role") as UserRole | null;
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }
};

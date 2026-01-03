import { AuthResponse, LoginCredentials, SignupCredentials, UserRole } from "../types/auth";

const MOCK_DELAY = 1000;

export const authService = {
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock checking if user exists
        if (credentials.email.includes("existing")) {
          reject(new Error("Email already exists"));
          return;
        }

        const response: AuthResponse = {
          user: {
            id: Math.random().toString(36).substr(2, 9),
            email: credentials.email,
            name: credentials.name,
            role: credentials.role,
          },
          token: `mock-jwt-token-${Math.random().toString(36).substr(2, 9)}`,
        };
        
        // Auto-login after signup
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user_role", response.user.role);
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        
        resolve(response);
      }, MOCK_DELAY);
    });
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (credentials.email === "admin@company.com" && credentials.password === "Password123") {
          const response: AuthResponse = {
            user: {
              id: "1",
              email: "admin@company.com",
              name: "Admin User",
              role: "admin",
            },
            token: "mock-jwt-token-admin",
          };
          localStorage.setItem("auth_token", response.token);
          localStorage.setItem("user_role", response.user.role);
          localStorage.setItem("auth_user", JSON.stringify(response.user));
          resolve(response);
        } else if (credentials.email === "employee@company.com" && credentials.password === "Password123") {
          const response: AuthResponse = {
            user: {
              id: "2",
              email: "employee@company.com",
              name: "John Doe",
              role: "employee",
            },
            token: "mock-jwt-token-employee",
          };
          localStorage.setItem("auth_token", response.token);
          localStorage.setItem("user_role", response.user.role);
          localStorage.setItem("auth_user", JSON.stringify(response.user));
          resolve(response);
        } else {
          reject(new Error("Invalid credentials. Please try again."));
        }
      }, MOCK_DELAY);
    });
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_user");
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

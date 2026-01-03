export const ROLES = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const DEFAULT_REDIRECTS = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.EMPLOYEE]: '/employee/dashboard',
};

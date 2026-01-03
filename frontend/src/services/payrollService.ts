import { apiClient } from '../api/client';

export interface SalaryStructure {
  basic: number;
  hra: number;
  da: number;
  allowances: number;
  deductions: number;
  total: number;
}

export interface Payslip {
  id: string;
  month: string; // "January 2026"
  year: number;
  basic: number;
  hra: number;
  da: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'Paid' | 'Processing';
}

export interface EmployeePayrollSummary {
  id: string;
  name: string;
  department: string;
  designation: string;
  baseSalary: number;
  netSalary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
}

const mockEmployeePayrolls: Record<string, SalaryStructure> = {
  '1': { basic: 50000, hra: 20000, da: 10000, allowances: 5000, deductions: 5000, total: 80000 },
  '2': { basic: 45000, hra: 18000, da: 9000, allowances: 4000, deductions: 4500, total: 71500 },
  '3': { basic: 60000, hra: 24000, da: 12000, allowances: 6000, deductions: 6000, total: 96000 },
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const DELAY_MS = 800;

export const payrollService = {
  // Admin: Get All Employees Payroll Summary
  getAllEmployeePayrolls: async (): Promise<EmployeePayrollSummary[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '1', name: 'John Doe', department: 'Engineering', designation: 'Senior Developer', baseSalary: 50000, netSalary: 80000, status: 'Active' },
            { id: '2', name: 'Sarah Wilson', department: 'Marketing', designation: 'Marketing Manager', baseSalary: 45000, netSalary: 71500, status: 'Active' },
            { id: '3', name: 'Mike Johnson', department: 'Sales', designation: 'Sales Director', baseSalary: 60000, netSalary: 96000, status: 'Active' },
          ]);
        }, DELAY_MS);
      });
    }
    try {
      // Fetch both users and payroll records
      const [usersResponse, payrollResponse] = await Promise.all([
        apiClient.get<any[]>('/users'),
        apiClient.get<any[]>('/payroll')
      ]);

      const users = usersResponse.data;
      const payrollRecords = payrollResponse.data;

      // Group payrolls by user and get latest
      const latestPayrollMap = new Map();
      payrollRecords.forEach((record: any) => {
        if (!latestPayrollMap.has(record.userId) || record.month > latestPayrollMap.get(record.userId).month) {
          latestPayrollMap.set(record.userId, record);
        }
      });

      // Map all users to EmployeePayrollSummary
      return users.map((user: any) => {
        const payroll = latestPayrollMap.get(user.id);
        return {
          id: user.id,
          name: user.name || user.email || 'Unknown',
          department: user.department || 'General',
          designation: user.position || user.role || 'Employee', // User 'position' if available (from profile), else role
          baseSalary: payroll ? Number(payroll.base) : 0,
          netSalary: payroll ? Number(payroll.net) : 0,
          status: 'Active' // You might want to map this from user.status if it exists
        };
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll summary');
    }
  },

  // Admin: Get Specific Employee Salary Structure
  getEmployeeSalaryStructure: async (employeeId: string): Promise<SalaryStructure> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const structure = mockEmployeePayrolls[employeeId];
          resolve(structure || { basic: 0, hra: 0, da: 0, allowances: 0, deductions: 0, total: 0 });
        }, DELAY_MS);
      });
    }
    try {
      // Fetch all and find latest for this user (inefficient but works with current backend)
      const response = await apiClient.get<any[]>('/payroll');
      const userRecords = response.data.filter((r: any) => r.userId === employeeId);

      if (userRecords.length === 0) {
        return { basic: 0, hra: 0, da: 0, allowances: 0, deductions: 0, total: 0 };
      }

      // Sort desc by month
      userRecords.sort((a: any, b: any) => b.month.localeCompare(a.month));
      const latest = userRecords[0];

      return {
        basic: Number(latest.base),
        hra: 0,
        da: 0,
        allowances: Number(latest.allowance),
        deductions: Number(latest.deduction),
        total: Number(latest.net)
      };
    } catch (error: any) {
      // Default fallback for new employees or error handling
      if (error.response?.status === 404) {
        return { basic: 0, hra: 0, da: 0, allowances: 0, deductions: 0, total: 0 };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch salary structure');
    }
  },

  // Admin: Update Salary Structure
  updateSalaryStructure: async (employeeId: string, structure: SalaryStructure): Promise<SalaryStructure> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockEmployeePayrolls[employeeId] = structure;
          resolve(structure);
        }, DELAY_MS);
      });
    }
    try {
      // Backend expects: userId, month, base, allowance, deduction
      // We'll update for the current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const payload = {
        userId: employeeId,
        month: currentMonth,
        base: structure.basic, // Mapping basic to base
        allowance: structure.allowances + structure.hra + structure.da, // aggregating allowances
        deduction: structure.deductions
      };

      const response = await apiClient.post<any>('/payroll', payload);

      // Return the structure as passed (or reconstructed)
      return {
        basic: Number(response.data.base),
        hra: 0,
        da: 0,
        allowances: Number(response.data.allowance),
        deductions: Number(response.data.deduction),
        total: Number(response.data.net)
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update salary structure');
    }
  },

  // Get Salary Structure (Employee)
  getMySalaryStructure: async (): Promise<SalaryStructure> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            basic: 50000,
            hra: 20000,
            da: 10000,
            allowances: 5000,
            deductions: 5000,
            total: 80000
          });
        }, DELAY_MS);
      });
    }
    try {
      const response = await apiClient.get<SalaryStructure>('/payroll/structure/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch salary structure');
    }
  },

  // Get Payslips (Employee)
  getMyPayslips: async (): Promise<Payslip[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '1', month: 'January 2026', year: 2026, basic: 50000, hra: 20000, da: 10000, allowances: 5000, deductions: 5000, netSalary: 80000, paymentDate: '2026-01-31', status: 'Paid' },
            { id: '2', month: 'December 2025', year: 2025, basic: 50000, hra: 20000, da: 10000, allowances: 5000, deductions: 5000, netSalary: 80000, paymentDate: '2025-12-31', status: 'Paid' },
          ]);
        }, DELAY_MS);
      });
    }
    try {
      const response = await apiClient.get<Payslip[]>('/payroll/payslips');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payslips');
    }
  },

  // Download Payslip (Mock)
  downloadPayslip: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          alert('Downloading Payslip ID: ' + id);
          resolve();
        }, 500);
      });
    }
    try {
      // For a real download, we might redirect or fetch blob
      // window.open(`${apiClient.defaults.baseURL}/payroll/payslips/${id}/download`, '_blank');

      const response = await apiClient.get(`/payroll/payslips/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Download failed', error);
      throw new Error('Failed to download payslip');
    }
  }
};

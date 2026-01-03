import React, { useEffect, useState } from 'react';
import { DollarSign, Search, Edit2, TrendingUp, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { payrollService, EmployeePayrollSummary, SalaryStructure } from '../../services/payrollService';
import { EditSalaryModal } from '../../components/payroll/EditSalaryModal';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function AdminPayrollPage() {
  const [employees, setEmployees] = useState<EmployeePayrollSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayrollSummary | null>(null);
  const [selectedSalaryStructure, setSelectedSalaryStructure] = useState<SalaryStructure | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await payrollService.getAllEmployeePayrolls();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load payrolls', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = async (employee: EmployeePayrollSummary) => {
    try {
      const structure = await payrollService.getEmployeeSalaryStructure(employee.id);
      setSelectedEmployee(employee);
      setSelectedSalaryStructure(structure);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch salary details', error);
    }
  };

  const handleSaveSalary = async (newStructure: SalaryStructure) => {
    if (!selectedEmployee) return;

    try {
      await payrollService.updateSalaryStructure(selectedEmployee.id, newStructure);

      // Update local list to reflect new net salary
      setEmployees(prev => prev.map(emp =>
        emp.id === selectedEmployee.id
          ? { ...emp, baseSalary: newStructure.basic, netSalary: newStructure.total }
          : emp
      ));

      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update salary', error);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading payroll data...</div>;
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500">Manage employee salaries and compensation</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Base Salary</th>
                <th className="px-6 py-3 font-medium">Net Salary</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.designation}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-gray-600">₹{emp.baseSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-green-600">₹{emp.netSalary.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${emp.status === 'Active' ? 'bg-green-100 text-green-800' :
                        emp.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(emp)}
                      className="gap-2 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <Edit2 size={14} />
                      Edit Salary
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No employees found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && selectedEmployee && selectedSalaryStructure && (
        <EditSalaryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveSalary}
          employeeName={selectedEmployee.name}
          initialStructure={selectedSalaryStructure}
        />
      )}
    </div>
  );
}

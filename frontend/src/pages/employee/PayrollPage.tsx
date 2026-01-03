import React, { useState, useEffect } from 'react';
import { Download, DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { payrollService, SalaryStructure, Payslip } from '../../services/payrollService';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function PayrollPage() {
  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [structData, slipsData] = await Promise.all([
          payrollService.getMySalaryStructure(),
          payrollService.getMyPayslips()
        ]);
        setStructure(structData);
        setPayslips(slipsData);
      } catch (error) {
        console.error('Failed to fetch payroll data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      await payrollService.downloadPayslip(id);
      // In a real app, this would trigger a file download
      alert('Payslip downloaded successfully!');
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading payroll information...</div>;
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
          <p className="text-gray-500">View salary structure and download payslips</p>
        </div>
      </div>

      {/* Salary Structure Card */}
      {structure && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="text-primary-600" size={20} />
              Current Salary Structure
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Basic Salary</span>
              <p className="text-xl font-semibold text-gray-900">${structure.basic.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">HRA</span>
              <p className="text-xl font-semibold text-gray-900">${structure.hra.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">DA</span>
              <p className="text-xl font-semibold text-gray-900">${structure.da.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Allowances</span>
              <p className="text-xl font-semibold text-green-600">+ ${structure.allowances.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Deductions (Tax/PF)</span>
              <p className="text-xl font-semibold text-red-600">- ${structure.deductions.toLocaleString()}</p>
            </div>
            <div className="space-y-1 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
              <span className="text-sm font-medium text-gray-900">Net Monthly Salary</span>
              <p className="text-2xl font-bold text-primary-600">${structure.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payslips Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-gray-500" size={20} />
            Payslip History
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Month</th>
                <th className="px-6 py-3 font-medium">Payment Date</th>
                <th className="px-6 py-3 font-medium">Net Salary</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {slip.month}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(slip.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ${slip.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={slip.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(slip.id)}
                      disabled={downloadingId === slip.id}
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      {downloadingId === slip.id ? (
                        <span className="animate-pulse">Downloading...</span>
                      ) : (
                        <>
                          <Download size={14} className="mr-1" /> Download
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

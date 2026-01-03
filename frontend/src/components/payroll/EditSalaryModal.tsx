import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SalaryStructure } from '../../services/payrollService';

interface EditSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (structure: SalaryStructure) => Promise<void>;
  employeeName: string;
  initialStructure: SalaryStructure;
}

export function EditSalaryModal({
  isOpen,
  onClose,
  onSave,
  employeeName,
  initialStructure
}: EditSalaryModalProps) {
  const [structure, setStructure] = useState<SalaryStructure>(initialStructure);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStructure(initialStructure);
  }, [initialStructure, isOpen]);

  if (!isOpen) return null;

  const calculateTotal = (current: SalaryStructure) => {
    return (
      (Number(current.basic) || 0) +
      (Number(current.hra) || 0) +
      (Number(current.da) || 0) +
      (Number(current.allowances) || 0) -
      (Number(current.deductions) || 0)
    );
  };

  const handleChange = (field: keyof SalaryStructure, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newStructure = { ...structure, [field]: numValue };
    newStructure.total = calculateTotal(newStructure);
    setStructure(newStructure);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(structure);
      onClose();
    } catch (error) {
      console.error('Failed to save salary structure', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Salary Structure</h2>
            <p className="text-sm text-gray-500">for {employeeName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Basic Salary"
              type="number"
              min="0"
              value={structure.basic}
              onChange={(e) => handleChange('basic', e.target.value)}
              required
            />
            <Input
              label="HRA"
              type="number"
              min="0"
              value={structure.hra}
              onChange={(e) => handleChange('hra', e.target.value)}
              required
            />
            <Input
              label="DA"
              type="number"
              min="0"
              value={structure.da}
              onChange={(e) => handleChange('da', e.target.value)}
              required
            />
            <Input
              label="Allowances"
              type="number"
              min="0"
              value={structure.allowances}
              onChange={(e) => handleChange('allowances', e.target.value)}
              required
            />
            <div className="col-span-2">
              <Input
                label="Deductions (Tax, PF, etc.)"
                type="number"
                min="0"
                value={structure.deductions}
                onChange={(e) => handleChange('deductions', e.target.value)}
                className="border-red-200 focus-visible:ring-red-200"
                required
              />
            </div>
          </div>

          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-700">
              <Calculator size={20} />
              <span className="font-medium">Net Monthly Salary</span>
            </div>
            <span className="text-2xl font-bold text-primary-700">
              ₹{structure.total.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

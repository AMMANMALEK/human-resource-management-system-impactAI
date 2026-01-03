import React, { useState, useEffect } from 'react';
import { Calendar, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { SuccessModal } from '../../components/leave/SuccessModal';
import { leaveService, CreateLeaveRequest } from '../../services/leaveService';
import { cn } from '../../lib/utils';

const LEAVE_TYPES = [
  { value: 'Casual', label: 'Casual Leave' },
  { value: 'Sick', label: 'Sick Leave' },
  { value: 'Paid', label: 'Paid Leave' },
];

export function ApplyLeavePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string } | null>(null);

  // Calculate duration for display
  const duration = React.useMemo(() => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
      }
    }
    return 0;
  }, [formData.fromDate, formData.toDate]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    const validationErrors = leaveService.validateLeaveRequest({
      ...formData,
      [name]: value
    });

    if (validationErrors[name]) {
      newErrors[name] = validationErrors[name];
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    const validationErrors = leaveService.validateLeaveRequest(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await leaveService.applyLeave(formData);
      setSuccessData({ id: result.id });
    } catch (err: any) {
      console.error('Submission error:', err);
      // Ensure state update happens in act
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSuccessData(null);
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    });
    setErrors({});
    // Optional: navigate to leave history
    // navigate('/employee/leaves');
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-gray-500">Submit a new leave request for approval</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {submitError}
                </div>
              )}

              <Select
                label="Leave Type"
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                options={LEAVE_TYPES}
                error={errors.leaveType}
                required
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  type="date"
                  label="From Date"
                  id="fromDate"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  min={today}
                  max={maxDateStr}
                  error={errors.fromDate}
                  required
                />
                <Input
                  type="date"
                  label="To Date"
                  id="toDate"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  min={formData.fromDate || today}
                  max={maxDateStr}
                  error={errors.toDate}
                  required
                />
              </div>

              <div className="space-y-1">
                <Textarea
                  label="Reason"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please describe why you need this leave (e.g., medical appointment, family vacation)..."
                  error={errors.reason}
                  required
                  rows={4}
                />
                <div className="flex justify-between text-xs text-gray-500 px-1">
                  <span>Minimum 20 characters</span>
                  <span className={cn(
                    formData.reason.length > 500 ? "text-red-500" : ""
                  )}>
                    {formData.reason.length}/500
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar / Info Panel */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-600" />
              Request Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">
                  {duration > 0 ? `${duration} Day${duration > 1 ? 's' : ''}` : '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900">{formData.leaveType || '-'}</span>
              </div>
            </div>
          </div>

          {/* Policy Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 space-y-3">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              Policy Guidelines
            </h3>
            <ul className="text-xs text-blue-800 space-y-2 list-disc list-inside">
              <li>Casual leave requires 2 days prior notice.</li>
              <li>Sick leave exceeding 2 days requires a medical certificate.</li>
              <li>Maximum 30 days of leave can be taken at once.</li>
            </ul>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={!!successData}
        onClose={handleModalClose}
        referenceId={successData?.id || ''}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { LeaveRequest } from '../../services/leaveService';
import { Textarea } from '../ui/Textarea';
import { cn } from '../../lib/utils';

interface LeaveActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, comment: string) => Promise<void>;
  request: LeaveRequest | null;
  action: 'approve' | 'reject';
}

export function LeaveActionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  request, 
  action 
}: LeaveActionModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'reject' && !comment.trim()) {
      setError('Reason is required for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(request.id, comment);
      onClose();
      setComment('');
    } catch (err) {
      setError('Failed to process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReject = action === 'reject';
  const title = isReject ? 'Reject Leave Request' : 'Approve Leave Request';
  const confirmText = isReject ? 'Reject Request' : 'Approve Request';
  const confirmVariant = isReject ? 'danger' : 'success'; // Assuming Button supports these, or we style manually

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className={cn("text-xl font-bold", isReject ? "text-red-600" : "text-green-600")}>
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <p><span className="font-medium text-gray-700">Employee:</span> {request.employeeName}</p>
          <p><span className="font-medium text-gray-700">Type:</span> {request.leaveType}</p>
          <p><span className="font-medium text-gray-700">Duration:</span> {request.fromDate} to {request.toDate}</p>
          <p><span className="font-medium text-gray-700">Reason:</span> {request.reason}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label={isReject ? "Rejection Reason *" : "Approval Comment (Optional)"}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError(null);
            }}
            placeholder={isReject ? "Please provide a reason for rejection..." : "Add a comment..."}
            error={error || undefined}
            rows={3}
            required={isReject}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={cn(
                isReject ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              )}
            >
              {isSubmitting ? 'Processing...' : confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

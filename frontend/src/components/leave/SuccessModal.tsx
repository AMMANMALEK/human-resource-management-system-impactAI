import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
}

export function SuccessModal({ isOpen, onClose, referenceId }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request Submitted!</h2>
            <p className="text-gray-500 mt-2">
              Your leave request has been successfully submitted for approval.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Reference ID:</span>
            <span className="font-mono font-medium text-gray-900">{referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium text-yellow-600">Pending Approval</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated Response:</span>
            <span className="font-medium text-gray-900">24-48 Hours</span>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );
}

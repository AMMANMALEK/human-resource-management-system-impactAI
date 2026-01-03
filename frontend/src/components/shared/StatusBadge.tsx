
import { cn } from '../../lib/utils';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface StatusBadgeProps {
  status: LeaveStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase() as LeaveStatus;
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const variants = {
    PENDING: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock,
    },
    APPROVED: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
    },
  };

  const config = variants[normalizedStatus] || variants.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.color,
        className
      )}
      role="status"
    >
      <Icon className="w-3.5 h-3.5" />
      {displayStatus}
    </span>
  );
}

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

const variantStyles = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-white border-green-200 text-gray-900',
  warning: 'bg-white border-amber-200 text-gray-900',
  danger: 'bg-white border-red-200 text-gray-900',
  info: 'bg-white border-blue-200 text-gray-900',
};

const iconStyles = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  className,
  onClick,
  'data-testid': testId
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 cursor-default",
        onClick && "cursor-pointer",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={cn("rounded-lg p-2", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="ml-2 text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

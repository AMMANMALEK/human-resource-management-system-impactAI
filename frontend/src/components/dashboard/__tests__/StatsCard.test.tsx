import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsCard } from '../StatsCard';
import { FileText } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Requests',
    value: 123,
    icon: FileText,
  };

  it('renders title and value correctly', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders trend information when provided', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 10, label: 'vs last month', isPositive: true }}
      />
    );
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toHaveClass('text-green-600');
  });

  it('renders negative trend correctly', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 5, label: 'vs last month', isPositive: false }}
      />
    );
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('5%')).toHaveClass('text-red-600');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<StatsCard {...defaultProps} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Total Requests').closest('div')!.parentElement!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<StatsCard {...defaultProps} variant="danger" data-testid="stats-card" />);
    const card = screen.getByTestId('stats-card');
    // We check for bg-white because danger variant uses it in our map
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('border-red-200');
  });
});

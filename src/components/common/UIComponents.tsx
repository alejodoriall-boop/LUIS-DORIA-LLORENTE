import React from 'react';
import { LucideIcon, Loader2, AlertCircle } from 'lucide-react';

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  compact?: boolean;
  highlighted?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  compact = false,
  highlighted = false,
  ...props
}) => {
  return (
    <div
      className={`bg-[#1F3327] border ${
        highlighted ? 'border-[#D4A94E]/50 shadow-lg shadow-[#D4A94E]/5' : 'border-white/10'
      } ${
        compact ? 'p-3.5 rounded-xl' : 'p-4 sm:p-5 rounded-2xl'
      } text-[#FFFFFF] shadow-md transition-all duration-200 ${
        hoverEffect ? 'hover:bg-[#1F3327] hover:border-white/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'error' | 'info' | 'gold';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'gold',
  action,
  className = '',
}) => {
  const badgeStyles = {
    gold: 'bg-[#D4A94E]/15 text-[#D4A94E] border-[#D4A94E]/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#15241C] border border-white/10 flex items-center justify-center text-[#D4A94E] shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-[#FFFFFF] tracking-tight">{title}</h2>
            {badge && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyles[badgeType]}`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#A5B8AC] mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};

export interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'gold' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'neutral',
  icon: Icon,
  className = '',
}) => {
  const styles = {
    gold: 'bg-[#D4A94E]/15 text-[#D4A94E] border-[#D4A94E]/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    neutral: 'bg-white/[0.06] text-[#A5B8AC] border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[type]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{status}</span>
    </span>
  );
};

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  icon: Icon,
  loading = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base font-bold',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`bg-[#D4A94E] hover:bg-[#b89249] active:scale-95 disabled:bg-[#1A251E] disabled:text-[#A5B8AC]/40 disabled:border-white/5 disabled:cursor-not-allowed text-[#0D1A13] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#0D1A13]" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0 text-[#0D1A13]" />
      )}
      <span>{children}</span>
    </button>
  );
};

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon: Icon,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base font-semibold',
  };

  return (
    <button
      disabled={disabled}
      className={`bg-[#1A251E] hover:bg-[#1F3327] active:scale-95 text-[#FFFFFF] border border-white/10 hover:border-white/20 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 text-[#A5B8AC]" />}
      <span>{children}</span>
    </button>
  );
};

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#15241C] border border-dashed border-white/15 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center text-[#FFFFFF] ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#1F3327] border border-white/10 flex items-center justify-center text-[#D4A94E] mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-[#FFFFFF] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#A5B8AC] max-w-md mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

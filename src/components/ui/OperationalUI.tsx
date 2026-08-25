import React from 'react';

/**
 * Reusable visual building blocks for the light operational workspace
 * Conforms to GanaderIA's hybrid visual design system
 */

export interface OperationalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  elevation?: 'flat' | 'low' | 'medium';
  noPadding?: boolean;
}

export const OperationalCard: React.FC<OperationalCardProps> = ({
  children,
  className = '',
  selected = false,
  elevation = 'low',
  noPadding = false,
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-150 border';
  const selectedClasses = selected
    ? 'bg-[#F4F8F5] border-[#123F2A] shadow-sm ring-1 ring-[#123F2A]/20'
    : 'bg-white border-[#D6DED7] hover:border-[#C3CEC5] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(4,56,37,0.06)]';
  const paddingClass = noPadding ? '' : 'p-4 sm:p-5';

  return (
    <div
      className={`${baseClasses} ${selectedClasses} ${paddingClass} text-[#18241D] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface LightFormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const LightFormField: React.FC<LightFormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#18241D] tracking-tight">
          {label} {required && <span className="text-[#C63D50]">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-[#C63D50] font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-[11px] text-[#526158]">{helperText}</p>
      )}
    </div>
  );
};

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  icon,
  size = 'sm',
  className = '',
}) => {
  const styles = {
    success: 'bg-[#DDF5E9] text-[#158A58] border-[#A8E5C7]',
    warning: 'bg-[#FFF2D5] text-[#B7791F] border-[#FFE199]',
    danger: 'bg-[#FDE5E9] text-[#C63D50] border-[#F9B6C2]',
    info: 'bg-[#E2ECFA] text-[#356FC0] border-[#B7D2F5]',
    neutral: 'bg-[#EEF2ED] text-[#526158] border-[#D6DED7]',
    gold: 'bg-[#F4EBD8] text-[#9E7728] border-[#E8D2A7]',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${styles[status]} ${sizeClasses} whitespace-nowrap ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D6DED7] ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[#DDEBE3] text-[#123F2A] flex items-center justify-center shrink-0 shadow-xs">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#18241D] tracking-tight">
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-[#526158] font-medium">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
};

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'gold';
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'green',
  icon,
  className = '',
  ...props
}) => {
  const bgClass =
    variant === 'green'
      ? 'bg-[#123F2A] hover:bg-[#1F6547] text-white shadow-[0_2px_8px_rgba(4,56,37,0.25)] active:scale-[0.98]'
      : 'bg-[#D4A94E] hover:bg-[#C5993F] text-[#0D1A13] font-black shadow-[0_2px_8px_rgba(201,163,90,0.3)] active:scale-[0.98]';

  return (
    <button
      type="button"
      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${bgClass} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#123F2A] bg-white hover:bg-[#EEF2ED] border border-[#D6DED7] hover:border-[#C3CEC5] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export interface LightModalProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const LightModalBody: React.FC<LightModalProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  maxWidth = '2xl',
}) => {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className={`w-full ${widthClasses[maxWidth]} bg-[#F5F7F3] rounded-3xl overflow-hidden shadow-2xl border border-[#D6DED7] flex flex-col text-[#18241D]`}>
      {/* Dark Institutional Green Header */}
      <div className="bg-[#123F2A] px-5 py-4 flex items-center justify-between text-white shrink-0 border-b border-[#1F6547]">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-white/10 text-[#D4A94E] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#FFFFFF] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#A5B8AC] font-medium">{subtitle}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#A5B8AC] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Light Body */}
      <div className="p-5 overflow-y-auto max-h-[78vh] space-y-4 text-[#18241D]">
        {children}
      </div>

      {/* Light Footer */}
      {footer && (
        <div className="bg-white px-5 py-3.5 border-t border-[#D6DED7] flex items-center justify-end gap-2 shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

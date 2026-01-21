import { motion } from "framer-motion";
import { forwardRef } from "react";

// ========================================
// Button Component
// ========================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      children,
      className = "",
      disabled,
      onClick,
      type,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#0078d4] hover:bg-[#1a86d9] text-white focus-visible:ring-[#0078d4]",
      secondary:
        "bg-white/10 hover:bg-white/15 text-white focus-visible:ring-white/30",
      ghost: "hover:bg-white/10 text-gray-300 focus-visible:ring-white/20",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        onClick={onClick}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

// ========================================
// Input Component
// ========================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", wrapperClassName = "", ...props }, ref) => {
    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors ${error ? "border-red-500" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

// ========================================
// Select Component
// ========================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors appearance-none cursor-pointer ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#2d2d2d]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);

Select.displayName = "Select";

// ========================================
// Toggle Component
// ========================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <motion.div
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-[#0078d4]" : "bg-white/20"}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ left: checked ? 24 : 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
      </motion.div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
}

// ========================================
// Card Component (Windows 11 Style)
// ========================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hover = true,
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover ? { backgroundColor: "rgba(255, 255, 255, 0.08)" } : undefined
      }
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`bg-white/5 rounded-lg border border-white/5 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ========================================
// Loading Spinner
// ========================================

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`${sizes[size]} border-2 border-white/20 border-t-[#0078d4] rounded-full animate-spin`}
    />
  );
}

// ========================================
// Section Header (Windows 11 Style)
// ========================================

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ========================================
// Empty State
// ========================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-gray-500">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

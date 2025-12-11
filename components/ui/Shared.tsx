import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  loading?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, loading, className, ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
    <input 
      {...props} 
      className={`event-input ${loading ? 'input-loading' : ''} ${props.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, children, className, ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
    <select {...props} className="event-input cursor-pointer">
      {children}
    </select>
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className, ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
    <textarea {...props} className="event-input resize-none" />
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className, ...props }) => {
  let baseClass = "px-4 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ";
  if (variant === 'primary') baseClass += "bg-blue-600 hover:bg-blue-500 text-white shadow-lg";
  if (variant === 'success') baseClass += "bg-green-600 hover:bg-green-500 text-white shadow-lg";
  if (variant === 'secondary') baseClass += "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600";
  if (variant === 'danger') baseClass += "text-red-400 hover:text-red-300 hover:bg-red-900/20";
  if (variant === 'ghost') baseClass += "text-slate-400 hover:text-white";

  return (
    <button {...props} className={`${baseClass} ${className || ''}`}>
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

export const SectionTitle: React.FC<{ title: string; colorClass?: string; icon?: string }> = ({ title, colorClass = "text-blue-400", icon }) => (
  <h3 className={`text-lg font-bold ${colorClass} mb-4 border-b border-slate-700 pb-2 flex items-center gap-2`}>
    {icon && <i className={icon}></i>}
    {title}
  </h3>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800 rounded-xl border border-slate-700 shadow-md ${className}`}>
    {children}
  </div>
);

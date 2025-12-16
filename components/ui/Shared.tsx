
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* --- INPUTS --- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  loading?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, loading, className, ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-rajdhani">{label}</label>}
    <input 
      {...props} 
      className={`neo-input w-full bg-[#05060a] border border-slate-800 text-slate-200 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 placeholder:text-slate-700 ${loading ? 'opacity-70 cursor-wait' : ''} ${props.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    />
  </div>
);

/* --- SELECTS --- */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, children, className, ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-rajdhani">{label}</label>}
    <div className="relative">
        <select {...props} className="neo-input w-full appearance-none bg-[#05060a] border border-slate-800 text-slate-200 focus:border-blue-500 cursor-pointer pr-10">
        {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-500">
            <i className="fa-solid fa-caret-down"></i>
        </div>
    </div>
  </div>
);

export interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, placeholder, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={`relative ${className || ''}`} ref={wrapperRef}>
            {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-rajdhani">{label}</label>}
            
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`neo-input w-full text-left flex justify-between items-center cursor-pointer bg-[#05060a] border border-slate-800 text-slate-200 transition-all ${isOpen ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : ''}`}
            >
                <span className={!selectedOption ? "text-slate-500" : "text-white truncate font-medium"}>
                    {selectedOption ? selectedOption.label : (placeholder || "Selecione...")}
                </span>
                <i className={`fa-solid fa-chevron-down text-xs text-blue-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="absolute z-[60] w-full mt-2 left-0 neo-popover max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map((option) => (
                        <div 
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm font-medium transition border-b border-white/5 last:border-0 font-rajdhani tracking-wide ${value === option.value ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-500 italic">Nenhuma opção disponível.</div>
                    )}
                </div>
            )}
        </div>
    );
};

/* --- TEXTAREA --- */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className, ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-rajdhani">{label}</label>}
    <textarea 
        {...props} 
        className="neo-input w-full resize-none bg-[#05060a] border border-slate-800 text-slate-200 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all p-3" 
    />
  </div>
);

/* --- BUTTONS --- */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className, ...props }) => {
  // Base classes for the Skew effect
  const baseSkew = "transform -skew-x-12 transition-all duration-300 active:scale-95 inline-flex items-center justify-center";
  const antiSkew = "transform skew-x-12 flex items-center gap-2";

  let colorClasses = "";
  
  switch(variant) {
      case 'primary':
          colorClasses = "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] border border-blue-400/30";
          break;
      case 'secondary':
          colorClasses = "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-400 hover:text-white";
          break;
      case 'danger':
          colorClasses = "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_4px_14px_rgba(220,38,38,0.4)] border border-red-400/30";
          break;
      case 'success':
          colorClasses = "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)] border border-green-400/30";
          break;
      case 'ghost':
          // Ghost button doesn't skew usually, or minimal skew
          return (
             <button {...props} className={`text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg font-bold tracking-wide transition font-rajdhani uppercase ${className || ''}`}>
                  {icon && <i className={`${icon} mr-2`}></i>}
                  {children}
             </button>
          );
  }

  return (
    <button {...props} className={`${baseSkew} ${colorClasses} px-6 py-2.5 font-bold font-rajdhani tracking-widest uppercase text-sm ${className || ''}`}>
      <span className={antiSkew}>
          {icon && <i className={`${icon}`}></i>}
          {children}
      </span>
    </button>
  );
};

/* --- SECTION TITLE --- */
export const SectionTitle: React.FC<{ title: string; colorClass?: string; icon?: string; children?: React.ReactNode }> = ({ title, colorClass = "text-blue-400", icon, children }) => (
  <div className={`mb-6 flex items-center justify-between border-b border-slate-800 pb-2`}>
      <h3 className={`text-xl font-black font-rajdhani ${colorClass} uppercase tracking-wider flex items-center gap-3 drop-shadow-md`}>
        {icon && <i className={`${icon} opacity-80`}></i>}
        {title}
      </h3>
      {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`neo-card p-6 bg-[#151a25] border border-white/5 shadow-xl ${className}`}>
    {children}
  </div>
);

/* --- MODAL --- */
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    // Use Portal to ensure modal is always relative to the viewport (body), 
    // escaping any parent transforms or overflow constraints.
    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div 
                    className="w-full max-w-4xl transform text-left align-middle shadow-2xl transition-all relative flex flex-col bg-[#0f131a] border border-blue-900/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 z-20"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 z-20"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 z-20"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 z-20"></div>

                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#151a25] relative z-10">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-microchip text-blue-500"></i>
                            <h3 className="text-xl font-black text-white font-rajdhani uppercase tracking-widest">{title}</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition w-8 h-8 flex items-center justify-center rounded hover:bg-white/5">
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    <div className="p-6 md:p-8 bg-[#0b0e14] relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

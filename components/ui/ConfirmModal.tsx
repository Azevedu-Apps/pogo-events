import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title = "Confirmar Ação", 
  message, 
  onConfirm, 
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm relative transform transition-all scale-100">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 mb-6 text-sm leading-relaxed">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-trash"></i>}
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};

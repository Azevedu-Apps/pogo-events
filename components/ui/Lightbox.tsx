
import React, { useState, useEffect } from 'react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title?: string;
  caption?: string;
  allowUpscale?: boolean;
}

export const Lightbox: React.FC<LightboxProps> = ({ 
  isOpen, 
  onClose, 
  src, 
  title, 
  caption, 
  allowUpscale = true 
}) => {
  const [upscale, setUpscale] = useState(false);

  // Reset upscale state when opening a new image
  useEffect(() => {
    if (isOpen) setUpscale(false);
  }, [isOpen, src]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-slate-900 border border-slate-700 p-2 rounded-2xl max-w-lg w-full flex flex-col items-center shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition z-50 border border-slate-700"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        {/* Image Container */}
        <div className="mt-8 mb-4 w-full aspect-square max-h-[60vh] flex items-center justify-center bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] rounded-xl border border-slate-800 relative overflow-hidden group">
          <img 
            src={src} 
            alt={title}
            className={`
              w-full h-full object-contain transition-all duration-500 
              ${upscale 
                ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] contrast-125 saturate-125' 
                : 'scale-90 drop-shadow-none'
              }
            `}
            style={{ imageRendering: upscale ? 'auto' : 'pixelated' }}
          />
          
          {upscale && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg border border-blue-400 animate-pulse">
              <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Upscaled
            </div>
          )}
        </div>
        
        {/* Metadata */}
        <div className="w-full text-center mb-6">
            {title && <h3 className="text-xl font-bold text-white capitalize mb-1">{title}</h3>}
            {caption && <p className="text-xs text-slate-400 font-mono break-all">{caption}</p>}
        </div>
        
        {/* Actions */}
        {allowUpscale && (
          <div className="flex gap-4 mb-2">
            <button 
              onClick={() => setUpscale(!upscale)}
              className={`
                px-6 py-2 rounded-full font-bold text-sm transition flex items-center gap-2
                ${upscale 
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] ring-2 ring-blue-400' 
                  : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                }
              `}
            >
              <i className={`fa-solid ${upscale ? 'fa-wand-magic-sparkles' : 'fa-magnifying-glass-plus'}`}></i>
              {upscale ? 'Qualidade Melhorada' : 'Melhorar Resolução'}
            </button>
          </div>
        )}
        
        <p className="text-[10px] text-slate-600 mt-2">
          {upscale 
            ? 'Filtros de nitidez e saturação aplicados via CSS.' 
            : 'Visualização original (Pixel Perfect).'
          }
        </p>
      </div>
    </div>
  );
};

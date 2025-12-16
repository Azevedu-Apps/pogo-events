
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getAllPokemonNames } from '../../services/pokeapi';

interface PokemonSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  onSelect?: (name: string) => void;
  loading?: boolean;
}

const PokemonSearchInput: React.FC<PokemonSearchInputProps> = ({ value, onChange, placeholder, className, label, onSelect, loading }) => {
  const [suggestions, setSuggestions] = useState<{name: string, url: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPokemon, setAllPokemon] = useState<{name: string, url: string}[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
      if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setCoords({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width
          });
      }
  };

  useEffect(() => {
    // @ts-ignore
    getAllPokemonNames().then(setAllPokemon);
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the input wrapper AND the portal dropdown
      const clickedWrapper = wrapperRef.current && wrapperRef.current.contains(target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!clickedWrapper && !clickedDropdown) {
        setShowSuggestions(false);
      }
    };

    const handleScroll = (event: Event) => {
        // Ignore scroll events originating from inside the dropdown (the list itself)
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
            return;
        }
        // If the window/body scrolls, update position instead of closing
        updatePosition();
    };

    const handleResize = () => {
        updatePosition();
    };

    if (showSuggestions) {
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        // Force update on open
        updatePosition();
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
    };
  }, [showSuggestions]);

  const handleInput = (text: string) => {
    onChange(text);
    if (text.length > 1) {
      const filtered = allPokemon
        .filter(p => p.name.includes(text.toLowerCase()))
        .slice(0, 10);
      setSuggestions(filtered);
      updatePosition();
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
    if (onSelect) onSelect(name);
  };

  const getSpriteUrl = (url: string) => {
      const id = url.split('/').filter(Boolean).pop();
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/icon/${id}.png`;
  }

  // Find currently selected pokemon to show sprite in input
  const selectedPokemon = allPokemon.find(p => p.name.toLowerCase() === value.toLowerCase().trim());

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-rajdhani">{label}</label>}
      
      <div className="relative group">
          {/* Left Icon: Sprite or Search Glass */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              {selectedPokemon ? (
                  <img 
                    src={getSpriteUrl(selectedPokemon.url)} 
                    className="w-8 h-8 object-contain animate-fade-in drop-shadow-md"
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
              ) : (
                  <i className="fa-solid fa-magnifying-glass text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
              )}
          </div>

          <input 
            ref={inputRef}
            type="text"
            value={value} 
            onChange={e => handleInput(e.target.value)} 
            placeholder={placeholder}
            className={`
                w-full bg-[#05060a] border border-slate-800 text-slate-200 
                pl-12 pr-10 py-2.5 rounded-lg
                focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] 
                outline-none transition-all placeholder:text-slate-700 font-medium
                ${loading ? 'opacity-80' : ''}
            `}
            onFocus={() => {
                if (value.length > 1) {
                    updatePosition();
                    setShowSuggestions(true);
                }
            }}
          />

          {/* Loading Indicator */}
          {loading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 animate-spin">
                  <i className="fa-solid fa-circle-notch"></i>
              </div>
          )}
          
          {/* Clear Button (only if not loading and has text) */}
          {!loading && value && (
              <button 
                onClick={() => { onChange(''); setSuggestions([]); }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-white transition-colors cursor-pointer"
              >
                  <i className="fa-solid fa-xmark"></i>
              </button>
          )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && createPortal(
        <div 
            ref={dropdownRef}
            style={{ 
                top: coords.top + 8, 
                left: coords.left, 
                width: coords.width 
            }}
            className="absolute z-[9999] neo-popover max-h-60 overflow-y-auto custom-scrollbar"
        >
          <div className="sticky top-0 bg-[#0b0e14]/90 backdrop-blur px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
              Sugestões
          </div>
          {suggestions.map(p => (
            <div 
              key={p.name}
              onClick={() => handleSelect(p.name)}
              className="px-3 py-2 hover:bg-blue-600/10 hover:text-blue-400 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors group"
            >
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50">
                  <img 
                    src={getSpriteUrl(p.url)}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    className="w-full h-full object-contain"
                    alt=""
                  />
              </div>
              <span className="text-sm font-bold capitalize font-rajdhani tracking-wide">{p.name.replace(/-/g, ' ')}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PokemonSearchInput;

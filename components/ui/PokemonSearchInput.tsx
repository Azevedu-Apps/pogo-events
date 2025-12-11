
import React, { useState, useEffect, useRef } from 'react';
import { getAllPokemonNames } from '../../services/pokeapi';

interface PokemonSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  onSelect?: () => void;
  loading?: boolean;
}

const PokemonSearchInput: React.FC<PokemonSearchInputProps> = ({ value, onChange, placeholder, className, label, onSelect, loading }) => {
  const [suggestions, setSuggestions] = useState<{name: string, url: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPokemon, setAllPokemon] = useState<{name: string, url: string}[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-ignore
    getAllPokemonNames().then(setAllPokemon);
    
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (text: string) => {
    onChange(text);
    if (text.length > 1) {
      const filtered = allPokemon
        .filter(p => p.name.includes(text.toLowerCase()))
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
    if (onSelect) onSelect();
  };

  const getSpriteUrl = (url: string) => {
      const id = url.split('/').filter(Boolean).pop();
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/icon/${id}.png`;
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
      <input 
        type="text"
        value={value} 
        onChange={e => handleInput(e.target.value)} 
        placeholder={placeholder}
        className={`event-input ${loading ? 'input-loading' : ''}`}
        onFocus={() => value.length > 1 && setShowSuggestions(true)}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {suggestions.map(p => (
            <div 
              key={p.name}
              onClick={() => handleSelect(p.name)}
              className="px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center gap-2 border-b border-slate-700/50 last:border-0"
            >
              <img 
                src={getSpriteUrl(p.url)}
                onError={(e) => (e.currentTarget.style.display = 'none')}
                className="w-8 h-8"
                alt=""
              />
              <span className="text-sm text-slate-200 capitalize">{p.name.replace(/-/g, ' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonSearchInput;

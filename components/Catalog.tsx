
import React, { useState, useEffect, memo } from 'react';
import { PogoEvent, CatalogProgress } from '../types';
import { fetchPokemon } from '../services/pokeapi';
import { getTypeIcon } from '../services/assets';
import { CatalogCardSkeleton } from './ui/Skeletons';

interface CatalogProps {
  event: PogoEvent;
  onBack: () => void;
}

// Fully restored Catalog Item with visuals
const CatalogItem = memo(({ item, isComplete, isShundoComplete, progressState, toggleVariant, type }: { 
    item: any, 
    isComplete: boolean, 
    isShundoComplete: boolean,
    progressState: any, 
    toggleVariant: (id: string, v: string) => void,
    type: 'spawn' | 'raid' | 'attack'
}) => {
    // Local state for fetched details (ID, Types) and Image fallback
    const [imgSrc, setImgSrc] = useState(item.image);
    const [details, setDetails] = useState<{id: number, types: string[]} | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch details on mount (Id, Types, and correct Image for Raids)
    useEffect(() => {
        let active = true;
        
        const load = async () => {
             if (!item.name) return;
             setLoading(true);

             const data = await fetchPokemon(item.name);
             if (active && data) {
                 setDetails({ id: data.id, types: data.types });
                 
                 // If it's a raid (usually missing image) or current image is broken/placeholder
                 if (type === 'raid' || !imgSrc || imgSrc.includes('random')) {
                     setImgSrc(data.image);
                 }
             }
             if (active) setLoading(false);
        };

        load();
        return () => { active = false; };
    }, [item.name, type]);

    if (loading) {
        return <CatalogCardSkeleton />;
    }

    const variants = type === 'raid' 
        ? ['normal', 'shiny', 'hundo', 'shadow', 'purified']
        : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
    
    const dexNumber = details?.id ? `#${details.id.toString().padStart(3, '0')}` : '???';

    // Determine card styling based on state
    let cardClasses = "catalog-item bg-slate-800 rounded-xl p-4 flex flex-col items-center relative border transition-all duration-300 overflow-hidden ";
    
    if (isShundoComplete) {
        cardClasses += "shundo-completed";
    } else if (isComplete) {
        cardClasses += "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)] bg-gradient-to-br from-slate-800 to-green-900/20";
    } else {
        cardClasses += "border-slate-700";
    }

    return (
        <div className={cardClasses}>
            
            {/* Completion Checkmark Animation */}
            {isShundoComplete ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 z-0 opacity-20 scale-125 animate-pulse">
                     <i className="fa-solid fa-crown text-8xl text-yellow-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"></i>
                </div>
            ) : (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 z-0 ${isComplete ? 'opacity-20 scale-100' : 'opacity-0 scale-0'}`}>
                    <i className="fa-solid fa-check text-8xl text-green-500"></i>
                </div>
            )}

            {/* Pokedex Watermark */}
            <div className="absolute top-2 left-2 z-0 text-5xl font-black text-white/5 select-none pointer-events-none tracking-tighter">
                {dexNumber}
            </div>
            
            {/* Top Right Checkbox for Attack type */}
            {type === 'attack' && (
                 <button 
                    onClick={() => toggleVariant(item.id, 'move_obtained')}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center border z-20 transition-all ${progressState['move_obtained'] ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_8px_rgba(147,51,234,0.6)]' : 'bg-slate-900 border-slate-600 text-transparent hover:border-slate-400'}`}
                 >
                    <i className="fa-solid fa-bolt"></i>
                 </button>
            )}

            <div className="relative w-24 h-24 mb-2 z-10 mt-4">
                <img 
                    src={imgSrc} 
                    onError={() => setImgSrc('https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg')} 
                    className="w-full h-full object-contain drop-shadow-xl transition-all duration-300" 
                />
            </div>
            
            <div className="z-10 text-center w-full mb-3">
                <span className={`font-bold capitalize leading-tight block ${isShundoComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 drop-shadow-sm' : 'text-white'}`}>{item.name}</span>
                
                {/* Type Icons */}
                <div className="flex justify-center gap-1 mt-1">
                    {details?.types.map(t => (
                        <img 
                            key={t} 
                            src={getTypeIcon(t)} 
                            className="w-4 h-4 object-contain shadow-sm" 
                            title={t} 
                            alt={t}
                        />
                    ))}
                </div>

                {type === 'attack' && item.move && (
                    <div className="flex items-center justify-center gap-2 mt-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                         <img src={getTypeIcon(item.moveType || 'normal')} className="w-3 h-3" />
                        <span className="text-xs text-white font-medium leading-none">{item.move}</span>
                    </div>
                )}
            </div>
            
            {/* Buttons Grid */}
            <div className="flex flex-wrap justify-center gap-1.5 z-10">
                {variants.map(variant => {
                    const isActive = progressState[variant];
                    let btnClass = "bg-slate-900 border-slate-600 text-slate-500 hover:border-slate-400"; // Default
                    
                    if (isActive) {
                        if (variant === 'normal') btnClass = "bg-red-600 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]";
                        if (variant === 'shiny') btnClass = "bg-yellow-600 border-yellow-500 text-white shadow-[0_0_8px_rgba(234,179,8,0.6)]";
                        if (variant === 'hundo') btnClass = "bg-pink-600 border-pink-500 text-white shadow-[0_0_8px_rgba(244,114,182,0.6)]";
                        if (variant === 'xxl') btnClass = "bg-blue-600 border-blue-400 text-white shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                        if (variant === 'xxs') btnClass = "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_8px_rgba(34,211,238,0.6)]";
                        if (variant === 'shadow') btnClass = "bg-purple-800 border-purple-600 text-white shadow-[0_0_8px_rgba(126,34,206,0.6)]";
                        if (variant === 'purified') btnClass = "bg-white border-slate-200 text-purple-800 shadow-[0_0_8px_rgba(255,255,255,0.6)]";
                    }

                    return (
                        <button 
                            key={variant}
                            onClick={() => toggleVariant(item.id, variant)}
                            className={`w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center border transition-all active:scale-95 ${btnClass}`}
                            title={variant}
                        >
                            {variant === 'normal' && <i className="fa-solid fa-circle"></i>}
                            {variant === 'shiny' && <i className="fa-solid fa-star"></i>}
                            {variant === 'hundo' && '100'}
                            {variant === 'xxl' && 'XXL'}
                            {variant === 'xxs' && 'xxs'}
                            {variant === 'shadow' && <i className="fa-solid fa-ghost"></i>}
                            {variant === 'purified' && <i className="fa-solid fa-bahai"></i>}
                        </button>
                    );
                })}
            </div>

            {/* Shundo Button */}
            {type !== 'attack' && (
                <button 
                    onClick={() => toggleVariant(item.id, 'shundo')}
                    className={`mt-2 w-full py-1 rounded-md border text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1 transition-all z-10 ${
                        progressState['shundo'] 
                        ? 'bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 border-transparent text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse' 
                        : 'bg-slate-900 border-slate-700 text-slate-600 hover:bg-slate-800'
                    }`}
                >
                    <i className="fa-solid fa-star"></i> SHUNDO
                </button>
            )}
        </div>
    );
});

const Catalog: React.FC<CatalogProps> = ({ event, onBack }) => {
  const [progress, setProgress] = useState<CatalogProgress>({});
  
  useEffect(() => {
    const saved = localStorage.getItem(`pogo_catalog_progress_${event.id}`);
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, [event.id]);

  const saveProgress = (newProgress: CatalogProgress) => {
    setProgress(newProgress);
    localStorage.setItem(`pogo_catalog_progress_${event.id}`, JSON.stringify(newProgress));
  };

  const toggleVariant = (pokemonId: string, variant: string) => {
    const newProgress = { ...progress };
    if (!newProgress[pokemonId]) newProgress[pokemonId] = {};
    // @ts-ignore
    newProgress[pokemonId][variant] = !newProgress[pokemonId][variant];
    saveProgress(newProgress);
  };

  // Build a flat list of items
  const categories: { title: string, type: 'spawn'|'raid'|'attack', items: any[] }[] = [];

  // 1. Spawns
  event.spawnCategories.forEach(cat => {
    categories.push({
      title: cat.name,
      type: 'spawn',
      items: cat.spawns.map(s => ({
        id: `${cat.name.toLowerCase().replace(/\s+/g, '')}-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: s.name,
        image: s.image
      }))
    });
  });

  // 2. Attacks
  if (event.attacks && event.attacks.length > 0) {
      categories.push({
          title: 'Ataques em Destaque',
          type: 'attack',
          items: event.attacks.map(a => ({
              id: `${a.pokemon.toLowerCase().replace(/\s+/g, '-')}-atk`,
              name: a.pokemon,
              image: a.image,
              move: a.move,
              moveType: a.type
          }))
      });
  }

  // 3. Raids
  if (event.raidsList && event.raidsList.length > 0) {
      categories.push({
          title: 'Raids',
          type: 'raid',
          items: event.raidsList.map(r => ({
              id: `raid-${r.boss.toLowerCase().replace(/\s+/g, '-')}`,
              name: r.boss,
              // Use random placeholder initially, CatalogItem will fetch real image
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${Math.floor(Math.random() * 900) + 1}.png`
          }))
      });
  }

  // Progress Calculation
  let totalItems = 0;
  let completedItems = 0;

  categories.forEach(cat => {
      cat.items.forEach(item => {
          totalItems++;
          const p = progress[item.id] || {};
          let isComplete = false;
          
          if (cat.type === 'attack') {
              isComplete = !!p['move_obtained'];
          } else if (cat.type === 'raid') {
              // Raid Completion: Normal, Shiny, Hundo, Shadow, Purified
              const required = ['normal', 'shiny', 'hundo', 'shadow', 'purified'];
              isComplete = required.every(k => p[k as keyof typeof p]);
          } else {
              // Spawn Completion: Normal, Shiny, Hundo, XXL, XXS
              const required = ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
              isComplete = required.every(k => p[k as keyof typeof p]);
          }
          
          if(isComplete) completedItems++;
      });
  });

  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="pb-20 animate-fade-in">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-30 py-4 border-b border-slate-800 shadow-sm mb-6">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center border border-slate-700 transition">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{event.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{percentage}%</span>
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catálogo</div>
          </div>
      </div>

      <div className="px-4 space-y-10">
        {categories.map((cat, idx) => (
            <div key={idx}>
                <h3 className={`text-lg font-bold border-b border-slate-700 pb-2 mb-4 uppercase flex items-center gap-2 ${cat.type === 'raid' ? 'text-red-400' : (cat.type === 'attack' ? 'text-purple-400' : 'text-blue-400')}`}>
                    {cat.type === 'raid' && <i className="fa-solid fa-dragon"></i>}
                    {cat.type === 'spawn' && <i className="fa-solid fa-leaf"></i>}
                    {cat.type === 'attack' && <i className="fa-solid fa-bolt"></i>}
                    {cat.title}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cat.items.map(item => {
                        const p = progress[item.id] || {};
                        let isComplete = false;
                        let isShundoComplete = false;
                        
                        if (cat.type === 'attack') {
                            isComplete = !!p['move_obtained'];
                        } else if (cat.type === 'raid') {
                            const required = ['normal', 'shiny', 'hundo', 'shadow', 'purified'];
                            isComplete = required.every(k => p[k as keyof typeof p]);
                            isShundoComplete = isComplete && !!p['shundo'];
                        } else {
                            const required = ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
                            isComplete = required.every(k => p[k as keyof typeof p]);
                            isShundoComplete = isComplete && !!p['shundo'];
                        }

                        return (
                            <CatalogItem 
                                key={item.id} 
                                item={item} 
                                isComplete={isComplete}
                                isShundoComplete={isShundoComplete}
                                progressState={p} 
                                toggleVariant={toggleVariant}
                                type={cat.type} 
                            />
                        )
                    })}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;

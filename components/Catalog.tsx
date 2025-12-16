
import React, { useState, useEffect, memo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { PogoEvent, CatalogProgress } from '../types';
import { fetchPokemon } from '../services/pokeapi';
import { getTypeIcon } from '../services/assets';
import { CatalogCardSkeleton } from './ui/Skeletons';
import { Lightbox } from './ui/Lightbox';
import { CatalogInfographic } from './detail/CatalogInfographic';
import { PokemonSocialCard } from './detail/PokemonSocialCard';
import { captureAndDownload } from '../utils/capture';
import { 
    listUserEventProgresses, createUserEventProgress, updateUserEventProgress,
    listUserPokedexes, createUserPokedex, updateUserPokedex 
} from '../services/graphql';

interface CatalogProps {
  event: PogoEvent;
  user: any;
  onBack: () => void;
}

// Weights configuration
const PROGRESS_WEIGHTS: Record<string, number> = {
    normal: 1,
    move_obtained: 1,
    xxl: 2,
    xxs: 2,
    shadow: 2,
    purified: 2,
    shiny: 4,
    hundo: 4
};

// Catalog Item
const CatalogItem = memo(({ item, isComplete, isShundoComplete, progressState, toggleVariant, type, onExportCard, isLocked, mergedProgress }: { 
    item: any, 
    isComplete: boolean, 
    isShundoComplete: boolean,
    progressState: any, 
    toggleVariant: (id: string, v: string, name: string) => void,
    type: 'spawn' | 'raid' | 'attack',
    onExportCard: (item: any, progress: any, types: string[], id: number) => void,
    isLocked: boolean,
    mergedProgress: any
}) => {
    const [images, setImages] = useState<{ normal: string, shiny: string }>({ normal: item.image, shiny: '' });
    const [details, setDetails] = useState<{id: number, types: string[]} | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let active = true;
        
        const load = async () => {
             if (!item.name) return;
             setLoading(true);

             const data = await fetchPokemon(item.name);
             if (active && data) {
                 setDetails({ id: data.id, types: data.types });
                 
                 const normal = (type === 'raid' || !images.normal || images.normal.includes('random')) ? data.image : images.normal;
                 setImages({
                     normal: normal,
                     shiny: data.shinyImage || normal // Fallback to normal if no shiny
                 });
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

    // Hover State Logic
    const displayImage = (isHovered && images.shiny) ? images.shiny : images.normal;

    // Base Styles matched to App.tsx card style
    let cardWrapperClass = "relative group rounded-xl overflow-hidden transition-all duration-300 border flex flex-col items-center ";
    let innerBgClass = "bg-[#151a25] w-full h-full p-4 flex flex-col items-center relative z-10";
    
    // Status Logic
    if (isShundoComplete) {
        cardWrapperClass += "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]";
    } else if (isComplete) {
        cardWrapperClass += "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
    } else {
        cardWrapperClass += "border-white/10 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]";
    }

    return (
        <div className={cardWrapperClass}>
            {/* Background Texture & Glow */}
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.05] pointer-events-none z-0"></div>
            {isShundoComplete && <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 z-0 animate-pulse"></div>}
            
            <div className={innerBgClass}>
                
                {/* Header: Dex ID & Export */}
                <div className="w-full flex justify-between items-start mb-2 relative z-20">
                    <span className="text-sm font-black text-slate-500 font-mono tracking-widest">{dexNumber}</span>
                    
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onExportCard({ ...item, image: images.normal }, mergedProgress, details?.types || [], details?.id || 0); 
                        }}
                        className="text-slate-600 hover:text-blue-400 transition-colors"
                        title="Compartilhar Card"
                    >
                        <i className="fa-solid fa-share-nodes text-xs"></i>
                    </button>
                </div>

                {/* Main Image Area with Hover Effect (NO CLICK) */}
                <div 
                    className="relative w-full aspect-square flex items-center justify-center mb-3 group/img cursor-default"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Shiny Indicator Icon */}
                    {isHovered && images.shiny !== images.normal && (
                        <div className="absolute top-0 right-0 z-20 animate-bounce">
                            <i className="fa-solid fa-star text-yellow-400 text-xs drop-shadow-md"></i>
                        </div>
                    )}

                    {/* Completion Checkmark Background */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${isComplete ? 'opacity-10 scale-100' : 'opacity-0 scale-50'}`}>
                         <i className={`fa-solid ${isShundoComplete ? 'fa-crown text-purple-500' : 'fa-check text-green-500'} text-8xl`}></i>
                    </div>

                    <img 
                        src={displayImage} 
                        onError={(e) => {
                            if (e.currentTarget.src !== 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg') {
                                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg';
                            }
                        }} 
                        className={`w-[85%] h-[85%] object-contain drop-shadow-xl transition-all duration-300 group-hover/img:scale-110 z-10 ${isLocked ? 'grayscale opacity-70' : ''}`}
                    />
                    
                    {/* Attack Type Badge */}
                    {type === 'attack' && (
                         <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!isLocked) toggleVariant(item.id, 'move_obtained', item.name); 
                            }}
                            className={`
                                absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center border z-20 transition-all 
                                ${mergedProgress['move_obtained'] ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_8px_rgba(147,51,234,0.6)]' : 'bg-[#0b0e14] border-slate-700 text-slate-600'}
                                ${!isLocked ? 'hover:border-slate-500 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                            `}
                            title="Ataque Obtido"
                            disabled={isLocked}
                         >
                            <i className="fa-solid fa-bolt text-xs"></i>
                         </button>
                    )}
                </div>

                {/* Name & Types */}
                <div className="text-center w-full mb-4 z-10">
                    <h4 className={`font-bold uppercase font-rajdhani tracking-wider leading-none mb-2 ${isShundoComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-slate-200'}`}>
                        {item.name}
                    </h4>
                    
                    <div className="flex justify-center gap-1.5 h-6">
                        {details?.types.map(t => (
                            <div key={t} className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-sm" title={t}>
                                <img src={getTypeIcon(t)} className="w-4 h-4 object-contain" alt={t} />
                            </div>
                        ))}
                    </div>

                    {type === 'attack' && item.move && (
                        <div className="mt-2 text-[10px] text-purple-300 bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/30 inline-block">
                            {item.move}
                        </div>
                    )}
                </div>

                {/* Control Grid (Tech Style) */}
                {type !== 'attack' && (
                    <div className="w-full space-y-2 z-10 mt-auto">
                        <div className="grid grid-cols-5 gap-1">
                            {variants.map(variant => {
                                const isActive = mergedProgress[variant];
                                let activeClass = "";
                                let inactiveClass = "bg-[#0b0e14] border-slate-800 text-slate-700";
                                let content = null;
                                let title = variant;

                                switch(variant) {
                                    case 'normal': 
                                        activeClass = "bg-red-900/80 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"; 
                                        content = <i className="fa-solid fa-check"></i>;
                                        break;
                                    case 'shiny': 
                                        activeClass = "bg-yellow-900/80 border-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.4)]";
                                        content = <i className="fa-solid fa-star"></i>;
                                        break;
                                    case 'hundo': 
                                        activeClass = "bg-pink-900/80 border-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]";
                                        content = "4*";
                                        break;
                                    case 'xxl': 
                                        activeClass = "bg-blue-900/80 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]";
                                        content = "XXL";
                                        break;
                                    case 'xxs': 
                                        activeClass = "bg-cyan-900/80 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]";
                                        content = "XXS";
                                        break;
                                    case 'shadow': 
                                        activeClass = "bg-purple-900/80 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]";
                                        content = <i className="fa-solid fa-ghost"></i>;
                                        break;
                                    case 'purified': 
                                        activeClass = "bg-slate-200 border-white text-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.4)]";
                                        content = <i className="fa-solid fa-bahai"></i>;
                                        break;
                                }

                                return (
                                    <button 
                                        key={variant}
                                        onClick={() => { if (!isLocked) toggleVariant(item.id, variant, item.name); }}
                                        disabled={isLocked}
                                        className={`
                                            h-7 rounded text-[10px] font-bold flex items-center justify-center border transition-all duration-200
                                            ${isActive ? activeClass : inactiveClass}
                                            ${!isLocked ? 'hover:border-slate-600 hover:text-slate-500 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                                        `}
                                        title={title}
                                    >
                                        {content}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Shundo Toggle (Wide Bar) */}
                        <button 
                            onClick={() => { if (!isLocked) toggleVariant(item.id, 'shundo', item.name); }}
                            disabled={isLocked}
                            className={`
                                w-full py-1.5 rounded text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300
                                flex items-center justify-center gap-2
                                ${mergedProgress['shundo'] 
                                    ? 'bg-gradient-to-r from-yellow-600 via-purple-600 to-pink-600 border-transparent text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse' 
                                    : 'bg-[#0b0e14] border-slate-800 text-slate-700'
                                }
                                ${!isLocked ? 'hover:border-slate-600 hover:text-slate-500 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                            `}
                        >
                            <i className="fa-solid fa-crown text-[8px]"></i> Shundo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

const Catalog: React.FC<CatalogProps> = ({ event, user, onBack }) => {
  const [progress, setProgress] = useState<CatalogProgress>({});
  
  // Pokedex State
  const [dexData, setDexData] = useState<any>({});
  const [useDex, setUseDex] = useState(false);
  const [dexRecordId, setDexRecordId] = useState<string | null>(null);
  
  const [dbRecordId, setDbRecordId] = useState<string | null>(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const [usingLocal, setUsingLocal] = useState(false);
  
  const [lightbox, setLightbox] = useState<{ open: boolean, src: string, name: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportCardData, setExportCardData] = useState<{ item: any, progress: any, types: string[], id: number } | null>(null);
  
  // Calculate Locks
  const now = new Date();
  const start = new Date(event.start);
  const end = new Date(event.end);
  const lockDate = new Date(end.getTime() + 24 * 60 * 60 * 1000); // End + 1 Day
  const isLocked = now < start || now > lockDate;
  
  // Load Pokedex Data & ID on Mount
  useEffect(() => {
      const loadDex = async () => {
          const savedDex = localStorage.getItem('pogo_dex_progress');
          const localDex = savedDex ? JSON.parse(savedDex) : {};
          setDexData(localDex);

          if (user) {
              const client = generateClient();
              try {
                  const result: any = await client.graphql({
                      query: listUserPokedexes,
                      authMode: 'userPool'
                  });
                  const record = result.data.listUserPokedexes.items[0];
                  if (record) {
                      setDexRecordId(record.id);
                  }
              } catch (e) {
                  // If fetching fails (schema missing in cloud), fail silently
                  console.debug("Could not fetch Dex ID (Cloud Schema might be missing)", e);
              }
          }
      };
      loadDex();
  }, [user]);

  // --- SYNC LOGIC (EVENT) ---
  useEffect(() => {
    const syncData = async () => {
        const localDataRaw = localStorage.getItem(`pogo_catalog_progress_${event.id}`);
        const localData = localDataRaw ? JSON.parse(localDataRaw) : null;

        // Use local data immediately for instant UI
        if (localData) setProgress(localData);

        // If no user, we are done (Guest Mode)
        if (!user) {
            setUsingLocal(true);
            return;
        }

        // Try Syncing with Cloud
        setLoadingSync(true);
        const client = generateClient();
        try {
            const result: any = await client.graphql({
                query: listUserEventProgresses,
                variables: {
                    filter: { eventId: { eq: event.id } }
                },
                authMode: 'userPool' // Ensure we use User Pool Auth for private data
            });

            const cloudRecord = result.data.listUserEventProgresses.items[0];

            if (cloudRecord) {
                // Cloud exists
                setDbRecordId(cloudRecord.id);
                
                // Safe JSON parse for cloud data
                let cloudData = {};
                try {
                    cloudData = cloudRecord.progressData ? JSON.parse(cloudRecord.progressData) : {};
                } catch (parseErr) {
                    console.error("Error parsing cloud data:", parseErr);
                    cloudData = {};
                }
                
                // Conflict Resolution: If Cloud is empty but Local has data, push Local -> Cloud
                if (Object.keys(cloudData).length === 0 && localData && Object.keys(localData).length > 0) {
                    await updateCloud(cloudRecord.id, localData);
                    setProgress(localData);
                } else {
                    // Otherwise, Cloud source of truth wins
                    setProgress(cloudData);
                    localStorage.setItem(`pogo_catalog_progress_${event.id}`, JSON.stringify(cloudData));
                }
            } else {
                // No Cloud Record exists yet, create one
                const initialData = localData || {};
                const newRecord: any = await client.graphql({
                    query: createUserEventProgress,
                    variables: {
                        input: {
                            eventId: event.id,
                            progressData: JSON.stringify(initialData)
                        }
                    },
                    authMode: 'userPool'
                });
                setDbRecordId(newRecord.data.createUserEventProgress.id);
            }
        } catch (err: any) {
            // Check for specific backend-missing error
            if (err.errors && err.errors[0]?.message?.includes("FieldUndefined")) {
                console.warn("Backend schema missing. Using Local Storage only.");
            } else {
                console.warn("Cloud Sync unavailable:", err);
            }
            setUsingLocal(true);
            if (localData) setProgress(localData);
        } finally {
            setLoadingSync(false);
        }
    };

    syncData();
  }, [event.id, user]);

  const updateCloud = async (id: string, data: any) => {
      const client = generateClient();
      try {
          await client.graphql({
              query: updateUserEventProgress,
              variables: {
                  input: {
                      id: id,
                      progressData: JSON.stringify(data)
                  }
              },
              authMode: 'userPool'
          });
      } catch (e) {
          // Silent fail on save is acceptable, user still has local data
          console.debug("Failed to save to cloud", e);
      }
  };

  const updateGlobalDex = async (dex: any) => {
      // Save Local
      localStorage.setItem('pogo_dex_progress', JSON.stringify(dex));
      
      // Save Cloud
      if (user && !usingLocal) {
          const client = generateClient();
          if (dexRecordId) {
              try {
                  await client.graphql({
                      query: updateUserPokedex,
                      variables: { input: { id: dexRecordId, progressData: JSON.stringify(dex) } },
                      authMode: 'userPool'
                  });
              } catch(e) { console.debug("Dex cloud update failed", e); }
          } else {
              // Create if missing
              try {
                  const res: any = await client.graphql({
                      query: createUserPokedex,
                      variables: { input: { progressData: JSON.stringify(dex) } },
                      authMode: 'userPool'
                  });
                  setDexRecordId(res.data.createUserPokedex.id);
              } catch(e) { console.debug("Dex cloud create failed", e); }
          }
      }
  };

  const saveProgress = (newProgress: CatalogProgress) => {
    // 1. Update State (Instant UI)
    setProgress(newProgress);
    
    // 2. Always save to LocalStorage (Offline / Backup)
    localStorage.setItem(`pogo_catalog_progress_${event.id}`, JSON.stringify(newProgress));

    // 3. If User Logged In AND Sync is working, Save to Cloud
    if (user && dbRecordId && !usingLocal) {
        updateCloud(dbRecordId, newProgress);
    }
  };

  const toggleVariant = (pokemonId: string, variant: string, pokemonName: string) => {
    const newProgress = { ...progress };
    if (!newProgress[pokemonId]) newProgress[pokemonId] = {};
    
    // @ts-ignore
    const newValue = !newProgress[pokemonId][variant];
    // @ts-ignore
    newProgress[pokemonId][variant] = newValue;
    
    saveProgress(newProgress);

    // --- INTEGRATION: AUTO UPDATE POKEDEX ---
    // If the user marked something as CAUGHT (true), update the global pokedex if it's missing there.
    if (newValue && pokemonName) {
        const cleanName = pokemonName.toLowerCase();
        const currentDexEntry = dexData[cleanName] || {};
        
        // Check if this variant is already recorded in the global dex
        // @ts-ignore
        if (!currentDexEntry[variant]) {
            // It's new to the Dex! Add it.
            const newDexData = { 
                ...dexData, 
                [cleanName]: { 
                    ...currentDexEntry, 
                    [variant]: true 
                } 
            };
            setDexData(newDexData); // Update local state for "Use Pokedex" view
            updateGlobalDex(newDexData); // Persist
        }
    }
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
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${Math.floor(Math.random() * 900) + 1}.png`
          }))
      });
  }

  // Progress Calculation (Weighted) based on EVENT data only
  let currentScore = 0;
  let maxScore = 0;

  categories.forEach(cat => {
      cat.items.forEach(item => {
          const p = progress[item.id] || {};
          
          if (cat.type === 'attack') {
              maxScore += PROGRESS_WEIGHTS['move_obtained'];
              if (p['move_obtained']) currentScore += PROGRESS_WEIGHTS['move_obtained'];
          } else {
              const variantsToCheck = cat.type === 'raid'
                  ? ['normal', 'shiny', 'hundo', 'shadow', 'purified']
                  : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
              
              variantsToCheck.forEach(v => {
                  const weight = PROGRESS_WEIGHTS[v] || 1;
                  maxScore += weight;
                  if (p[v as keyof typeof p]) currentScore += weight;
              });
          }
      });
  });

  const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  // Progress Color Logic
  let progressColor = "bg-gradient-to-r from-red-600 to-orange-500 shadow-red-500/50";
  if (percentage >= 30) progressColor = "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/50";
  if (percentage >= 70) progressColor = "bg-gradient-to-r from-emerald-600 to-green-500 shadow-emerald-500/50";
  if (percentage >= 100) progressColor = "bg-gradient-to-r from-yellow-500 via-purple-500 to-pink-500 shadow-purple-500/50";

  const handleExportFull = () => {
      captureAndDownload({
          nodeId: 'catalog-infographic-capture',
          fileName: `checklist-${event.name.replace(/\s+/g, '-').toLowerCase()}`,
          onStart: () => setExporting(true),
          onEnd: () => setExporting(false)
      });
  };

  const handleExportCard = (item: any, itemProgress: any, types: string[], id: number) => {
      setExportCardData({ item, progress: itemProgress, types, id });
      setTimeout(() => {
          captureAndDownload({
              nodeId: 'social-card-capture',
              fileName: `card-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
              onStart: () => setExporting(true),
              onEnd: () => {
                  setExporting(false);
                  setExportCardData(null);
              }
          });
      }, 100);
  };

  return (
    <div className="pb-20 animate-fade-in relative">
      
      {/* Hidden Export Views */}
      <div className="fixed top-0 left-[-9999px] pointer-events-none">
          <CatalogInfographic 
             event={event} 
             progress={progress} 
             categories={categories} 
             id="catalog-infographic-capture" 
          />
          {exportCardData && (
              <PokemonSocialCard 
                id="social-card-capture" 
                pokemon={{ ...exportCardData.item, types: exportCardData.types }} 
                progress={exportCardData.progress}
                eventName={event.name}
                dexId={exportCardData.id}
              />
          )}
      </div>

      <Lightbox 
          isOpen={!!lightbox?.open}
          onClose={() => setLightbox(null)}
          src={lightbox?.src || ''}
          title={lightbox?.name}
      />

      <div className="sticky top-0 bg-[#0b0e14]/90 backdrop-blur-xl z-30 py-4 border-b border-white/5 shadow-2xl mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={onBack} className="w-10 h-10 bg-[#151a25] hover:bg-white/10 text-slate-300 rounded-full flex items-center justify-center border border-white/10 transition">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div className="flex-1">
                <h2 className="text-xl font-black text-white font-rajdhani uppercase tracking-wide leading-none truncate max-w-[200px] md:max-w-none">{event.name}</h2>
              </div>
            </div>

            {/* Locked Banner */}
            {isLocked && (
                <div className="bg-red-900/20 border border-red-500/50 px-4 py-2 rounded flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wide animate-pulse">
                    <i className="fa-solid fa-lock"></i>
                    {now < start ? "Evento não iniciado" : "Período de registro encerrado"}
                </div>
            )}

            {/* ENHANCED PROGRESS BAR */}
            <div className="flex-1 w-full md:max-w-xl mx-4 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conclusão do Evento</span>
                    <span className={`text-sm font-black font-mono ${percentage === 100 ? 'text-yellow-400' : 'text-white'}`}>
                        {percentage}% {percentage === 100 && <i className="fa-solid fa-crown ml-1"></i>}
                    </span>
                </div>
                <div className="h-4 w-full bg-[#05060a] rounded-full overflow-hidden border border-slate-700/50 relative shadow-inner">
                    {/* Background Grid inside bar */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_100%]"></div>
                    
                    {/* Bar Fill */}
                    <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_currentColor] progress-stripe ${progressColor}`} 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                
                {/* USE POKEDEX TOGGLE */}
                <div 
                    onClick={() => setUseDex(!useDex)}
                    className="flex flex-col items-center cursor-pointer group"
                    title="Mesclar com dados da Pokédex"
                >
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Usar Pokédex</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${useDex ? 'bg-blue-600' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all ${useDex ? 'left-6' : 'left-1'}`}></div>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-700 mx-2"></div>

                {loadingSync && <span className="text-xs text-blue-400 animate-pulse font-mono bg-blue-900/20 px-2 py-1 rounded"><i className="fa-solid fa-cloud-arrow-up"></i> Sync</span>}
                {usingLocal && user && <span className="text-xs text-orange-400 font-mono bg-orange-900/20 px-2 py-1 rounded cursor-help" title="Sincronização com nuvem falhou. Usando dados locais."><i className="fa-solid fa-triangle-exclamation"></i> Offline</span>}
                <button 
                    onClick={handleExportFull} 
                    disabled={exporting}
                    className="btn-tech btn-tech-blue text-xs px-4 py-2 whitespace-nowrap"
                >
                    {exporting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>}
                    <span className="hidden sm:inline">Baixar</span>
                </button>
            </div>
          </div>
      </div>

      <div className="px-4 md:px-8 space-y-12">
        {categories.map((cat, idx) => (
            <div key={idx}>
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-2">
                    <div className={`text-xl ${cat.type === 'raid' ? 'text-red-500' : (cat.type === 'attack' ? 'text-purple-500' : 'text-blue-500')}`}>
                        {cat.type === 'raid' && <i className="fa-solid fa-dragon"></i>}
                        {cat.type === 'spawn' && <i className="fa-solid fa-leaf"></i>}
                        {cat.type === 'attack' && <i className="fa-solid fa-bolt"></i>}
                    </div>
                    <h3 className="text-2xl font-black text-white font-rajdhani uppercase tracking-widest">{cat.title}</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {cat.items.map(item => {
                        const eventP = progress[item.id] || {};
                        
                        // Merge with Global Pokedex if enabled
                        // Dex uses lowercase names as keys: { 'pikachu': { shiny: true } }
                        const globalP = useDex ? (dexData[item.name.toLowerCase()] || {}) : {};
                        const mergedP = { ...globalP, ...eventP }; // Event progress overrides/adds to global for display

                        let isComplete = false;
                        let isShundoComplete = false;
                        
                        // Check Completion using Merged Data
                        if (cat.type === 'attack') {
                            isComplete = !!mergedP['move_obtained'];
                        } else if (cat.type === 'raid') {
                            const required = ['normal', 'shiny', 'hundo', 'shadow', 'purified'];
                            isComplete = required.every(k => mergedP[k as keyof typeof mergedP]);
                            isShundoComplete = isComplete && !!mergedP['shundo'];
                        } else {
                            const required = ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
                            isComplete = required.every(k => mergedP[k as keyof typeof mergedP]);
                            isShundoComplete = isComplete && !!mergedP['shundo'];
                        }

                        return (
                            <CatalogItem 
                                key={item.id} 
                                item={item} 
                                isComplete={isComplete}
                                isShundoComplete={isShundoComplete}
                                progressState={eventP} // State passed to update function (must be event specific)
                                mergedProgress={mergedP} // State passed for visual display
                                toggleVariant={toggleVariant}
                                type={cat.type}
                                onExportCard={handleExportCard}
                                isLocked={isLocked}
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

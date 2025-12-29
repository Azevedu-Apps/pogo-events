
import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { PogoEvent, CatalogProgress } from '../types';
import { fetchPokemon } from '../services/pokeapi';
import { getTypeIcon } from '../services/assets';
import { CatalogCardSkeleton } from './ui/Skeletons';
import { Lightbox } from './ui/Lightbox';
import { CatalogInfographic } from './detail/CatalogInfographic';
import { PokemonSocialCard } from './detail/PokemonSocialCard';
import { captureAndDownload } from '../utils/capture';

interface CatalogProps {
  event: PogoEvent;
  user?: any;
  onBack: () => void;
}

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

// Tooltip Inteligente com Portal e Posicionamento Absoluto
const SmartTooltip = ({ text, color = "blue", triggerRef, isVisible }: { text: string, color?: string, triggerRef: React.RefObject<HTMLElement>, isVisible: boolean }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0, opacity: 0, scale: 0.95, translate: 'translate(-50%, -100%)', side: 'top' });
    const tooltipRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const viewportWidth = window.innerWidth;
            
            let side = 'top';
            let top = rect.top + scrollY - 12; 
            let left = rect.left + scrollX + rect.width / 2;
            let translate = 'translate(-50%, -100%)';

            if (rect.top < 130) {
                side = 'bottom';
                top = rect.bottom + scrollY + 12;
                translate = 'translate(-50%, 0)';
            } else if (rect.left < 140) {
                side = 'right';
                top = rect.top + scrollY + rect.height / 2;
                left = rect.right + scrollX + 12;
                translate = 'translate(0, -50%)';
            } else if (viewportWidth - rect.right < 140) {
                side = 'left';
                top = rect.top + scrollY + rect.height / 2;
                left = rect.left + scrollX - 12;
                translate = 'translate(-100%, -50%)';
            }

            setCoords({ top, left, opacity: 1, scale: 1, translate, side });
        } else {
            setCoords(prev => ({ ...prev, opacity: 0, scale: 0.95 }));
        }
    }, [isVisible, triggerRef]);

    if (!isVisible) return null;

    const colors: Record<string, string> = {
        blue: "border-blue-500 text-blue-400",
        red: "border-red-500 text-red-400",
        yellow: "border-yellow-500 text-yellow-400",
        pink: "border-pink-500 text-pink-400",
        cyan: "border-cyan-400 text-cyan-300",
        purple: "border-purple-600 text-purple-400",
        slate: "border-slate-500 text-slate-300",
        white: "border-slate-100 text-white"
    };

    const activeColor = colors[color] || colors.blue;
    const arrowPosClass = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-[#0b0e14]/95",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#0b0e14]/95",
        left: "left-full top-1/2 -translate-y-1/2 border-l-[#0b0e14]/95",
        right: "right-full top-1/2 -translate-y-1/2 border-r-[#0b0e14]/95"
    }[coords.side];

    return createPortal(
        <div 
            ref={tooltipRef}
            style={{ 
                top: coords.top, 
                left: coords.left, 
                opacity: coords.top === 0 ? 0 : coords.opacity,
                transform: `${coords.translate} scale(${coords.scale})`,
            }}
            className={`absolute px-4 py-2 bg-[#0b0e14]/95 backdrop-blur-xl rounded-lg border ${activeColor.split(' ')[0]} shadow-2xl pointer-events-none z-[10000] transition-opacity transition-transform duration-200 flex flex-col items-center gap-1 min-w-[110px]`}
        >
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-rajdhani whitespace-nowrap drop-shadow-md ${activeColor.split(' ').slice(1).join(' ')}`}>
                {text}
            </span>
            <div className={`w-6 h-[1.5px] rounded-full ${activeColor.split(' ')[0].replace('border-', 'bg-')}`}></div>
            <div className={`absolute border-[6px] border-transparent ${arrowPosClass}`}></div>
        </div>,
        document.body
    );
};

const CatalogItem = memo(({ item, isComplete, isShundoComplete, toggleVariant, type, onExportCard, mergedProgress }: { 
    item: any, 
    isComplete: boolean, 
    isShundoComplete: boolean,
    progressState: any, 
    toggleVariant: (id: string, variant: string, name: string) => void,
    type: 'spawn' | 'raid' | 'attack',
    onExportCard: (item: any, progress: any, types: string[], id: number) => void,
    isLocked: boolean,
    mergedProgress: any
}) => {
    const [images, setImages] = useState<{ normal: string, shiny: string }>({ normal: item.image, shiny: '' });
    const [details, setDetails] = useState<{id: number, types: string[]} | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);

    const shareRef = useRef<HTMLButtonElement>(null);
    const attackRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
             if (!item.name) return;
             setLoading(true);
             const data = await fetchPokemon(item.name);
             if (active && data) {
                 setDetails({ id: data.id, types: data.types });
                 const normal = (type === 'raid' || !images.normal || images.normal.includes('random')) ? data.image : images.normal;
                 setImages({ normal, shiny: data.shinyImage || normal });
             }
             if (active) setLoading(false);
        };
        load();
        return () => { active = false; };
    }, [item.name, type]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopyStatus(label);
        setTimeout(() => setCopyStatus(null), 2000);
    };

    if (loading) return <CatalogCardSkeleton />;

    const variants = type === 'raid' 
        ? ['normal', 'shiny', 'hundo', 'shadow', 'purified']
        : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
    
    const dexNumberRaw = details?.id?.toString() || "";
    const dexNumberFormatted = details?.id ? `#${details.id.toString().padStart(3, '0')}` : '???';
    const displayImage = (isHovered && images.shiny) ? images.shiny : images.normal;

    let cardWrapperClass = "relative group rounded-3xl transition-all duration-300 border flex flex-col items-center h-full overflow-visible ";
    if (isShundoComplete) cardWrapperClass += "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]";
    else if (isComplete) cardWrapperClass += "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
    else cardWrapperClass += "border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]";

    return (
        <div className={cardWrapperClass}>
            <div className="absolute inset-0 bg-[#151a25] rounded-3xl overflow-hidden z-0 pointer-events-none">
                <div className="absolute inset-0 bg-dot-pattern opacity-[0.07]"></div>
            </div>
            
            {copyStatus && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[130] bg-blue-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-2xl animate-bounce border border-blue-400 font-rajdhani tracking-widest">
                    {copyStatus} COPIADO!
                </div>
            )}

            <div className="w-full h-full p-5 md:p-7 flex flex-col items-center relative z-10">
                <div className="w-full flex justify-between items-center mb-1 relative z-20">
                    <button 
                        onClick={() => copyToClipboard(dexNumberRaw, 'NÚMERO')}
                        className="text-sm md:text-base font-black text-slate-500 font-mono tracking-widest bg-[#0b0e14] px-2 py-0.5 rounded border border-white/5 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                    >
                        {dexNumberFormatted}
                    </button>

                    <div className="relative">
                        <button 
                            ref={shareRef}
                            onMouseEnter={() => setActiveTooltip('share')}
                            onMouseLeave={() => setActiveTooltip(null)}
                            onClick={() => onExportCard({ ...item, image: images.normal }, mergedProgress, details?.types || [], details?.id || 0)} 
                            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors border border-white/5"
                        >
                            <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                        <SmartTooltip text="Gerar Card Social" triggerRef={shareRef} isVisible={activeTooltip === 'share'} color="blue" />
                    </div>
                </div>

                <div 
                    className="relative flex-1 flex items-center justify-center mb-6 group/img cursor-pointer" 
                    onMouseEnter={() => setIsHovered(true)} 
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => copyToClipboard(item.name, 'NOME')}
                >
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${isComplete ? 'opacity-20 scale-110' : 'opacity-0 scale-50'}`}>
                         <i className={`fa-solid ${isShundoComplete ? 'fa-crown text-purple-500' : 'fa-check text-green-500'} text-8xl md:text-6xl`}></i>
                    </div>
                    <img src={displayImage} className="w-full max-h-56 md:max-h-44 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/img:scale-110 z-10" />
                    
                    {type === 'attack' && (
                         <div className="absolute -bottom-2 -right-2 z-20">
                            <button 
                                ref={attackRef}
                                onMouseEnter={() => setActiveTooltip('attack')}
                                onMouseLeave={() => setActiveTooltip(null)}
                                onClick={(e) => { e.stopPropagation(); toggleVariant(item.id, 'move_obtained', item.name); }} 
                                className={`w-10 h-10 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all ${mergedProgress['move_obtained'] ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)]' : 'bg-[#0b0e14] text-slate-600'} hover:bg-slate-800`}
                            >
                                <i className="fa-solid fa-bolt text-lg"></i>
                            </button>
                            <SmartTooltip text="Ataque Obtido" triggerRef={attackRef} isVisible={activeTooltip === 'attack'} color="purple" />
                         </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3 mb-6 z-10 flex-wrap w-full px-2">
                    {/* Element icons moved before the name */}
                    <div className="flex gap-2 h-7 md:h-6">
                        {details?.types.map(t => {
                            const typeRef = React.createRef<HTMLDivElement>();
                            return (
                                <div key={t} className="relative">
                                    <div 
                                        ref={typeRef}
                                        onMouseEnter={() => setActiveTooltip(`type-${t}`)}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <img src={getTypeIcon(t)} className="w-full h-full object-contain transition-transform hover:scale-110" alt={t} />
                                    </div>
                                    <SmartTooltip text={`Tipo ${t}`} triggerRef={typeRef} isVisible={activeTooltip === `type-${t}`} color="slate" />
                                </div>
                            );
                        })}
                    </div>

                    <h4 
                        onClick={() => copyToClipboard(item.name, 'NOME')}
                        className={`font-black cursor-pointer uppercase font-rajdhani tracking-tighter leading-none italic pr-2 ${isShundoComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-white'} text-2xl md:text-xl lg:text-2xl hover:text-blue-400 transition-colors`}
                    >
                        {item.name}
                    </h4>
                </div>

                {type !== 'attack' && (
                    <div className="w-full space-y-4 z-10 mt-auto">
                        <div className="grid grid-cols-5 gap-3">
                            {variants.map(variant => {
                                const isActive = mergedProgress[variant];
                                let activeClass = "";
                                let content = null;
                                let tooltipLabel = "";
                                let tooltipColor = "blue";
                                const btnRef = React.createRef<HTMLButtonElement>();

                                switch(variant) {
                                    case 'normal': 
                                        activeClass = "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"; 
                                        content = <i className="fa-solid fa-check text-2xl md:text-xl"></i>; 
                                        tooltipLabel = "Capturado";
                                        tooltipColor = "red";
                                        break;
                                    case 'shiny': 
                                        activeClass = "bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]"; 
                                        content = <i className="fa-solid fa-star text-2xl md:text-xl"></i>; 
                                        tooltipLabel = "Brilhante";
                                        tooltipColor = "yellow";
                                        break;
                                    case 'hundo': 
                                        activeClass = "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"; 
                                        content = <span className="text-xl md:text-lg font-black">100</span>; 
                                        tooltipLabel = "100% IV";
                                        tooltipColor = "pink";
                                        break;
                                    case 'xxl': 
                                        activeClass = "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"; 
                                        content = <span className="text-xl md:text-lg font-black">XXL</span>; 
                                        tooltipLabel = "Tamanho XXL";
                                        tooltipColor = "blue";
                                        break;
                                    case 'xxs': 
                                        activeClass = "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"; 
                                        content = <span className="text-xl md:text-lg font-black">XXS</span>; 
                                        tooltipLabel = "Tamanho XXS";
                                        tooltipColor = "cyan";
                                        break;
                                    case 'shadow': 
                                        activeClass = "bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"; 
                                        content = <i className="fa-solid fa-fire-flame-curved text-2xl md:text-xl"></i>; 
                                        tooltipLabel = "Sombroso";
                                        tooltipColor = "purple";
                                        break;
                                    case 'purified': 
                                        activeClass = "bg-slate-100 text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.5)]"; 
                                        content = <i className="fa-solid fa-bahai text-2xl md:text-xl"></i>; 
                                        tooltipLabel = "Purificado";
                                        tooltipColor = "white";
                                        break;
                                }
                                return (
                                    <div key={variant} className="relative">
                                        <button 
                                            ref={btnRef}
                                            onMouseEnter={() => setActiveTooltip(variant)}
                                            onMouseLeave={() => setActiveTooltip(null)}
                                            onClick={() => toggleVariant(item.id, variant, item.name)} 
                                            className={`w-full h-14 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? activeClass : "bg-[#0b0e14] text-slate-700 hover:bg-slate-800"} active:scale-95 border-0`}
                                        >
                                            {content}
                                        </button>
                                        <SmartTooltip text={tooltipLabel} triggerRef={btnRef} isVisible={activeTooltip === variant} color={tooltipColor} />
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="relative">
                            {(() => {
                                const shundoRef = React.createRef<HTMLButtonElement>();
                                return (
                                    <>
                                        <button 
                                            ref={shundoRef}
                                            onMouseEnter={() => setActiveTooltip('shundo')}
                                            onMouseLeave={() => setActiveTooltip(null)}
                                            onClick={() => toggleVariant(item.id, 'shundo', item.name)} 
                                            className={`w-full py-5 md:py-4 rounded-2xl text-lg md:text-sm font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 font-rajdhani border-0 ${mergedProgress['shundo'] ? 'bg-gradient-to-r from-yellow-500 via-purple-600 to-pink-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-pulse' : 'bg-[#0b0e14] text-slate-700 hover:bg-slate-800'}`}
                                        >
                                            <i className="fa-solid fa-crown text-xl md:text-base"></i> PROTOCOLO SHUNDO
                                        </button>
                                        <SmartTooltip text="Meta Final: 100% Shiny" triggerRef={shundoRef} isVisible={activeTooltip === 'shundo'} color="purple" />
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

const Catalog: React.FC<CatalogProps> = ({ event, user, onBack }) => {
  const [progress, setProgress] = useState<CatalogProgress>({});
  const [lightbox, setLightbox] = useState<{ open: boolean, src: string, name: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportCardData, setExportCardData] = useState<{ item: any, progress: any, types: string[], id: number } | null>(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`pogo_catalog_progress_${event.id}`);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  }, [event.id]);

  const saveProgress = (newProgress: CatalogProgress) => {
    setProgress(newProgress);
    localStorage.setItem(`pogo_catalog_progress_${event.id}`, JSON.stringify(newProgress));
  };

  const toggleVariant = (pokemonId: string, variant: string, pokemonName: string) => {
    const newProgress = { ...progress };
    if (!newProgress[pokemonId]) newProgress[pokemonId] = {};
    const newValue = !newProgress[pokemonId][variant as keyof CatalogProgress[string]];
    newProgress[pokemonId][variant as keyof CatalogProgress[string]] = newValue as any;
    saveProgress(newProgress);
  };

  const categories: { title: string, type: 'spawn'|'raid'|'attack', items: any[] }[] = [];
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
  
  if (event.attacks?.length > 0) {
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
  
  if (event.raidsList?.length > 0) {
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

  let currentScore = 0;
  let maxScore = 0;
  categories.forEach(cat => {
      cat.items.forEach(item => {
          const p = progress[item.id] || {};
          if (cat.type === 'attack') {
              maxScore += PROGRESS_WEIGHTS['move_obtained'];
              if (p['move_obtained']) currentScore += PROGRESS_WEIGHTS['move_obtained'];
          } else {
              const variantsToCheck = cat.type === 'raid' ? ['normal', 'shiny', 'hundo', 'shadow', 'purified'] : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];
              variantsToCheck.forEach(v => {
                  const weight = PROGRESS_WEIGHTS[v] || 1;
                  maxScore += weight;
                  if (p[v as keyof typeof p]) currentScore += weight;
              });
          }
      });
  });

  const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;
  let progressColor = percentage >= 100 ? "bg-gradient-to-r from-yellow-500 via-purple-500 to-pink-500 shadow-purple-500/50" : (percentage >= 70 ? "bg-gradient-to-r from-emerald-600 to-green-500" : (percentage >= 30 ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-gradient-to-r from-red-600 to-orange-500"));

  return (
    <div className="pb-20 animate-fade-in relative">
      <div className="fixed top-0 left-[-9999px] pointer-events-none">
          <CatalogInfographic event={event} progress={progress} categories={categories} id="catalog-infographic-capture" />
          {exportCardData && <PokemonSocialCard id="social-card-capture" pokemon={{ ...exportCardData.item, types: exportCardData.types }} progress={exportCardData.progress} eventName={event.name} dexId={exportCardData.id} />}
      </div>
      
      <Lightbox isOpen={!!lightbox?.open} onClose={() => setLightbox(null)} src={lightbox?.src || ''} title={lightbox?.name} />
      
      <div className="sticky top-0 bg-[#0b0e14]/95 backdrop-blur-xl z-[40] py-4 border-b border-white/5 shadow-2xl mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={onBack} className="w-10 h-10 bg-[#151a25] hover:bg-white/10 text-slate-300 rounded-full flex items-center justify-center border border-white/10 transition"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-2xl font-black text-white font-rajdhani uppercase tracking-wide truncate max-w-[200px] md:max-w-none">{event.name}</h2>
            </div>
            <div className="flex-1 w-full md:max-w-xl mx-4 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Conclusão</span>
                    <span className={`text-sm font-black font-mono ${percentage === 100 ? 'text-yellow-400' : 'text-white'}`}>{percentage}%</span>
                </div>
                <div className="h-4 w-full bg-[#05060a] rounded-full overflow-hidden border border-slate-700/50 relative shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-700 ease-out progress-stripe ${progressColor}`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => captureAndDownload({ nodeId: 'catalog-infographic-capture', fileName: `checklist-${event.name.toLowerCase()}`, onStart: () => setExporting(true), onEnd: () => setExporting(false) })} disabled={exporting} className="btn-tech btn-tech-blue text-xs px-5 py-2.5 whitespace-nowrap">
                    {exporting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>} <span className="hidden sm:inline">Baixar Checklist</span>
                </button>
            </div>
          </div>
      </div>

      <div className="md:px-8 space-y-32 relative"> 
        {categories.map((cat, idx) => (
            <div key={idx} className="px-4 md:px-0">
                <div className="flex items-center gap-4 mb-12 border-b border-white/5 pb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-black/40 border border-white/10 ${cat.type === 'raid' ? 'text-red-500' : (cat.type === 'attack' ? 'text-purple-500' : 'text-blue-500')}`}>
                        {cat.type === 'raid' && <i className="fa-solid fa-dragon"></i>}
                        {cat.type === 'spawn' && <i className="fa-solid fa-leaf"></i>}
                        {cat.type === 'attack' && <i className="fa-solid fa-bolt"></i>}
                    </div>
                    <h3 className="text-4xl font-black text-white font-rajdhani uppercase tracking-[0.1em] drop-shadow-md">{cat.title}</h3>
                </div>
                
                <div className="
                    flex overflow-x-visible gap-6 pb-12 -mx-4 px-10
                    md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-x-10 md:gap-y-20 md:pb-0 md:mx-0 md:px-0
                    snap-x snap-mandatory scroll-smooth
                ">
                    {cat.items.map(item => {
                        const mergedP = progress[item.id] || {};
                        let isComplete = cat.type === 'attack' ? !!mergedP['move_obtained'] : (cat.type === 'raid' ? ['normal', 'shiny', 'hundo', 'shadow', 'purified'].every(k => mergedP[k]) : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'].every(k => mergedP[k]));
                        let isShundoComplete = isComplete && !!mergedP['shundo'];
                        return (
                            <div key={item.id} className="
                                flex-shrink-0 w-[80vw] max-w-[340px] 
                                md:w-full md:max-w-none 
                                snap-center h-full transition-all duration-300
                                overflow-visible
                            ">
                                <CatalogItem 
                                    item={item} 
                                    isComplete={isComplete} 
                                    isShundoComplete={isShundoComplete} 
                                    progressState={mergedP} 
                                    mergedProgress={mergedP} 
                                    toggleVariant={toggleVariant} 
                                    type={cat.type} 
                                    onExportCard={(item, progress, types, id) => setExportCardData({ item, progress, types, id })} 
                                    isLocked={false} 
                                />
                            </div>
                        );
                    })}
                    <div className="md:hidden flex-shrink-0 w-8"></div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;

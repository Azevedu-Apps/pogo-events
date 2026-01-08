import React, { useState, useEffect, memo } from 'react';
import { PogoEvent, CatalogProgress } from '../types';
import { fetchPokemon } from '../services/pokeapi';
import { getTypeIcon, getPokemonAsset, getBackgroundAsset } from '../services/assets';
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

// Componente Tooltip simples para o catálogo
const Tooltip = ({ text }: { text: string }) => (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 whitespace-nowrap pointer-events-none opacity-0 group-hover/tt:opacity-100 transition-opacity z-[100] shadow-xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
    </div>
);

const CatalogItem = memo(({ item, isComplete, isShundoComplete, progressState, toggleVariant, type, onExportCard, isLocked, mergedProgress }: {
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
    const [details, setDetails] = useState<{ id: number, types: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!item.name) return;
            setLoading(true);
            const data = await fetchPokemon(item.name);
            if (active && data) {
                setDetails({ id: data.id, types: data.types });

                let normal = (type === 'raid' || !images.normal || images.normal.includes('random')) ? data.image : images.normal;
                let shiny = data.shinyImage || normal;

                // Override logic for Forms and Costumes (Matches PokemonCard logic)
                const hasSpecificForm = (item.form && item.form !== '00');
                if ((item.costume || hasSpecificForm) && data.id) {
                    normal = getPokemonAsset(data.id, { costume: item.costume, form: item.form || '00' });
                    shiny = getPokemonAsset(data.id, { costume: item.costume, form: item.form || '00', shiny: true });
                }

                setImages({
                    normal: normal,
                    shiny: shiny
                });
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

    const isShadowRaid = type === 'raid' && item.tier && (item.tier.toLowerCase().includes('shadow') || item.tier.toLowerCase().includes('sombroso'));

    const variants = type === 'raid'
        ? (isShadowRaid ? ['normal', 'shiny', 'hundo', 'shadow', 'purified'] : ['normal', 'shiny', 'hundo', 'shundo'])
        : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];

    const dexNumberRaw = details?.id?.toString() || "";
    const dexNumberFormatted = details?.id ? `#${details.id.toString().padStart(3, '0')}` : '???';
    const displayImage = images.normal;

    let cardWrapperClass = "relative group rounded-3xl overflow-hidden transition-all duration-300 border flex flex-col items-center h-full ";
    if (isShundoComplete) cardWrapperClass += "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]";
    else if (isComplete) cardWrapperClass += "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
    else cardWrapperClass += "border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]";

    return (
        <div className={cardWrapperClass}>
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.07] pointer-events-none z-0"></div>

            {/* Feedback de Cópia */}
            {copyStatus && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] bg-blue-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl animate-bounce border border-blue-400">
                    {copyStatus} COPIADO!
                </div>
            )}

            {/* Background Overlay if exists */}
            {item.background && (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500 h-full w-full opacity-70 group-hover:opacity-100 group-hover:saturate-125"
                        style={{ backgroundImage: `url(${getBackgroundAsset(item.background)})` }}
                    ></div>
                    <div className="absolute inset-0 bg-black/30 z-0"></div>
                </>
            )}

            <div className={`bg-[#151a25] w-full h-full p-4 md:p-6 flex flex-col items-center relative z-10 ${item.background ? 'bg-opacity-70 backdrop-blur-sm' : ''}`}>
                {/* ID and Share */}
                <div className="w-full flex justify-between items-center mb-1 relative z-20">
                    <div className="relative group/tt">
                        <button
                            onClick={() => copyToClipboard(dexNumberRaw, 'NÚMERO')}
                            className="text-sm md:text-base font-black text-slate-500 font-mono tracking-widest bg-[#0b0e14] px-2 py-0.5 rounded border border-white/5 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                        >
                            {dexNumberFormatted}
                        </button>
                        <Tooltip text="Copiar ID" />
                    </div>

                    <div className="relative group/tt">
                        <button onClick={() => onExportCard({ ...item, image: images.normal }, mergedProgress, details?.types || [], details?.id || 0)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors border border-white/5">
                            <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                        <Tooltip text="Compartilhar Card" />
                    </div>
                </div>

                {/* Pokemon Sprite */}
                <div
                    className="relative flex-1 flex items-center justify-center mb-6 group/img cursor-pointer group/tt"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => copyToClipboard(item.name, 'NOME')}
                >
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${isComplete ? 'opacity-20 scale-110' : 'opacity-0 scale-50'}`}>
                        <i className={`fa-solid ${isShundoComplete ? 'fa-crown text-purple-500' : 'fa-check text-green-500'} text-7xl md:text-5xl`}></i>
                    </div>
                    <img src={displayImage} className="w-full max-h-48 md:max-h-36 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover/img:scale-105 z-10 will-change-transform" />
                    <Tooltip text="Copiar Nome" />


                </div>

                {/* Pokemon Info - Name and Types aligned horizontally */}
                <div className="flex items-center justify-center gap-3 z-10 flex-wrap w-full px-2">
                    <div class="flex flex-col items-center">
                        <div className="flex gap-1.5 h-7 md:h-5">
                            {details?.types.map(t => (
                                <div key={t} className="relative group/tt">
                                    <img src={getTypeIcon(t)} className="w-full h-full object-contain transition-transform hover:scale-110" alt={t} />
                                    <Tooltip text={`Tipo ${t}`} />
                                </div>
                            ))}
                        </div>

                        <h4
                            onClick={() => copyToClipboard(item.name, 'NOME')}
                            className={`font-black cursor-pointer uppercase font-rajdhani tracking-tighter leading-none ${isShundoComplete ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_100px_rgba(168,85,247,0.3)]' : 'text-white'} text-3xl md:text-xl lg:text-2xl hover:text-blue-400 transition-colors`}
                        >
                            {item.name}
                        </h4>
                    </div>

                    {type === 'attack' && item.move && (
                        <div className={`w-full mt-1 mb-3 flex items-center justify-center gap-2 px-3 py-1 rounded-lg border inline-block font-rajdhani uppercase tracking-widest text-center ${(() => {
                            switch ((item.moveType || 'normal').toLowerCase()) {
                                case 'fire': return 'bg-red-900/40 border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.3)]';
                                case 'water': return 'bg-blue-900/40 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.3)]';
                                case 'grass': return 'bg-green-900/40 border-green-500/50 text-green-100 shadow-[0_0_15px_rgba(22,163,74,0.3)]';
                                case 'electric': return 'bg-yellow-900/40 border-yellow-500/50 text-yellow-100 shadow-[0_0_15px_rgba(202,138,4,0.3)]';
                                case 'psychic': return 'bg-pink-900/40 border-pink-500/50 text-pink-100 shadow-[0_0_15px_rgba(219,39,119,0.3)]';
                                case 'ice': return 'bg-cyan-900/40 border-cyan-500/50 text-cyan-100 shadow-[0_0_15px_rgba(8,145,178,0.3)]';
                                case 'dragon': return 'bg-indigo-900/40 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(79,70,229,0.3)]';
                                case 'dark': return 'bg-slate-900/60 border-slate-500/50 text-slate-100 shadow-[0_0_15px_rgba(71,85,105,0.3)]';
                                case 'fairy': return 'bg-fuchsia-900/40 border-fuchsia-500/50 text-fuchsia-100 shadow-[0_0_15px_rgba(192,38,211,0.3)]';
                                case 'fighting': return 'bg-orange-900/40 border-orange-500/50 text-orange-100 shadow-[0_0_15px_rgba(234,88,12,0.3)]';
                                case 'flying': return 'bg-sky-900/40 border-sky-500/50 text-sky-100 shadow-[0_0_15px_rgba(14,165,233,0.3)]';
                                case 'poison': return 'bg-violet-900/40 border-violet-500/50 text-violet-100 shadow-[0_0_15px_rgba(124,58,237,0.3)]';
                                case 'ground': return 'bg-amber-900/40 border-amber-600/50 text-amber-100 shadow-[0_0_15px_rgba(217,119,6,0.3)]';
                                case 'rock': return 'bg-stone-700/40 border-stone-500/50 text-stone-100 shadow-[0_0_15px_rgba(120,113,108,0.3)]';
                                case 'bug': return 'bg-lime-900/40 border-lime-500/50 text-lime-100 shadow-[0_0_15px_rgba(101,163,13,0.3)]';
                                case 'ghost': return 'bg-indigo-900/60 border-indigo-400/50 text-indigo-100 shadow-[0_0_15px_rgba(129,140,248,0.3)]';
                                case 'steel': return 'bg-slate-700/40 border-slate-400/50 text-slate-100 shadow-[0_0_15px_rgba(148,163,184,0.3)]';
                                default: return 'bg-purple-900/30 border-purple-500/40 text-purple-300';
                            }
                        })()}`}>
                            <div className="relative group/tt flex items-center justify-center">
                                <img src={getTypeIcon(item.moveType || 'normal')} className="w-4 h-4 object-contain drop-shadow-md" />
                                <Tooltip text={`Tipo ${item.moveType || 'Normal'}`} />
                            </div>
                            <span className="text-xs font-black">{item.move}</span>
                        </div>
                    )}
                </div>

                {/* Progress Buttons */}
                <div className="w-full space-y-3 z-10 mt-auto">
                    <div className={`grid ${variants.length === 4 ? 'grid-cols-4' : 'grid-cols-5'} gap-2`}>
                        {variants.map(variant => {
                            const isActive = mergedProgress[variant];
                            let activeClass = "";
                            let content = null;
                            let tooltipLabel = "";
                            switch (variant) {
                                case 'normal': activeClass = "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"; content = <i className="fa-solid fa-check text-2xl md:text-base"></i>; tooltipLabel = "Capturado"; break;
                                case 'shiny': activeClass = "bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]"; content = <i className="fa-solid fa-star text-2xl md:text-base"></i>; tooltipLabel = "Brilhante"; break;
                                case 'hundo': activeClass = "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"; content = <span className="text-xl md:text-sm font-black">100</span>; tooltipLabel = "100% IV"; break;
                                case 'xxl': activeClass = "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"; content = <span className="text-xl md:text-sm font-black">XL</span>; tooltipLabel = "Tamanho XXL"; break;
                                case 'xxs': activeClass = "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"; content = <span className="text-xl md:text-sm font-black">XS</span>; tooltipLabel = "Tamanho XXS"; break;
                                case 'shadow': activeClass = "bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"; content = <i className="fa-solid fa-fire-flame-curved text-2xl md:text-base"></i>; tooltipLabel = "Sombroso"; break;
                                case 'purified': activeClass = "bg-slate-100 text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.5)]"; content = <i className="fa-solid fa-bahai text-2xl md:text-base"></i>; tooltipLabel = "Purificado"; break;
                                case 'shundo': activeClass = "bg-gradient-to-r from-yellow-500 via-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"; content = <i className="fa-solid fa-crown text-2xl md:text-base"></i>; tooltipLabel = "Shundo"; break;
                            }
                            return (
                                <div key={variant} className="relative group/tt">
                                    <button
                                        onClick={() => toggleVariant(item.id, variant, item.name)}
                                        className={`w-full h-16 md:h-10 rounded-2xl md:rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? activeClass : "bg-[#0b0e14] text-slate-700 hover:bg-slate-800"} active:scale-95 border-0`}
                                    >
                                        {content}
                                    </button>
                                    <Tooltip text={tooltipLabel} />
                                </div>
                            );
                        })}
                    </div>

                    {!variants.includes('shundo') && (
                        <div className="relative group/tt">
                            <button
                                onClick={() => toggleVariant(item.id, 'shundo', item.name)}
                                className={`w-full py-5 md:py-3 rounded-2xl md:rounded-xl text-base md:text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 font-rajdhani border-0 ${mergedProgress['shundo'] ? 'bg-gradient-to-r from-yellow-500 via-purple-600 to-pink-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] animate-pulse' : 'bg-[#0b0e14] text-slate-700 hover:bg-slate-800'}`}
                            >
                                <i className="fa-solid fa-crown text-lg md:text-sm"></i> SHUNDO
                            </button>
                            <Tooltip text="Meta Final: 100% Shiny" />
                        </div>
                    )}
                </div>
            </div>
        </div >
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

    useEffect(() => {
        if (exportCardData) {
            setTimeout(() => {
                captureAndDownload({
                    nodeId: 'social-card-capture',
                    fileName: `${exportCardData.item.name.toLowerCase().replace(/\s+/g, '-')}-card`,
                    onEnd: () => setExportCardData(null)
                });
            }, 500);
        }
    }, [exportCardData]);

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

    const categories: { title: string, type: 'spawn' | 'raid' | 'attack', items: any[] }[] = [];
    event.spawnCategories.forEach(cat => {
        categories.push({
            title: cat.name,
            type: 'spawn',
            items: cat.spawns.map(s => {
                const idParts = [
                    cat.name.toLowerCase().replace(/\s+/g, ''),
                    s.name.toLowerCase().replace(/\s+/g, '-')
                ];
                if (s.form && s.form !== '00') idParts.push(`f-${s.form.toLowerCase().replace(/\s+/g, '-')}`);
                if (s.costume) idParts.push(`c-${s.costume.toLowerCase().replace(/\s+/g, '-')}`);

                return {
                    id: idParts.join('-'),
                    name: s.name,
                    image: s.image,
                    form: s.form,
                    costume: s.costume,
                    background: s.background
                };
            })
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
                image: r.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${Math.floor(Math.random() * 900) + 1}.png`,
                tier: r.tier,
                form: r.form,
                costume: r.costume,
                background: r.background
            }))
        });
    }

    let currentScore = 0;
    let maxScore = 0;
    categories.forEach(cat => {
        cat.items.forEach(item => {
            const p = progress[item.id] || {};
            let variantsToCheck = ['normal', 'shiny', 'hundo', 'xxl', 'xxs'];

            if (cat.type === 'raid') {
                const isShadow = item.tier && (item.tier.toLowerCase().includes('shadow') || item.tier.toLowerCase().includes('sombroso'));
                variantsToCheck = isShadow
                    ? ['normal', 'shiny', 'hundo', 'shadow', 'purified']
                    : ['normal', 'shiny', 'hundo', 'shundo'];
            } else if (cat.type === 'attack') {
                variantsToCheck = ['move_obtained'];
            }

            variantsToCheck.forEach(v => {
                const weight = PROGRESS_WEIGHTS[v] || 1;
                maxScore += weight;
                if (p[v as keyof typeof p]) currentScore += weight;
            });
        });
    });

    const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;
    let progressColor = "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]";

    return (
        <div className="pb-20 animate-fade-in relative">
            <div className="fixed top-0 left-[-9999px] pointer-events-none">
                <CatalogInfographic event={event} progress={progress} categories={categories} id="catalog-infographic-capture" />
                {exportCardData && <PokemonSocialCard id="social-card-capture" pokemon={{ ...exportCardData.item, types: exportCardData.types }} progress={exportCardData.progress} eventName={event.name} dexId={exportCardData.id} />}
            </div>

            <Lightbox isOpen={!!lightbox?.open} onClose={() => setLightbox(null)} src={lightbox?.src || ''} title={lightbox?.name} />

            <div className="sticky top-0 bg-[#0b0e14]/95 backdrop-blur-xl z-30 py-4 border-b border-white/5 shadow-2xl mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={onBack} className="w-10 h-10 bg-[#151a25] hover:bg-white/10 text-slate-300 rounded-full flex items-center justify-center border border-white/10 transition"><i className="fa-solid fa-arrow-left"></i></button>
                        <h2 className="text-xl font-black text-white font-rajdhani uppercase tracking-wide truncate max-w-[200px] md:max-w-none">{event.name}</h2>
                    </div>
                    <div className="flex-1 w-full md:max-w-xl mx-4 flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Conclusão</span>
                            <span className={`text-sm font-black font-mono ${percentage === 100 ? 'text-yellow-400' : 'text-white'}`}>{percentage}%</span>
                        </div>
                        <div className="h-4 w-full bg-[#05060a] rounded-full overflow-hidden border border-slate-700/50 relative shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-700 ease-out animate-progress-flow ${progressColor}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">

                    </div>
                </div>
            </div>

            <div className="md:px-8 space-y-16">
                {categories.map((cat, idx) => (
                    <div key={idx} className="px-4 md:px-0">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-black/40 border border-white/10 ${cat.type === 'raid' ? 'text-red-500' : (cat.type === 'attack' ? 'text-purple-500' : 'text-blue-500')}`}>
                                {cat.type === 'raid' && <i className="fa-solid fa-dragon"></i>}
                                {cat.type === 'spawn' && <i className="fa-solid fa-leaf"></i>}
                                {cat.type === 'attack' && <i className="fa-solid fa-bolt"></i>}
                            </div>
                            <h3 className="text-3xl font-black text-white font-rajdhani uppercase tracking-[0.1em] drop-shadow-md">{cat.title}</h3>
                        </div>

                        <div className="
                    flex overflow-x-auto gap-4 pb-12 -mx-4 px-10
                    md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 md:pb-0 md:mx-0 md:px-0
                    scrollbar-hide snap-x snap-mandatory scroll-smooth
                ">
                            {cat.items.map(item => {
                                const mergedP = progress[item.id] || {};
                                let isComplete = cat.type === 'raid' ? ['normal', 'shiny', 'hundo', 'shadow', 'purified'].every(k => mergedP[k]) : ['normal', 'shiny', 'hundo', 'xxl', 'xxs'].every(k => mergedP[k]);
                                let isShundoComplete = !!mergedP['shundo'];
                                return (
                                    <div key={item.id} className="
                                flex-shrink-0 w-[75vw] max-w-[320px] 
                                md:w-full md:max-w-none 
                                snap-center h-full transition-all duration-300
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

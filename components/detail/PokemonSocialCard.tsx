
import React from 'react';
import { typeColors } from '../../utils/visuals';
import { getTypeIcon } from '../../services/assets';

interface PokemonSocialCardProps {
    id: string;
    pokemon: {
        name: string;
        image: string;
        types?: string[];
    };
    progress: {
        normal?: boolean;
        shiny?: boolean;
        hundo?: boolean;
        xxl?: boolean;
        xxs?: boolean;
        shundo?: boolean;
        shadow?: boolean;
        purified?: boolean;
    };
    eventName: string;
    dexId: number;
}

// Map Tailwind colors to specific hex for better gradient control in export
const typeColorMap: Record<string, { main: string, dark: string }> = {
    normal: { main: '#94a3b8', dark: '#475569' },
    fire: { main: '#ef4444', dark: '#991b1b' },
    water: { main: '#3b82f6', dark: '#1e40af' },
    grass: { main: '#22c55e', dark: '#14532d' },
    electric: { main: '#eab308', dark: '#854d0e' },
    ice: { main: '#67e8f9', dark: '#0e7490' },
    fighting: { main: '#f97316', dark: '#9a3412' },
    poison: { main: '#a855f7', dark: '#6b21a8' },
    ground: { main: '#d97706', dark: '#78350f' },
    flying: { main: '#818cf8', dark: '#4338ca' },
    psychic: { main: '#ec4899', dark: '#9d174d' },
    bug: { main: '#84cc16', dark: '#3f6212' },
    rock: { main: '#a16207', dark: '#451a03' },
    ghost: { main: '#6366f1', dark: '#3730a3' },
    dragon: { main: '#4f46e5', dark: '#312e81' },
    steel: { main: '#94a3b8', dark: '#475569' },
    dark: { main: '#1e293b', dark: '#020617' },
    fairy: { main: '#f472b6', dark: '#be185d' },
};

export const PokemonSocialCard: React.FC<PokemonSocialCardProps> = ({ id, pokemon, progress, eventName, dexId }) => {
    // 1. Determine Visual Theme
    const mainType = pokemon.types?.[0]?.toLowerCase() || 'normal';
    const typeTheme = typeColorMap[mainType] || typeColorMap.normal;
    const isShundo = progress.shundo;
    
    // Calculate Score
    // Weights: Normal (5), XXS/XXL (10), 100% (20), Shiny (30)
    let score = 0;
    const maxScore = 75; // 5 + 10 + 10 + 20 + 30
    
    if (progress.normal) score += 5;
    if (progress.xxs) score += 10;
    if (progress.xxl) score += 10;
    if (progress.hundo) score += 20;
    if (progress.shiny) score += 30;

    const percentage = Math.min(100, Math.round((score / maxScore) * 100));
    const isMastered = percentage === 100; // All variants except Shundo caught
    
    // Background Logic
    let bgStyle: React.CSSProperties = {
        background: `linear-gradient(135deg, ${typeTheme.main} 0%, ${typeTheme.dark} 100%)`
    };
    
    let borderClass = 'border-slate-700';
    let overlayClass = '';

    if (isShundo) {
        bgStyle = {
            background: `linear-gradient(135deg, #facc15 0%, #a855f7 50%, #ec4899 100%)`
        };
        borderClass = 'border-yellow-400';
        overlayClass = 'bg-[url("https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png")] opacity-20';
    } else if (isMastered) {
        borderClass = 'border-yellow-500'; // Gold border for 100% completion
    }

    const dexNum = `#${dexId.toString().padStart(3, '0')}`;

    return (
        <div id={id} className="w-[600px] h-[900px] flex items-center justify-center bg-slate-900 font-sans p-12">
            
            {/* CARD CONTAINER */}
            <div 
                className={`
                    relative w-full h-full rounded-[48px] overflow-hidden flex flex-col shadow-2xl border-[12px]
                    ${borderClass}
                `}
                style={bgStyle}
            >
                {/* Texture Overlay */}
                <div className={`absolute inset-0 ${overlayClass}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                {/* --- HEADER --- */}
                <div className="relative z-10 px-8 pt-10 flex justify-between items-start">
                    <div>
                        <div className="text-white/60 font-black text-3xl tracking-tighter mb-1">{dexNum}</div>
                        <h1 className="text-white font-black text-5xl uppercase tracking-tight leading-none drop-shadow-md">
                            {pokemon.name}
                        </h1>
                    </div>
                    {/* Event Tag */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-right">
                        <span className="text-white/80 text-xs font-bold uppercase block">Evento</span>
                        <span className="text-white font-bold text-sm leading-tight max-w-[150px] block truncate">{eventName}</span>
                    </div>
                </div>

                {/* --- MAIN VISUAL --- */}
                <div className="relative flex-1 flex items-center justify-center">
                    {/* Circle Backdrop */}
                    <div className="absolute w-[420px] h-[420px] rounded-full bg-black/30 backdrop-blur-sm border border-white/10 shadow-inner"></div>
                    
                    {/* Glow behind pokemon */}
                    <div className={`absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-60 ${isShundo ? 'bg-white' : 'bg-white/40'}`}></div>

                    {/* Pokemon Image */}
                    <img 
                        src={pokemon.image} 
                        className="relative z-20 w-[380px] h-[380px] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)]"
                    />

                    {/* SHUNDO Special Badge */}
                    {isShundo && (
                        <div className="absolute top-10 right-10 z-30">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] border-2 border-white -rotate-12 animate-pulse">
                                SHUNDO
                            </div>
                        </div>
                    )}
                </div>

                {/* --- STATS & PROGRESS --- */}
                <div className="relative z-10 bg-slate-900/90 backdrop-blur-md m-6 rounded-3xl p-6 border border-white/10 shadow-xl">
                    
                    {/* Badges Row */}
                    <div className="flex justify-between gap-2 mb-6">
                         <Badge label="Normal" caught={progress.normal} color="bg-slate-500" icon="fa-circle" />
                         <Badge label="Tiny XS" caught={progress.xxs} color="bg-cyan-500" text="XXS" />
                         <Badge label="Huge XL" caught={progress.xxl} color="bg-blue-600" text="XXL" />
                         <Badge label="100% IV" caught={progress.hundo} color="bg-pink-500" text="100" />
                         <Badge label="Shiny" caught={progress.shiny} color="bg-yellow-500" icon="fa-star" />
                    </div>

                    {/* Progress Bar Area */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                <span>Progresso de Coleção</span>
                                <span>{percentage}%</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                                <div 
                                    className={`h-full transition-all duration-1000 ${isShundo ? 'bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500' : 'bg-green-500'}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        {/* Type Icons */}
                        <div className="flex gap-1">
                             {pokemon.types?.map(t => (
                                 <div key={t} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-lg">
                                     <img src={getTypeIcon(t)} className="w-6 h-6 object-contain" />
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* --- SEAL OF COMPLETION --- */}
                {isMastered && !isShundo && (
                    <div className="absolute bottom-32 right-8 z-40 rotate-[-15deg] opacity-90">
                        <div className="w-28 h-28 rounded-full border-4 border-yellow-500 flex items-center justify-center bg-yellow-900/80 backdrop-blur text-yellow-500 font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.4)] text-center leading-none p-2">
                            <div className="border border-yellow-500/50 rounded-full w-full h-full flex items-center justify-center">
                                MASTER<br/>COLLECTION
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Badge = ({ label, caught, color, icon, text }: any) => {
    // If caught, full color. If not, dark grey.
    const bgClass = caught ? color : 'bg-slate-800 border-slate-700 opacity-40 grayscale';
    
    return (
        <div className="flex flex-col items-center flex-1">
            <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-2 border transition-all
                ${bgClass} ${caught ? 'border-white/20' : ''}
            `}>
                {icon && <i className={`fa-solid ${icon} text-lg drop-shadow-md`}></i>}
                {text && <span className="font-black text-sm drop-shadow-md">{text}</span>}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${caught ? 'text-white' : 'text-slate-600'}`}>{label}</span>
        </div>
    );
}

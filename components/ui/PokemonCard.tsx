
import React, { useState, useEffect } from 'react';
import { fetchPokemon } from '../../services/pokeapi';
import { getTypeIcon, getPokemonAsset, getBackgroundAsset } from '../../services/assets';

interface PokemonCardProps {
    name: string;
    image: string;
    shiny?: boolean;
    tier?: string; // "1", "3", "5", "Mega", "Shadow", "Max-1", "Gigamax"
    form?: string; // Subtítulo (ex: "Costume", "Alola")
    costume?: string; // New costume ID (e.g. "06", "51")
    background?: string; // New: Location/Special background filename
    onDelete?: () => void;
    onImageClick?: (src: string) => void;
    className?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ name, image, shiny, tier, form, costume, background, onDelete, onImageClick, className }) => {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            const data = await fetchPokemon(name);
            if (active && data) {
                setDetails(data);
            }
            if (active) setLoading(false);
        };
        load();
        return () => { active = false; };
    }, [name]);

    // Determine colors based on context (Tier or Type)
    const isMaxBattle = tier?.includes('Max') || tier === 'Gigamax' || tier === 'Dinamax';
    const isRaid = tier && !isMaxBattle;

    let accentColor = "text-slate-400";
    let borderClass = "border-slate-700 hover:border-slate-500";
    let glowClass = "group-hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]";
    let bgGradient = "from-slate-800/50 to-transparent";
    let barColor = "bg-slate-600";

    if (isMaxBattle) {
        accentColor = "text-fuchsia-400";
        borderClass = "border-fuchsia-500/30 hover:border-fuchsia-400";
        glowClass = "group-hover:shadow-[0_0_20px_rgba(232,121,249,0.3)]";
        bgGradient = "from-fuchsia-900/20 to-transparent";
        barColor = "bg-fuchsia-500";
    } else if (isRaid) {
        accentColor = "text-red-400";
        borderClass = "border-red-500/30 hover:border-red-400";
        glowClass = "group-hover:shadow-[0_0_20px_rgba(248,113,113,0.3)]";
        bgGradient = "from-red-900/20 to-transparent";
        barColor = "bg-red-500";
    } else if (details?.types?.[0]) {
        const t = details.types[0].toLowerCase();
        // Tech-y mapping
        if (['fire', 'fighting', 'dragon'].includes(t)) { accentColor = "text-orange-400"; borderClass = "hover:border-orange-500/50 border-slate-700"; barColor = "bg-orange-500"; }
        else if (['water', 'ice', 'flying'].includes(t)) { accentColor = "text-blue-400"; borderClass = "hover:border-blue-500/50 border-slate-700"; barColor = "bg-blue-500"; }
        else if (['grass', 'bug'].includes(t)) { accentColor = "text-emerald-400"; borderClass = "hover:border-emerald-500/50 border-slate-700"; barColor = "bg-emerald-500"; }
        else if (['electric', 'ground', 'rock'].includes(t)) { accentColor = "text-yellow-400"; borderClass = "hover:border-yellow-500/50 border-slate-700"; barColor = "bg-yellow-500"; }
        else if (['psychic', 'poison', 'ghost', 'fairy'].includes(t)) { accentColor = "text-purple-400"; borderClass = "hover:border-purple-500/50 border-slate-700"; barColor = "bg-purple-500"; }
        else if (['dark', 'steel'].includes(t)) { accentColor = "text-slate-400"; borderClass = "hover:border-slate-400/50 border-slate-700"; barColor = "bg-slate-500"; }
    }

    // Calculate Display Image
    // Calculate Display Image
    let displayImage = details?.image || image;

    // Override with PokeMiners asset if we have specific Form/Costume data
    const hasSpecificForm = (form && form !== '00');
    if ((costume || hasSpecificForm) && details?.id) {
        displayImage = getPokemonAsset(details.id, {
            costume: costume,
            shiny: shiny,
            form: form || '00'
        });
    }

    if (loading) {
        return (
            <div className={`aspect-[3/4] bg-[#151a25] rounded-xl border border-white/5 relative overflow-hidden ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            </div>
        );
    }

    return (
        <div
            className={`
            group relative aspect-[3/4] bg-[#151a25] rounded-xl border ${borderClass} 
            overflow-hidden transition-all duration-300 ${glowClass}
            flex flex-col select-none hover:-translate-y-1
            ${className || ''}
        `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Tech Background Overlay */}
            <div className="absolute inset-0 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] opacity-[0.03] pointer-events-none"></div>

            {/* Custom Location/Special Background */}
            {background ? (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500 opacity-70 group-hover:opacity-100 group-hover:saturate-125"
                        style={{ backgroundImage: `url(${getBackgroundAsset(background)})` }}
                    ></div>
                    <div className="absolute inset-0 bg-black/40"></div>
                </>
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} opacity-60`}></div>
            )}

            {/* Top Bar: Tier or Tech Indicator */}
            <div className="relative z-10 flex justify-between items-start p-3 h-10 flex-shrink-0">
                {tier ? (
                    <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${barColor} animate-pulse`}></div>
                        <span className={`text-xs font-black uppercase tracking-widest leading-none ${accentColor}`}>
                            {tier.replace('Max-', 'Max ')}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 opacity-40">
                        <div className={`h-1 w-4 rounded-full ${barColor}`}></div>
                        <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                    </div>
                )}

                {/* Icons */}
                <div className="flex gap-2">
                    {shiny && !onDelete && (
                        <i className="fa-solid fa-star text-xs text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse"></i>
                    )}
                    {onDelete && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-slate-500 hover:text-red-500 transition hover:bg-white/10 rounded p-1 -mt-1">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Image - flex-1 allows it to shrink/grow, filling available space */}
            <div className="flex-1 relative flex items-center justify-center p-2 z-10 min-h-0">
                {/* Hover Glow Behind Image */}
                <div className={`absolute w-24 h-24 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <img
                    src={displayImage}
                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1 will-change-transform"
                    onError={(e) => {
                        if (e.currentTarget.src !== image) e.currentTarget.src = image;
                        else e.currentTarget.style.display = 'none';
                    }}
                />
            </div>

            {/* Footer Data Plate - flex-shrink-0 prevents it from being crushed */}
            <div className="relative z-20 bg-[#0b0e14] border-t border-white/5 px-2 pt-3 pb-4 flex flex-col items-center gap-1.5 flex-shrink-0">
                {/* Tech Corner Accents on Footer */}
                <div className={`absolute top-0 left-0 h-[1px] w-6 ${barColor}`}></div>
                <div className={`absolute top-0 right-0 h-[1px] w-6 ${barColor}`}></div>

                <h3 className="text-white font-rajdhani font-bold uppercase tracking-wider text-xs md:text-sm text-center leading-tight line-clamp-2 w-full px-1 min-h-[1.2em]">
                    {name}
                </h3>

                <div className="flex items-center justify-center gap-1.5 w-full">
                    {form ? (
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-mono bg-[#151a25] px-2 py-0.5 rounded border border-white/5 truncate max-w-[95%]">
                            {form}
                        </span>
                    ) : (
                        // Type Icons
                        details?.types?.map((t: string) => (
                            <div key={t} className="w-5 h-5 bg-[#151a25] rounded-full flex items-center justify-center border border-white/10 flex-shrink-0" title={t}>
                                <img src={getTypeIcon(t)} className="w-3 h-3" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

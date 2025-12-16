
import React from 'react';
import { EggGroup } from '../../types';
import { getEggSvg } from '../../utils/visuals';

const EggCardIncubator: React.FC<{ pokemon: any, eggSvg: string, glowColor: string, accentColor: string }> = ({ pokemon, eggSvg, glowColor, accentColor }) => {
    return (
        <div className={`relative w-40 h-56 rounded-xl bg-[#151a25] border border-white/5 flex flex-col items-center overflow-hidden transition-all duration-300 hover:-translate-y-2 group shadow-lg ${glowColor}`}>
             
             {/* Tech Header */}
             <div className="w-full h-1 bg-[#0b0e14] flex justify-center overflow-visible z-20">
                 <div className={`w-16 h-1 ${accentColor} shadow-[0_0_10px_currentColor]`}></div>
             </div>

             {/* Background Tech Ring */}
             <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                 <div className={`w-32 h-32 rounded-full border-2 border-dashed ${accentColor} animate-spin-slow`}></div>
             </div>

             {/* Egg Watermark (Faded) */}
             <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10 pointer-events-none" dangerouslySetInnerHTML={{__html: eggSvg}}></div>

             {/* Pokemon Name Badge (Floating) - Flexible Size */}
             <div className="mt-5 z-20 px-2 w-full flex justify-center">
                 <div className="bg-[#0b0e14]/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded text-xs font-bold text-slate-200 uppercase tracking-widest shadow-lg text-center font-rajdhani leading-none whitespace-normal line-clamp-2">
                     {pokemon.name}
                 </div>
             </div>

             {/* Image */}
             <div className="flex-1 flex items-center justify-center w-full z-20 relative p-4">
                 {/* Glow behind image */}
                 <div className={`absolute w-20 h-20 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors`}></div>
                 
                 <img src={pokemon.image} className="w-28 h-28 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110" />
                 
                 {pokemon.shiny && (
                     <div className="absolute top-2 right-2 animate-pulse">
                         <i className="fa-solid fa-star text-yellow-400 text-[10px] drop-shadow-md"></i>
                     </div>
                 )}
             </div>

             {/* Footer Info */}
             <div className="w-full bg-[#0b0e14] py-2 px-3 flex flex-col items-center border-t border-white/5 z-20 flex-shrink-0">
                 {pokemon.form ? (
                     <span className="text-[9px] text-slate-400 font-mono leading-none truncate max-w-full uppercase tracking-wider">{pokemon.form}</span>
                 ) : (
                     <div className="flex gap-1 opacity-30">
                         <div className="w-1 h-1 rounded-full bg-white"></div>
                         <div className="w-1 h-1 rounded-full bg-white"></div>
                         <div className="w-1 h-1 rounded-full bg-white"></div>
                     </div>
                 )}
             </div>
        </div>
    );
};

export const EggDetailDisplay: React.FC<{ groups: EggGroup[], title?: string, desc?: string, hideTitle?: boolean }> = ({ groups, title, desc, hideTitle }) => {
    const sortOrder: Record<string, number> = { "2 km": 1, "5 km": 2, "7 km": 3, "10 km": 4, "12 km": 5 };
    const sortedEggs = [...groups].sort((a, b) => (sortOrder[a.distance] || 99) - (sortOrder[b.distance] || 99));

    return (
        <section className="w-full">
            {!hideTitle && (
                <>
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                        <i className="fa-solid fa-egg"></i> {title || 'Ovos e Eclosões'}
                    </h3>
                    {desc && <p className="text-slate-300 text-sm mb-6 bg-slate-900/30 p-4 rounded-xl border border-emerald-900/30">{desc}</p>}
                </>
            )}
            
            <div className="flex flex-col gap-16 items-center">
                {sortedEggs.map(group => {
                    let color = '#22c55e'; // 2km green
                    let glowColor = 'hover:shadow-green-500/20 hover:border-green-500/50';
                    let accentColor = 'bg-green-500';
                    let textColor = 'text-green-400';
          
                    if (group.distance.includes('5')) { color = '#f97316'; glowColor = 'hover:shadow-orange-500/20 hover:border-orange-500/50'; accentColor = 'bg-orange-500'; textColor = 'text-orange-400'; }
                    if (group.distance.includes('7')) { color = '#eab308'; glowColor = 'hover:shadow-yellow-500/20 hover:border-yellow-500/50'; accentColor = 'bg-yellow-500'; textColor = 'text-yellow-400'; }
                    if (group.distance.includes('10')) { color = '#a855f7'; glowColor = 'hover:shadow-purple-500/20 hover:border-purple-500/50'; accentColor = 'bg-purple-500'; textColor = 'text-purple-400'; }
                    if (group.distance.includes('12')) { color = '#ef4444'; glowColor = 'hover:shadow-red-500/20 hover:border-red-500/50'; accentColor = 'bg-red-500'; textColor = 'text-red-400'; }
                    
                    const eggSvg = getEggSvg(color);

                    return (
                        <div key={group.distance} className="w-full max-w-6xl">
                            <div className="flex flex-col items-center mb-10 relative">
                                <div className={`px-8 py-2 rounded-lg border border-white/10 bg-[#151a25] ${textColor} font-black font-rajdhani uppercase tracking-[0.2em] text-xl z-10 flex items-center gap-4 shadow-xl`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${accentColor}`}></div>
                                    Ovos de {group.distance}
                                    <div className={`w-1.5 h-1.5 rounded-full ${accentColor}`}></div>
                                </div>
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-6">
                                {group.spawns.map((p, i) => (
                                    <EggCardIncubator key={i} pokemon={p} eggSvg={eggSvg} glowColor={glowColor} accentColor={accentColor} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

import React from 'react';
import { EggGroup } from '../../types';
import { getEggSvg } from '../../utils/visuals';

const EggCardIncubator: React.FC<{ pokemon: any, eggSvg: string, glowColor: string }> = ({ pokemon, eggSvg, glowColor }) => {
    return (
        <div className={`egg-card-v2 group relative w-36 h-48 bg-slate-800 rounded-[2rem] border-2 border-slate-700 shadow-lg ${glowColor} flex flex-col items-center justify-between p-4 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer`}>
             <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
             
             <div className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10 border border-slate-700 w-full text-center truncate">
                 {pokemon.name}
             </div>

             <div className="relative flex-1 w-full flex items-center justify-center z-10">
                 <img src={pokemon.image} className="egg-card-v2-normal w-24 h-24 object-contain drop-shadow-2xl transition-opacity duration-300 absolute" />
                 {pokemon.shiny && <img src={pokemon.shinyImage || pokemon.image} className="egg-card-v2-shiny w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(253,224,71,0.6)] opacity-0 transition-opacity duration-300 absolute" />}
             </div>

             <div className="z-10 flex flex-col items-center w-full">
                 {pokemon.shiny ? <i className="fa-solid fa-star text-[10px] text-yellow-500 mb-1 animate-pulse"></i> : <div className="h-3"></div>}
                 {pokemon.form && <div className="text-[9px] text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded text-center leading-tight w-full truncate">{pokemon.form}</div>}
             </div>
             
             {/* Egg Watermark */}
             <div className="absolute -bottom-8 -right-8 opacity-20 rotate-12 pointer-events-none w-32 h-32" dangerouslySetInnerHTML={{__html: eggSvg}}></div>
        </div>
    );
};

export const EggDetailDisplay: React.FC<{ groups: EggGroup[], title?: string, desc?: string }> = ({ groups, title, desc }) => {
    const sortOrder: Record<string, number> = { "2 km": 1, "5 km": 2, "7 km": 3, "10 km": 4, "12 km": 5 };
    const sortedEggs = [...groups].sort((a, b) => (sortOrder[a.distance] || 99) - (sortOrder[b.distance] || 99));

    return (
        <section className="mb-10">
            <h3 className="text-xl font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-egg"></i> {title || 'Ovos e Eclosões'}
            </h3>
            {desc && <p className="text-slate-300 text-sm mb-6 bg-slate-900/30 p-4 rounded-xl border border-emerald-900/30">{desc}</p>}
            
            <div className="flex flex-col gap-12">
                {sortedEggs.map(group => {
                    let color = '#22c55e'; // 2km green
                    let glowColor = 'shadow-green-500/20';
          
                    if (group.distance.includes('5')) { color = '#f97316'; glowColor = 'shadow-orange-500/20'; }
                    if (group.distance.includes('7')) { color = '#eab308'; glowColor = 'shadow-yellow-500/20'; }
                    if (group.distance.includes('10')) { color = '#a855f7'; glowColor = 'shadow-purple-500/20'; }
                    if (group.distance.includes('12')) { color = '#ef4444'; glowColor = 'shadow-red-500/20'; }
                    
                    const eggSvg = getEggSvg(color);

                    return (
                        <div key={group.distance} className="w-full">
                            <div className="flex items-center gap-3 mb-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700 w-fit mx-auto">
                                <div className="w-8 h-10 drop-shadow-md" dangerouslySetInnerHTML={{__html: eggSvg}}></div>
                                <span className="font-black text-xl text-white">Ovos de {group.distance}</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6">
                                {group.spawns.map((p, i) => (
                                    <EggCardIncubator key={i} pokemon={p} eggSvg={eggSvg} glowColor={glowColor} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

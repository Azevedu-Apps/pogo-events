
import React from 'react';
import { PogoEvent, CatalogProgress } from '../../types';
import { getTypeIcon } from '../../services/assets';

interface CatalogInfographicProps {
    event: PogoEvent;
    progress: CatalogProgress;
    categories: { title: string, type: 'spawn'|'raid'|'attack', items: any[] }[];
    id: string;
}

export const CatalogInfographic: React.FC<CatalogInfographicProps> = ({ event, progress, categories, id }) => {
    // Calculate total stats
    let total = 0;
    let caught = 0;
    let shiny = 0;
    let hundo = 0;

    categories.forEach(cat => {
        cat.items.forEach(item => {
            total++;
            const p = progress[item.id] || {};
            if (p.normal || p.move_obtained) caught++;
            if (p.shiny) shiny++;
            if (p.hundo) hundo++;
        });
    });

    const percent = total > 0 ? Math.round((caught / total) * 100) : 0;

    return (
        <div id={id} className="w-[1080px] min-h-[1350px] bg-slate-900 text-white font-sans relative flex flex-col">
            <div className="absolute inset-0 opacity-10 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')]"></div>
            
            {/* HEADER */}
            <div className="relative z-10 bg-gradient-to-r from-blue-900 to-slate-900 p-8 border-b-4 border-blue-500 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest mb-2">Checklist de Evento</h2>
                    <h1 className="text-5xl font-black text-white drop-shadow-lg leading-tight">{event.name}</h1>
                </div>
                <div className="flex gap-6">
                    <div className="text-center">
                        <div className="text-4xl font-black text-green-400">{percent}%</div>
                        <div className="text-xs uppercase font-bold text-slate-400">Progresso</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-yellow-400">{shiny}</div>
                        <div className="text-xs uppercase font-bold text-slate-400">Shinies</div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="relative z-10 p-8 flex-1 space-y-8 bg-slate-900/95">
                {categories.map((cat, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-3xl p-6 border border-white/5 break-inside-avoid">
                        <h3 className={`text-2xl font-bold border-b border-white/10 pb-2 mb-4 uppercase flex items-center gap-3 ${cat.type === 'raid' ? 'text-red-400' : (cat.type === 'attack' ? 'text-purple-400' : 'text-blue-400')}`}>
                            {cat.type === 'raid' && <i className="fa-solid fa-dragon"></i>}
                            {cat.type === 'spawn' && <i className="fa-solid fa-leaf"></i>}
                            {cat.type === 'attack' && <i className="fa-solid fa-bolt"></i>}
                            {cat.title}
                        </h3>

                        <div className="grid grid-cols-6 gap-4">
                            {cat.items.map((item) => {
                                const p = progress[item.id] || {};
                                const isCaught = p.normal || p.move_obtained;
                                const isShiny = p.shiny;
                                const isHundo = p.hundo;

                                return (
                                    <div key={item.id} className={`
                                        relative rounded-xl p-2 flex flex-col items-center border-2 transition-colors
                                        ${isCaught ? 'bg-slate-700/80 border-green-500/50' : 'bg-slate-800 border-slate-700'}
                                    `}>
                                        {/* Status Icons */}
                                        <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20">
                                            {isShiny && <i className="fa-solid fa-star text-yellow-400 text-xs drop-shadow-md"></i>}
                                            {isHundo && <span className="text-[8px] font-black text-pink-400 bg-pink-900/50 px-1 rounded">100</span>}
                                        </div>

                                        <div className="w-20 h-20 mb-1 relative">
                                            <img src={item.image} className={`w-full h-full object-contain ${!isCaught ? 'opacity-50 grayscale' : ''}`} />
                                            {isCaught && <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] border-2 border-slate-800"><i className="fa-solid fa-check"></i></div>}
                                        </div>
                                        
                                        <div className="text-center w-full">
                                            <div className="text-[10px] font-bold text-white truncate w-full">{item.name}</div>
                                            {item.move && <div className="text-[8px] text-purple-300 truncate w-full">{item.move}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="p-6 bg-black/60 flex justify-between items-center backdrop-blur-md border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl shadow-lg">
                        <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <span className="text-2xl font-bold tracking-wide">Pogo<span className="text-blue-500">Events</span></span>
                </div>
                <div className="text-right text-slate-400 text-sm">
                    Gerado via PogoEvents App
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { PogoEvent } from '../../types';
import { typeColors } from '../../utils/visuals';

// Helper to get day/month
const getDateParts = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const time = d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { day, month, time };
};

export const EventInfographic: React.FC<{ event: PogoEvent, id: string, inlineStyles?: string }> = ({ event, id, inlineStyles }) => {
    const start = getDateParts(event.start);
    const end = getDateParts(event.end);
    
    // Background based on type
    let bgGradient = "from-slate-900 to-slate-800";
    let accentColor = "bg-blue-600";
    
    if (event.type.includes("Comunidade")) { bgGradient = "from-blue-900 to-slate-900"; accentColor = "bg-blue-500"; }
    else if (event.type.includes("Destaque")) { bgGradient = "from-yellow-900 to-slate-900"; accentColor = "bg-yellow-500"; }
    else if (event.type.includes("Reide")) { bgGradient = "from-red-900 to-slate-900"; accentColor = "bg-red-600"; }
    else if (event.type.includes("Max")) { bgGradient = "from-fuchsia-900 to-slate-900"; accentColor = "bg-fuchsia-600"; }

    return (
        <div id={id} className={`w-[1080px] min-h-[1350px] bg-gradient-to-br ${bgGradient} text-white relative overflow-hidden flex flex-col font-sans`}>
            {/* INJECTED STYLES FOR EXPORT */}
            {inlineStyles && <style dangerouslySetInnerHTML={{__html: inlineStyles}} />}

            {/* Background Texture/Image */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')]"></div>
            {event.cover && <img src={event.cover} className="absolute top-0 left-0 w-full h-[600px] object-cover opacity-30 mask-image-gradient" style={{maskImage: 'linear-gradient(to bottom, black, transparent)'}} />}

            {/* HEADER */}
            <div className="relative z-10 p-12 flex justify-between items-start">
                <div className="max-w-[700px]">
                    <div className={`${accentColor} inline-block px-4 py-1 rounded-full text-2xl font-bold uppercase tracking-wider mb-4 shadow-lg`}>
                        {event.type}
                    </div>
                    <h1 className="text-7xl font-black leading-tight drop-shadow-xl">{event.name}</h1>
                    <div className="mt-4 text-3xl font-bold text-slate-300 flex items-center gap-4">
                        <i className="fa-regular fa-clock text-white"></i>
                        <span>{start.time} - {end.time}</span>
                    </div>
                </div>

                {/* DATE BOX (Calendar Style) */}
                <div className="bg-white text-slate-900 rounded-3xl p-6 flex flex-col items-center w-40 shadow-2xl border-4 border-slate-200">
                    <span className="text-3xl font-black uppercase tracking-widest text-slate-400">{start.month}</span>
                    <span className="text-8xl font-black leading-none tracking-tighter text-slate-900">{start.day}</span>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 px-12 flex-1 flex flex-col gap-10">
                
                {/* HERO FEATURED */}
                {event.featured && (
                    <div className="flex items-center justify-center -mt-10 mb-8 relative">
                        <div className="absolute w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
                        <img src={event.featured.image} className="w-[500px] h-[500px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10" />
                        {event.featured.shinyRate && (
                            <div className="absolute bottom-10 right-20 bg-black/60 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                                <i className="fa-solid fa-star text-yellow-400 text-3xl"></i>
                                <span className="text-2xl font-bold">{event.featured.shinyRate}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* BONUSES GRID */}
                {event.bonuses.length > 0 && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                        <h3 className="text-3xl font-bold uppercase mb-6 flex items-center gap-3 text-yellow-400">
                            <i className="fa-solid fa-gift"></i> Bônus do Evento
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {event.bonuses.map((b, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-yellow-400 text-2xl">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <span className="text-2xl font-medium leading-snug">{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SPAWNS / RAIDS ROW */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Just showing first 2 categories to fit infographic style */}
                    {event.spawnCategories.slice(0, 2).map((cat, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-3xl p-6 border border-white/5">
                            <h3 className="text-2xl font-bold uppercase mb-4 text-green-400 border-b border-white/10 pb-2">{cat.name}</h3>
                            <div className="flex flex-wrap gap-4">
                                {cat.spawns.slice(0, 8).map((s, i) => (
                                    <div key={i} className="relative">
                                        <img src={s.image} className="w-24 h-24 object-contain drop-shadow-md" />
                                        {s.shiny && <i className="fa-solid fa-star text-yellow-400 absolute top-0 right-0 text-sm drop-shadow-md"></i>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* RAIDS */}
                    {event.raidsList.length > 0 && (
                        <div className="bg-slate-800/50 rounded-3xl p-6 border border-white/5">
                            <h3 className="text-2xl font-bold uppercase mb-4 text-red-400 border-b border-white/10 pb-2">Reides</h3>
                            <div className="flex flex-wrap gap-6">
                                {event.raidsList.slice(0, 7).map((r, i) => (
                                    <div key={i} className="flex flex-col items-center w-24">
                                        <div className="text-xs font-bold uppercase bg-red-600 px-2 rounded mb-1">{r.tier.replace('Max-', 'Max ')}</div>
                                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${r.boss.toLowerCase()}.png`} 
                                             onError={(e) => e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random()*150)}.png`}
                                             className="w-20 h-20 object-contain drop-shadow-md" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-auto p-8 bg-black/40 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                        <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-wide">Pogo<span className="text-blue-500">Events</span></h2>
                        <p className="text-slate-400 text-lg">Acompanhe seu progresso</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-slate-300">Criado por Treinador</p>
                    <p className="text-slate-500">Imagens © Niantic / Pokémon Company</p>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { PogoEvent } from '../types';
import { EventStatusBadge } from './EventStatusBadge';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
    events: PogoEvent[];
}

export const Home = ({ events }: HomeProps) => {
    const navigate = useNavigate();
    const heroEvent = events[0];
    const displayEvents = events.slice(1);

    if (events.length === 0) {
        return <div className="text-slate-500 p-10 text-center">Nenhum evento encontrado.</div>;
    }

    return (
        <div className="animate-fade-in">
            {/* --- HERO BANNER --- */}
            {heroEvent && (
                <div
                    className="w-full h-[400px] rounded-[2.5rem] mb-16 relative overflow-hidden group cursor-pointer border-2 border-transparent bg-[#0f131a] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    onClick={() => navigate(`/event/${heroEvent.id}`)}
                >
                    <div className="absolute inset-[-50%] z-0 animate-border-spin opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: 'conic-gradient(from 0deg, transparent 0 300deg, #3b82f6 360deg)' }}>
                    </div>
                    <div className="absolute inset-[2px] rounded-[2.4rem] bg-[#0f131a] z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
                        <div className="absolute top-0 right-0 w-[75%] h-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0f131a]/80 to-[#0f131a] z-20"></div>
                            <img
                                src={heroEvent.cover || (heroEvent.featured ? heroEvent.featured.image : '')}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-1000 animate-ken-burns"
                                alt={heroEvent.name}
                            />
                        </div>
                        <div className="absolute inset-0 p-12 z-30 flex flex-col justify-center max-w-2xl">
                            <div className="flex flex-col items-start gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] font-rajdhani">Protocolo Prioritário</span>
                                </div>
                                <h1 className="text-6xl md:text-7xl font-black text-white uppercase font-rajdhani leading-[0.85] italic tracking-tighter drop-shadow-2xl">
                                    {heroEvent.name}
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <EventStatusBadge start={heroEvent.start} end={heroEvent.end} />
                                    <div className="h-4 w-px bg-white/10"></div>
                                    <span className="text-xl font-black text-slate-400 font-rajdhani">
                                        {new Date(heroEvent.start).toLocaleDateString('pt-BR')}
                                        <span className="mx-2 text-slate-600">|</span>
                                        {new Date(heroEvent.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/event/${heroEvent.id}/catalog`);
                                    }}
                                    className="btn-tech btn-tech-blue mt-8 px-10 py-3 text-sm group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all"
                                >
                                    <i className="fa-solid fa-list-check mr-2 animate-pulse"></i> Checklist
                                </button>
                            </div>
                        </div>
                        {heroEvent.featured && (
                            <div className="absolute right-10 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center z-40 pointer-events-none animate-float">
                                <img
                                    src={heroEvent.featured.image}
                                    className="max-h-[110%] object-contain drop-shadow-[0_0_60px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-transform duration-700"
                                    alt={heroEvent.featured.name}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
                <h2 className="text-4xl font-black text-white font-rajdhani uppercase flex items-center gap-3 tracking-tighter italic">
                    <span className="text-blue-500">///</span>
                    Sinalizações de {new Date().getFullYear()}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {displayEvents.map((evt) => {
                    const startDate = new Date(evt.start);
                    const day = startDate.getDate().toString().padStart(2, '0');
                    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = startDate.getFullYear().toString().slice(-2);
                    let coverImg = evt.cover || (evt.images && evt.images[0]) || (evt.featured ? evt.featured.image : 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg');

                    return (
                        <div
                            key={evt.id}
                            onClick={() => navigate(`/event/${evt.id}`)}
                            className="group relative h-[280px] rounded-3xl overflow-hidden cursor-pointer bg-[#0f131a] border border-white/10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.6)] hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
                            <div className="absolute top-0 right-0 w-[65%] h-full overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-l from-transparent via-[#0f131a]/60 to-[#0f131a] z-10`}></div>
                                <img src={coverImg} className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 filter grayscale group-hover:grayscale-0" alt={evt.name} />
                            </div>
                            <div className="absolute inset-0 p-6 z-20 flex flex-col justify-between pl-8">
                                <div className="flex flex-col items-start">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-white/20 text-blue-100 bg-black/40 backdrop-blur mb-1">
                                        [{evt.type}]
                                    </div>
                                </div>
                                <div className="relative">
                                    <h3 className="text-4xl font-black text-white uppercase font-rajdhani leading-[0.85] italic mb-3 drop-shadow-lg max-w-[80%]">
                                        {evt.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-2xl font-black font-rajdhani text-blue-500 tracking-tighter">
                                            <span>{day}</span>
                                            <span className="mx-1 text-slate-600">/</span>
                                            <span>{month}</span>
                                            <span className="mx-1 text-slate-600">/</span>
                                            <span>{year}</span>
                                        </div>
                                        <div className="h-4 w-px bg-white/20 mx-1"></div>
                                        <div className="text-lg font-bold text-slate-400 font-rajdhani">
                                            {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <EventStatusBadge start={evt.start} end={evt.end} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

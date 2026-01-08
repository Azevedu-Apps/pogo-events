import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { amplifyConfig } from './services/aws-config';
import { PogoEvent } from './types';
import { listPogoEvents } from './services/graphql';
import { getEventTheme } from './utils/visuals';

// Components
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import EventDetail from './components/EventDetail';
import Catalog from './components/Catalog';
import { ToolsPage } from './components/ToolsPage';
import { BrandGenerator } from './components/BrandGenerator';
import { Dashboard } from './components/Dashboard';

import { EventCardSkeleton } from './components/ui/Skeletons';
import { Button } from './components/ui/Shared';
import { Footer } from './components/Footer';

// Configure Amplify
try {
    Amplify.configure(amplifyConfig);
} catch (e) {
    console.error("Amplify config error:", e);
}

// --- SUB-COMPONENT: STATUS BADGE ---
const EventStatusBadge = ({ start, end }: { start: string, end: string }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');

    // 1. Check if Future (Hasn't started yet)
    if (now < startDate) {
        if (diffDays <= 7) {
            if (diffDays < 1) {
                // Less than 1 day: HH:MM:SS
                return (
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-900/20 border border-red-500/30 px-2 py-1 rounded flex items-center gap-1.5 animate-pulse">
                        <i className="fa-solid fa-stopwatch text-[9px]"></i> {pad(diffHours)}:{pad(diffMinutes)}:{pad(diffSeconds)}
                    </div>
                );
            }
            // 1 to 7 days: X DIAS HH:MM
            return (
                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest bg-orange-900/20 border border-orange-500/30 px-2 py-1 rounded flex items-center gap-1.5">
                    <i className="fa-solid fa-hourglass-half text-[9px]"></i> {diffDays} DIAS {pad(diffHours)}:{pad(diffMinutes)}
                </div>
            );
        }

        return (
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-900/20 border border-blue-500/30 px-2 py-1 rounded flex items-center gap-1.5">
                <i className="fa-regular fa-clock text-[9px]"></i> EM BREVE
            </div>
        );
    }

    // 2. Check if Ended
    if (now > endDate) {
        return (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 border border-slate-700 px-2 py-1 rounded flex items-center gap-1.5">
                <i className="fa-solid fa-lock text-[9px]"></i> ENCERRADO
            </div>
        );
    }

    // 3. Default: Active (Operating Now)
    return (
        <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">OPERANDO AGORA</span>
        </div>
    );
};

function App() {
    const [view, setView] = useState<'list' | 'calendar' | 'details' | 'catalog' | 'tools' | 'brand_gen' | 'dashboard' | 'assets'>('dashboard');
    const [events, setEvents] = useState<PogoEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setApiError(null);
        const client = generateClient();
        try {
            const result: any = await client.graphql({
                query: listPogoEvents,
                authMode: 'apiKey'
            });

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            const items = result.data.listPogoEvents.items;
            const parsedEvents: PogoEvent[] = items.map((item: any) => ({
                ...item,
                spawnCategories: item.spawnCategories ? JSON.parse(item.spawnCategories) : [],
                attacks: item.attacks ? JSON.parse(item.attacks) : [],
                raidsList: item.raidsList ? JSON.parse(item.raidsList) : [],
                customTexts: item.customTexts ? JSON.parse(item.customTexts) : [],
                eggs: item.eggs ? JSON.parse(item.eggs) : [],
                bonuses: item.bonuses || [],
                images: item.images || [],
                payment: item.payment ? {
                    type: item.payment.type,
                    cost: item.payment.cost,
                    ticket: (item.payment.ticketCost || item.payment.ticketBonuses) ? {
                        cost: item.payment.ticketCost,
                        bonuses: item.payment.ticketBonuses || []
                    } : undefined
                } : undefined,
                featured: item.featured,
                paidResearch: item.paidResearch,
            }));

            const now = new Date();
            const currentYear = now.getFullYear();

            // Filter: Strictly events from the current year
            const filtered = parsedEvents.filter(e => {
                const startDate = new Date(e.start);
                return startDate.getFullYear() === currentYear;
            });

            const sorted = filtered.sort((a, b) => {
                const startA = new Date(a.start);
                const endA = new Date(a.end);
                const startB = new Date(b.start);
                const endB = new Date(b.end);

                const getPriority = (start: Date, end: Date) => {
                    if (now >= start && now <= end) return 1; // Now
                    if (now < start) {
                        const dDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                        if (dDays <= 7) return 2; // Close Future
                        return 3; // Distant Future
                    }
                    return 4; // Past
                };

                const prioA = getPriority(startA, endA);
                const prioB = getPriority(startB, endB);

                if (prioA !== prioB) return prioA - prioB;
                // Sub-sort by date
                if (prioA === 4) return startB.getTime() - startA.getTime(); // Past: newest first
                return startA.getTime() - startB.getTime(); // Others: oldest first
            });

            setEvents(sorted);
        } catch (e: any) {
            console.error("Error fetching events", e);
            setApiError(e.message || "Falha na conexão com o servidor de dados.");
        } finally {
            setLoading(false);
        }
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </div>
            );
        }

        if (apiError && view !== 'brand_gen') {
            return (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-red-900/10 border border-red-900/30 rounded-3xl">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 text-6xl mb-6"></i>
                    <h2 className="text-2xl font-bold text-white mb-2">Erro de Rede</h2>
                    <p className="text-slate-400 mb-8">{apiError}</p>
                    <Button onClick={fetchEvents}><i className="fa-solid fa-rotate-right mr-2"></i> Reestabelecer Conexão</Button>
                </div>
            );
        }

        switch (view) {
            case 'dashboard':
                return <Dashboard events={events} onNavigate={(v, id) => {
                    setView(v);
                    if (id) setSelectedEventId(id);
                }} />;
            case 'calendar':
                return <Calendar events={events} onEventClick={(id) => { setSelectedEventId(id); setView('details'); }} />;
            case 'details':
                return selectedEvent ? <EventDetail
                    event={selectedEvent}
                    onBack={() => setView('list')}
                    onOpenCatalog={() => setView('catalog')}
                /> : <div>Evento não encontrado</div>;
            case 'catalog':
                return selectedEvent ? <Catalog event={selectedEvent} onBack={() => setView('details')} /> : <div>Erro ao carregar catálogo</div>;
            case 'tools':
                return <ToolsPage events={events} />;
            case 'brand_gen':
                return <BrandGenerator />;

            case 'list':
            default:
                const heroEvent = events[0];
                const displayEvents = events.slice(1);

                return (
                    <div className="animate-fade-in">
                        {/* --- HERO BANNER --- */}
                        {heroEvent && (
                            <div
                                className="w-full h-[400px] rounded-[2.5rem] mb-16 relative overflow-hidden group cursor-pointer border-2 border-transparent bg-[#0f131a] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                                onClick={() => { setSelectedEventId(heroEvent.id); setView('details'); }}
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
                                                    setSelectedEventId(heroEvent.id);
                                                    setView('catalog');
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
                            {displayEvents.map((evt, index) => {
                                const startDate = new Date(evt.start);
                                const day = startDate.getDate().toString().padStart(2, '0');
                                const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
                                const year = startDate.getFullYear().toString().slice(-2);
                                let coverImg = evt.cover || (evt.images && evt.images[0]) || (evt.featured ? evt.featured.image : 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg');

                                return (
                                    <div
                                        key={evt.id}
                                        onClick={() => { setSelectedEventId(evt.id); setView('details'); }}
                                        className="group relative h-[280px] rounded-3xl overflow-hidden cursor-pointer bg-[#0f131a] border border-white/10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.6)] hover:-translate-y-1"
                                    >
                                        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
                                        <div className="absolute top-0 right-0 w-[65%] h-full overflow-hidden">
                                            <div className={`absolute inset-0 bg-gradient-to-l from-transparent via-[#0f131a]/60 to-[#0f131a] z-10`}></div>
                                            <img src={coverImg} className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 filter grayscale group-hover:grayscale-0" />
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
        }
    };

    return (
        <div className="flex h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
            <Sidebar currentView={view} setView={(v) => { setSelectedEventId(null); setView(v); }} />
            <main className="flex-1 h-full overflow-y-auto relative scrollbar-hide">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0b0e14]/80 backdrop-blur sticky top-0 z-30">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest hidden md:block font-rajdhani">
                        Vorgex / {view === 'list' ? 'Terminal' : view.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-6 ml-auto">
                        <div className="bg-[#151a25] px-4 py-2 rounded-sm border border-white/5 flex items-center gap-3 shadow-sm">
                            <span className="text-xs font-bold text-blue-400 uppercase font-rajdhani tracking-wider">Season 12</span>
                            <div className="h-4 w-px bg-slate-700"></div>
                            <span className="text-xs font-bold text-slate-400 font-mono text-[9px]">NEXUS CORE v3.5</span>
                        </div>
                    </div>
                </header>
                <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
                    {renderContent()}
                </div>
                <Footer />
            </main>
        </div >
    );
};

export default App;

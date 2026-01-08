import React, { useMemo } from 'react';
import { PogoEvent, Raid } from '../types';
import { getEventTheme } from '../utils/visuals';

interface DashboardProps {
    events: PogoEvent[];
    onNavigate: (view: 'list' | 'calendar' | 'details' | 'catalog' | 'tools' | 'brand_gen' | 'dashboard', eventId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ events, onNavigate }) => {
    const now = new Date();

    // 1. Filter Active Events
    const activeEvents = useMemo(() => {
        return events.filter(e => {
            const start = new Date(e.start);
            const end = new Date(e.end);
            return now >= start && now <= end;
        }).sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime());
    }, [events]);

    // 2. Find Spotlight Hour (Next or Current)
    const spotlightEvent = useMemo(() => {
        // Filter for events that look like Spotlight Hours (usually Tuesdays 6-7 PM)
        // Or events explicitly named "Hora do Holofote" or type "spotlight"
        const spotlights = events.filter(e =>
            e.name.toLowerCase().includes('holofote') ||
            e.type.toLowerCase() === 'spotlight'
        );

        // Find the one for "today" if it's Tuesday, or the next closest one
        // For now, let's just find the one that is active OR coming up very soon (next 7 days)
        const upcoming = spotlights.filter(e => {
            const end = new Date(e.end);
            return end >= now;
        }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        return upcoming[0];
    }, [events]);

    // 3. Aggregate Raids from Active Events
    const activeRaids = useMemo(() => {
        const raids: { tier: string, bosses: Raid[] }[] = [];
        const processedBosses = new Set<string>();

        activeEvents.forEach(e => {
            if (e.raidsList && e.raidsList.length > 0) {
                e.raidsList.forEach(r => {
                    const key = `${r.tier}-${r.boss}`;
                    if (!processedBosses.has(key)) {
                        processedBosses.add(key);

                        let group = raids.find(g => g.tier === r.tier);
                        if (!group) {
                            group = { tier: r.tier, bosses: [] };
                            raids.push(group);
                        }
                        group.bosses.push(r);
                    }
                });
            }
        });

        // Sort tiers order: Mega -> 5 -> Shadow -> 3 -> 1
        const tierOrder = ['mega', '5', 'shadow', 'dinamax', '3', '1'];
        return raids.sort((a, b) => {
            const aIndex = tierOrder.findIndex(t => a.tier.toLowerCase().includes(t));
            const bIndex = tierOrder.findIndex(t => b.tier.toLowerCase().includes(t));
            return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        });
    }, [activeEvents]);

    // Helper to check if it's weekend (for Spotlight logic if needed, though we use event data)
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white font-rajdhani uppercase tracking-wider">
                        Dashboard
                    </h2>
                    <p className="text-slate-400 font-medium">Visão geral do que está acontecendo agora</p>
                </div>
            </div>

            {/* Spotlight Hour Section (Only Mon-Fri) */}
            {!isWeekend && spotlightEvent && (
                <div
                    onClick={() => onNavigate('details', spotlightEvent.id)}
                    className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden cursor-pointer group border border-white/10 hover:border-yellow-500/50 transition-all duration-500 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
                    <img
                        src={spotlightEvent.cover || spotlightEvent.images[0]}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt="Spotlight"
                    />
                    <div className="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-center items-start">
                        <div className="bg-yellow-500 text-black font-black text-xs px-3 py-1 rounded uppercase tracking-widest mb-2 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse">
                            Hora do Holofote
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-white font-rajdhani uppercase italic drop-shadow-lg mb-2">
                            {spotlightEvent.featured?.name || spotlightEvent.name}
                        </h3>
                        <div className="flex items-center gap-4 text-yellow-300 font-bold text-sm md:text-base bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                            <span><i className="fa-regular fa-clock mr-2"></i>{new Date(spotlightEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(spotlightEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {spotlightEvent.bonuses[0] && (
                                <>
                                    <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                    <span>{spotlightEvent.bonuses[0]}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Events Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/80">
                    <i className="fa-solid fa-calendar-check text-green-400"></i>
                    <h3 className="text-xl font-black font-rajdhani uppercase tracking-widest">Eventos Ativos</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeEvents.length > 0 ? activeEvents.map(event => {
                        const theme = getEventTheme(event.type);
                        const color = theme.border.split('-')[1];
                        return (
                            <div
                                key={event.id}
                                onClick={() => onNavigate('details', event.id)}
                                className="bg-[#151a25] rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 hover:bg-[#1a202e] transition-all cursor-pointer group flex gap-4 items-center"
                            >
                                <div className={`w-16 h-16 rounded-xl shrink-0 overflow-hidden border border-white/10 relative`}>
                                    <img src={event.cover} className="w-full h-full object-cover" />
                                    <div className={`absolute inset-0 bg-${color}-500/20`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold font-rajdhani uppercase truncate group-hover:text-blue-400 transition-colors">{event.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <i className="fa-regular fa-clock"></i>
                                        <span>Termina em {new Date(event.end).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <i className="fa-solid fa-chevron-right text-slate-600 group-hover:text-white transition-colors"></i>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-8 text-center text-slate-500 bg-[#151a25]/50 rounded-2xl border border-white/5 border-dashed">
                            Nenhum evento ativo no momento.
                        </div>
                    )}
                </div>
            </div>

            {/* Active Raids */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-white/80">
                    <i className="fa-solid fa-dragon text-red-400"></i>
                    <h3 className="text-xl font-black font-rajdhani uppercase tracking-widest">Chefes de Reide Atuais</h3>
                </div>

                {activeRaids.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeRaids.map((group, idx) => (
                            <div key={idx} className="bg-[#151a25] rounded-2xl overflow-hidden border border-white/5">
                                <div className="bg-black/20 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                    <span className="font-black font-rajdhani uppercase tracking-wider text-slate-300">{group.tier}</span>
                                    {group.tier.toLowerCase().includes('shadow') && <i className="fa-solid fa-fire-flame-curved text-purple-500"></i>}
                                    {group.tier.toLowerCase().includes('mega') && <i className="fa-solid fa-dna text-pink-500"></i>}
                                    {group.tier.toLowerCase().includes('5') && <i className="fa-solid fa-star text-yellow-500"></i>}
                                </div>
                                <div className="p-4 grid grid-cols-3 gap-2">
                                    {group.bosses.map((boss, bIdx) => (
                                        <div key={bIdx} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <img
                                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${Math.floor(Math.random() * 900) + 1}.png`}
                                                className="w-12 h-12 object-contain drop-shadow-lg"
                                                alt={boss.boss}
                                            />
                                            <span className="text-[10px] font-bold text-center text-slate-400 uppercase leading-tight">{boss.boss}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-500 bg-[#151a25]/50 rounded-2xl border border-white/5 border-dashed">
                        Nenhuma informação de reide disponível.
                    </div>
                )}
            </div>
        </div>
    );
};

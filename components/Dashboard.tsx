import React, { useMemo } from 'react';
import { PogoEvent, Raid } from '../types';
import { getEventTheme, formatDate } from '../utils/visuals';
import { fixPokemonSpriteUrl } from '../services/assets';
import { getPokemonAsset, getRaidEggIcon } from '../services/assets';

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
        }).sort((a, b) => {
            // Priority Sort: Spotlight -> Community Day -> Raid Day -> General
            const getPriority = (type: string) => {
                const t = type.toLowerCase();
                if (t.includes('holofote') || t === 'spotlight') return 1;
                if (t.includes('comunidade') || t === 'community') return 2;
                if (t.includes('reide') || t === 'raid') return 3;
                return 4;
            };
            return getPriority(a.type) - getPriority(b.type);
        });
    }, [events]);

    // 2. Filter Upcoming Events (Next 3)
    const upcomingEvents = useMemo(() => {
        return events.filter(e => {
            const start = new Date(e.start);
            return start > now;
        })
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 3);
    }, [events, now]);

    // 3. Determine Hero Events (Active + Potential Split)
    const { heroEvent, upcomingHero } = useMemo(() => {
        let active = activeEvents.length > 0 ? activeEvents[0] : null;
        let upcoming = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

        let splitUpcoming = null;

        // If no active event, upcoming takes over as main hero
        if (!active) {
            active = upcoming;
            upcoming = null; // No split if it's the only one
        } else if (upcoming) {
            // Check if upcoming is starting soon (< 24h)
            const timeUntilStart = new Date(upcoming.start).getTime() - now.getTime();
            const hoursUntil = timeUntilStart / (1000 * 60 * 60);

            if (hoursUntil < 24 && hoursUntil > 0) {
                splitUpcoming = upcoming;
            }
        }

        return { heroEvent: active, upcomingHero: splitUpcoming };
    }, [activeEvents, upcomingEvents, now]);

    // 4. Aggregate Raids from Active Events
    const activeRaids = useMemo(() => {
        const raids: { tier: string, bosses: Raid[] }[] = [];
        const processedBosses = new Set<string>();

        // Find events that are active OR are roughly "today" for Raid display
        // We look at all active events to gather raid bosses
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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const getRaidBossImage = (bossName: string, tier: string) => {
        // Handle Mega/Primal naming for PokemonDB (e.g. "Mega Diancie" -> "diancie-mega", "Mega Charizard X" -> "charizard-mega-x")
        let formattedName = bossName.toLowerCase().replace(/[\\.']/g, '');
        const parts = formattedName.split(' ');

        if (parts.length > 1 && (parts[0] === 'mega' || parts[0] === 'primal')) {
            const modifier = parts.shift(); // Remove 'mega'
            if (modifier) {
                parts.splice(1, 0, modifier); // Insert at index 1 (after the name)
            }
            formattedName = parts.join('-');
        } else {
            formattedName = formattedName.replace(/ /g, '-');
        }

        return fixPokemonSpriteUrl(`https://img.pokemondb.net/sprites/home/normal/${formattedName}.png`);
    };

    const renderHeroCard = (event: PogoEvent, isSplit: boolean = false, isUpcoming: boolean = false) => {
        const isLive = new Date() >= new Date(event.start) && new Date() <= new Date(event.end);

        return (
            <div
                key={event.id}
                onClick={() => onNavigate('details', event.id)}
                className={`relative w-full ${isSplit ? 'h-[320px] md:h-full' : 'h-[320px] md:h-[400px]'} rounded-3xl overflow-hidden cursor-pointer group shadow-2xl transition-all hover:scale-[1.005] ${isLive ? 'border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}`}
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={event.cover}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75 group-hover:brightness-90"
                        alt="Hero Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/20 to-transparent"></div>
                    {!isSplit && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14]/90 via-transparent to-transparent"></div>
                    )}
                </div>

                {/* Content */}
                <div className={`absolute bottom-0 left-0 p-6 md:p-8 w-full z-20 ${isSplit ? '' : 'md:w-2/3 md:p-12'}`}>
                    {/* Status Badge */}
                    <div className="flex gap-2 mb-3">
                        {isLive && (
                            <div className="flex items-center gap-2 bg-red-600/90 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-red-900/50 backdrop-blur-sm animate-pulse-slow">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                Ao Vivo
                            </div>
                        )}
                        {isUpcoming && (
                            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded animate-pulse">
                                Em Breve
                            </span>
                        )}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md backdrop-blur-md border border-white/20 shadow-lg ${getEventTheme(event.type).badge}`}>
                            <i className={`fa-solid ${getEventTheme(event.type).icon} text-white`}></i>
                            <span className="text-white font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-black drop-shadow-md">
                                {event.type}
                            </span>
                        </div>
                    </div>

                    {/* Event Title */}
                    <h1 className={`${isSplit ? 'text-2xl md:text-3xl' : 'text-4xl md:text-6xl'} font-black text-white font-rajdhani uppercase leading-none mb-4 drop-shadow-xl italic line-clamp-2`}>
                        {event.name}
                    </h1>

                    {/* Date & Timer */}
                    <div className="flex items-center gap-6 text-slate-200">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                            <i className="fa-regular fa-clock text-blue-400"></i>
                            <span className="font-mono font-bold text-xs md:text-sm">
                                {isUpcoming
                                    ? `Começa: ${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${formatDate(new Date(event.start))}`
                                    : `${new Date(event.start).toLocaleDateString()} - ${new Date(event.end).toLocaleDateString()}`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* HERO SECTION */}
            {heroEvent && (
                upcomingHero ? (
                    // SPLIT VIEW
                    <div className="md:h-[400px] flex flex-col md:flex-row gap-4">
                        <div className="flex-1 h-full">
                            {renderHeroCard(heroEvent, true, false)}
                        </div>
                        <div className="flex-1 h-full">
                            {renderHeroCard(upcomingHero, true, true)}
                        </div>
                    </div>
                ) : (
                    // SINGLE VIEW
                    renderHeroCard(heroEvent, false, false)
                )
            )}

            {/* STATUS STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#151a25] p-4 rounded-xl border border-white/5 flex items-center justify-between col-span-1 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Season 12</div>
                        <div className="text-xl font-black text-white font-rajdhani uppercase">Shared Skies</div>
                    </div>
                    <i className="fa-solid fa-cloud-sun text-blue-500 text-2xl opacity-50"></i>
                </div>

                {/* Global Bonus Summary */}
                <div className="bg-[#151a25] p-4 rounded-xl border border-white/5 flex items-center gap-4 col-span-1 md:col-span-3 shadow-lg relative overflow-hidden">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden md:block">Bônus Ativos:</div>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-2 bg-green-900/20 px-3 py-1 rounded text-green-300 text-sm font-bold border border-green-700/30 whitespace-nowrap">
                            <i className="fa-solid fa-candy-cane"></i> 2x Doces de Captura
                        </div>
                        <div className="flex items-center gap-2 bg-purple-900/20 px-3 py-1 rounded text-purple-300 text-sm font-bold border border-purple-700/30 whitespace-nowrap">
                            <i className="fa-solid fa-ghost"></i> Equipe GO Rocket Frequente
                        </div>
                        {/* Dynamic from events? */}
                        {activeEvents.flatMap(e => e.bonuses).slice(0, 2).map((b, i) => (
                            <div key={i} className="flex items-center gap-2 bg-blue-900/20 px-3 py-1 rounded text-blue-300 text-sm font-bold border border-blue-700/30 whitespace-nowrap">
                                <i className="fa-solid fa-star"></i> {b}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN (RAIDS & ACTIVE LIST) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ACTIVE RAIDS */}
                    <div>
                        <div className="flex items-center gap-3 text-white mb-6">
                            <div className="w-1 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                            <h3 className="text-2xl font-black font-rajdhani uppercase tracking-wider">Chefes de Reide</h3>
                        </div>

                        {activeRaids.length > 0 ? (
                            <div className="space-y-8">
                                {activeRaids.map((group, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <img src={getRaidEggIcon(group.tier)} className="w-6 h-6 object-contain" />
                                            <h4 className="text-slate-300 font-bold uppercase tracking-widest text-sm font-rajdhani">
                                                Nível {group.tier}
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {group.bosses.map((boss, bIdx) => (
                                                <div
                                                    key={bIdx}
                                                    className="group relative bg-[#151a25]/80 rounded-xl border border-white/5 overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col"
                                                >
                                                    {/* Background Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    {/* Shiny/Event Tags (Top Right) */}
                                                    <div className="absolute top-2 right-2 z-20 flex gap-1">
                                                        {!boss.shinyLocked && (
                                                            <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center animate-pulse-slow" title="Shiny Disponível">
                                                                <i className="fa-solid fa-star text-[8px] text-yellow-400"></i>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Pokemon Image */}
                                                    <div className="h-28 mt-4 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                                                        <img
                                                            src={getRaidBossImage(boss.boss, group.tier)}
                                                            className="w-24 h-24 object-contain filter drop-shadow-xl"
                                                            onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')}
                                                            alt={boss.boss}
                                                        />
                                                    </div>

                                                    {/* Name Bar */}
                                                    <div className="mt-auto bg-black/40 backdrop-blur-sm p-3 border-t border-white/5 relative z-10">
                                                        <div className="text-xs font-bold text-center text-slate-200 uppercase tracking-wide leading-tight group-hover:text-red-400 transition-colors truncate">
                                                            {boss.boss}
                                                        </div>
                                                        {boss.form && (
                                                            <div className="text-[9px] text-center text-slate-500 font-mono mt-0.5 truncate uppercase">
                                                                {boss.form}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 bg-[#151a25] rounded-2xl border border-white/5 border-dashed">
                                Nenhuma Reide reportada nos eventos ativos.
                            </div>
                        )}
                    </div>

                    {/* OTHER ACTIVE EVENTS */}
                    <div>
                        <div className="flex items-center gap-3 text-white mb-4">
                            <div className="w-1 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                            <h3 className="text-2xl font-black font-rajdhani uppercase tracking-wider">Outros Eventos Ativos</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {activeEvents.length > 1 ? activeEvents.slice(1).map(event => {
                                const theme = getEventTheme(event.type);
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => onNavigate('details', event.id)}
                                        className="bg-[#151a25] rounded-xl p-3 border border-white/5 hover:bg-[#1a202e] hover:border-white/20 transition-all cursor-pointer flex items-center gap-4 group"
                                    >
                                        <div className="w-20 h-12 rounded-lg overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                            <img src={event.cover} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-white font-rajdhani uppercase truncate group-hover:text-blue-400 transition-colors">{event.name}</h4>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{event.type}</span>
                                        </div>
                                        <div className="text-right text-xs text-slate-400 font-mono">
                                            <div>Termina em</div>
                                            <div className="text-white">{formatDate(new Date(event.end))}</div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-slate-500 text-sm italic">Nenhum outro evento ativo.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (TIMELINE) */}
                <div className="lg:col-span-1">
                    <div className="bg-[#151a25] rounded-3xl p-6 border border-white/5 sticky top-24">
                        <div className="flex items-center gap-3 text-white mb-6">
                            <i className="fa-solid fa-hourglass-start text-blue-500"></i>
                            <h3 className="text-xl font-black font-rajdhani uppercase tracking-wider">Próximos Eventos</h3>
                        </div>

                        {upcomingEvents.length > 0 ? (
                            <div className="relative border-l-2 border-white/10 ml-3 space-y-8 py-2">
                                {upcomingEvents.map((event, idx) => (
                                    <div key={idx} className="relative pl-6 group cursor-pointer" onClick={() => onNavigate('details', event.id)}>
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#151a25] border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform"></div>

                                        <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-widest font-rajdhani">
                                            {formatDate(new Date(event.start))}
                                        </div>
                                        <h4 className="text-white font-bold leading-tight mb-2 group-hover:text-blue-300 transition-colors">
                                            {event.name}
                                        </h4>
                                        <div className="text-[10px] text-slate-500 bg-white/5 inline-block px-2 py-1 rounded uppercase tracking-wider border border-white/5">
                                            {event.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-500 text-center py-4">Fim da temporada.</div>
                        )}

                        <button
                            onClick={() => onNavigate('calendar')}
                            className="w-full mt-8 py-3 rounded-xl border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-calendar-days"></i>
                            Ver Calendário Completo
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

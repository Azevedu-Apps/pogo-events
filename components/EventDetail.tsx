
import React, { useState, useEffect } from 'react';
import { PogoEvent } from '../types';
import { CustomSectionsDisplay, RaidDisplay, AttackDisplay, FeaturedDisplay, FreeResearchDisplay, PaidResearchDisplay, TicketCard } from './detail/DetailSections';
import { EggDetailDisplay } from './detail/EggDetail';
import { EventInfographic } from './detail/EventInfographic';
import { captureAndDownload } from '../utils/capture';
import { Lightbox } from './ui/Lightbox';
import { PokemonCard } from './ui/PokemonCard';
import { getEventTheme } from '../utils/visuals';
import { getPokemonAsset, getBackgroundAsset } from '../services/assets';
import { Footer } from './Footer';

interface EventDetailProps {
    event: PogoEvent;
    onBack: () => void;
    onOpenCatalog: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onOpenCatalog }) => {
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    console.log("🔍 EVENT JSON DATA:", event);
    // Calculate Progress & Check Start Date
    useEffect(() => {
        const now = new Date();
        const start = new Date(event.start);
        if (now >= start) {
            setHasStarted(true);

            // Calculate Progress Percentage
            const savedData = localStorage.getItem(`pogo_catalog_progress_${event.id}`);

            if (savedData) {
                try {
                    const progress = JSON.parse(savedData);
                    let currentScore = 0;
                    let maxScore = 0;

                    // Replicate simplified weighting logic
                    const WEIGHTS: Record<string, number> = { normal: 1, move_obtained: 1, xxl: 2, xxs: 2, shadow: 2, purified: 2, shiny: 4, hundo: 4 };
                    // 1. Spawns
                    event.spawnCategories.forEach(cat => {
                        cat.spawns.forEach(s => {
                            const idParts = [
                                cat.name.toLowerCase().replace(/\s+/g, ''),
                                s.name.toLowerCase().replace(/\s+/g, '-')
                            ];
                            if (s.form && s.form !== '00') idParts.push(`f-${s.form.toLowerCase().replace(/\s+/g, '-')}`);
                            if (s.costume) idParts.push(`c-${s.costume.toLowerCase().replace(/\s+/g, '-')}`);

                            const pid = idParts.join('-');
                            const p = progress[pid] || {};
                            ['normal', 'shiny', 'hundo', 'xxl', 'xxs'].forEach(k => {
                                maxScore += WEIGHTS[k] || 1;
                                if (p[k]) currentScore += WEIGHTS[k] || 1;
                            });
                        });
                    });

                    // 2. Raids
                    event.raidsList.forEach(r => {
                        const pid = `raid-${r.boss.toLowerCase().replace(/\s+/g, '-')}`;
                        const p = progress[pid] || {};
                        const isShadow = r.tier && (r.tier.toLowerCase().includes('shadow') || r.tier.toLowerCase().includes('sombroso'));

                        const variants = isShadow
                            ? ['normal', 'shiny', 'hundo', 'shadow', 'purified']
                            : ['normal', 'shiny', 'hundo', 'shundo'];

                        variants.forEach(k => {
                            maxScore += WEIGHTS[k] || 1;
                            if (p[k]) currentScore += WEIGHTS[k] || 1;
                        });
                    });

                    // 3. Attacks
                    event.attacks.forEach(a => {
                        const pid = `${a.pokemon.toLowerCase().replace(/\s+/g, '-')}-atk`;
                        const p = progress[pid] || {};
                        maxScore += WEIGHTS['move_obtained'];
                        if (p['move_obtained']) currentScore += WEIGHTS['move_obtained'];
                    });

                    if (maxScore > 0) {
                        setProgressPercent(Math.round((currentScore / maxScore) * 100));
                    }
                } catch (e) {
                    console.error("Failed to calc progress", e);
                }
            }
        }
    }, [event]);

    const theme = getEventTheme(event.type);

    // Format Date
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const dateStr = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} > ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Filter Raids
    const maxBattles = event.raidsList?.filter(r =>
        r.tier.startsWith('Max') || r.tier === 'Gigamax' || r.tier === 'Dinamax'
    ) || [];

    const standardRaids = event.raidsList?.filter(r =>
        !r.tier.startsWith('Max') && r.tier !== 'Gigamax' && r.tier !== 'Dinamax'
    ) || [];

    const handleExportImage = () => {
        captureAndDownload({
            nodeId: 'event-infographic-capture',
            fileName: `evento-${event.name.replace(/\s+/g, '-').toLowerCase()}`,
            scale: 2,
            onStart: () => setExporting(true),
            onEnd: () => setExporting(false)
        });
    };

    const coverImg = event.cover || (event.images && event.images[0]) || (event.featured ? event.featured.image : null);

    // Helper for Section Headers
    const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
        <div className="flex flex-col items-center justify-center mb-12 text-center relative z-10">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-4"></div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase font-rajdhani tracking-wider drop-shadow-lg">{title}</h2>
            {subtitle && <p className="text-blue-200/80 font-rajdhani text-lg mt-2 uppercase tracking-widest">{subtitle}</p>}
            <div className="w-2 h-2 rotate-45 bg-blue-500 mt-4"></div>
        </div>
    );

    return (
        <div className="animate-fade-in relative min-h-screen bg-[#05060a] text-slate-200 overflow-hidden font-sans pb-32">
            <Lightbox isOpen={!!lightboxImg} onClose={() => setLightboxImg(null)} src={lightboxImg || ''} />

            {/* Hidden Infographic */}
            <div className="fixed top-0 left-[-9999px] pointer-events-none">
                <EventInfographic event={event} id="event-infographic-capture" />
            </div>

            {/* --- FIXED BACKGROUND TEXTURE --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] opacity-5"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/50 via-[#0b0e14]/80 to-[#0b0e14]"></div>
            </div>

            {/* --- NAV HEADER (Floating) --- */}
            <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
                <button onClick={onBack} className="pointer-events-auto flex items-center gap-2 text-white/70 hover:text-white transition group bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-white/30 shadow-lg">
                    <i className="fa-solid fa-arrow-left"></i>
                    <span className="font-rajdhani font-bold uppercase tracking-wider text-xs">Voltar</span>
                </button>

                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    <div className="flex flex-row gap-3 items-center">
                        {hasStarted && (
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 h-10 shadow-lg">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Progresso</span>
                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <span className="text-xs font-black text-white font-mono">{progressPercent}%</span>
                            </div>
                        )}

                        <button
                            onClick={onOpenCatalog}
                            className="btn-tech btn-tech-blue px-6 py-2 text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] h-10"
                        >
                            <i className="fa-solid fa-list-check"></i> Checklist
                        </button>
                        <button
                            onClick={handleExportImage}
                            disabled={exporting}
                            className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-slate-700 transition text-white hover:text-blue-400 hover:border-blue-500/50 shadow-lg"
                            title="Exportar Infográfico"
                        >
                            {exporting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-share-nodes"></i>}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- HERO SECTION --- */}
            <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    {coverImg ? (
                        <img src={coverImg} className="w-full h-full object-cover opacity-60 mask-image-gradient-b" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} opacity-20`}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-black/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05060a]/80 via-transparent to-[#05060a]/80"></div>
                </div>

                {/* Central Hero Content */}
                <div className="relative z-10 text-center max-w-6xl px-4 flex flex-col items-center">
                    <div className="mb-4 animate-fade-in-up">
                        <span className={`px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.3em] ${theme.shadow}`}>
                            {event.type}
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white uppercase font-rajdhani leading-[0.85] tracking-tight drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] mb-6 animate-scale-in">
                        {event.name}
                    </h1>

                    {/* Decorative Divider */}
                    <div className="flex items-center gap-4 opacity-70 mb-8 w-full justify-center">
                        <div className="h-px bg-gradient-to-r from-transparent to-white w-24"></div>
                        <div className="w-3 h-3 rotate-45 border border-white"></div>
                        <div className="h-px bg-gradient-to-l from-transparent to-white w-24"></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 text-slate-300 font-rajdhani uppercase tracking-widest text-sm animate-fade-in-up delay-100">
                        <div className="flex flex-col items-center gap-1">
                            <i className="fa-regular fa-calendar text-2xl mb-2 text-blue-400"></i>
                            <span className="font-bold text-white">{dateStr}</span>
                        </div>
                        <div className="h-8 w-px bg-white/20 hidden md:block"></div>
                        <div className="flex flex-col items-center gap-1">
                            <i className="fa-regular fa-clock text-2xl mb-2 text-blue-400"></i>
                            <span className="font-bold text-white">{timeStr}</span>
                        </div>
                        {event.location !== 'Global' && (
                            <>
                                <div className="h-8 w-px bg-white/20 hidden md:block"></div>
                                <div className="flex flex-col items-center gap-1">
                                    <i className="fa-solid fa-map-location-dot text-2xl mb-2 text-red-400"></i>
                                    <span className="font-bold text-white">{event.location}</span>
                                </div>
                            </>
                        )}
                        {/* TICKET INFO ADDED TO HEADER */}
                        {(event.payment?.type !== 'free' || event.payment?.ticket) && (
                            <>
                                <div className="h-8 w-px bg-white/20 hidden md:block"></div>
                                <div className="flex flex-col items-center gap-1">
                                    <i className="fa-solid fa-ticket text-2xl mb-2 text-yellow-400"></i>
                                    <span className="font-bold text-white">
                                        {event.payment?.type === 'paid_event'
                                            ? (event.payment?.cost || 'Pago')
                                            : (event.payment?.ticket?.cost || 'Ingresso')}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT CONTAINER --- */}
            <div className="relative z-10 -mt-20">

                {/* 1. FEATURED / ABOUT (Card Style) */}
                <div className="max-w-[1400px] mx-auto px-6 mb-20">
                    <div className={`grid grid-cols-1 ${event.featured ? 'lg:grid-cols-2' : ''} gap-8`}>
                        {/* Left: Text Info */}
                        <div className="bg-[#151a25]/80 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col justify-center relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                            <div className="absolute -right-10 -bottom-10 text-9xl text-white/5 rotate-12 z-0">
                                <i className="fa-solid fa-circle-info"></i>
                            </div>

                            <h3 className="text-2xl font-black text-white font-rajdhani uppercase tracking-wide mb-6 relative z-10 flex items-center gap-3">
                                <i className="fa-solid fa-newspaper text-blue-500"></i> Informações
                            </h3>

                            <div className="prose prose-invert prose-sm max-w-none relative z-10">
                                {event.research && <p className="text-lg leading-relaxed text-slate-300">{event.research}</p>}
                                {event.customTexts?.[0] && <p className="text-lg leading-relaxed text-slate-300 mt-4">{event.customTexts[0].desc}</p>}

                                {/* TICKET INFO */}
                                {event.payment?.ticket && (
                                    <div className="mt-8">
                                        <TicketCard ticket={event.payment.ticket} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Visual Feature */}
                        {event.featured && (
                            <div className="relative rounded-3xl overflow-hidden min-h-[400px] group border border-white/10 shadow-2xl bg-black">
                                {event.featured.background ? (
                                    <>
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-70"
                                            style={{ backgroundImage: `url(${getBackgroundAsset(event.featured.background)})` }}
                                        ></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-0"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 to-black/80 z-0"></div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center z-10 p-10">
                                    <img
                                        src={event.featured.costume
                                            ? getPokemonAsset(parseInt(event.featured.image.split('/').pop()?.split('.')[0] || '1'), {
                                                costume: event.featured.costume,
                                                form: event.featured.form
                                            })
                                            : event.featured.image}
                                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(236,72,153,0.3)] transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                                    <span className="text-pink-400 font-bold tracking-widest text-xs uppercase mb-1 block">Pokémon em Destaque</span>
                                    <h3 className="text-4xl font-black text-white font-rajdhani uppercase">{event.featured.name}</h3>
                                    {event.featured.shinyRate && (
                                        <div className="flex items-center gap-2 mt-2 text-pink-200 text-sm font-bold">
                                            <i className="fa-solid fa-star text-yellow-400"></i> {event.featured.shinyRate}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAID RESEARCH SECTION */}
                {event.paidResearch && (
                    <div className="max-w-[1400px] mx-auto px-6 mb-20 animate-fade-in-up delay-100">
                        <PaidResearchDisplay research={event.paidResearch} />
                    </div>
                )}

                {/* 2. GAME FEATURES (Bonuses - STRIP/FAIXA) */}
                {event.bonuses.length > 0 && (
                    <div className="w-full bg-slate-900/80 border-y border-white/10 backdrop-blur-sm py-10 mb-24 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                        <div className="absolute inset-0 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] opacity-5"></div>

                        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                            <div className="flex items-center justify-center mb-8 gap-3">
                                <i className="fa-solid fa-gift text-yellow-400 text-xl"></i>
                                <h2 className="text-2xl font-black text-white uppercase font-rajdhani tracking-[0.2em]">Bônus Ativos</h2>
                                <i className="fa-solid fa-gift text-yellow-400 text-xl"></i>
                            </div>

                            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                                {event.bonuses.map((bonus, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                            <i className="fa-solid fa-check text-sm"></i>
                                        </div>
                                        <p className="text-slate-300 font-bold font-rajdhani text-lg uppercase tracking-wide leading-tight max-w-xs group-hover:text-white transition-colors">
                                            {bonus}
                                        </p>
                                    </div>
                                ))}
                                {/* Ticket Bonuses appended if exists */}
                                {event.payment?.ticket?.bonuses?.map((bonus, i) => (
                                    <div key={`ticket-${i}`} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                            <i className="fa-solid fa-ticket text-sm"></i>
                                        </div>
                                        <p className="text-blue-200 font-bold font-rajdhani text-lg uppercase tracking-wide leading-tight max-w-xs group-hover:text-white transition-colors">
                                            {bonus}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. MAIN CONTENT (Spawns, Raids) */}
                <div className="max-w-[1400px] mx-auto px-6">

                    {/* SPAWNS (Collection) */}
                    {event.spawnCategories?.length > 0 && (
                        <div className="mb-32">
                            <SectionHeader title="Habitats & Encontros" subtitle="Complete sua coleção" />

                            <div className="space-y-16">
                                {event.spawnCategories.map((cat, idx) => (
                                    <div key={cat.id} className="relative">
                                        {/* Category Header */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-10 h-10 border-2 border-green-500 rotate-45 flex items-center justify-center">
                                                <div className="w-6 h-6 bg-green-500 -rotate-45 flex items-center justify-center text-black text-xs font-bold">{idx + 1}</div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-green-400 font-rajdhani uppercase tracking-widest">{cat.name}</h3>
                                            <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent"></div>
                                        </div>

                                        {/* Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {cat.spawns.map((s, i) => (
                                                <PokemonCard
                                                    key={i}
                                                    name={s.name}
                                                    image={s.image}
                                                    shiny={s.shiny}
                                                    form={s.form}
                                                    costume={s.costume}
                                                    background={s.background}
                                                    onImageClick={setLightboxImg}
                                                    className="bg-[#151a25] border-white/5 hover:border-green-500/50"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RAIDS & BATTLES */}
                    {(standardRaids.length > 0 || maxBattles.length > 0) && (
                        <div className="mb-32 relative">
                            <div className="absolute inset-0 bg-red-900/5 rounded-[3rem] -m-8 pointer-events-none"></div>

                            <SectionHeader title="Desafios de Combate" subtitle="Prepare sua equipe" />

                            <div className="space-y-12 relative z-10">
                                {maxBattles.length > 0 && (
                                    <div className="bg-[#151a25]/90 border border-fuchsia-500/30 rounded-3xl p-8 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/20 blur-[80px] rounded-full"></div>
                                        <RaidDisplay raids={maxBattles} title="Batalhas Max (Dinamax / Gigamax)" icon="fa-cloud-bolt" colorClass="text-fuchsia-400" />
                                    </div>
                                )}

                                {standardRaids.length > 0 && (
                                    <div className="bg-[#151a25]/90 border border-red-500/30 rounded-3xl p-8">
                                        <RaidDisplay raids={standardRaids} title="Reides Padrão" icon="fa-dragon" colorClass="text-red-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. EGGS STRIP (Full Width) */}
                {event.eggs?.length > 0 && (
                    <div className="w-full bg-[#080a0f] border-y border-white/5 py-16 mb-24 relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] opacity-5"></div>
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

                        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                            <SectionHeader title={event.eggTitle || "Eclosões de Ovos"} subtitle={event.eggDesc || "Pokémon chocando durante o evento"} />

                            <div className="mt-12">
                                <EggDetailDisplay groups={event.eggs} hideTitle={true} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. REMAINING CONTENT (Attacks, Custom) - GALLERY REMOVED */}
                <div className="max-w-[1400px] mx-auto px-6">

                    {/* ATTACKS */}
                    {event.attacks?.length > 0 && (
                        <div className="mb-24">
                            <SectionHeader title="Ataques Exclusivos" subtitle="Evolua para aprender" />
                            <div className="max-w-4xl mx-auto">
                                <AttackDisplay attacks={event.attacks} />
                            </div>
                        </div>
                    )}

                    {/* CUSTOM TEXTS */}
                    {event.customTexts?.slice(1).length > 0 && (
                        <div className="mb-20">
                            <CustomSectionsDisplay sections={event.customTexts.slice(1)} onImageClick={setLightboxImg} />
                        </div>
                    )}
                </div>

            </div>

            {/* --- FOOTER --- */}
            <Footer />
        </div>
    );
};

export default EventDetail;

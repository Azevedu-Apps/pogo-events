
import React, { useState, useEffect } from 'react';
import { PogoEvent, CustomText, Raid, Attack } from '../../types';
import { getTypeIcon } from '../../services/assets';
import { fetchPokemon } from '../../services/pokeapi';
import { RaidCardSkeleton } from '../ui/Skeletons';

export const HeroSection: React.FC<{ event: PogoEvent, onOpenCatalog: () => void }> = ({ event, onOpenCatalog }) => {
    let priceBadge = <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold uppercase">Gratuito</span>;
    if (event.payment?.type === 'paid_event') priceBadge = <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold uppercase">{event.payment.cost}</span>;
    if (event.payment?.type === 'free_ticket') priceBadge = <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase">Gratuito + Ingresso</span>;

    return (
        <div className="relative h-64 md:h-80 bg-slate-900 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] opacity-10"></div>
             {event.cover ? (
                 <img src={event.cover} className="absolute inset-0 w-full h-full object-cover opacity-60" />
             ) : event.featured ? (
                 <div className="absolute -bottom-10 right-0 md:right-20 h-full w-1/2 flex items-end justify-end pointer-events-none opacity-40 md:opacity-100">
                    <img src={event.featured.image} className="h-[120%] object-contain" />
                 </div>
             ) : null}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
             <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                 <div className="flex gap-2 mb-3">
                     <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">{event.type}</span>
                     {priceBadge}
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-6 leading-tight">{event.name}</h1>
                 
                 <button onClick={onOpenCatalog} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-full shadow-lg transition flex items-center gap-2 mx-auto hover:scale-105 active:scale-95 border border-green-400/30">
                     <i className="fa-solid fa-list-check"></i> Abrir Catálogo
                 </button>
             </div>
        </div>
    );
};

export const InfoGrid: React.FC<{ event: PogoEvent }> = ({ event }) => (
    <div className="flex flex-col md:flex-row gap-6 bg-slate-700/30 p-6 rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex-1">
            <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Início</h4>
            <p className="text-white font-medium text-lg"><i className="fa-regular fa-calendar mr-2 text-green-400"></i> {new Date(event.start).toLocaleString()}</p>
        </div>
        <div className="hidden md:block w-px bg-slate-600/50"></div>
        <div className="flex-1">
            <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Fim</h4>
            <p className="text-white font-medium text-lg"><i className="fa-regular fa-calendar-xmark mr-2 text-red-400"></i> {new Date(event.end).toLocaleString()}</p>
        </div>
        {event.location && event.location !== 'Global' && (
            <>
                <div className="hidden md:block w-px bg-slate-600/50"></div>
                <div className="flex-1">
                    <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Local</h4>
                    <p className="text-white font-medium text-lg"><i className="fa-solid fa-map-location-dot mr-2 text-blue-400"></i> {event.location}</p>
                </div>
            </>
        )}
    </div>
);

export const TicketCard: React.FC<{ ticket: NonNullable<PogoEvent['payment']>['ticket'] }> = ({ ticket }) => {
    if (!ticket) return null;
    return (
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl relative overflow-hidden shadow-lg">
            <div className="absolute -right-4 -top-4 text-indigo-500/10 text-9xl"><i className="fa-solid fa-ticket"></i></div>
            <div className="relative z-10">
                <h3 className="text-indigo-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><i className="fa-solid fa-ticket"></i> Ingresso Disponível ({ticket.cost})</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {ticket.bonuses.map((b, i) => (
                        <li key={i} className="text-indigo-100 text-sm flex items-center gap-2"><i className="fa-solid fa-check text-indigo-400"></i> {b}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const FreeResearchDisplay: React.FC<{ research: string }> = ({ research }) => (
    <section className="bg-slate-800 border-l-4 border-indigo-500 rounded-r-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass"></i> Pesquisas Gratuitas
        </h3>
        <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{research}</p>
    </section>
);

export const FeaturedDisplay: React.FC<{ featured: NonNullable<PogoEvent['featured']> }> = ({ featured }) => (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-900/40 to-slate-900 border border-pink-500/30 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 flex-shrink-0">
                <img src={featured.image} className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(236,72,153,0.4)] animate-pulse-slow" />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-pink-500/50 whitespace-nowrap">
                    <span className="text-pink-300 text-xs font-bold uppercase tracking-widest">Destaque</span>
                </div>
            </div>
            
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{featured.name}</h3>
                {featured.shinyRate && (
                    <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/40 rounded-lg px-4 py-2">
                        <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
                        <span className="text-pink-200 text-sm font-bold">{featured.shinyRate}</span>
                    </div>
                )}
            </div>
        </div>
    </section>
);

export const CustomSectionsDisplay: React.FC<{ sections: CustomText[], onImageClick: (url: string) => void }> = ({ sections, onImageClick }) => (
    <div className="space-y-6">
        {sections.map((section, idx) => (
            <div key={idx} className="bg-slate-900/30 border border-slate-700/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-3">{section.title}</h3>
                {section.type === 'text' && <p className="text-slate-300 whitespace-pre-line leading-relaxed">{section.desc}</p>}
                {section.type === 'image' && <img src={section.img} onClick={() => onImageClick(section.img!)} className="w-full max-h-96 object-contain rounded-lg cursor-zoom-in bg-slate-900" />}
                {section.type === 'mixed' && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3 flex-shrink-0">
                            <img src={section.img} onClick={() => onImageClick(section.img!)} className="w-full rounded-lg cursor-zoom-in border border-slate-700" />
                        </div>
                        <div className="md:w-2/3">
                            <p className="text-slate-300 whitespace-pre-line leading-relaxed">{section.desc}</p>
                        </div>
                    </div>
                )}
            </div>
        ))}
    </div>
);

// --- RAID COMPONENTS ---

const RaidCard: React.FC<{ raid: Raid }> = ({ raid }) => {
    const [imgSrc, setImgSrc] = useState<string>('https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        const load = async () => {
            const data = await fetchPokemon(raid.boss);
            if (active && data) {
                setImgSrc(data.image);
            }
            if (active) setLoading(false);
        };
        load();
        return () => { active = false; };
    }, [raid.boss]);

    if (loading) {
        return <RaidCardSkeleton />;
    }

    const isMax = raid.tier === 'Max' || raid.tier === 'Gigamax' || raid.tier === 'Dinamax';
    const isMega = raid.tier === 'Mega';
    const isShadow = raid.tier === 'Shadow';
    
    let containerClass = "bg-slate-800 border-slate-700";
    let tierBadgeClass = "bg-slate-700 text-slate-300";
    let glow = "";

    if (isMax) {
        containerClass = "bg-fuchsia-900/20 border-fuchsia-500/50";
        tierBadgeClass = "bg-fuchsia-600 text-white";
        glow = "shadow-[0_0_15px_rgba(192,38,211,0.2)]";
    } else if (isMega) {
        containerClass = "bg-slate-800 border-pink-500/50";
        tierBadgeClass = "bg-gradient-to-r from-pink-500 to-orange-500 text-white";
    } else if (isShadow) {
        containerClass = "bg-purple-900/20 border-purple-600/50";
        tierBadgeClass = "bg-purple-700 text-white";
    } else if (raid.tier === '5') {
        containerClass = "bg-slate-800 border-slate-600";
        tierBadgeClass = "bg-slate-200 text-slate-900";
    }

    return (
        <div className={`relative rounded-xl border p-3 flex flex-col items-center transition hover:scale-105 ${containerClass} ${glow}`}>
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tierBadgeClass}`}>
                {isMax ? <><i className="fa-solid fa-cloud-bolt mr-1"></i>MAX</> : 
                 isShadow ? <><i className="fa-solid fa-fire mr-1"></i>Shadow</> : 
                 isMega ? 'Mega' : `Nível ${raid.tier}`}
            </div>
            
            <div className="mt-6 w-20 h-20 mb-2 relative">
                <img src={imgSrc} className="w-full h-full object-contain drop-shadow-md" />
                {isShadow && <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full -z-10"></div>}
            </div>
            
            <span className="text-sm font-bold text-white capitalize text-center leading-tight">{raid.boss}</span>
        </div>
    );
}

export const RaidDisplay: React.FC<{ raids: Raid[], title?: string, icon?: string, colorClass?: string }> = ({ 
    raids, 
    title = "Reides", 
    icon = "fa-dragon", 
    colorClass = "text-red-400" 
}) => (
    <section>
         <h3 className={`text-xl font-bold ${colorClass} mb-4 border-b border-slate-700 pb-2 flex items-center gap-2`}>
            <i className={`fa-solid ${icon}`}></i> {title}
         </h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {raids.map((raid, i) => (
                 <RaidCard key={i} raid={raid} />
             ))}
         </div>
    </section>
);

export const AttackDisplay: React.FC<{ attacks: Attack[] }> = ({ attacks }) => (
    <section>
        <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><i className="fa-solid fa-bolt"></i> Ataques em Destaque</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attacks.map((atk, i) => (
                <div key={i} className="bg-slate-700/30 border border-slate-600/50 p-4 rounded-xl flex items-center gap-4">
                    <img src={atk.image} className="w-12 h-12 bg-slate-800 rounded-full p-1 border border-slate-600" />
                    <div>
                        <div className="font-bold text-white capitalize">{atk.pokemon}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <img src={getTypeIcon(atk.type || 'normal')} className="w-4 h-4 object-contain" />
                            <span className="text-purple-300 text-sm font-medium">{atk.move}</span>
                        </div>
                        {atk.method && <div className="text-[10px] text-slate-400 mt-1 italic"><i className="fa-solid fa-circle-info mr-1"></i> {atk.method}</div>}
                    </div>
                </div>
            ))}
        </div>
    </section>
);

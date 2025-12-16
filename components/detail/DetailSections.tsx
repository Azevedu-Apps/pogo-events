
import React from 'react';
import { PogoEvent, CustomText, Raid, Attack } from '../../types';
import { getTypeIcon } from '../../services/assets'; 
import { getEventTheme as getTheme } from '../../utils/visuals'; 
import { PokemonCard } from '../ui/PokemonCard';

// Removed HeroSection as it is now inline in EventDetail for better control

export const TicketCard: React.FC<{ ticket: NonNullable<PogoEvent['payment']>['ticket'] }> = ({ ticket }) => {
    if (!ticket) return null;
    return (
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-5 rounded-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-indigo-500/10 text-8xl"><i className="fa-solid fa-ticket"></i></div>
            <div className="relative z-10">
                <h3 className="text-indigo-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-ticket"></i> Ingresso ({ticket.cost})
                </h3>
                <ul className="space-y-2 mt-3">
                    {ticket.bonuses.map((b, i) => (
                        <li key={i} className="text-indigo-100 text-sm flex items-start gap-2">
                            <i className="fa-solid fa-check text-indigo-400 mt-1 text-xs"></i> 
                            <span className="leading-tight">{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const FreeResearchDisplay: React.FC<{ research: string }> = ({ research }) => (
    <section className="bg-slate-800/50 border-l-4 border-indigo-500 rounded-r-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass"></i> Pesquisas Gratuitas
        </h3>
        <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{research}</p>
    </section>
);

export const FeaturedDisplay: React.FC<{ featured: NonNullable<PogoEvent['featured']> }> = ({ featured }) => (
    // Implementation moved to main page structure for layout flexibility
    null
);

export const CustomSectionsDisplay: React.FC<{ sections: CustomText[], onImageClick: (url: string) => void }> = ({ sections, onImageClick }) => (
    <div className="space-y-24">
        {sections.map((section, idx) => {
            const isEven = idx % 2 === 0;
            return (
                <div key={idx} className="relative group">
                    {/* Decorative Title */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-1 bg-blue-500/50 rounded-full"></div>
                        <h3 className="text-3xl font-black text-white font-rajdhani uppercase tracking-widest text-shadow-sm">{section.title}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                    </div>
                    
                    {section.type === 'text' && (
                        <div className="bg-[#151a25]/60 border-l-2 border-blue-500/50 p-6 md:p-8 rounded-r-2xl backdrop-blur-sm">
                            <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-line">{section.desc}</p>
                        </div>
                    )}
                    
                    {section.type === 'image' && section.img && (
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 group-hover:border-blue-500/30 transition-colors">
                            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none"></div>
                            <img 
                                src={section.img} 
                                onClick={() => onImageClick(section.img!)} 
                                className="w-full h-auto max-h-[600px] object-cover cursor-zoom-in transition-transform duration-700 hover:scale-105" 
                            />
                        </div>
                    )}
                    
                    {section.type === 'mixed' && section.img && (
                        <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 items-center`}>
                            <div className="md:w-1/2 w-full relative group/img">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover/img:opacity-20 transition-opacity"></div>
                                <img 
                                    src={section.img} 
                                    onClick={() => onImageClick(section.img!)} 
                                    className="w-full rounded-2xl cursor-zoom-in border border-white/10 shadow-2xl relative z-10" 
                                />
                            </div>
                            <div className="md:w-1/2 w-full">
                                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-line bg-[#0b0e14]/50 p-6 rounded-xl border border-white/5">
                                    {section.desc}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

export const RaidDisplay: React.FC<{ raids: Raid[], title?: string, icon?: string, colorClass?: string }> = ({ 
    raids, 
    title = "Reides", 
    icon = "fa-dragon", 
    colorClass = "text-red-400" 
}) => (
    <section>
         <h3 className={`text-2xl font-black uppercase tracking-wide ${colorClass} mb-8 flex items-center gap-3`}>
            <i className={`fa-solid ${icon}`}></i> {title}
         </h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
             {raids.map((raid, i) => (
                 <PokemonCard 
                    key={i} 
                    name={raid.boss}
                    image={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${raid.boss.toLowerCase().replace(/\s+/g, '-').replace(/[.'":]/g, '')}.png`}
                    tier={raid.tier}
                    shiny={true} 
                    className="bg-black/40 border-white/5 hover:border-white/20"
                 />
             ))}
         </div>
    </section>
);

export const AttackDisplay: React.FC<{ attacks: Attack[] }> = ({ attacks }) => (
    <section>
        <div className="grid grid-cols-1 gap-4">
            {attacks.map((atk, i) => (
                <div key={i} className="bg-[#1a202c]/80 border border-white/5 p-4 rounded-xl flex items-center gap-5 hover:border-purple-500/40 transition group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md"></div>
                        <img src={atk.image} className="w-14 h-14 bg-slate-900 rounded-full p-1 border border-slate-700 object-contain relative z-10" />
                    </div>
                    <div className="flex-1">
                        <div className="font-black text-white text-lg uppercase font-rajdhani tracking-wide">{atk.pokemon}</div>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded text-xs text-slate-300 font-bold uppercase">
                                <img src={getTypeIcon(atk.type || 'normal')} className="w-3 h-3 object-contain" />
                                {atk.move}
                            </div>
                            {atk.power && <span className="text-[10px] text-slate-400 font-mono border border-slate-700 px-1.5 rounded">PWR {atk.power}</span>}
                        </div>
                        {atk.method && <div className="text-xs text-slate-400 mt-2 italic leading-tight">{atk.method}</div>}
                    </div>
                </div>
            ))}
        </div>
    </section>
);

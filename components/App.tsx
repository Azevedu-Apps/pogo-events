
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { amplifyConfig } from '../services/aws-config';
import { PogoEvent } from '../types';
import { listPogoEvents, createPogoEvent, updatePogoEvent, deletePogoEvent } from '../services/graphql';
import { isAdmin } from '../utils/roles';
import { getEventTheme } from '../utils/visuals';

// Components
import AuthModal from './AuthModal';
import Sidebar from './Sidebar';
import Calendar from './Calendar';
import EventForm from './EventForm';
import EventDetail from './EventDetail';
import Catalog from './Catalog';
import Documentation from './Documentation';
import Pokedex from './Pokedex';
import { ToolsPage } from './ToolsPage'; 
import { ConfirmModal } from './ui/ConfirmModal';
import { EventCardSkeleton } from './ui/Skeletons';

// Configure Amplify immediately
try {
    Amplify.configure(amplifyConfig);
} catch (e) {
    console.error("Amplify config error:", e);
}

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'list' | 'create' | 'calendar' | 'details' | 'catalog' | 'docs' | 'tools' | 'pokedex'>('list');
  const [events, setEvents] = useState<PogoEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial data
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const u = await getCurrentUser();
      setUser(u);
      fetchEvents();
    } catch {
      setUser(null);
      // Even if auth fails, we try to fetch public events
      fetchEvents();
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const client = generateClient();
    try {
      const result: any = await client.graphql({
        query: listPogoEvents,
        authMode: 'apiKey'
      });
      
      const items = result.data.listPogoEvents.items;
      const parsedEvents: PogoEvent[] = items.map((item: any) => {
        let paymentApp: PogoEvent['payment'] = undefined;
        if (item.payment) {
            paymentApp = {
                type: item.payment.type,
                cost: item.payment.cost,
                ticket: {
                    cost: item.payment.ticketCost,
                    bonuses: item.payment.ticketBonuses || []
                }
            };
        }

        let featuredApp = undefined;
        if (item.featured) {
            featuredApp = {
                name: item.featured.name,
                image: item.featured.image,
                shinyRate: 'Shiny: Padrão'
            };
        }

        return {
          ...item,
          spawnCategories: item.spawnCategories ? JSON.parse(item.spawnCategories) : [],
          attacks: item.attacks ? JSON.parse(item.attacks) : [],
          raidsList: item.raidsList ? JSON.parse(item.raidsList) : [],
          customTexts: item.customTexts ? JSON.parse(item.customTexts) : [],
          eggs: item.eggs ? JSON.parse(item.eggs) : [],
          bonuses: item.bonuses || [],
          images: item.images || [],
          payment: paymentApp,
          featured: featuredApp,
          paidResearch: item.paidResearch,
        };
      });
      
      parsedEvents.sort((a, b) => {
          const timeA = new Date(a.start).getTime();
          const timeB = new Date(b.start).getTime();
          if (isNaN(timeA)) return 1;
          if (isNaN(timeB)) return -1;
          return timeB - timeA;
      });
      
      setEvents(parsedEvents);
    } catch (e) {
      console.error("Error fetching events", e);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAWS = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    // Don't clear events, public can see them
    setView('list'); 
  };

  const handleSaveEvent = async (event: PogoEvent) => {
    if (!isAdmin(user)) {
        alert("Você não tem permissão para salvar eventos.");
        return;
    }

    setLoading(true);
    const client = generateClient();
    try {
        const paymentPayload = event.payment ? {
            type: event.payment.type,
            cost: event.payment.cost,
            ticketCost: event.payment.ticket?.cost,
            ticketBonuses: event.payment.ticket?.bonuses || []
        } : null;

        const featuredPayload = event.featured ? {
            name: event.featured.name,
            image: event.featured.image
        } : null;

        const payload = {
            id: event.id,
            name: event.name,
            type: event.type,
            start: formatDateForAWS(event.start),
            end: formatDateForAWS(event.end),
            location: event.location,
            cover: event.cover,
            research: event.research,
            eggTitle: event.eggTitle,
            eggDesc: event.eggDesc,
            bonuses: event.bonuses,
            images: event.images,
            spawnCategories: JSON.stringify(event.spawnCategories),
            attacks: JSON.stringify(event.attacks),
            raidsList: JSON.stringify(event.raidsList),
            customTexts: JSON.stringify(event.customTexts),
            eggs: JSON.stringify(event.eggs),
            payment: paymentPayload, 
            featured: featuredPayload,
            paidResearch: event.paidResearch 
        };

        if (events.find(e => e.id === event.id)) {
            await client.graphql({
              query: updatePogoEvent,
              variables: { input: payload },
              authMode: 'apiKey'
            });
        } else {
            await client.graphql({
              query: createPogoEvent,
              variables: { input: payload },
              authMode: 'apiKey'
            });
        }

        setTimeout(() => {
          fetchEvents();
          setView('list');
        }, 1000);
        
    } catch (e: any) {
        console.error("Error saving event", e);
        const msg = e.errors ? e.errors.map((err: any) => err.message).join(', ') : e.message;
        alert(`Erro ao salvar evento: ${msg || 'Verifique o console'}`);
    } finally {
        setLoading(false);
    }
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteConfirm({ show: true, id });
  };

  const executeDelete = async () => {
      if (!deleteConfirm.id) return;
      if (!isAdmin(user)) {
          alert("Apenas administradores podem excluir eventos.");
          setDeleteConfirm({ show: false, id: null });
          return;
      }
      
      setIsDeleting(true);
      const client = generateClient();
      
      try {
         await client.graphql({
            query: deletePogoEvent,
            variables: { input: { id: String(deleteConfirm.id) } },
            authMode: 'apiKey'
         });
         
         setDeleteConfirm({ show: false, id: null });
         await fetchEvents(); 
      } catch(err: any) {
         console.error("Erro ao deletar:", err);
         const msg = err.errors ? err.errors.map((e:any) => e.message).join(', ') : err.message;
         alert("Erro ao deletar: " + msg);
      } finally {
         setIsDeleting(false);
      }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Render Logic
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

    switch (view) {
      case 'create':
        if (!isAdmin(user)) {
             return (
                 <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in">
                     <div className="w-24 h-24 bg-red-900/20 border border-red-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)] transform -skew-x-12">
                        <i className="fa-solid fa-user-lock text-4xl text-red-500 transform skew-x-12"></i>
                     </div>
                     <h2 className="text-3xl font-black text-white mb-2 font-rajdhani uppercase tracking-widest text-glow">Acesso Não Autorizado</h2>
                     <p className="text-red-400 font-mono text-sm max-w-md mb-8 border-l-2 border-red-500 pl-4 bg-red-950/20 py-2">
                        ERRO 403: Privilégios insuficientes.<br/>
                        Acesso ao módulo de criação restrito a administradores.
                     </p>
                     <button onClick={() => setView('list')} className="text-cyan-400 hover:text-white font-bold transition font-rajdhani uppercase tracking-widest border border-cyan-500/50 px-8 py-3 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <i className="fa-solid fa-arrow-left mr-2"></i> Retornar ao Dashboard
                     </button>
                 </div>
             );
        }
        return <EventForm 
            initialData={selectedEvent} 
            onSave={handleSaveEvent} 
            onCancel={() => { setSelectedEventId(null); setView('list'); }} 
        />;
      case 'calendar':
        // @ts-ignore
        return <Calendar events={events} onEventClick={(id) => { setSelectedEventId(id); setView('details'); }} />;
      case 'details':
        return selectedEvent ? <EventDetail 
            event={selectedEvent} 
            onBack={() => setView('list')} 
            onOpenCatalog={() => setView('catalog')}
        /> : <div>Evento não encontrado</div>;
      case 'catalog':
        return selectedEvent ? <Catalog event={selectedEvent} user={user} onBack={() => setView('details')} /> : <div>Err</div>;
      case 'tools':
        return <ToolsPage events={events} />;
      case 'pokedex':
        return <Pokedex user={user} />;
      case 'docs':
        if (!isAdmin(user)) return <div>Acesso restrito</div>;
        return <Documentation />;
      case 'list':
      default:
        return (
          <>
            {/* --- HERO BANNER (Top Featured - First event in list) --- */}
            {events.length > 0 && events[0].featured && (
                <div 
                    className="w-full h-[350px] rounded-3xl mb-12 relative overflow-hidden group cursor-pointer border border-blue-900/50 shadow-2xl bg-black" 
                    onClick={() => { setSelectedEventId(events[0].id); setView('details'); }}
                >
                    {/* Background Tech Grid */}
                    <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
                    
                    {/* Image */}
                    <div className="absolute inset-0">
                        {events[0].cover ? (
                            <img src={events[0].cover} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/60 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center p-10 md:p-16">
                        <div className="max-w-3xl relative z-10 animate-fade-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px w-8 bg-blue-500"></div>
                                <span className="text-blue-400 font-bold font-rajdhani uppercase tracking-[0.2em] text-sm">Destaque Principal</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black text-white uppercase font-rajdhani leading-[0.85] mb-6 italic transform -skew-x-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] text-outline group-hover:text-white transition-all duration-500">
                                {events[0].name}
                            </h1>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Início</span>
                                    <span className="text-xl text-white font-rajdhani font-bold">{new Date(events[0].start).toLocaleDateString()}</span>
                                </div>
                                <div className="h-8 w-px bg-slate-700 transform skew-x-12"></div>
                                <button className="btn-tech btn-tech-blue w-auto inline-flex px-8 py-2 text-sm">
                                    Acessar Dados
                                </button>
                            </div>
                        </div>

                        {/* Hero Character */}
                        {events[0].featured && (
                            <div className="absolute right-[-20px] top-0 bottom-0 w-1/2 hidden md:flex items-center justify-center pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-l from-blue-500/10 to-transparent mix-blend-overlay"></div>
                                <img 
                                    src={events[0].featured.image} 
                                    className="h-[130%] object-contain drop-shadow-[0_0_50px_rgba(37,99,235,0.4)] group-hover:scale-110 transition duration-700" 
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- EVENTS GRID HEADER --- */}
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
                <h2 className="text-4xl font-black text-white font-rajdhani uppercase flex items-center gap-3 tracking-tighter italic">
                    <span className="text-blue-500">///</span>
                    Event Database
                </h2>
                {isAdmin(user) && (
                    <button onClick={() => setView('create')} className="btn-tech btn-tech-green w-auto px-6 py-2 text-sm">
                        <i className="fa-solid fa-plus"></i> Novo Registro
                    </button>
                )}
            </div>

            {/* --- JJK STYLE CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {events.map((evt, index) => {
                    const theme = getEventTheme(evt.type);
                    const startDate = new Date(evt.start);
                    
                    const day = startDate.getDate().toString().padStart(2, '0');
                    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = startDate.getFullYear().toString().slice(-2);

                    let coverImg = evt.cover || (evt.images && evt.images[0]) || (evt.featured ? evt.featured.image : 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg');
                    
                    // Specific border/glow colors based on theme
                    let borderColor = "border-blue-500/30 group-hover:border-blue-400";
                    let textColor = "text-blue-100";
                    let stripeColor = "text-blue-500";
                    
                    if (theme.border.includes('red')) { borderColor = "border-red-500/30 group-hover:border-red-400"; textColor = "text-red-100"; stripeColor = "text-red-500"; }
                    if (theme.border.includes('yellow')) { borderColor = "border-yellow-500/30 group-hover:border-yellow-400"; textColor = "text-yellow-100"; stripeColor = "text-yellow-500"; }
                    if (theme.border.includes('emerald')) { borderColor = "border-emerald-500/30 group-hover:border-emerald-400"; textColor = "text-emerald-100"; stripeColor = "text-emerald-500"; }
                    if (theme.border.includes('fuchsia')) { borderColor = "border-fuchsia-500/30 group-hover:border-fuchsia-400"; textColor = "text-fuchsia-100"; stripeColor = "text-fuchsia-500"; }

                    return (
                        <div 
                            key={evt.id} 
                            onClick={() => { setSelectedEventId(evt.id); setView('details'); }}
                            className={`
                                group relative h-[280px] rounded-3xl overflow-hidden cursor-pointer
                                bg-[#0f131a] border ${borderColor} transition-all duration-500
                                hover:shadow-[0_0_40px_rgba(0,0,0,0.6)] hover:-translate-y-1
                            `}
                        >
                            {/* --- BACKGROUND LAYERS --- */}
                            <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
                            
                            {/* Masked Image on Right */}
                            <div className="absolute top-0 right-0 w-[65%] h-full overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-l from-transparent via-[#0f131a]/20 to-[#0f131a] z-10`}></div>
                                <img 
                                    src={coverImg} 
                                    className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 filter grayscale group-hover:grayscale-0"
                                />
                            </div>

                            {/* --- DECORATIONS (JJK STYLE) --- */}
                            
                            {/* Top Right Corner Tech */}
                            <div className="absolute top-4 right-4 flex items-center gap-1 z-20 opacity-50">
                                <div className={`w-1.5 h-1.5 rounded-full ${stripeColor.replace('text-', 'bg-')}`}></div>
                                <div className={`w-1.5 h-1.5 rounded-full ${stripeColor.replace('text-', 'bg-')}`}></div>
                                <div className={`w-1.5 h-1.5 rounded-full ${stripeColor.replace('text-', 'bg-')}`}></div>
                                <span className="font-mono text-xs text-white ml-2 tracking-widest">SYS.0{index + 1}</span>
                            </div>

                            {/* Bottom Right Stripes */}
                            <div className={`absolute bottom-0 right-6 w-24 h-4 bg-stripe-pattern ${stripeColor} transform -skew-x-12 z-20`}></div>

                            {/* Left Vertical Tech Text */}
                            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 -rotate-90 origin-center opacity-30 pointer-events-none hidden sm:block">
                                <span className="text-xs font-mono tracking-[0.3em] text-white uppercase whitespace-nowrap">
                                    POKEMON GO EVENT PROTOCOL // {year}
                                </span>
                            </div>

                            {/* --- CONTENT (Left Aligned) --- */}
                            <div className="absolute inset-0 p-6 z-20 flex flex-col justify-between pl-8">
                                
                                {/* Header: Type */}
                                <div className="flex flex-col items-start">
                                    <div className={`
                                        text-xs font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${borderColor} ${textColor}
                                        bg-black/40 backdrop-blur mb-1
                                    `}>
                                        [{evt.type}]
                                    </div>
                                </div>

                                {/* Body: Title & Date */}
                                <div className="relative">
                                    {/* Giant Title */}
                                    <h3 className="text-4xl font-black text-white uppercase font-rajdhani leading-[0.85] italic mb-3 drop-shadow-lg max-w-[80%]">
                                        {evt.name}
                                    </h3>
                                    
                                    {/* Stylized Date Box */}
                                    <div className="flex items-center gap-2">
                                        <div className={`flex text-2xl font-black font-rajdhani ${stripeColor} tracking-tighter`}>
                                            <span>{day}</span>
                                            <span className="mx-1 text-slate-600">/</span>
                                            <span>{month}</span>
                                            <span className="mx-1 text-slate-600">/</span>
                                            <span>{year}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Line */}
                                <div className="flex items-center gap-2 mt-2">
                                    {/* STATUS BADGE WOULD GO HERE */}
                                </div>
                            </div>

                            {/* --- ADMIN ACTIONS --- */}
                            {isAdmin(user) && (
                                <div className="absolute top-4 right-14 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEventId(evt.id); setView('create'); }}
                                        className="bg-black/50 hover:bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded border border-white/10"
                                    >
                                        <i className="fa-solid fa-pen text-xs"></i>
                                    </button>
                                    <button 
                                        onClick={(e) => requestDelete(evt.id, e)}
                                        className="bg-black/50 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded border border-white/10"
                                    >
                                        <i className="fa-solid fa-trash text-xs"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-blue-500/30">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={() => { setShowAuthModal(false); checkAuth(); }} />
      
      <ConfirmModal 
        isOpen={deleteConfirm.show} 
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />

      <Sidebar 
          user={user} 
          currentView={view} 
          setView={(v) => { setSelectedEventId(null); setView(v); }} 
          onLogout={handleLogout}
          onLogin={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0b0e14]/80 backdrop-blur sticky top-0 z-30">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest hidden md:block font-rajdhani">
                Dashboard / {view === 'list' ? 'Visão Geral' : view.toUpperCase()}
            </div>
            
            <div className="flex items-center gap-6 ml-auto">
                <div className="bg-[#151a25] px-4 py-2 rounded-sm border border-white/5 flex items-center gap-3 shadow-sm">
                    <span className="text-xs font-bold text-blue-400 uppercase font-rajdhani tracking-wider">Season 12</span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <span className="text-xs font-bold text-slate-400 font-mono">v2.5.0</span>
                </div>
                
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-white font-rajdhani uppercase tracking-wide">{user.username}</div>
                            <div className="text-xs text-green-400 font-bold uppercase tracking-widest">Online</div>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 p-0.5 transform -skew-x-12 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                            <div className="w-full h-full bg-[#0b0e14] flex items-center justify-center text-xs font-bold text-white transform skew-x-12">
                                {user.username?.substring(0,2).toUpperCase()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>

        <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
             {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

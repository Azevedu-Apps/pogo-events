
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { amplifyConfig } from './services/aws-config';
import { PogoEvent } from './types';
import { listPogoEvents, createPogoEvent, updatePogoEvent, deletePogoEvent } from './services/graphql';

// Components
import AuthModal from './components/AuthModal';
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';
import Catalog from './components/Catalog';
import { ConfirmModal } from './components/ui/ConfirmModal';

// Configure Amplify
Amplify.configure(amplifyConfig);
const client = generateClient();

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'list' | 'create' | 'calendar' | 'details' | 'catalog'>('list');
  const [events, setEvents] = useState<PogoEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial data from AWS on mount/auth
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      fetchEvents();
    } catch {
      setUser(null);
      setShowAuthModal(true);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Use raw GraphQL query
      const result: any = await client.graphql({
        query: listPogoEvents,
        authMode: 'apiKey'
      });
      
      const items = result.data.listPogoEvents.items;
      
      const parsedEvents: PogoEvent[] = items.map((item: any) => {
        // --- DATA MAPPING (AWS -> APP) ---
        
        // Reconstruct Payment (Flat Backend -> Nested App)
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

        // Reconstruct Featured
        let featuredApp = undefined;
        if (item.featured) {
            featuredApp = {
                name: item.featured.name,
                image: item.featured.image,
                // Backend doesn't store shinyRate, set default
                shinyRate: 'Shiny: Padrão'
            };
        }

        return {
          ...item,
          // Parse JSON fields stored as strings in DynamoDB
          spawnCategories: item.spawnCategories ? JSON.parse(item.spawnCategories) : [],
          attacks: item.attacks ? JSON.parse(item.attacks) : [],
          raidsList: item.raidsList ? JSON.parse(item.raidsList) : [],
          customTexts: item.customTexts ? JSON.parse(item.customTexts) : [],
          eggs: item.eggs ? JSON.parse(item.eggs) : [],
          bonuses: item.bonuses || [],
          images: item.images || [],
          // Use mapped objects
          payment: paymentApp,
          featured: featuredApp,
          paidResearch: item.paidResearch, // Structure matches (name, cost, details)
        };
      });
      
      // Sort by start date desc
      parsedEvents.sort((a, b) => {
          const timeA = new Date(a.start).getTime();
          const timeB = new Date(b.start).getTime();
          // Handle invalid dates safely
          if (isNaN(timeA)) return 1;
          if (isNaN(timeB)) return -1;
          return timeB - timeA;
      });
      
      setEvents(parsedEvents);
    } catch (e) {
      console.error("Error fetching events", e);
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
    setEvents([]);
    setShowAuthModal(true);
  };

  const handleSaveEvent = async (event: PogoEvent) => {
    setLoading(true);
    try {
        // --- DATA MAPPING (APP -> AWS) ---

        // Map Payment (Nested App -> Flat Backend)
        const paymentPayload = event.payment ? {
            type: event.payment.type,
            cost: event.payment.cost,
            ticketCost: event.payment.ticket?.cost,
            ticketBonuses: event.payment.ticket?.bonuses || []
        } : null;

        // Map Featured (Strip unsupported fields like shinyRate)
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
            // JSON Fields (Stringified)
            spawnCategories: JSON.stringify(event.spawnCategories),
            attacks: JSON.stringify(event.attacks),
            raidsList: JSON.stringify(event.raidsList),
            customTexts: JSON.stringify(event.customTexts),
            eggs: JSON.stringify(event.eggs),
            // Custom Types (Passed as Objects)
            payment: paymentPayload, 
            featured: featuredPayload,
            paidResearch: event.paidResearch 
        };

        if (events.find(e => e.id === event.id)) {
            // Update
            await client.graphql({
              query: updatePogoEvent,
              variables: { input: payload },
              authMode: 'apiKey'
            });
        } else {
            // Create
            await client.graphql({
              query: createPogoEvent,
              variables: { input: payload },
              authMode: 'apiKey'
            });
        }

        // Wait a moment for AppSync
        setTimeout(() => {
          fetchEvents();
          setView('list');
        }, 1000);
        
    } catch (e: any) {
        console.error("Error saving event", e);
        // Show detailed error if available
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
      
      setIsDeleting(true);
      console.log("Tentando deletar evento ID:", deleteConfirm.id);
      
      try {
         await client.graphql({
            query: deletePogoEvent,
            variables: { input: { id: String(deleteConfirm.id) } },
            authMode: 'apiKey'
         });
         
         console.log("Evento deletado com sucesso.");
         setDeleteConfirm({ show: false, id: null });
         // Refresh list from server to ensure it's gone
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
    if (loading) return <div className="flex justify-center py-20"><div className="loader w-12 h-12 border-4 border-blue-500"></div></div>;

    switch (view) {
      case 'create':
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
        return selectedEvent ? <Catalog event={selectedEvent} onBack={() => setView('details')} /> : <div>Err</div>;
      case 'list':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500 flex flex-col items-center">
                    <i className="fa-regular fa-calendar-xmark text-4xl mb-4 opacity-50"></i>
                    <p className="mb-4">Nenhum evento encontrado na nuvem.</p>
                    <button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition">
                        <i className="fa-solid fa-plus mr-2"></i> Criar Evento
                    </button>
                </div>
            )}
            {events.map(evt => {
                // Date Formatting
                const start = evt.start ? new Date(evt.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '???';
                const end = evt.end ? new Date(evt.end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '???';
                
                // Cover Image Logic
                let coverImg = evt.cover || (evt.images && evt.images[0]) || (evt.featured ? evt.featured.image : 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg');
                const coverClass = (evt.cover || (evt.images && evt.images.length > 0)) ? 'object-cover' : (evt.featured ? 'object-contain p-4' : 'object-cover opacity-20 scale-150');
                
                // Price Badge Logic
                let priceBadge = <span className="bg-green-600/90 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Gratuito</span>;
                if (evt.payment?.type === 'paid_event') priceBadge = <span className="bg-red-600/90 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">{evt.payment.cost}</span>;
                else if (evt.payment?.type === 'free_ticket') priceBadge = <span className="bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Gratuito + Ticket</span>;

                return (
                  <div key={evt.id} className="event-card bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md flex flex-col h-full hover:border-blue-500 transition cursor-pointer" onClick={() => { setSelectedEventId(evt.id); setView('details'); }}>
                    <div className="h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900 to-purple-900"></div>
                        <img 
                            src={coverImg} 
                            className={`h-full w-full ${coverClass} relative z-10 transition group-hover:scale-105 duration-500`}
                            onError={(e) => { e.currentTarget.src='https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg'; e.currentTarget.style.opacity='0.2'; }}
                        />
                        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
                            <span className="bg-black/60 backdrop-blur text-xs px-2 py-1 rounded text-white font-bold">{evt.type}</span>
                            {priceBadge}
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-1 leading-tight hover:text-blue-400 transition">{evt.name}</h3>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <i className="fa-regular fa-clock"></i> {start} - {end}
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-2 border-t border-slate-700/50 pt-4">
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedEventId(evt.id); setView('catalog'); }} 
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-2 rounded-lg transition font-bold shadow-md flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-list-check"></i> Catálogo
                                </button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <button 
                                    onClick={(e) => requestDelete(evt.id, e)} 
                                    className="text-red-400 hover:text-red-300 text-sm transition px-2 py-1 rounded hover:bg-red-900/20 flex items-center gap-1"
                                >
                                    <i className="fa-solid fa-trash"></i> Excluir
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEventId(evt.id); setView('create'); }} 
                                        className="text-slate-400 hover:text-white text-sm px-2 py-1 transition"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedEventId(evt.id); setView('details'); }} 
                                        className="bg-slate-700 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg transition font-bold"
                                    >
                                        Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                );
            })}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={() => { setUser({ userId: 'user' }); setShowAuthModal(false); fetchEvents(); }} />
      
      <ConfirmModal 
        isOpen={deleteConfirm.show} 
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita e removerá os dados da nuvem."
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />

      {/* Header */}
      <header className="bg-slate-800 shadow-lg sticky top-0 z-40 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('list')}>
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><i className="fa-solid fa-location-dot text-white"></i></div>
             <h1 className="text-xl font-bold text-slate-100 tracking-wide">Pogo<span className="text-blue-500">Events</span></h1>
          </div>
          
          <nav className="flex gap-6 font-bold text-slate-400 text-sm">
            <button onClick={() => setView('list')} className={`${view === 'list' ? 'text-blue-400 border-b-2 border-blue-400' : ''} py-1 hover:text-white transition`}>Meus Eventos</button>
            <button onClick={() => setView('calendar')} className={`${view === 'calendar' ? 'text-blue-400 border-b-2 border-blue-400' : ''} py-1 hover:text-white transition`}>Calendário</button>
            <button onClick={() => { setSelectedEventId(null); setView('create'); }} className={`${view === 'create' ? 'text-blue-400 border-b-2 border-blue-400' : ''} py-1 hover:text-white transition`}>Criar Evento</button>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
             {user ? 
                <button onClick={handleLogout} className="text-red-400 text-xs font-bold border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/20">SAIR</button> :
                <button onClick={() => setShowAuthModal(true)} className="text-blue-400 text-xs font-bold">LOGIN</button>
             }
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

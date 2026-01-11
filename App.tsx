import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { amplifyConfig } from './services/aws-config';
import { PogoEvent } from './types';
import { listPogoEvents } from './services/graphql';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import { ToolsPage } from './components/ToolsPage';
import { Dashboard } from './components/Dashboard';
import { EventCardSkeleton } from './components/ui/Skeletons';
import { Button } from './components/ui/Shared';
import { Footer } from './components/Footer';

// New Route Components
import { Home } from './components/Home';
import { EventDetailWrapper, CatalogWrapper } from './components/RouteWrappers';

// Configure Amplify
try {
    Amplify.configure(amplifyConfig);
} catch (e) {
    console.error("Amplify config error:", e);
}

function App() {
    const [events, setEvents] = useState<PogoEvent[]>([]);
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

            // Filter: Strictly events from the current year (or future)
            const filtered = parsedEvents.filter(e => {
                const startDate = new Date(e.start);
                return startDate.getFullYear() >= currentYear;
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

    if (loading) {
        return (
            <div className="flex h-screen bg-[#0b0e14] items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse p-10 w-full max-w-[1600px]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="flex h-screen bg-[#0b0e14] items-center justify-center p-10">
                <div className="flex flex-col items-center justify-center p-20 text-center bg-red-900/10 border border-red-900/30 rounded-3xl">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 text-6xl mb-6"></i>
                    <h2 className="text-2xl font-bold text-white mb-2">Erro de Rede</h2>
                    <p className="text-slate-400 mb-8">{apiError}</p>
                    <Button onClick={fetchEvents}><i className="fa-solid fa-rotate-right mr-2"></i> Reestabelecer Conexão</Button>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="flex h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
                <Sidebar />
                <main className="flex-1 h-full overflow-y-auto relative scrollbar-hide">
                    <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0b0e14]/80 backdrop-blur sticky top-0 z-30">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest hidden md:block font-rajdhani">
                            Vorgex / SYSTEM
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
                        <Routes>
                            <Route path="/" element={<Home events={events} />} />
                            <Route path="/dashboard" element={<Dashboard events={events} onNavigate={() => { }} />} />
                            <Route path="/calendar" element={<Calendar events={events} />} />
                            <Route path="/tools" element={<ToolsPage events={events} />} />
                            <Route path="/event/:id" element={<EventDetailWrapper events={events} />} />
                            <Route path="/event/:id/catalog" element={<CatalogWrapper events={events} />} />
                            {/* Fallback for Assets or unknown routes */}
                            <Route path="*" element={<Home events={events} />} />
                        </Routes>
                    </div>
                    <Footer />
                </main>
            </div>
        </Router>
    );
};

export default App;

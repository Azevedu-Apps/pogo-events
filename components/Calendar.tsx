
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PogoEvent } from '../types';
import { getEventTheme } from '../utils/visuals';
import { captureAndDownload } from '../utils/capture';

interface CalendarProps {
    events: PogoEvent[];
    onEventClick: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [exporting, setExporting] = useState(false);
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    const [hoverInfo, setHoverInfo] = useState<{
        event: PogoEvent;
        x: number;
        y: number;
        align: 'left' | 'right';
        verticalAlign?: 'top' | 'bottom';
    } | null>(null);

    const hoverTimeout = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        };
    }, []);

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    // --- COLOR GENERATION LOGIC ---
    // Muted/Softer Palette (Darker shades with borders for definition)
    const EVENT_COLORS = [
        "bg-red-900/90 border-red-700 text-red-100",
        "bg-orange-900/90 border-orange-700 text-orange-100",
        "bg-amber-900/90 border-amber-700 text-amber-100",
        "bg-yellow-900/90 border-yellow-700 text-yellow-100",
        "bg-lime-900/90 border-lime-700 text-lime-100",
        "bg-green-900/90 border-green-700 text-green-100",
        "bg-emerald-900/90 border-emerald-700 text-emerald-100",
        "bg-teal-900/90 border-teal-700 text-teal-100",
        "bg-cyan-900/90 border-cyan-700 text-cyan-100",
        "bg-sky-900/90 border-sky-700 text-sky-100",
        "bg-blue-900/90 border-blue-700 text-blue-100",
        "bg-indigo-900/90 border-indigo-700 text-indigo-100",
        "bg-violet-900/90 border-violet-700 text-violet-100",
        "bg-purple-900/90 border-purple-700 text-purple-100",
        "bg-fuchsia-900/90 border-fuchsia-700 text-fuchsia-100",
        "bg-pink-900/90 border-pink-700 text-pink-100",
        "bg-rose-900/90 border-rose-700 text-rose-100",
        "bg-slate-800 border-slate-600 text-slate-200",
        "bg-stone-800 border-stone-600 text-stone-200"
    ];

    const getEventColor = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % EVENT_COLORS.length;
        return EVENT_COLORS[index];
    };

    // --- CALENDAR GRID LOGIC ---
    const calendarData = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start on Sunday

        const endDate = new Date(lastDayOfMonth);
        if (endDate.getDay() !== 6) {
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
        }

        const weeks = [];
        let currentWeek = [];
        let dayIterator = new Date(startDate);

        while (dayIterator <= endDate) {
            currentWeek.push(new Date(dayIterator));
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            dayIterator.setDate(dayIterator.getDate() + 1);
        }
        return weeks;
    }, [year, month]);

    // --- EVENT POSITIONING LOGIC ---
    const getWeekEvents = (weekStart: Date, weekEnd: Date) => {
        // 1. Filter events overlapping this week
        const weekEvents = events.filter(evt => {
            if (!evt.start) return false;
            const start = new Date(evt.start);
            const end = evt.end ? new Date(evt.end) : new Date(start.getTime() + 3600000); // Default 1h

            // Normalize to day boundaries
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            const ws = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
            const we = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());

            return s <= we && e >= ws;
        });

        // 2. Sort: Longest duration first, then earlier start date
        weekEvents.sort((a, b) => {
            const durA = (new Date(a.end || a.start).getTime() - new Date(a.start).getTime());
            const durB = (new Date(b.end || b.start).getTime() - new Date(b.start).getTime());
            if (durA !== durB) return durB - durA;
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        });

        // 3. Assign Slots
        const slots: (string | null)[][] = []; // slots[row][col_0_to_6] = eventId
        const eventPositions: any[] = [];

        weekEvents.forEach(evt => {
            const start = new Date(evt.start);
            const end = evt.end ? new Date(evt.end) : new Date(start.getTime() + 3600000);

            // Determine visual start/end index (0-6)
            let startIndex = 0;
            let span = 7;

            // If starts after week start
            if (start > weekStart) {
                startIndex = Math.floor((start.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
            }

            // Calculate end relative to week start
            const eventEndIndex = Math.floor((end.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

            // Clamp span
            span = Math.min(7, eventEndIndex + 1) - startIndex;

            // Clamp negative (shouldn't happen with filter but safe)
            if (startIndex < 0) startIndex = 0;
            if (startIndex + span > 7) span = 7 - startIndex;

            // Find first available slot row
            let slotRow = 0;
            while (true) {
                if (!slots[slotRow]) slots[slotRow] = Array(7).fill(null);

                let fits = true;
                for (let i = startIndex; i < startIndex + span; i++) {
                    if (slots[slotRow][i] !== null) {
                        fits = false;
                        break;
                    }
                }

                if (fits) {
                    // Mark slots
                    for (let i = startIndex; i < startIndex + span; i++) {
                        slots[slotRow][i] = evt.id;
                    }

                    // Visual Logic
                    const isStart = start >= weekStart;
                    const isEnd = end <= weekEnd;

                    eventPositions.push({
                        event: evt,
                        startIndex,
                        span,
                        slotRow,
                        isStart,
                        isEnd
                    });
                    break;
                }
                slotRow++;
            }
        });

        return { positions: eventPositions, totalSlots: slots.length };
    };

    const handleMouseEnter = (e: React.MouseEvent, evt: PogoEvent) => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }

        setHoveredEventId(evt.id);

        const rect = e.currentTarget.getBoundingClientRect();

        // Horizontal Logic
        let align: 'left' | 'right' = 'right';
        let x = rect.right;

        const spaceOnRight = window.innerWidth - rect.right;
        const spaceOnLeft = rect.left;

        if (spaceOnRight < 350) {
            // Not enough space on right.
            if (spaceOnLeft >= 350) {
                // Place on Left (Outside)
                align = 'left';
                x = rect.left;
            } else {
                // Not enough space on Left either (Wide event)
                // Align Right but anchored to Left Edge (Inside/Overlap)
                align = 'right';
                x = rect.left;
            }
        } else {
            // Space available on right, prefer right
            align = 'right';
            x = rect.right;

            // Optimization: If event is essentially on the right half, maybe prefer left?
            // Existing code used center-split. Let's keep it if collision check passes?
            // Actually, the center-split was what caused the issue (assuming fitting).
            // Let's rely purely on "Available Space".
            // If we have space on Right, use Right. It's standard reading order (LTR).
            // However, for elements strictly on the Right Side, tooltip on Left is conventional.
            if (rect.left > window.innerWidth / 2 && spaceOnLeft >= 350) {
                align = 'left';
                x = rect.left;
            }
        }

        setHoverInfo({
            event: evt,
            x: x,
            y: rect.top,
            align: align,
            verticalAlign: rect.top > window.innerHeight - 350 ? 'bottom' : 'top'
        });
    };

    const handleMouseLeave = () => {
        setHoveredEventId(null);
        hoverTimeout.current = setTimeout(() => {
            setHoverInfo(null);
        }, 100);
    };

    const handleExport = () => {
        captureAndDownload({
            nodeId: 'calendar-capture',
            fileName: `calendario-${monthNames[month]}-${year}`.toLowerCase(),
            scale: 2,
            onStart: () => setExporting(true),
            onEnd: () => setExporting(false)
        });
    };

    return (
        <div className="flex flex-col gap-6 relative animate-fade-in pb-20">

            {/* HOVER TOOLTIP PORTAL */}
            {hoverInfo && !exporting && createPortal(
                <div
                    className="fixed z-[9999] w-80 pointer-events-none"
                    style={{
                        top: hoverInfo.verticalAlign === 'top' ? hoverInfo.y - 10 : 'auto',
                        bottom: hoverInfo.verticalAlign === 'bottom' ? (window.innerHeight - hoverInfo.y) - 10 : 'auto',
                        left: hoverInfo.align === 'right' ? hoverInfo.x + 10 : 'auto',
                        right: hoverInfo.align === 'left' ? (window.innerWidth - hoverInfo.x) + 10 : 'auto'
                    }}
                >
                    <EventHoverCard event={hoverInfo.event} />
                </div>,
                document.body
            )}

            {/* HEADER CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#151a25] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex bg-[#0b0e14] rounded-full p-1 border border-white/10">
                        <button onClick={() => changeMonth(-1)} className="w-10 h-10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button onClick={() => changeMonth(1)} className="w-10 h-10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-white font-rajdhani uppercase tracking-wide leading-none">
                            {monthNames[month]} <span className="text-blue-500">{year}</span>
                        </h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">System Date</span>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="btn-tech btn-tech-blue relative z-10"
                >
                    {exporting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>}
                    Exportar Visual
                </button>
            </div>

            {/* CALENDAR GRID */}
            <div id="calendar-capture" className="bg-[#151a25] rounded-3xl shadow-2xl border border-white/5 overflow-hidden font-sans">

                {/* Days Header */}
                <div className="grid grid-cols-7 bg-[#0f131a] border-b border-white/5">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest font-rajdhani">
                            {d}
                        </div>
                    ))}
                </div>

                {/* WEEKS */}
                <div className="flex flex-col border-b border-white/5 bg-[#0b0e14]">
                    {calendarData.map((week, wIdx) => {
                        const { positions, totalSlots } = getWeekEvents(week[0], week[6]);
                        // Ensure minimum height for cell (roughly 120px) + slots
                        const minHeight = Math.max(120, (totalSlots * 28) + 40);

                        return (
                            <div key={wIdx} className="relative border-b border-white/5 last:border-0" style={{ height: minHeight }}>
                                {/* Background Grid Cells */}
                                <div className="absolute inset-0 grid grid-cols-7 divide-x divide-white/5">
                                    {week.map((day, dIdx) => {
                                        const isToday = day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() && day.getFullYear() === new Date().getFullYear();
                                        const isCurrentMonth = day.getMonth() === month;

                                        return (
                                            <div key={dIdx} className={`
                                        h-full p-2 transition-all duration-300
                                        ${isCurrentMonth ? 'bg-[#151a25]/50' : 'bg-[#0b0e14] opacity-50'}
                                        ${isToday ? 'bg-blue-900/10 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.6)]' : ''}
                                    `}>
                                                <div className={`
                                            w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold font-mono mb-1
                                            ${isToday ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-110' : 'text-slate-400'}
                                        `}>
                                                    {day.getDate()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Events Layer */}
                                <div className="absolute inset-0 top-10 px-1 pointer-events-none">
                                    {/* Grid container for alignment reference, though we use absolute percentages */}
                                    <div className="w-full h-full relative">
                                        {positions.map((pos, pIdx) => {
                                            // Identify Single Day Event
                                            const isSingleDay = pos.span === 1 && pos.isStart && pos.isEnd;

                                            // Calculate Color: Neutral for single day, Hash for others
                                            const bgClass = isSingleDay
                                                ? "bg-slate-700/90 border-slate-500 text-slate-200 hover:bg-slate-600"
                                                : getEventColor(pos.event.id);

                                            // Determine styling based on continuity
                                            const roundedLeft = pos.isStart ? 'rounded-l-md' : '';
                                            const roundedRight = pos.isEnd ? 'rounded-r-md' : '';

                                            // Highlighting Logic
                                            const isHovered = hoveredEventId === pos.event.id;
                                            const isAnyHovered = hoveredEventId !== null;

                                            let interactionClass = '';

                                            if (isHovered) {
                                                // Active Focused Item
                                                interactionClass = 'ring-2 ring-white z-50 brightness-110 scale-[1.01] opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]';
                                            } else if (isAnyHovered) {
                                                // Others when one is active (Dimmed)
                                                interactionClass = 'opacity-30 grayscale-[50%] scale-95 blur-[0.5px]';
                                            } else {
                                                // Default State
                                                interactionClass = 'opacity-90 hover:opacity-100 hover:brightness-110';
                                            }

                                            // Spacing/Size Logic
                                            let leftStyle = '';
                                            let widthStyle = '';

                                            if (isSingleDay) {
                                                leftStyle = `calc(${((pos.startIndex * 100) / 7)}% + 1.8%)`;
                                                widthStyle = `calc(${((pos.span * 100) / 7)}% - 3.6%)`;
                                            } else {
                                                const leftGap = pos.isStart ? '4px' : '0px';
                                                const rightGap = pos.isEnd ? '4px' : '0px';
                                                leftStyle = `calc(${((pos.startIndex * 100) / 7)}% + ${leftGap})`;
                                                widthStyle = `calc(${((pos.span * 100) / 7)}% - ${leftGap} - ${rightGap})`;
                                            }

                                            return (
                                                <div
                                                    key={pIdx}
                                                    onClick={() => onEventClick(pos.event.id)}
                                                    onMouseEnter={(e) => handleMouseEnter(e, pos.event)}
                                                    onMouseLeave={handleMouseLeave}
                                                    className={`
                                                absolute h-6 text-xs flex items-center px-2 cursor-pointer pointer-events-auto
                                                shadow-md border font-bold tracking-wide transition-all duration-300 ease-out
                                                ${bgClass} ${roundedLeft} ${roundedRight}
                                                ${interactionClass}
                                            `}
                                                    style={{
                                                        left: leftStyle,
                                                        width: widthStyle,
                                                        top: `${pos.slotRow * 28}px`,
                                                    }}
                                                >
                                                    <span className="truncate drop-shadow-md w-full sticky left-2">
                                                        {pos.isStart || pos.startIndex === 0 ? pos.event.name : ''}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- HOVER CARD COMPONENT ---
const EventHoverCard: React.FC<{ event: PogoEvent }> = ({ event }) => {
    const theme = getEventTheme(event.type);

    const formatTime = (dStr: string) => {
        if (!dStr) return '';
        const d = new Date(dStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    let coverImg = event.cover || (event.images && event.images[0]) || (event.featured ? event.featured.image : null);

    return (
        <div className={`neo-popover relative ring-1 ${theme.border.replace('border-', 'ring-')}`}>
            {/* Header Image */}
            <div className={`h-28 w-full relative overflow-hidden ${theme.gradient}`}>
                <div className="absolute inset-0 opacity-20 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')]"></div>
                {coverImg && (
                    <img
                        src={coverImg}
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                )}
                {/* Tech Overlay Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px] opacity-20"></div>

                <div className="absolute bottom-3 left-4 right-4 z-10">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded shadow-lg backdrop-blur-md ${theme.badge} border border-white/20 mb-1.5`}>
                        <i className={`fa-solid ${theme.icon} text-white text-xs`}></i>
                        <span className="text-white text-xs font-black uppercase tracking-widest">{event.type}</span>
                    </div>
                    <h3 className="text-base font-black text-white leading-tight drop-shadow-md line-clamp-2 font-rajdhani uppercase">{event.name}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-[#0b0e14]/95 backdrop-blur">
                <div className="text-xs font-medium text-slate-300 mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 bg-[#151a25] p-1.5 rounded border border-white/5">
                        <i className="fa-regular fa-clock text-blue-400 w-4 text-center"></i>
                        <span className="font-mono">{formatTime(event.start)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#151a25] p-1.5 rounded border border-white/5">
                        <i className="fa-solid fa-flag-checkered text-red-400 w-4 text-center"></i>
                        <span className="font-mono">{formatTime(event.end)}</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-2 mb-3 pt-2 border-t border-white/5">
                    {event.bonuses?.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-200 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-700/50">
                            <i className="fa-solid fa-gift text-yellow-500"></i> {event.bonuses.length} Bônus
                        </div>
                    )}
                    {(event.raidsList?.length > 0) && (
                        <div className="flex items-center gap-1.5 text-xs text-red-200 bg-red-900/20 px-2 py-1 rounded border border-red-700/50">
                            <i className="fa-solid fa-dragon text-red-500"></i> Reides
                        </div>
                    )}
                </div>

                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-t border-white/5 pt-2 flex items-center justify-center gap-2">
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    Clique para detalhes
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                </div>
            </div>
        </div>
    );
}

export default Calendar;

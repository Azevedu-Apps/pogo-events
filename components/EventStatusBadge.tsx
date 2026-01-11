import React, { useState, useEffect } from 'react';

export const EventStatusBadge = ({ start, end }: { start: string, end: string }) => {
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

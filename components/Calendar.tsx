import React, { useState } from 'react';
import { PogoEvent } from '../types';

interface CalendarProps {
  events: PogoEvent[];
  onEventClick: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(evt => {
      if (!evt.start) return false;
      const start = new Date(evt.start);
      const end = evt.end ? new Date(evt.end) : start;
      
      // Normalize comparison to simple date objects without time
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const c = new Date(year, month, day);
      
      // Check if current day is within range
      return c >= s && c <= e;
    });
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
        <button onClick={() => changeMonth(-1)} className="bg-slate-700 hover:bg-slate-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="text-2xl font-bold text-white capitalize">{monthNames[month]} {year}</h2>
        <button onClick={() => changeMonth(1)} className="bg-slate-700 hover:bg-slate-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-900 border-b border-slate-700">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-700">
          {Array.from({ length: firstDay }).map((_, i) => (
             <div key={`empty-${i}`} className="min-h-[100px] bg-slate-900 opacity-50 p-2"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const dayEvents = getEventsForDay(day);

            return (
              <div key={day} className={`min-h-[100px] bg-slate-800 p-1 flex flex-col hover:bg-slate-750 transition ${isToday ? 'bg-slate-800 ring-1 ring-inset ring-blue-500' : ''}`}>
                <span className={`text-xs font-bold mb-1 ml-1 ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{day}</span>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                  {dayEvents.map(evt => {
                     let colorClass = "bg-green-600";
                     const t = (evt.type || '').toLowerCase();
                     if (t.includes('comunidade')) colorClass = "bg-blue-600";
                     else if (t.includes('destaque')) colorClass = "bg-orange-600";
                     else if (t.includes('reide') || t.includes('raid')) colorClass = "bg-red-600";
                     else if (t.includes('sazonal')) colorClass = "bg-purple-600";
                     
                     return (
                       <div 
                        key={evt.id} 
                        onClick={() => onEventClick(evt.id)}
                        className={`${colorClass} text-[10px] text-white px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80`}
                        title={evt.name}
                       >
                         {evt.name}
                       </div>
                     )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
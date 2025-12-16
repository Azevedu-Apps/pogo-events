
import React, { useState } from 'react';
import { isAdmin } from '../utils/roles';

interface SidebarProps {
  user: any;
  currentView: string;
  setView: (view: any) => void;
  onLogout: () => void;
  onLogin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, setView, onLogout, onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isUserAdmin = isAdmin(user);

  const menuItems = [
    { id: 'list', label: 'Eventos', icon: 'fa-solid fa-gamepad', admin: false },
    { id: 'pokedex', label: 'Pokédex', icon: 'fa-solid fa-book-open', admin: false, protected: true },
    { id: 'calendar', label: 'Calendário', icon: 'fa-solid fa-calendar-days', admin: false },
    { id: 'tools', label: 'Ferramentas', icon: 'fa-solid fa-screwdriver-wrench', admin: false },
    { id: 'create', label: 'Criar Evento', icon: 'fa-solid fa-plus-circle', admin: true },
    { id: 'docs', label: 'Database', icon: 'fa-solid fa-database', admin: true },
  ];

  const handleNavigation = (viewId: string) => {
    setView(viewId);
    setIsOpen(false);
  };

  const NavItem = ({ item }: { item: any }) => {
    if (item.admin && !isUserAdmin) return null;
    if (item.protected && !user) return null;

    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => handleNavigation(item.id)}
        className={`w-full sidebar-link ${isActive ? 'active' : ''}`}
      >
        <i className={`${item.icon} w-5 text-center`}></i>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0b0e14]/95 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-xl">
         <div className="flex items-center gap-2">
             <i className="fa-solid fa-dragon text-blue-500 text-xl"></i>
             <span className="font-rajdhani font-black text-xl text-white uppercase tracking-wider">POGO<span className="text-blue-500">HUB</span></span>
         </div>
         <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white p-2">
            <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
         </button>
      </div>

      {/* Overlay */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 w-64 flex flex-col 
        bg-[#0f131a] border-r border-white/5 transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:h-screen pt-20 md:pt-0
      `}>
        {/* Desktop Logo Area */}
        <div className="hidden md:flex p-8 items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-dragon text-white text-xl"></i>
            </div>
            <div>
                <h1 className="text-2xl font-black text-white leading-none tracking-wide font-rajdhani">POGO<span className="text-blue-500">HUB</span></h1>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-0.5">Dashboard</span>
            </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            <div className="px-3 mb-2 mt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-rajdhani">Menu Principal</h3>
            </div>
            <NavItem item={menuItems[0]} />
            <NavItem item={menuItems[1]} />
            <NavItem item={menuItems[2]} />
            <NavItem item={menuItems[3]} />

            {isUserAdmin && (
                <>
                    <div className="px-3 mb-2 mt-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-rajdhani">Admin</h3>
                    </div>
                    <NavItem item={menuItems[4]} />
                    <NavItem item={menuItems[5]} />
                </>
            )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0b0e14]">
            {user ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#151a25] border border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                            {user.username?.substring(0,2).toUpperCase() || 'US'}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-bold text-white truncate font-rajdhani uppercase">{user.signInDetails?.loginId || user.username}</span>
                            <span className="text-xs text-blue-400 truncate uppercase tracking-wider font-bold">{isUserAdmin ? 'Admin' : 'Membro'}</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="text-slate-500 hover:text-red-400 w-8 h-8 flex items-center justify-center transition-all rounded-full hover:bg-white/5" title="Sair">
                        <i className="fa-solid fa-power-off"></i>
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onLogin} 
                    className="btn-tech btn-tech-blue w-full"
                >
                    <i className="fa-solid fa-right-to-bracket"></i> <span>Conectar</span>
                </button>
            )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

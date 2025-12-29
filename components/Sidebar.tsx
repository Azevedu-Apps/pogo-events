
import React, { useState, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import { createUserFeedback } from '../services/graphql';
import { Modal, TextArea, Button, Input, Select } from './ui/Shared';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  user?: any;
  onLogout?: () => void;
  onLogin?: () => void;
}

const CATEGORIES = [
    { id: 'feature', label: 'Nova Funcionalidade' },
    { id: 'bug', label: 'Bug / Reporte de Erro' },
    { id: 'performance', label: 'Performance / Lentidão' },
    { id: 'accessibility', label: 'Acessibilidade' },
    { id: 'design', label: 'Interface / Design' },
    { id: 'data', label: 'Correção de Dados' },
    { id: 'other', label: 'Outros' },
];

// --- SUB-COMPONENT: NAV ITEM ---
// Fixed: Move NavItem outside of Sidebar and use proper prop types to resolve TypeScript error regarding 'key' prop.
interface NavItemProps {
  item: { id: string; label: string; icon: string };
  isActive: boolean;
  onClick: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick }) => (
  <button
    onClick={() => onClick(item.id)}
    className={`w-full sidebar-link ${isActive ? 'active' : ''}`}
  >
    <i className={`${item.icon} w-5 text-center`}></i>
    <span>{item.label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout, onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [category, setCategory] = useState('feature');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [occuredAt, setOccuredAt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'list', label: 'Eventos', icon: 'fa-solid fa-radar' },
    { id: 'calendar', label: 'Calendário', icon: 'fa-solid fa-calendar-days' },
    { id: 'tools', label: 'Ferramentas', icon: 'fa-solid fa-screwdriver-wrench' },
  ];

  const handleNavigation = (viewId: string) => {
    setView(viewId);
    setIsOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCategory('feature');
    setTitle('');
    setContent('');
    setOccuredAt('');
    setImagePreview(null);
  };

  const handleSubmitFeedback = async () => {
    if (!content.trim() || !title.trim()) return;

    setIsSending(true);
    const client = generateClient();

    try {
      await client.graphql({
        query: createUserFeedback,
        variables: {
          input: {
            title,
            content,
            category,
            userEmail: user?.email || 'Anônimo',
            deviceInfo: navigator.userAgent,
            imageUrl: imagePreview || undefined,
            occuredAt: occuredAt ? new Date(occuredAt).toISOString() : undefined
          }
        },
        authMode: 'apiKey'
      });

      alert('Feedback transmitido com sucesso! A central analisará seu reporte.');
      resetForm();
      setShowSuggestionModal(false);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert('Falha na transmissão. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0b0e14]/95 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-xl">
         <div className="flex items-center gap-2">
             <i className="fa-solid fa-location-crosshairs text-blue-500 text-xl"></i>
             <span className="font-rajdhani font-black text-xl text-white uppercase tracking-wider">CATCH<span className="text-blue-500">NEXUS</span></span>
         </div>
         <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white p-2">
            <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
         </button>
      </div>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 w-64 flex flex-col 
        bg-[#0f131a] border-r border-white/5 transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:h-screen pt-20 md:pt-0
      `}>
        <div className="hidden md:flex p-8 items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-location-crosshairs text-white text-xl"></i>
            </div>
            <div>
                <h1 className="text-2xl font-black text-white leading-none tracking-wide font-rajdhani uppercase">CATCH<span className="text-blue-500">NEXUS</span></h1>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Creature Intel</span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            <div className="px-3 mb-2 mt-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-rajdhani">Navegação Principal</h3>
            </div>
            {/* Fixed: Use NavItem with updated props and outside definition to avoid 'key' prop TS error */}
            {menuItems.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                isActive={currentView === item.id} 
                onClick={handleNavigation} 
              />
            ))}

            <div className="px-3 mb-2 mt-8">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-rajdhani">Perfil</h3>
            </div>
            {user ? (
                <button
                    onClick={onLogout}
                    className="w-full sidebar-link text-red-400 hover:bg-red-500/10"
                >
                    <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
                    <span>Desconectar</span>
                </button>
            ) : (
                <button
                    onClick={onLogin}
                    className="w-full sidebar-link text-blue-400 hover:bg-blue-500/10"
                >
                    <i className="fa-solid fa-right-to-bracket w-5 text-center"></i>
                    <span>Acessar</span>
                </button>
            )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#0b0e14] text-center">
            <button 
                onClick={() => setShowSuggestionModal(true)}
                className="text-[10px] text-blue-500/70 hover:text-blue-400 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full"
            >
                <i className="fa-solid fa-comment-dots"></i>
                Enviar Feedback
            </button>
        </div>
      </aside>

      {/* SUGGESTION / FEEDBACK MODAL */}
      <Modal 
        isOpen={showSuggestionModal} 
        onClose={() => setShowSuggestionModal(false)} 
        title="Protocolo de Feedback Nexus"
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                <p className="text-base text-blue-300 leading-relaxed italic">
                    "Detectamos uma nova entrada de dados do sistema. Selecione a categoria e forneça os detalhes para processamento."
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                    label="Categoria do Reporte"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </Select>

                <Input 
                    label="Resumo / Título"
                    placeholder="Ex: Inconsistência no contador de variantes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            {category === 'bug' && (
                <div className="animate-fade-in">
                    <Input 
                        label="Data e Hora do Incidente"
                        type="datetime-local"
                        value={occuredAt}
                        onChange={(e) => setOccuredAt(e.target.value)}
                        ref={dateInputRef}
                        onClick={(e) => {
                            try {
                                if ((e.target as any).showPicker) {
                                    (e.target as any).showPicker();
                                }
                            } catch (err) {}
                        }}
                    />
                </div>
            )}

            {/* Image Uploader */}
            <div className="space-y-2 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                <label className="block text-base font-bold text-slate-400 uppercase tracking-widest font-rajdhani ml-1">Evidência Visual (PNG/JPG)</label>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400 transition bg-black/20 overflow-hidden group"
                    >
                        {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-cover group-hover:opacity-50 transition" alt="Preview" />
                        ) : (
                            <>
                                <i className="fa-solid fa-camera text-2xl"></i>
                                <span className="text-[10px] font-bold uppercase tracking-widest font-rajdhani">Anexar</span>
                            </>
                        )}
                    </button>
                    {imagePreview && (
                        <button onClick={() => setImagePreview(null)} className="text-red-500 hover:text-white text-sm font-bold uppercase tracking-widest bg-red-900/20 px-4 py-2 rounded border border-red-500/30 font-rajdhani">
                            Remover
                        </button>
                    )}
                    <input 
                        type="file" 
                        accept="image/jpeg,image/png" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                    />
                </div>
            </div>

            <TextArea 
                label="Descrição Detalhada"
                placeholder="Descreva aqui sua sugestão ou o erro passo-a-passo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-56"
                required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                    onClick={() => { setShowSuggestionModal(false); resetForm(); }}
                    className="px-6 py-2 text-slate-500 hover:text-white font-bold uppercase text-base tracking-widest transition font-rajdhani"
                >
                    Cancelar
                </button>
                <Button 
                    onClick={handleSubmitFeedback} 
                    disabled={isSending || !content.trim() || !title.trim()}
                    className="min-w-[180px]"
                >
                    {isSending ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-satellite-dish mr-2"></i>}
                    {isSending ? 'Transmitindo...' : 'Transmitir Dados'}
                </Button>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;


import React, { useState, useEffect } from 'react';
import { PogoEvent, SpawnCategory, Attack, Raid, CustomText, EggGroup } from '../types';
import { Button } from './ui/Shared';
import { GeneralInfoSection, BonusSection, FreeResearchSection, PaidResearchSection, CustomTextSection, FeaturedSection, GallerySection } from './form/FormSections';
import { SpawnSection, EggSection, AttackSection, RaidSection } from './form/SpawnEggForm';
import { TOOLBOX_ITEMS } from '../utils/constants';

interface EventFormProps {
  initialData?: PogoEvent;
  onSave: (event: PogoEvent) => void;
  onCancel: () => void;
}

// Internal State Types for the Builder
interface SectionItem {
    id: string;
    type: string;
    data: any;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSave, onCancel }) => {
  // 1. General Info (Fixed Section)
  const [generalData, setGeneralData] = useState<Partial<PogoEvent>>({
    name: '', type: 'Evento Sazonal', location: 'Global', 
    payment: { type: 'free', cost: '', ticket: { cost: '', bonuses: [] } },
    cover: '', start: '', end: ''
  });
  
  const [bonuses, setBonuses] = useState<string[]>([]);
  
  // 2. Dynamic Sections (Drag & Drop Canvas)
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isGeneralCollapsed, setIsGeneralCollapsed] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (initialData) {
        setGeneralData({
            id: initialData.id,
            name: initialData.name,
            type: initialData.type,
            location: initialData.location,
            payment: initialData.payment,
            cover: initialData.cover,
            start: initialData.start,
            end: initialData.end
        });
        setBonuses(initialData.bonuses || []);

        const loadedSections: SectionItem[] = [];
        
        // Reconstruct sections from flat structure
        if (initialData.research) loadedSections.push({ id: 'res-free', type: 'research_free', data: initialData.research });
        if (initialData.paidResearch?.name) loadedSections.push({ id: 'res-paid', type: 'research_paid', data: initialData.paidResearch });
        if (initialData.featured) loadedSections.push({ id: 'feat', type: 'featured', data: initialData.featured });
        
        initialData.spawnCategories?.forEach((cat, i) => 
            loadedSections.push({ id: `spawn-${i}`, type: 'spawns', data: cat })
        );

        // Raids need to be split
        const stdRaids = initialData.raidsList?.filter(r => !r.tier.startsWith('Max') && r.tier !== 'Gigamax' && r.tier !== 'Dinamax') || [];
        const maxBattles = initialData.raidsList?.filter(r => r.tier.startsWith('Max') || r.tier === 'Gigamax' || r.tier === 'Dinamax') || [];

        if (stdRaids.length > 0) loadedSections.push({ id: 'raids', type: 'raids', data: stdRaids });
        if (maxBattles.length > 0) loadedSections.push({ id: 'max', type: 'max_battles', data: maxBattles });

        if (initialData.eggs && initialData.eggs.length > 0) {
            loadedSections.push({ id: 'eggs', type: 'eggs', data: { title: initialData.eggTitle || 'Ovos', desc: initialData.eggDesc || '', eggs: initialData.eggs } });
        }

        if (initialData.attacks && initialData.attacks.length > 0) {
            loadedSections.push({ id: 'atk', type: 'attacks', data: initialData.attacks });
        }

        if (initialData.images && initialData.images.length > 0) {
            loadedSections.push({ id: 'gallery', type: 'gallery', data: initialData.images });
        }

        initialData.customTexts?.forEach((ct, i) => 
            loadedSections.push({ id: `custom-${i}`, type: 'custom', data: ct })
        );

        setSections(loadedSections);
        setIsGeneralCollapsed(true); // Auto collapse on edit to show content
    }
  }, [initialData]);

  // --- DRAG & DROP LOGIC (HTML5 Native) ---
  const handleDragStart = (e: React.DragEvent, type: string) => {
      e.dataTransfer.setData("type", type);
      e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("type");
      if (!type) return;
      addSection(type);
  };

  const addSection = (type: string) => {
      const newId = `${type}-${Date.now()}`;
      let defaultData: any = {};

      switch(type) {
          case 'featured': defaultData = { name: '', image: '', shinyRate: 'Shiny: Padrão' }; break;
          case 'research_free': defaultData = ''; break;
          case 'research_paid': defaultData = { name: 'Pesquisa', cost: 'R$ 5,00', details: '' }; break;
          case 'spawns': defaultData = { id: Date.now(), name: 'Novos Spawns', spawns: [] }; break;
          case 'raids': defaultData = []; break;
          case 'max_battles': defaultData = []; break;
          case 'eggs': defaultData = { title: 'Eclosões', desc: '', eggs: [] }; break;
          case 'attacks': defaultData = []; break;
          case 'gallery': defaultData = []; break;
          case 'custom': defaultData = { type: 'text', title: 'Título', desc: '' }; break;
      }

      setSections(prev => [...prev, { id: newId, type, data: defaultData }]);
  };

  // --- SECTION MANAGEMENT ---
  const updateSection = (id: string, newData: any) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, data: newData } : s));
  };

  const removeSection = (id: string) => {
      setSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === sections.length - 1) return;
      
      const newSections = [...sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      setSections(newSections);
  };

  // --- SAVE LOGIC ---
  const handleSave = () => {
      // Reconstruct flat PogoEvent
      const event: any = {
          ...generalData,
          bonuses,
          // Defaults for arrays
          spawnCategories: [],
          raidsList: [],
          customTexts: [],
          images: [],
          attacks: [],
          eggs: [],
          // Nullables
          featured: null,
          research: null,
          paidResearch: null,
          eggTitle: null,
          eggDesc: null
      };

      // Merge sections back
      sections.forEach(s => {
          if (s.type === 'featured') event.featured = s.data;
          if (s.type === 'research_free') event.research = s.data;
          if (s.type === 'research_paid') event.paidResearch = s.data;
          if (s.type === 'spawns') event.spawnCategories.push(s.data);
          
          if (s.type === 'raids') event.raidsList.push(...s.data);
          if (s.type === 'max_battles') event.raidsList.push(...s.data);

          if (s.type === 'eggs') {
              event.eggs = s.data.eggs;
              event.eggTitle = s.data.title;
              event.eggDesc = s.data.desc;
          }

          if (s.type === 'attacks') event.attacks = s.data;
          if (s.type === 'gallery') event.images = s.data;
          if (s.type === 'custom') event.customTexts.push(s.data);
      });

      onSave(event as PogoEvent);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
        
        {/* LEFT TOOLBOX (Sticky) */}
        <div className="lg:w-72 bg-[#0b0e14] border-r border-slate-800 flex flex-col overflow-hidden h-full shadow-2xl z-20">
            <div className="p-5 border-b border-slate-800 bg-[#0f131a]">
                <h3 className="font-black text-white uppercase text-sm tracking-widest font-rajdhani flex items-center gap-2">
                    <i className="fa-solid fa-boxes-stacked text-blue-500"></i> Módulos
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Arraste para o blueprint</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {TOOLBOX_ITEMS.map(item => (
                    <div 
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.type)}
                        className="bg-[#151a25] hover:bg-[#1c2230] p-4 rounded border-l-4 border-slate-700 hover:border-blue-500 cursor-move flex items-center gap-4 transition group shadow-md"
                    >
                        <div className={`w-8 h-8 rounded bg-slate-900 flex items-center justify-center ${item.color} shadow-inner`}>
                            <i className={item.icon}></i>
                        </div>
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white uppercase font-rajdhani tracking-wide">{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-800 text-center">
                <Button onClick={onCancel} variant="secondary" className="w-full mb-2">Cancelar</Button>
                <Button onClick={handleSave} className="w-full">Salvar Evento</Button>
            </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex flex-col bg-[#05060a] relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }}>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8 relative z-10" onDragOver={handleDragOver} onDrop={handleDrop}>
                
                {/* Header Title */}
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.5)] transform -skew-x-12 border border-blue-400">
                        <i className="fa-solid fa-pen-ruler transform skew-x-12"></i>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white font-rajdhani uppercase tracking-wide">{initialData ? 'Editor de Evento' : 'Novo Blueprint'}</h2>
                        <p className="text-slate-500 text-sm font-mono">ID: {initialData?.id || 'NEW_ENTRY'}</p>
                    </div>
                </div>

                {/* 1. GENERAL INFO (FIXED) */}
                <div className="bg-[#151a25] border border-slate-700 shadow-xl relative transition-all group">
                    {/* Tech Corner Accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>

                    <div className="bg-[#0f131a] p-4 border-b border-slate-700 flex justify-between items-center cursor-pointer select-none hover:bg-[#1a202c] transition" onClick={() => setIsGeneralCollapsed(!isGeneralCollapsed)}>
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-circle-info text-blue-500"></i>
                            <h3 className="font-bold text-white uppercase tracking-widest font-rajdhani">Configurações Principais</h3>
                        </div>
                        <i className={`fa-solid fa-chevron-${isGeneralCollapsed ? 'down' : 'up'} text-slate-500`}></i>
                    </div>
                    
                    {!isGeneralCollapsed && (
                        <div className="p-8 space-y-10 animate-fade-in">
                            <GeneralInfoSection data={generalData} onChange={(f, v) => setGeneralData(prev => ({ ...prev, [f]: v }))} />
                            <BonusSection bonuses={bonuses} onChange={setBonuses} />
                        </div>
                    )}
                </div>

                {/* 2. DYNAMIC SECTIONS */}
                {sections.length === 0 && (
                     <div className="border-2 border-dashed border-slate-800 bg-[#0b0e14]/50 rounded-xl p-20 text-center text-slate-600 flex flex-col items-center justify-center transition hover:border-blue-500/30 hover:text-slate-400 hover:bg-[#0b0e14]">
                         <i className="fa-solid fa-microchip text-6xl mb-6 opacity-20"></i>
                         <h3 className="text-xl font-bold uppercase font-rajdhani mb-2">Área de Montagem Vazia</h3>
                         <p className="text-sm">Arraste módulos do painel esquerdo para começar a construir.</p>
                     </div>
                )}

                {sections.map((section, idx) => {
                    const def = TOOLBOX_ITEMS.find(t => t.type === section.type);
                    return (
                        <div key={section.id} className="bg-[#151a25] border border-slate-800 shadow-lg relative group animate-fade-in hover:border-slate-600 transition-all">
                            {/* Decorative Bar Left */}
                            <div className={`absolute top-0 bottom-0 left-0 w-1 ${def?.color.replace('text-', 'bg-').replace('-400', '-600')}`}></div>

                            {/* SECTION HEADER / CONTROLS */}
                            <div className="bg-[#0f131a]/50 p-3 pl-5 border-b border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <i className={`${def?.icon} ${def?.color}`}></i>
                                    <span className="font-bold text-slate-200 text-sm uppercase tracking-widest font-rajdhani">{def?.label}</span>
                                </div>
                                <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition">
                                    <button onClick={() => moveSection(idx, 'up')} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"><i className="fa-solid fa-arrow-up"></i></button>
                                    <button onClick={() => moveSection(idx, 'down')} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"><i className="fa-solid fa-arrow-down"></i></button>
                                    <button onClick={() => removeSection(section.id)} className="w-8 h-8 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition border border-red-900/30 ml-2"><i className="fa-solid fa-times"></i></button>
                                </div>
                            </div>

                            {/* SECTION CONTENT */}
                            <div className="p-6">
                                {section.type === 'featured' && <FeaturedSection data={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'research_free' && <FreeResearchSection research={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'research_paid' && <PaidResearchSection data={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'spawns' && <SpawnSection data={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'raids' && <RaidSection raids={section.data} onChange={d => updateSection(section.id, d)} type="standard" />}
                                {section.type === 'max_battles' && <RaidSection raids={section.data} onChange={d => updateSection(section.id, d)} type="max" />}
                                {section.type === 'eggs' && <EggSection data={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'attacks' && <AttackSection attacks={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'gallery' && <GallerySection images={section.data} onChange={d => updateSection(section.id, d)} />}
                                {section.type === 'custom' && <CustomTextSection data={section.data} onChange={d => updateSection(section.id, d)} />}
                            </div>
                        </div>
                    );
                })}

                <div className="h-24"></div> {/* Bottom Spacer */}
            </div>
        </div>
    </div>
  );
};

export default EventForm;

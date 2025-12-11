
import React, { useState } from 'react';
import { PogoEvent, SpawnCategory, Attack, Raid, CustomText, EggGroup } from '../types';
import { Button, Input, SectionTitle, TextArea } from './ui/Shared';
import { GeneralInfoSection, PaymentSection, CustomTextSection, FeaturedSection } from './form/FormSections';
import { SpawnSection, EggSection, AttackSection, StandardRaidForm, MaxBattleForm } from './form/SpawnEggForm';

interface EventFormProps {
  initialData?: PogoEvent;
  onSave: (event: PogoEvent) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PogoEvent>>(initialData || {
    name: '', type: 'Evento Sazonal', location: 'Global', bonuses: [], images: [], 
    spawnCategories: [], attacks: [], raidsList: [], customTexts: [], eggs: [],
    payment: { type: 'free', cost: '', ticket: { cost: '', bonuses: [] } },
    paidResearch: { name: '', cost: '', details: '' },
    featured: undefined
  });

  const [newBonus, setNewBonus] = useState('');
  const [newImage, setNewImage] = useState('');

  const handleChange = (field: keyof PogoEvent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBonus = () => {
    if (!newBonus) return;
    handleChange('bonuses', [...(formData.bonuses || []), newBonus]);
    setNewBonus('');
  };

  const addImage = () => {
    if (!newImage) return;
    handleChange('images', [...(formData.images || []), newImage]);
    setNewImage('');
  };

  const save = (e: React.MouseEvent) => {
    e.preventDefault();
    // Ensure ID is a string for AWS compatibility
    onSave({ ...formData, id: formData.id || Date.now().toString() } as PogoEvent);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden text-slate-200">
      <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900 flex items-center justify-between px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="%23ffffff" fill-opacity="1"><circle cx="3" cy="3" r="3"/><circle cx="13" cy="13" r="3"/></g></svg>')`}}></div>
        <h2 className="text-3xl font-bold text-white relative z-10"><i className="fa-solid fa-calendar-plus mr-3"></i>{initialData ? 'Editar Evento' : 'Criar Evento'}</h2>
        <Button onClick={() => setFormData({
            ...formData,
            name: "Dia Comunitário: Tudo em Um", type: "Dia da Comunidade",
            start: "2025-12-16T14:00", end: "2025-12-17T17:00",
            payment: { type: "free_ticket", cost: "", ticket: { cost: "R$ 1,90", bonuses: ["3h Incenso", "2x Doces"] } },
            bonuses: ["1/2 Distância para Chocar", "3x Poeira Estelar"],
            eggTitle: "Eclosões Especiais",
            eggDesc: "Os seguintes Pokémon eclodirão de ovos de 2km obtidos durante o evento.",
            location: "Global"
        })} className="relative z-10 bg-indigo-600 border border-indigo-400/50" icon="fa-solid fa-wand-magic-sparkles">Demo</Button>
      </div>

      <div className="p-8 space-y-8">
        
        {/* 1. General Info */}
        <GeneralInfoSection data={formData} onChange={handleChange} />
        
        {/* 2. General Bonuses */}
        <section>
             <SectionTitle title="Bônus Gerais" colorClass="text-yellow-400" />
             <div className="flex gap-2 mb-4">
                 <Input className="flex-1" value={newBonus} onChange={e => setNewBonus(e.target.value)} placeholder="Ex: 2x XP de Captura" />
                 <Button onClick={addBonus} className="bg-blue-600"><i className="fa-solid fa-plus"></i></Button>
             </div>
             <ul className="space-y-2">
                 {formData.bonuses?.map((b, i) => (
                     <li key={i} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded border border-slate-600/50 text-sm text-slate-300">
                         <span><i className="fa-solid fa-check text-green-500 mr-2"></i>{b}</span>
                         <button onClick={() => handleChange('bonuses', formData.bonuses!.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><i className="fa-solid fa-times"></i></button>
                     </li>
                 ))}
             </ul>
        </section>

        {/* 3. Payment / Ticket Bonus */}
        <PaymentSection data={formData} onChange={handleChange} />

        {/* 4. Free Research */}
        <section>
             <h3 className="text-sm font-bold text-indigo-400 mb-2 uppercase border-b border-slate-700 pb-1">Pesquisas Gratuitas</h3>
             <TextArea className="h-32" value={formData.research} onChange={e => handleChange('research', e.target.value)} placeholder="Descreva as tarefas de campo..." />
        </section>

        {/* 5. Paid Research */}
        <section>
             <SectionTitle title="Pesquisa Paga" colorClass="text-orange-400" />
             <div className="bg-orange-900/10 border border-orange-900/50 p-4 rounded-xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <Input label="Nome da Pesquisa" value={formData.paidResearch?.name} onChange={e => handleChange('paidResearch', { ...formData.paidResearch, name: e.target.value })} />
                     <Input label="Custo" value={formData.paidResearch?.cost} onChange={e => handleChange('paidResearch', { ...formData.paidResearch, cost: e.target.value })} />
                     <TextArea label="Detalhes" className="col-span-2 h-20" value={formData.paidResearch?.details} onChange={e => handleChange('paidResearch', { ...formData.paidResearch, details: e.target.value })} />
                 </div>
             </div>
        </section>

        {/* 6. Custom Sections */}
        <CustomTextSection data={formData} onChange={list => handleChange('customTexts', list)} />

        {/* 7. Featured */}
        <FeaturedSection data={formData} onChange={v => handleChange('featured', v)} />

        {/* 8. Spawns */}
        <SpawnSection categories={formData.spawnCategories || []} onChange={c => handleChange('spawnCategories', c)} />

        {/* 9. Standard Raids */}
        <StandardRaidForm raids={formData.raidsList || []} onChange={r => handleChange('raidsList', r)} />

        {/* 10. Max Battles */}
        <MaxBattleForm raids={formData.raidsList || []} onChange={r => handleChange('raidsList', r)} />

        {/* 11. Eggs */}
        <EggSection eggs={formData.eggs || []} title={formData.eggTitle} desc={formData.eggDesc} onChange={(e, t, d) => { handleChange('eggs', e); handleChange('eggTitle', t); handleChange('eggDesc', d); }} />
        
        {/* 12. Attacks */}
        <AttackSection attacks={formData.attacks || []} onChange={l => handleChange('attacks', l)} />
        
        {/* 13. Gallery */}
        <section>
            <SectionTitle title="Galeria de Imagens" colorClass="text-cyan-400" />
            <div className="flex gap-2 mb-4">
                <Input className="flex-1" placeholder="Cole a URL da imagem..." value={newImage} onChange={e => setNewImage(e.target.value)} />
                <Button onClick={addImage} className="bg-cyan-600"><i className="fa-solid fa-image"></i></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images?.map((img, i) => (
                    <div key={i} className="relative group h-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => handleChange('images', formData.images!.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500/80 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100">x</button>
                    </div>
                ))}
            </div>
        </section>

        <div className="pt-6 border-t border-slate-700 flex justify-end gap-4 sticky bottom-0 bg-slate-800 p-4 -mx-8 -mb-8 border-t shadow-2xl z-20">
             <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
             <Button onClick={save}>Salvar Evento</Button>
        </div>
      </div>
    </div>
  );
};

export default EventForm;

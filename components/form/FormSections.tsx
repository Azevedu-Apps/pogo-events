
import React, { useState } from 'react';
import { PogoEvent, CustomText, PogoEventPayment } from '../../types';
import { Input, Select, TextArea, Button, SectionTitle } from '../ui/Shared';
import PokemonSearchInput from '../ui/PokemonSearchInput';
import { fetchPokemon } from '../../services/pokeapi';

// --- GENERAL INFO ---
export const GeneralInfoSection: React.FC<{ data: Partial<PogoEvent>, onChange: (f: keyof PogoEvent, v: any) => void }> = ({ data, onChange }) => (
  <section>
    <SectionTitle title="Informações Gerais" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="col-span-2 md:col-span-1">
        <Input label="Nome do Evento" value={data.name || ''} onChange={e => onChange('name', e.target.value)} placeholder="Ex: Dia Comunitário: Pikachu" />
      </div>
      <div className="col-span-2 md:col-span-1">
        <Select label="Tipo" value={data.type} onChange={e => onChange('type', e.target.value)}>
          <option>Dia da Comunidade</option>
          <option>Hora em Destaque</option>
          <option>Dia de Reides</option>
          <option>Evento Sazonal</option>
          <option>Evento Global</option>
          <option>Evento Local/Ticket</option>
          <option>Batalhas Max - Gigamax</option>
          <option>Batalhas Max - Dinamax</option>
        </Select>
      </div>
      <div className="col-span-2">
        <Input label="URL da Capa (Imagem)" value={data.cover || ''} onChange={e => onChange('cover', e.target.value)} placeholder="http://..." />
      </div>
      <div>
        <Input label="Início" type="datetime-local" value={data.start || ''} onChange={e => onChange('start', e.target.value)} />
      </div>
      <div>
        <Input label="Fim" type="datetime-local" value={data.end || ''} onChange={e => onChange('end', e.target.value)} />
      </div>
      <div className="col-span-2">
        <Input label="Local" value={data.location || 'Global'} onChange={e => onChange('location', e.target.value)} />
      </div>
    </div>
  </section>
);

// --- PAYMENT ---
export const PaymentSection: React.FC<{ data: Partial<PogoEvent>, onChange: (f: keyof PogoEvent, v: any) => void }> = ({ data, onChange }) => {
  const [newBonus, setNewBonus] = useState('');
  const payment = data.payment || { type: 'free', cost: '', ticket: { cost: '', bonuses: [] } };

  const handlePaymentChange = (field: keyof PogoEventPayment | 'ticketCost', value: any) => {
    if (field === 'ticketCost') {
      onChange('payment', { ...payment, ticket: { ...payment.ticket, cost: value } });
    } else {
      onChange('payment', { ...payment, [field]: value });
    }
  };

  const addTicketBonus = () => {
    if (!newBonus) return;
    const currentTicket = payment.ticket || { cost: '', bonuses: [] };
    onChange('payment', { ...payment, ticket: { ...currentTicket, bonuses: [...(currentTicket.bonuses || []), newBonus] } });
    setNewBonus('');
  };

  const removeTicketBonus = (idx: number) => {
    const currentTicket = payment.ticket!;
    const bs = [...(currentTicket.bonuses || [])];
    bs.splice(idx, 1);
    onChange('payment', { ...payment, ticket: { ...currentTicket, bonuses: bs } });
  };

  return (
    <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl mb-6">
      <label className="block text-xs font-bold text-blue-300 uppercase mb-2">Modelo de Pagamento</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={payment.type} onChange={e => handlePaymentChange('type', e.target.value)}>
          <option value="free">Gratuito</option>
          <option value="paid_event">Evento Pago</option>
          <option value="free_ticket">Gratuito + Ingresso Opcional</option>
        </Select>
        {payment.type === 'paid_event' && (
          <Input placeholder="Valor (ex: R$ 14,90)" value={payment.cost} onChange={e => handlePaymentChange('cost', e.target.value)} />
        )}
        {payment.type === 'free_ticket' && (
          <Input placeholder="Valor Ingresso (ex: R$ 4,90)" value={payment.ticket?.cost} onChange={e => handlePaymentChange('ticketCost', e.target.value)} />
        )}
      </div>
      {payment.type === 'free_ticket' && (
        <div className="mt-4 pt-4 border-t border-blue-900/30">
          <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">Bônus Exclusivos do Ingresso</label>
          <div className="flex gap-2 mb-2">
            <Input className="flex-1" value={newBonus} onChange={e => setNewBonus(e.target.value)} placeholder="Ex: Encontros aumentados..." />
            <Button onClick={addTicketBonus} variant="success" className="bg-yellow-600 hover:bg-yellow-500"><i className="fa-solid fa-plus"></i></Button>
          </div>
          <ul className="space-y-2">
            {payment.ticket?.bonuses?.map((b, i) => (
              <li key={i} className="flex justify-between items-center bg-yellow-900/20 px-3 py-2 rounded border border-yellow-700/30 text-sm text-yellow-100">
                <span><i className="fa-solid fa-ticket text-yellow-500 mr-2"></i>{b}</span>
                <button onClick={() => removeTicketBonus(i)} className="text-red-400 hover:text-red-300"><i className="fa-solid fa-times"></i></button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- CUSTOM TEXT ---
export const CustomTextSection: React.FC<{ data: Partial<PogoEvent>, onChange: (v: CustomText[]) => void }> = ({ data, onChange }) => {
  const [temp, setTemp] = useState<Partial<CustomText>>({ type: 'text', title: '', desc: '', img: '' });
  const list = data.customTexts || [];

  const add = () => {
    if (!temp.title) return;
    onChange([...list, temp as CustomText]);
    setTemp({ type: 'text', title: '', desc: '', img: '' });
  };

  const remove = (i: number) => {
    const l = [...list];
    l.splice(i, 1);
    onChange(l);
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-8">
      <label className="block text-xs font-bold text-slate-300 uppercase mb-3"><i className="fa-solid fa-paragraph mr-2"></i>Seções Personalizadas</label>
      <div className="flex flex-col gap-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Select value={temp.type} onChange={e => setTemp({ ...temp, type: e.target.value as any })}>
            <option value="text">Apenas Texto</option>
            <option value="image">Apenas Imagem</option>
            <option value="mixed">Imagem + Texto</option>
          </Select>
          <Input placeholder="Título (Obrigatório)" value={temp.title} onChange={e => setTemp({ ...temp, title: e.target.value })} />
        </div>
        {temp.type !== 'text' && <Input placeholder="URL da Imagem" value={temp.img} onChange={e => setTemp({ ...temp, img: e.target.value })} />}
        {temp.type !== 'image' && <TextArea placeholder="Conteúdo da seção..." className="h-20 text-sm" value={temp.desc} onChange={e => setTemp({ ...temp, desc: e.target.value })} />}
        <Button onClick={add} variant="secondary"><i className="fa-solid fa-plus mr-2"></i>Adicionar Seção</Button>
      </div>
      <div className="space-y-3">
        {list.map((item, i) => (
          <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col gap-1 relative group">
            <button onClick={() => remove(i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><i className="fa-solid fa-times"></i></button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{item.type}</span>
              <h4 className="font-bold text-slate-300 text-sm">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- FEATURED ---
export const FeaturedSection: React.FC<{ data: Partial<PogoEvent>, onChange: (v: any) => void }> = ({ data, onChange }) => {
    const [query, setQuery] = useState(data.featured?.name || '');
    const [loading, setLoading] = useState(false);

    const search = async () => {
        if (!query) return;
        setLoading(true);
        const p = await fetchPokemon(query);
        setLoading(false);
        if (p) {
            onChange({ name: p.name, image: p.image, shinyRate: 'Shiny: Padrão' });
        }
    };

    return (
        <section>
            <SectionTitle title="Destaque Principal" colorClass="text-pink-400" />
            <div className="flex gap-4 items-start">
                <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                        <PokemonSearchInput 
                            placeholder="Pokémon Destaque (Inglês)" 
                            value={query} 
                            onChange={setQuery} 
                            className="flex-1" 
                            loading={loading}
                        />
                        <Button onClick={search} variant="secondary"><i className="fa-solid fa-search"></i></Button>
                    </div>
                    {data.featured && (
                        <Select value={data.featured.shinyRate} onChange={e => onChange({ ...data.featured, shinyRate: e.target.value })}>
                            <option>Shiny: Padrão</option>
                            <option>Shiny: Dia Comunitário (1/25)</option>
                            <option>Shiny: Aumentado (1/128)</option>
                            <option>Shiny: Reide (1/20)</option>
                        </Select>
                    )}
                </div>
                <div className="w-24 h-24 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                    {data.featured ? (
                         <>
                            <img src={data.featured.image} className="w-full h-full object-contain p-1" />
                            <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-center text-white py-0.5 capitalize">{data.featured.name}</div>
                         </>
                    ) : <span className="text-xs text-slate-600">Img</span>}
                </div>
            </div>
        </section>
    );
};

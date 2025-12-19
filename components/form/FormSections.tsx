
import React, { useState } from 'react';
import { PogoEvent, CustomText, PogoEventPayment } from '../../types';
import { Input, Select, TextArea, Button, SectionTitle, Modal } from '../ui/Shared';
import PokemonSearchInput from '../ui/PokemonSearchInput';
import { fetchPokemon } from '../../services/pokeapi';
import { PREDEFINED_BONUSES } from '../../utils/constants';

// --- GENERAL INFO ---
export const GeneralInfoSection: React.FC<{ data: Partial<PogoEvent>, onChange: (f: keyof PogoEvent, v: any) => void }> = ({ data, onChange }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Default Payment Structure
    const payment = data.payment || { type: 'free', cost: '', ticket: { cost: '', bonuses: [] } };

    const updatePayment = (newPayment: PogoEventPayment) => {
        onChange('payment', newPayment);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                    <Input label="Nome do Evento" value={data.name || ''} onChange={e => onChange('name', e.target.value)} placeholder="Ex: Dia Comunitário: Pikachu" />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <Select label="Tipo de Evento" value={data.type} onChange={e => onChange('type', e.target.value)}>
                        <option>Dia da Comunidade</option>
                        <option>Dia de Pesquisa</option>
                        <option>Dia de Reides</option>
                        <option>Dia de Destaque</option>
                        <option>Hora em Destaque</option>
                        <option>Evento Sazonal</option>
                        <option>Evento Global</option>
                        <option>Evento Local/Ticket</option>
                        <option>Batalhas Max - Gigamax</option>
                        <option>Batalhas Max - Dinamax</option>
                    </Select>
                </div>
                <div className="col-span-2">
                    <Input label="URL da Capa (Imagem Wide)" value={data.cover || ''} onChange={e => onChange('cover', e.target.value)} placeholder="https://..." />
                </div>
                <div>
                    <Input label="Data de Início" type="datetime-local" value={data.start || ''} onChange={e => onChange('start', e.target.value)} />
                </div>
                <div>
                    <Input label="Data de Término" type="datetime-local" value={data.end || ''} onChange={e => onChange('end', e.target.value)} />
                </div>
                <div>
                    <Input label="Localização" value={data.location || 'Global'} onChange={e => onChange('location', e.target.value)} />
                </div>

                {/* PAYMENT TRIGGER */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest font-rajdhani">Acesso / Monetização</label>
                    <div className="flex gap-2">
                        <Select value={payment.type} onChange={e => updatePayment({ ...payment, type: e.target.value })} className="flex-1">
                            <option value="free">Gratuito</option>
                            <option value="paid_event">Evento Pago</option>
                            <option value="free_ticket">Gratuito + Ingresso</option>
                        </Select>
                        {payment.type !== 'free' && (
                            <Button onClick={() => setShowPaymentModal(true)} variant="secondary" className="px-3" title="Configurar Pagamento">
                                <i className="fa-solid fa-cog"></i>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* PAYMENT DISPLAY SUMMARY */}
            {payment.type !== 'free' && (
                <div className="bg-blue-900/10 border border-blue-500/30 p-4 rounded text-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div className="flex items-center gap-2 font-bold text-blue-300 mb-1 uppercase font-rajdhani tracking-wider">
                        <i className="fa-solid fa-ticket"></i>
                        {payment.type === 'paid_event' ? `Evento Pago: ${payment.cost}` : `Ingresso: ${payment.ticket?.cost}`}
                    </div>
                    {payment.ticket?.bonuses && payment.ticket.bonuses.length > 0 && (
                        <div className="text-xs text-blue-200 opacity-80 pl-6">
                            + {payment.ticket.bonuses.length} bônus exclusivos configurados.
                        </div>
                    )}
                </div>
            )}

            {/* PAYMENT MODAL */}
            <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Configuração de Pagamento">
                <PaymentConfig payment={payment} onChange={updatePayment} />
                <div className="mt-8 flex justify-end">
                    <Button onClick={() => setShowPaymentModal(false)}>Confirmar Alterações</Button>
                </div>
            </Modal>
        </div>
    );
};

// --- PAYMENT CONFIG (INSIDE MODAL) ---
const PaymentConfig: React.FC<{ payment: PogoEventPayment, onChange: (p: PogoEventPayment) => void }> = ({ payment, onChange }) => {
    const [newBonus, setNewBonus] = useState('');

    const addBonus = () => {
        if (!newBonus) return;
        const currentTicket = payment.ticket || { cost: '', bonuses: [] };
        onChange({ ...payment, ticket: { ...currentTicket, bonuses: [...(currentTicket.bonuses || []), newBonus] } });
        setNewBonus('');
    };

    const removeBonus = (idx: number) => {
        const currentTicket = payment.ticket!;
        const bs = [...(currentTicket.bonuses || [])];
        bs.splice(idx, 1);
        onChange({ ...payment, ticket: { ...currentTicket, bonuses: bs } });
    };

    return (
        <div className="space-y-6">
            {payment.type === 'paid_event' && (
                <Input label="Custo do Evento" placeholder="Ex: R$ 14,90" value={payment.cost} onChange={e => onChange({ ...payment, cost: e.target.value })} />
            )}
            {payment.type === 'free_ticket' && (
                <Input label="Custo do Ingresso" placeholder="Ex: R$ 4,90" value={payment.ticket?.cost} onChange={e => onChange({ ...payment, ticket: { ...(payment.ticket || { bonuses: [] }), cost: e.target.value } })} />
            )}

            <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-2 tracking-widest font-rajdhani">Bônus do Ingresso</label>
                <div className="flex gap-2 mb-4">
                    <Input className="flex-1" value={newBonus} onChange={e => setNewBonus(e.target.value)} placeholder="Ex: Encontros aumentados..." />
                    <Button onClick={addBonus} variant="success" className="bg-yellow-600 hover:bg-yellow-500 text-white"><i className="fa-solid fa-plus"></i></Button>
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {payment.ticket?.bonuses?.map((b, i) => (
                        <li key={i} className="flex justify-between items-center bg-[#0b0e14] px-3 py-2 border border-slate-800 text-sm text-yellow-100 hover:border-yellow-600/50 transition">
                            <span><i className="fa-solid fa-ticket text-yellow-500 mr-2"></i>{b}</span>
                            <button onClick={() => removeBonus(i)} className="text-red-500 hover:text-red-400"><i className="fa-solid fa-times"></i></button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

// --- BONUSES ---
export const BonusSection: React.FC<{ bonuses: string[], onChange: (b: string[]) => void }> = ({ bonuses, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPreset = PREDEFINED_BONUSES.filter(p => p.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const addBonus = (label: string) => {
        if (!bonuses.includes(label)) {
            onChange([...bonuses, label]);
        }
        setSearchTerm('');
    };

    const removeBonus = (idx: number) => {
        onChange(bonuses.filter((_, i) => i !== idx));
    };

    return (
        <div className="mt-8 border-t border-slate-800 pt-6">
            <SectionTitle title="Bônus Gerais" colorClass="text-yellow-400" icon="fa-solid fa-gift" />

            {/* SEARCH / ADD */}
            <div className="relative mb-6">
                <div className="flex gap-2">
                    <Input
                        className="flex-1"
                        placeholder="Pesquisar ou digitar bônus personalizado..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={() => addBonus(searchTerm)} disabled={!searchTerm}><i className="fa-solid fa-plus"></i></Button>
                </div>

                {/* DROPDOWN */}
                {searchTerm && (
                    <div className="absolute top-full left-0 right-0 bg-[#0b0e14] border border-slate-700 mt-1 z-50 max-h-40 overflow-y-auto shadow-2xl custom-scrollbar">
                        {filteredPreset.map((p, i) => (
                            <button key={i} onClick={() => addBonus(p.label)} className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-sm text-slate-200 border-b border-slate-800 last:border-0">
                                <i className={p.icon}></i> {p.label}
                            </button>
                        ))}
                        {filteredPreset.length === 0 && (
                            <div className="px-3 py-2 text-xs text-slate-500 italic">Nenhum bônus predefinido. Clique em + para adicionar o texto atual.</div>
                        )}
                    </div>
                )}
            </div>

            {/* LIST */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bonuses.map((b, i) => {
                    const preset = PREDEFINED_BONUSES.find(p => p.label === b);
                    const icon = preset ? preset.icon : "fa-solid fa-star text-yellow-500";
                    return (
                        <li key={i} className="flex justify-between items-center bg-[#05060a] px-3 py-3 border border-slate-800 text-sm text-slate-300 shadow-sm hover:border-yellow-500/30 transition group">
                            <span className="flex items-center gap-3 truncate">
                                <i className={`${icon} opacity-70 group-hover:opacity-100`}></i>
                                <span className="truncate font-medium" title={b}>{b}</span>
                            </span>
                            <button onClick={() => removeBonus(i)} className="text-slate-600 hover:text-red-500 ml-2"><i className="fa-solid fa-times"></i></button>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

// --- CUSTOM TEXT ---
export const CustomTextSection: React.FC<{ data: CustomText, onChange: (v: CustomText) => void }> = ({ data, onChange }) => {
    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Select value={data.type} onChange={e => onChange({ ...data, type: e.target.value as any })} label="Layout">
                    <option value="text">Apenas Texto</option>
                    <option value="image">Apenas Imagem</option>
                    <option value="mixed">Imagem + Texto</option>
                </Select>
                <Input label="Título" placeholder="Ex: Detalhes da História" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} />
            </div>
            {data.type !== 'text' && <Input label="URL da Imagem" placeholder="https://..." value={data.img || ''} onChange={e => onChange({ ...data, img: e.target.value })} className="mb-4" />}
            {data.type !== 'image' && <TextArea label="Texto Descritivo" placeholder="Conteúdo da seção..." className="h-32 text-sm" value={data.desc || ''} onChange={e => onChange({ ...data, desc: e.target.value })} />}
        </div>
    );
};

// --- FEATURED ---
export const FeaturedSection: React.FC<{ data: NonNullable<PogoEvent['featured']>, onChange: (v: any) => void }> = ({ data, onChange }) => {
    const [query, setQuery] = useState(data.name || '');
    const [loading, setLoading] = useState(false);

    const search = async () => {
        if (!query) return;
        setLoading(true);
        const p = await fetchPokemon(query);
        setLoading(false);
        if (p) {
            onChange({ name: p.name, image: p.image, shinyRate: data.shinyRate || 'Shiny: Padrão' });
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 w-full space-y-4">
                <div className="flex gap-2 items-end">
                    <PokemonSearchInput
                        label="Pokémon em Destaque"
                        placeholder="Nome (Inglês)"
                        value={query}
                        onChange={setQuery}
                        className="flex-1"
                        loading={loading}
                    />
                    <Button onClick={search} variant="secondary"><i className="fa-solid fa-search"></i></Button>
                </div>
                <Select label="Probabilidade de Shiny" value={data.shinyRate} onChange={e => onChange({ ...data, shinyRate: e.target.value })}>
                    <option>Shiny: Padrão</option>
                    <option>Shiny: Dia Comunitário (1/25)</option>
                    <option>Shiny: Aumentado (1/128)</option>
                    <option>Shiny: Reide (1/20)</option>
                </Select>
            </div>

            {/* Visual Preview */}
            <div className="w-full md:w-32 h-32 bg-[#05060a] border border-slate-800 flex items-center justify-center relative overflow-hidden flex-shrink-0 group">
                {/* Tech Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-600"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-600"></div>

                {data.image ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                        <img src={data.image} className="w-full h-full object-contain p-2 z-10" />
                        <div className="absolute bottom-0 w-full bg-black/80 text-[9px] text-center text-white py-0.5 capitalize font-mono z-20">{data.name}</div>
                    </>
                ) : <span className="text-xs text-slate-600 font-rajdhani uppercase">Preview</span>}
            </div>
        </div>
    );
};

// --- RESEARCH SECTIONS ---
export const FreeResearchSection: React.FC<{ research: string, onChange: (v: string) => void }> = ({ research, onChange }) => (
    <TextArea className="h-32" value={research} onChange={e => onChange(e.target.value)} placeholder="Descreva as tarefas de campo e encontros..." label="Conteúdo da Pesquisa" />
);

export const PaidResearchSection: React.FC<{ data: NonNullable<PogoEvent['paidResearch']>, onChange: (v: any) => void }> = ({ data, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome da Pesquisa" value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} />
        <Input label="Custo (Display)" value={data.cost} onChange={e => onChange({ ...data, cost: e.target.value })} />
        <TextArea label="Detalhes e Recompensas" className="col-span-2 h-24" value={data.details} onChange={e => onChange({ ...data, details: e.target.value })} />
    </div>
);

// --- GALLERY ---
export const GallerySection: React.FC<{ images: string[], onChange: (v: string[]) => void }> = ({ images, onChange }) => {
    const [newImage, setNewImage] = useState('');
    const addImage = () => {
        if (!newImage) return;
        onChange([...images, newImage]);
        setNewImage('');
    };
    return (
        <div>
            <div className="flex gap-2 mb-6 items-end">
                <Input className="flex-1" label="Adicionar Imagem à Galeria" placeholder="Cole a URL da imagem..." value={newImage} onChange={e => setNewImage(e.target.value)} />
                <Button onClick={addImage} className="bg-cyan-600 h-[42px]"><i className="fa-solid fa-plus"></i></Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                    <div key={i} className="relative group h-28 bg-[#05060a] border border-slate-800 overflow-hidden hover:border-cyan-500 transition-colors">
                        <img src={img} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                        <button onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-red-500 w-6 h-6 flex items-center justify-center text-sm hover:bg-red-500 hover:text-white transition"><i className="fa-solid fa-times"></i></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

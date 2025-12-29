
import React, { useState, useEffect, useMemo } from 'react';
import { PogoEvent } from '../../types';
import { CustomSelect, Button, SectionTitle } from '../ui/Shared';

interface SearchStringGeneratorProps {
    events: PogoEvent[];
}

interface CustomFilter {
    id: string;
    label: string;
    tag: string;
}

const CUSTOM_FILTERS: CustomFilter[] = [
    { id: 'shiny', label: 'Brilhante (Shiny)', tag: 'shiny' },
    { id: 'hundo', label: '100% IV (Hundo)', tag: '4*' },
    { id: 'three_star', label: '3 Estrelas (90%+)', tag: '3*' },
    { id: 'shadow', label: 'Sombroso (Shadow)', tag: 'shadow' },
    { id: 'purified', label: 'Purificado', tag: 'purified' },
    { id: 'dynamax', label: 'Dinamax', tag: 'dynamax' },
    { id: 'gigamax', label: 'Gigamax', tag: 'gigamax' },
    { id: 'special_bg', label: 'Fundo Especial', tag: 'specialbackground' },
    { id: 'location_bg', label: 'Fundo de Localidade', tag: 'locationbackground' },
    { id: 'legendary', label: 'Lendário', tag: 'legendary' },
    { id: 'mythical', label: 'Mítico', tag: 'mythical' },
    { id: 'eggsonly', label: 'Chocado (Ovos)', tag: 'eggsonly' },
    { id: 'costume', label: 'Evento (Fantasia)', tag: 'costume' },
    { id: 'evolve', label: 'Pode Evoluir', tag: 'evolve' },
    { id: 'adventure', label: 'Efeito de Aventura', tag: 'adventureeffect' },
];

export const SearchStringGenerator: React.FC<SearchStringGeneratorProps> = ({ events }) => {
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
    const [generatedStrings, setGeneratedStrings] = useState<Array<{ label: string, desc: string, query: string }>>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [includeAllEventPokes, setIncludeAllEventPokes] = useState(true);

    // Get Event Pokemon IDs
    const eventPokemonNames = useMemo(() => {
        if (!selectedEventId) return "";
        const event = events.find(e => e.id === selectedEventId);
        if (!event) return "";

        const pokes = new Set<string>();
        event.spawnCategories.forEach(cat => cat.spawns.forEach(s => pokes.add(s.name.toLowerCase())));
        event.raidsList.forEach(r => pokes.add(r.boss.toLowerCase()));
        event.eggs.forEach(g => g.spawns.forEach(s => pokes.add(s.name.toLowerCase())));
        if (event.featured) pokes.add(event.featured.name.toLowerCase());
        event.attacks.forEach(a => pokes.add(a.pokemon.toLowerCase()));

        return Array.from(pokes).join(',');
    }, [selectedEventId, events]);

    useEffect(() => {
        if (!eventPokemonNames) {
            setGeneratedStrings([]);
            return;
        }

        const strings = [
            {
                label: "Filtro do Evento (Simples)",
                desc: "Mostra todos os Pokémon relacionados ao evento.",
                query: eventPokemonNames
            },
            {
                label: "Limpeza Rápida (Trash)",
                desc: "Filtra Pokémon do evento que NÃO são Shiny, NÃO são 4* e NÃO são Sombrosos.",
                query: `${eventPokemonNames}&!shiny&!4*&!shadow&!mythical&!legendary`
            },
            {
                label: "Busca de 100% (IV Perfeito)",
                desc: "Filtra apenas os 4* (100% IV) do evento.",
                query: `${eventPokemonNames}&4*`
            }
        ];

        setGeneratedStrings(strings);
    }, [eventPokemonNames]);

    const customGeneratedString = useMemo(() => {
        if (!selectedEventId) return "Selecione um evento primeiro...";
        
        let parts: string[] = [];
        if (includeAllEventPokes) {
            parts.push(eventPokemonNames);
        }

        selectedFilters.forEach(fid => {
            const f = CUSTOM_FILTERS.find(filter => filter.id === fid);
            if (f) parts.push(f.tag);
        });

        return parts.join('&');
    }, [selectedFilters, includeAllEventPokes, eventPokemonNames, selectedEventId]);

    const toggleFilter = (id: string) => {
        setSelectedFilters(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header / Selector */}
            <div className="bg-[#151a25] p-6 rounded-2xl border border-white/5 shadow-lg relative z-30">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                    <div className="w-full md:w-96">
                        <CustomSelect 
                            label="Evento de Origem" 
                            value={selectedEventId} 
                            onChange={setSelectedEventId}
                            options={events.map(e => ({ value: e.id, label: e.name }))}
                            placeholder="Selecione um evento..."
                        />
                    </div>
                    <div className="flex-1 text-sm text-slate-500 font-mono tracking-wider italic pb-1">
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-microchip text-blue-500"></i> 
                            Analisando base de dados para o evento selecionado.
                        </span>
                    </div>
                </div>
            </div>

            {/* PREDEFINED SECTION */}
            <div className="space-y-4">
                <SectionTitle title="Protocolos Sugeridos" icon="fa-solid fa-wand-magic-sparkles" colorClass="text-blue-400" />
                <div className="grid grid-cols-1 gap-4">
                    {generatedStrings.map((item, idx) => (
                        <StringCard key={idx} label={item.label} desc={item.desc} query={item.query} />
                    ))}
                </div>
            </div>

            {/* CUSTOM BUILDER SECTION */}
            <div className="space-y-6">
                <SectionTitle title="Construtor Personalizado" icon="fa-solid fa-gears" colorClass="text-emerald-400" />
                
                <div className="bg-[#151a25] border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Filters Column */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <label className="flex items-center gap-3 cursor-pointer group bg-black/40 p-3 rounded-xl border border-white/5 hover:border-blue-500/50 transition-all w-full">
                                    <input 
                                        type="checkbox" 
                                        checked={includeAllEventPokes} 
                                        onChange={e => setIncludeAllEventPokes(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
                                    />
                                    <span className="text-sm font-bold text-slate-200 uppercase tracking-widest font-rajdhani">Filtrar por Pokémon do Evento</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {CUSTOM_FILTERS.map(filter => (
                                    <label key={filter.id} className={`
                                        flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all
                                        ${selectedFilters.includes(filter.id) 
                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                            : 'bg-[#0b0e14] border-white/5 text-slate-400 hover:border-white/20'}
                                    `}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedFilters.includes(filter.id)}
                                            onChange={() => toggleFilter(filter.id)}
                                            className="hidden"
                                        />
                                        <div className={`
                                            w-5 h-5 rounded flex items-center justify-center border transition-all
                                            ${selectedFilters.includes(filter.id) ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'}
                                        `}>
                                            {selectedFilters.includes(filter.id) && <i className="fa-solid fa-check text-[10px] text-black"></i>}
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider font-rajdhani">{filter.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Result Column */}
                        <div className="lg:col-span-5 flex flex-col">
                            <div className="bg-[#0b0e14] rounded-2xl border border-white/10 p-6 flex-1 flex flex-col shadow-inner relative overflow-hidden group/result">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <i className="fa-solid fa-terminal text-8xl"></i>
                                </div>
                                
                                <div className="flex justify-between items-center mb-4 relative z-10">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] font-rajdhani flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Saída do Blueprint
                                    </span>
                                    <button 
                                        onClick={() => {
                                            setSelectedFilters([]);
                                            setIncludeAllEventPokes(true);
                                        }}
                                        className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                                    >
                                        Limpar Tudo
                                    </button>
                                </div>

                                <div className="flex-1 bg-black/40 rounded-lg p-4 font-mono text-xs text-blue-400 break-all overflow-y-auto mb-6 border border-white/5 max-h-[250px] custom-scrollbar">
                                    {customGeneratedString}
                                </div>

                                <Button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(customGeneratedString);
                                        alert("String copiada!");
                                    }}
                                    className="w-full py-4 text-sm"
                                    variant="success"
                                >
                                    <i className="fa-regular fa-copy mr-2"></i> Copiar String Customizada
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-xs text-blue-400 flex items-start gap-3">
                <i className="fa-solid fa-circle-info mt-0.5"></i>
                <div>
                    <strong>Dica de Operação:</strong> Você pode usar o construtor personalizado sem selecionar um evento para gerar strings genéricas (como apenas `shiny&4*`) para sua Pokédex global.
                </div>
            </div>
        </div>
    );
};

const StringCard: React.FC<{ label: string, desc: string, query: string }> = ({ label, desc, query }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(query);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#151a25]/80 border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition shadow-md group">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                    <h3 className="text-white font-bold text-lg font-rajdhani uppercase tracking-wide">{label}</h3>
                    <p className="text-slate-400 text-xs mt-1">{desc}</p>
                </div>
                <Button 
                    onClick={handleCopy} 
                    variant={copied ? "success" : "primary"}
                    className="w-full sm:w-auto h-10 px-6 text-xs"
                >
                    {copied ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-copy"></i>}
                    {copied ? "Copiado!" : "Copiar String"}
                </Button>
            </div>
            
            <div className="relative">
                <div className="bg-[#05060a] text-blue-400/80 p-4 rounded-lg font-mono text-[10px] sm:text-xs overflow-x-auto whitespace-pre-wrap break-all border border-slate-800 shadow-inner">
                    {query}
                </div>
            </div>
        </div>
    );
}

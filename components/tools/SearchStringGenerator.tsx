
import React, { useState, useEffect } from 'react';
import { PogoEvent } from '../../types';
import { CustomSelect, Button } from '../ui/Shared';

interface SearchStringGeneratorProps {
    events: PogoEvent[];
}

export const SearchStringGenerator: React.FC<SearchStringGeneratorProps> = ({ events }) => {
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
    const [generatedStrings, setGeneratedStrings] = useState<Array<{ label: string, desc: string, query: string }>>([]);

    useEffect(() => {
        if (!selectedEventId) return;
        const event = events.find(e => e.id === selectedEventId);
        if (!event) return;

        // 1. Extract all Pokemon Names
        const pokes = new Set<string>();
        
        // From Spawns
        event.spawnCategories.forEach(cat => {
            cat.spawns.forEach(s => pokes.add(s.name.toLowerCase()));
        });
        
        // From Raids
        event.raidsList.forEach(r => pokes.add(r.boss.toLowerCase()));
        
        // From Eggs
        event.eggs.forEach(g => {
            g.spawns.forEach(s => pokes.add(s.name.toLowerCase()));
        });

        // Featured
        if (event.featured) pokes.add(event.featured.name.toLowerCase());

        // From Attacks (Pokemon that evolve)
        event.attacks.forEach(a => pokes.add(a.pokemon.toLowerCase()));

        // Clean names for Search String (remove forms that breaks search sometimes, though Pogo is robust)
        // Usually names are enough. 
        const baseList = Array.from(pokes);
        
        // If list is empty, don't generate
        if (baseList.length === 0) {
            setGeneratedStrings([]);
            return;
        }

        const baseString = baseList.join(',');

        // 2. Generate Variations
        const strings = [
            {
                label: "Filtro do Evento (Simples)",
                desc: "Mostra todos os Pokémon relacionados ao evento.",
                query: baseString
            },
            {
                label: "Limpeza Rápida (Trash)",
                desc: "Filtra Pokémon do evento que NÃO são Shiny, NÃO são 4* e NÃO são Sombrosos. Útil para transferência em massa.",
                query: `${baseString}&!shiny&!4*&!shadow&!mythical&!legendary`
            },
            {
                label: "Busca de 100% (IV Perfeito)",
                desc: "Filtra apenas os 4* (100% IV) do evento.",
                query: `${baseString}&4*`
            },
            {
                label: "Filtro de Troca (Distância)",
                desc: "Filtra Pokémon do evento capturados longe (mais de 100km) para ganhar doces extras na troca.",
                query: `${baseString}&distance100-`
            },
            {
                label: "Filtro para Evolução (0*, 1*, 2*)",
                desc: "Filtra Pokémon 'ruins' do evento para evoluir e transferir (XP Farm).",
                query: `${baseString}&!3*&!4*&!shiny`
            }
        ];

        setGeneratedStrings(strings);

    }, [selectedEventId, events]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Selector */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative z-20">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <CustomSelect 
                            label="Selecione o Evento Base" 
                            value={selectedEventId} 
                            onChange={setSelectedEventId}
                            options={events.map(e => ({ value: e.id, label: e.name }))}
                            placeholder="Selecione um evento..."
                        />
                    </div>
                    <div className="text-sm text-slate-400 pb-3">
                        {generatedStrings.length > 0 ? (
                            <span><i className="fa-solid fa-check text-green-500 mr-1"></i> Strings geradas com sucesso.</span>
                        ) : (
                            <span>Selecione um evento para gerar.</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-4 relative z-10">
                {generatedStrings.map((item, idx) => (
                    <StringCard key={idx} label={item.label} desc={item.desc} query={item.query} />
                ))}
            </div>
            
            <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-xl text-xs text-blue-200">
                <i className="fa-solid fa-circle-info mr-2"></i>
                <strong>Dica:</strong> As strings utilizam os nomes em inglês (padrão da API). O Pokémon GO geralmente aceita nomes em inglês mesmo com o jogo em Português, mas certifique-se de que não há apelidos conflitantes.
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
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition shadow-md group">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-white font-bold text-lg">{label}</h3>
                    <p className="text-slate-400 text-sm">{desc}</p>
                </div>
                <Button 
                    onClick={handleCopy} 
                    className={copied ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"}
                >
                    {copied ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-copy"></i>}
                    {copied ? "Copiado!" : "Copiar"}
                </Button>
            </div>
            
            <div className="relative">
                <pre className="bg-slate-950 text-slate-300 p-3 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all border border-slate-900/50">
                    {query}
                </pre>
            </div>
        </div>
    );
}

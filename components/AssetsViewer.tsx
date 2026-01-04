import React, { useState } from 'react';
import {
    ITEM_MAP,
    STATUS_ICONS,
    UI_ICONS,
    getItemIcon,
    getStatusIcon,
    getUIIcon,
    getTypeIcon,
    getRaidEggIcon,
    getPokemonAsset
} from '../services/assets';

export const AssetsViewer: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPokemon, setSelectedPokemon] = useState<{ name: string, id: number } | null>(null);
    const [pokeList, setPokeList] = useState<{ name: string, url: string }[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    // Fetch Pokemon List on mount
    React.useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
            .then(res => res.json())
            .then(data => setPokeList(data.results));
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const id = parseInt(term);
        if (!isNaN(id) && id > 0 && id <= 1025) {
            const found = pokeList[id - 1];
            if (found) setSelectedPokemon({ name: found.name, id });
            else setSelectedPokemon({ name: `Unknown #${id}`, id });
        } else {
            // Search by name
            const found = pokeList.find(p => p.name.includes(term.toLowerCase()));
            if (found) {
                const urlParts = found.url.split('/');
                const foundId = parseInt(urlParts[urlParts.length - 2]);
                setSelectedPokemon({ name: found.name, id: foundId });
            } else {
                setSelectedPokemon(null);
            }
        }
    };

    // Common Form IDs in PokeMiners
    // 00: Normal, 31: Galar, 61: Alola, 51: Mega, 52: Mega Y/Primal
    const interestingForms = ['00', '11', '12', '31', '51', '52', '61', '62'];

    const types = [
        'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
        'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
    ];

    const raidTiers = ['1', '3', '5', 'Mega', 'Shadow'];

    const pokemonSamples = [1, 4, 7, 25, 94, 150, 249, 384, 483];

    return (
        <div className="p-8 space-y-12 pb-32 animate-fade-in pl-24">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-white font-rajdhani uppercase tracking-wider">Assets Debugger</h2>
                    <p className="text-slate-400">Visualização de todos os assets mapeados no sistema</p>
                </div>
            </div>

            {/* POKEMON SCANNER */}
            <section className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-white/10">
                <div className="flex flex-col gap-4">
                    <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Pokemon Inspector</h3>

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search Pokemon Name (e.g., 'pikachu') or ID (e.g., '25')..."
                                className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-xl text-white font-mono focus:border-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searchTerm && selectedPokemon && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 font-mono text-sm">
                                    Found: {selectedPokemon.name.toUpperCase()} (#{selectedPokemon.id})
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {selectedPokemon && (
                    <div className="space-y-8 animate-fade-in">
                        {/* 1. MAIN FORMS (Normal & Shiny) */}
                        <div className="flex justify-center gap-12 p-8 bg-black/20 rounded-xl">
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={getPokemonAsset(selectedPokemon.id, { form: '00' })}
                                    className="w-48 h-48 object-contain drop-shadow-2xl"
                                    onError={(e) => e.currentTarget.style.opacity = '0.3'}
                                    alt="Normal"
                                />
                                <span className="text-lg text-white font-bold tracking-widest">NORMAL</span>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <img
                                    src={getPokemonAsset(selectedPokemon.id, { form: '00', shiny: true })}
                                    className="w-48 h-48 object-contain drop-shadow-2xl"
                                    onError={(e) => e.currentTarget.style.opacity = '0.3'}
                                    alt="Shiny"
                                />
                                <span className="text-lg text-yellow-500 font-bold tracking-widest">SHINY</span>
                            </div>
                        </div>

                        {/* 2. KNOWN FORMS SCANNER */}
                        <div>
                            <h4 className="text-lg text-blue-300 font-bold mb-4 uppercase tracking-wider">Potential Forms (Alola, Galar, Mega, etc.)</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                {interestingForms.map(form => (
                                    <ScannerItem key={form} id={selectedPokemon.id} form={form} label={`Form ${form}`} />
                                ))}
                            </div>
                        </div>

                        {/* 3. COSTUME SCANNER */}
                        <div>
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                <h4 className="text-lg text-pink-300 font-bold uppercase tracking-wider">Costume Scanner</h4>
                                <button
                                    onClick={() => setIsScanning(!isScanning)}
                                    className="px-4 py-1 rounded bg-pink-500/20 text-pink-300 text-xs border border-pink-500/50 hover:bg-pink-500/40"
                                >
                                    {isScanning ? 'Stop Scan' : 'Scan Costumes (01-50)'}
                                </button>
                                <p className="text-xs text-slate-500 max-w-md">
                                    Scans for costume variations. Note: This tries to load 100+ images (Standard & Shiny), so it might be slow.
                                </p>
                            </div>

                            {isScanning && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {Array.from({ length: 51 }).map((_, i) => {
                                        const costume = i.toString().padStart(2, '0');
                                        if (costume === '00') return null;
                                        return (
                                            <div key={costume} className="contents">
                                                <ScannerItem
                                                    id={selectedPokemon.id}
                                                    form="00"
                                                    costume={costume}
                                                    label={`Costume ${costume}`}
                                                />
                                                <ScannerItem
                                                    id={selectedPokemon.id}
                                                    form="00"
                                                    costume={costume}
                                                    shiny={true}
                                                    label={`Costume ${costume} (Shiny)`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {!isScanning && <p className="text-slate-500 italic text-sm">Click "Scan" to try loading costume variations...</p>}
                        </div>
                    </div>
                )}
            </section>

            {/* 1. STATUS ICONS */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Status Icons (STATUS_ICONS)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {Object.keys(STATUS_ICONS).map(key => (
                        <div key={key} className="bg-[#151a25] border border-white/5 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-blue-500/50 transition-colors">
                            <img src={getStatusIcon(key)} className="w-12 h-12 object-contain" alt={key} />
                            <span className="text-xs font-mono text-slate-400 break-all text-center">{key}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 1.5 UI ICONS */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-2">UI Icons (UI_ICONS)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {Object.keys(UI_ICONS).map(key => (
                        <div key={key} className="bg-[#151a25] border border-white/5 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-pink-500/50 transition-colors">
                            <img src={getUIIcon(key)} className="w-12 h-12 object-contain" alt={key} />
                            <span className="text-xs font-mono text-slate-400 break-all text-center">{key}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. ITEMS */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Items (ITEM_MAP)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {Object.keys(ITEM_MAP).map(key => (
                        <div key={key} className="bg-[#151a25] border border-white/5 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-green-500/50 transition-colors">
                            <img src={getItemIcon(key as any)} className="w-12 h-12 object-contain" alt={key} />
                            <span className="text-xs font-mono text-slate-400 break-all text-center">{key}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. TYPES */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Types</h3>
                <div className="flex flex-wrap gap-4">
                    {types.map(type => (
                        <div key={type} className="bg-[#151a25] border border-white/5 p-4 rounded-xl flex flex-col items-center gap-3">
                            <img src={getTypeIcon(type)} className="w-8 h-8 object-contain" alt={type} />
                            <span className="text-xs font-mono text-slate-400 uppercase">{type}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. RAID EGGS */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-2">Raid Eggs</h3>
                <div className="flex flex-wrap gap-6">
                    {raidTiers.map(tier => (
                        <div key={tier} className="bg-[#151a25] border border-white/5 p-4 rounded-xl flex flex-col items-center gap-3">
                            <img src={getRaidEggIcon(tier)} className="w-16 h-16 object-contain" alt={tier} />
                            <span className="text-xs font-mono text-slate-400 uppercase">{tier}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// Helper component that hides itself if the image fails to load
const ScannerItem: React.FC<{ id: number, form: string, costume?: string, label: string, shiny?: boolean }> = ({ id, form, costume, label, shiny }) => {
    const [exists, setExists] = useState(true);
    const src = getPokemonAsset(id, { form, costume, shiny });

    if (!exists) return null;

    return (
        <div className={`border ${shiny ? 'border-yellow-500/30 bg-yellow-900/10' : 'border-white/5 bg-[#151a25]'} p-2 rounded-xl flex flex-col items-center gap-2 relative group`}>
            <img
                src={src}
                className="w-16 h-16 object-contain"
                onError={() => setExists(false)}
                alt={label}
            />
            <span className={`text-[10px] font-mono ${shiny ? 'text-yellow-500' : 'text-slate-500'} break-all text-center`}>{label}</span>
            {/* Show code on hover */}
            <div className="absolute inset-0 bg-black/80 hidden group-hover:flex items-center justify-center rounded-xl p-2 text-center">
                <span className="text-[10px] text-white break-all">
                    {form} {costume} {shiny ? '(S)' : ''}
                </span>
            </div>
        </div>
    );
};

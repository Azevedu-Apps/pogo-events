
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { getAllPokemonNames, fetchPokemon, fetchSpeciesDetails } from '../services/pokeapi';
import { getTypeIcon } from '../services/assets';
import { getPokemonMoveset, getMoveDetails, calculateBars } from '../services/gamemaster';
import { Input, Button, Modal, Select } from './ui/Shared';
import { typeColors } from '../utils/visuals';

// --- TYPES ---
interface DexProgress {
    normal?: boolean;
    shiny?: boolean;
    hundo?: boolean;
    xxl?: boolean;
    xxs?: boolean;
    lucky?: boolean;
    shadow?: boolean;
    purified?: boolean;
    mega?: boolean;
    dynamax?: boolean;
    gigamax?: boolean;
}

interface UserDex {
    [pokemonId: string]: DexProgress;
}

interface Region {
    id: string;
    name: string;
    range: [number, number];
    color: string;
}

// --- CONSTANTS ---
const REGIONS: Region[] = [
    { id: 'all', name: 'Nacional', range: [1, 2000], color: 'text-slate-200' },
    { id: 'kanto', name: 'Kanto', range: [1, 151], color: 'text-red-400' },
    { id: 'johto', name: 'Johto', range: [152, 251], color: 'text-yellow-400' },
    { id: 'hoenn', name: 'Hoenn', range: [252, 386], color: 'text-green-400' },
    { id: 'sinnoh', name: 'Sinnoh', range: [387, 493], color: 'text-blue-400' },
    { id: 'unova', name: 'Unova', range: [494, 649], color: 'text-gray-400' },
    { id: 'kalos', name: 'Kalos', range: [650, 721], color: 'text-pink-400' },
    { id: 'alola', name: 'Alola', range: [722, 809], color: 'text-orange-400' },
    { id: 'galar', name: 'Galar', range: [810, 905], color: 'text-cyan-400' },
    { id: 'paldea', name: 'Paldea', range: [906, 1025], color: 'text-purple-400' },
];

const VARIANTS = [
    { id: 'normal', label: 'Normal', icon: 'fa-solid fa-check', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
    { id: 'shiny', label: 'Shiny', icon: 'fa-solid fa-star', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
    { id: 'lucky', label: 'Sortudo', icon: 'fa-solid fa-clover', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10' },
    { id: 'shadow', label: 'Sombroso', icon: 'fa-solid fa-fire', color: 'text-purple-500', border: 'border-purple-500/50', bg: 'bg-purple-500/10' },
    { id: 'purified', label: 'Purificado', icon: 'fa-solid fa-bahai', color: 'text-blue-300', border: 'border-blue-300/50', bg: 'bg-blue-300/10' },
    { id: 'hundo', label: '100%', text: '4*', color: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-500/10' },
    { id: 'xxl', label: 'XXL', text: 'XXL', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
    { id: 'xxs', label: 'XXS', text: 'XXS', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' },
    { id: 'mega', label: 'Mega', icon: 'fa-solid fa-dna', color: 'text-teal-400', border: 'border-teal-500/50', bg: 'bg-teal-500/10', special: true },
    { id: 'gigamax', label: 'Gigamax', icon: 'fa-solid fa-cloud-bolt', color: 'text-fuchsia-500', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-500/10', special: true },
    { id: 'dynamax', label: 'Dinamax', icon: 'fa-solid fa-x', color: 'text-red-500', border: 'border-red-500/50', bg: 'bg-red-500/10', special: true },
];

const TYPE_THEMES: Record<string, { from: string, to: string, accent: string }> = {
    normal: { from: 'from-slate-500', to: 'to-slate-700', accent: 'bg-slate-400' },
    fire: { from: 'from-orange-500', to: 'to-red-600', accent: 'bg-orange-400' },
    water: { from: 'from-blue-500', to: 'to-cyan-600', accent: 'bg-blue-400' },
    grass: { from: 'from-green-500', to: 'to-emerald-700', accent: 'bg-green-400' },
    electric: { from: 'from-yellow-400', to: 'to-orange-500', accent: 'bg-yellow-300' },
    ice: { from: 'from-cyan-400', to: 'to-blue-500', accent: 'bg-cyan-300' },
    fighting: { from: 'from-red-700', to: 'to-orange-800', accent: 'bg-red-600' },
    poison: { from: 'from-purple-600', to: 'to-fuchsia-800', accent: 'bg-purple-500' },
    ground: { from: 'from-yellow-600', to: 'to-orange-700', accent: 'bg-yellow-500' },
    flying: { from: 'from-indigo-400', to: 'to-blue-600', accent: 'bg-indigo-300' },
    psychic: { from: 'from-pink-500', to: 'to-rose-600', accent: 'bg-pink-400' },
    bug: { from: 'from-lime-500', to: 'to-green-600', accent: 'bg-lime-400' },
    rock: { from: 'from-stone-500', to: 'to-stone-700', accent: 'bg-stone-400' },
    ghost: { from: 'from-violet-600', to: 'to-purple-900', accent: 'bg-violet-500' },
    dragon: { from: 'from-indigo-600', to: 'to-violet-800', accent: 'bg-indigo-500' },
    steel: { from: 'from-slate-400', to: 'to-slate-600', accent: 'bg-slate-300' },
    dark: { from: 'from-slate-800', to: 'to-black', accent: 'bg-slate-700' },
    fairy: { from: 'from-pink-300', to: 'to-rose-400', accent: 'bg-pink-200' },
};

const PokemonDetailModal: React.FC<{ 
    baseName: string; 
    baseData: any;
    isOpen: boolean; 
    onClose: () => void;
    userProgress: DexProgress;
    onUpdate: (p: DexProgress) => void; 
}> = ({ baseName, baseData, isOpen, onClose, userProgress, onUpdate }) => {
    const [speciesData, setSpeciesData] = useState<any>(null);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [moves, setMoves] = useState<{fast: any[], charged: any[]} | null>(null);
    const [loadingForm, setLoadingForm] = useState(false);
    const [isShiny, setIsShiny] = useState(false);
    const [selectedMoves, setSelectedMoves] = useState({ fast: '', charged1: '', charged2: '' });
    const [moveStats, setMoveStats] = useState<Record<string, any>>({});

    useEffect(() => {
        const dexId = baseData?.speciesId || baseData?.id;
        if (isOpen && dexId) {
            const load = async () => {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dexId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSpeciesData(data);
                    const defaultForm = data.varieties.find((v: any) => v.is_default) || data.varieties[0];
                    if (defaultForm) {
                        setLoadingForm(true);
                        const fData = await fetchPokemon(defaultForm.pokemon.name);
                        setSelectedForm(fData);
                        setLoadingForm(false);
                    }
                }
                const movesData = await getPokemonMoveset(dexId);
                setMoves(movesData);
            };
            load();
        }
    }, [isOpen, baseData]);

    if (!isOpen) return null;
    const theme = TYPE_THEMES[selectedForm?.types?.[0]?.toLowerCase() || 'normal'] || TYPE_THEMES['normal'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`#${baseData.id.toString().padStart(3,'0')} // ${baseData.name.toUpperCase()}`}>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.from} ${theme.to} border-2 border-white/20 aspect-square flex flex-col items-center justify-center`}>
                        <img src={isShiny ? selectedForm?.shinyImage : selectedForm?.image} className="w-[80%] h-[80%] object-contain drop-shadow-2xl" />
                    </div>
                    <div className="bg-[#151a25] p-4 rounded-2xl border border-white/5">
                         <Button onClick={() => setIsShiny(!isShiny)} className="w-full">{isShiny ? 'Ver Normal' : 'Ver Shiny'}</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {VARIANTS.map(v => (
                            <button key={v.id} onClick={() => onUpdate({ ...userProgress, [v.id]: !userProgress[v.id as keyof DexProgress] })} className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-[10px] uppercase font-bold transition-all ${userProgress[v.id as keyof DexProgress] ? `${v.bg} ${v.border} ${v.color}` : 'bg-[#0b0e14] border-slate-800 text-slate-600'}`}>
                                {v.icon ? <i className={v.icon}></i> : v.text}
                                <span className="mt-1">{v.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 text-slate-400 italic">Detalhes técnicos e moveset carregados da GameMaster API.</div>
            </div>
        </Modal>
    );
};

const DexCard = memo(({ name, url, userProgress, onUpdate }: { name: string, url: string, userProgress: DexProgress, onUpdate: (p: DexProgress) => void }) => {
    const [details, setDetails] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let active = true;
        fetchPokemon(name).then(data => { if (active) setDetails(data); });
        return () => { active = false; };
    }, [name]);

    if (!details) return <div className="bg-[#151a25] rounded-xl h-40 animate-pulse border border-white/5"></div>;
    const isCaught = Object.values(userProgress).some(v => v === true);

    return (
        <>
            <div onClick={() => setIsModalOpen(true)} className={`group relative bg-[#151a25] rounded-xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1 ${isCaught ? 'border-blue-500/30' : 'border-white/5'}`}>
                <div className="flex-1 flex items-center justify-center p-4">
                    <img src={details.image} className={`w-20 h-20 object-contain drop-shadow-xl ${!isCaught ? 'grayscale opacity-40' : ''}`} />
                </div>
                <div className="bg-[#0b0e14] p-2 text-center border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase truncate">{name.replace(/-/g, ' ')}</h4>
                </div>
            </div>
            <PokemonDetailModal baseName={name} baseData={details} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userProgress={userProgress} onUpdate={onUpdate} />
        </>
    );
});

const Pokedex: React.FC = () => {
    const [allPokemon, setAllPokemon] = useState<{name: string, url: string}[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dexProgress, setDexProgress] = useState<UserDex>({});
    const [selectedRegion, setSelectedRegion] = useState<Region['id']>('all');

    useEffect(() => {
        getAllPokemonNames().then(setAllPokemon);
        const saved = localStorage.getItem('pogo_dex_progress');
        if (saved) setDexProgress(JSON.parse(saved));
    }, []);

    const handleUpdate = useCallback((name: string, p: DexProgress) => {
        setDexProgress(prev => {
            const next = { ...prev, [name]: p };
            localStorage.setItem('pogo_dex_progress', JSON.stringify(next));
            return next;
        });
    }, []);

    const filtered = useMemo(() => {
        let list = allPokemon;
        if (selectedRegion !== 'all') {
            const r = REGIONS.find(reg => reg.id === selectedRegion)!;
            list = list.filter(p => {
                const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
                return id >= r.range[0] && id <= r.range[1];
            });
        }
        if (searchTerm) list = list.filter(p => p.name.includes(searchTerm.toLowerCase()));
        return list;
    }, [allPokemon, searchTerm, selectedRegion]);

    return (
        <div className="animate-fade-in pb-20">
            <h1 className="text-3xl font-black text-white mb-8 font-rajdhani uppercase">Pokédex Nacional</h1>
            <div className="bg-[#151a25] p-6 rounded-xl border border-white/5 mb-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                    {REGIONS.map(r => (
                        <button key={r.id} onClick={() => setSelectedRegion(r.id)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition-all ${selectedRegion === r.id ? 'bg-slate-700 border-slate-500 text-white' : 'bg-[#0b0e14] border-slate-800 text-slate-500'}`}>{r.name}</button>
                    ))}
                </div>
                <Input placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {filtered.slice(0, 100).map(p => <DexCard key={p.name} name={p.name} url={p.url} userProgress={dexProgress[p.name] || {}} onUpdate={(prog) => handleUpdate(p.name, prog)} />)}
            </div>
        </div>
    );
};

export default Pokedex;

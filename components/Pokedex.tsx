
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getAllPokemonNames, fetchPokemon, fetchSpeciesDetails } from '../services/pokeapi';
import { getTypeIcon } from '../services/assets';
import { getPokemonMoveset, getMoveDetails, calculateBars } from '../services/gamemaster';
import { Input, Button, Modal, Select } from './ui/Shared';
import { typeColors } from '../utils/visuals';
import { listUserPokedexes, createUserPokedex, updateUserPokedex } from '../services/graphql';

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

// --- VISUAL THEMES FOR CARD ---
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

// --- CP CALCULATION UTILS ---
const CPM_VALUES = [
    0.094, 0.135137432, 0.16639787, 0.192650919, 0.21573247, 0.236572661, 0.25572005, 0.273530381, 0.29024988, 0.306057377, // 1 - 5.5
    0.3210876, 0.335445036, 0.34921268, 0.362457751, 0.37523559, 0.387592406, 0.39956728, 0.411193551, 0.42250001, 0.432926419, // 6 - 10.5
    0.44310755, 0.453059958, 0.46279839, 0.472336083, 0.48168495, 0.4908558, 0.49985844, 0.508701765, 0.51739395, 0.525942511, // 11 - 15.5
    0.53435433, 0.542635767, 0.55079269, 0.558830576, 0.56675452, 0.574569153, 0.58227891, 0.589887917, 0.59740001, 0.604818814, // 16 - 20.5
    0.61215729, 0.619399365, 0.62656713, 0.633644533, 0.64065295, 0.647576426, 0.65443563, 0.661214806, 0.667934, 0.674577537,   // 21 - 25.5
    0.68116492, 0.687680648, 0.69414365, 0.700538673, 0.70688421, 0.713164996, 0.71939909, 0.725575614, 0.7317, 0.734741009,     // 26 - 30.5
    0.73776948, 0.740785574, 0.74378943, 0.746781211, 0.74976104, 0.752729087, 0.75568551, 0.758630378, 0.76156384, 0.764486065, // 31 - 35.5
    0.76739717, 0.770297266, 0.7731865, 0.776064962, 0.77893275, 0.781790055, 0.78463697, 0.787473578, 0.79030001, 0.792803968,  // 36 - 40.5
    0.79530001, 0.797800015, 0.8003, 0.802799995, 0.8053, 0.8078, 0.81029999, 0.81279998, 0.81529999, 0.81779999,                // 41 - 45.5
    0.82029999, 0.82279999, 0.82529999, 0.82779999, 0.83029999, 0.83279999, 0.83529999, 0.83779999, 0.84029999, 0.84279999,      // 46 - 50.5
];

const getCPM = (level: number) => {
    const index = Math.round((level - 1) * 2);
    if (index >= 0 && index < CPM_VALUES.length) {
        return CPM_VALUES[index];
    }
    return 0.8403 + ((level - 50) * 0.005); 
};

// Convert Main Series stats (PokeAPI) to Pokemon GO Base Stats
const calculateGoStats = (stats: any[]) => {
    if (!stats || stats.length < 6) return { atk: 0, def: 0, sta: 0 };
    
    const hp = stats[0].base_stat;
    const atk = stats[1].base_stat;
    const def = stats[2].base_stat;
    const spa = stats[3].base_stat;
    const spd = stats[4].base_stat;
    const spe = stats[5].base_stat;

    const speedMod = 1 + (spe - 75) / 500;

    const higherAtk = Math.max(atk, spa);
    const lowerAtk = Math.min(atk, spa);
    const scaledAtk = Math.round(2 * ((7/8 * higherAtk) + (1/8 * lowerAtk)));
    const goAtk = Math.round(scaledAtk * speedMod);

    const higherDef = Math.max(def, spd);
    const lowerDef = Math.min(def, spd);
    const scaledDef = Math.round(2 * ((5/8 * higherDef) + (3/8 * lowerDef)));
    const goDef = Math.round(scaledDef * speedMod);

    const goSta = Math.floor(hp * 1.75 + 50);

    return { atk: goAtk, def: goDef, sta: goSta };
};

const calculateCP = (baseStats: {atk: number, def: number, sta: number}, level: number, ivs: {atk: number, def: number, sta: number}) => {
    const cpm = getCPM(level);
    const attack = baseStats.atk + ivs.atk;
    const defense = baseStats.def + ivs.def;
    const stamina = baseStats.sta + ivs.sta;

    const cp = Math.floor((attack * Math.sqrt(defense) * Math.sqrt(stamina) * Math.pow(cpm, 2)) / 10);
    return Math.max(10, cp);
};

const calculateHP = (baseSta: number, level: number, ivSta: number) => {
    const cpm = getCPM(level);
    return Math.max(10, Math.floor((baseSta + ivSta) * cpm));
};

// --- POKEMON DETAIL MODAL ---
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

    // Move Selection State
    const [selectedMoves, setSelectedMoves] = useState<{ fast: string, charged1: string, charged2: string }>({ fast: '', charged1: '', charged2: '' });
    const [moveStats, setMoveStats] = useState<Record<string, { power: number, energy: string, type: string }>>({});

    // Calculator State
    const [calcLevel, setCalcLevel] = useState(20); 
    const [calcIVs, setCalcIVs] = useState({ atk: 15, def: 15, sta: 15 });
    const [weatherBoost, setWeatherBoost] = useState(false);

    // Load Species Data (Flavor Text + Varieties)
    useEffect(() => {
        const dexId = baseData?.speciesId || baseData?.id;

        if (isOpen && dexId) {
            const load = async () => {
                try {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dexId}`);
                    if (!res.ok) throw new Error("Species not found");
                    const data = await res.json();
                    setSpeciesData(data);
                    
                    const defaultForm = data.varieties.find((v: any) => v.is_default) || data.varieties[0];
                    if (defaultForm) loadFormDetails(defaultForm.pokemon.name);

                    const movesData = await getPokemonMoveset(dexId);
                    setMoves(movesData);

                } catch (e) {
                    console.error("Error loading species", e);
                }
            };
            load();
        }
    }, [isOpen, baseData]);

    const loadFormDetails = async (formName: string) => {
        setLoadingForm(true);
        const data = await fetchPokemon(formName);
        setSelectedForm(data);
        // Reset moves on form change
        setSelectedMoves({ fast: '', charged1: '', charged2: '' });
        setMoveStats({});
        setLoadingForm(false);
    };

    // Helper to fetch/set move stats
    const updateMoveStats = async (moveName: string) => {
        if (!moveName || moveStats[moveName]) return;
        const details = await getMoveDetails(moveName);
        if (details) {
            let energyVal = 'fast';
            if (details.category === 'charged') {
                energyVal = calculateBars(details.energy_delta);
            }
            setMoveStats(prev => ({
                ...prev,
                [moveName]: {
                    power: details.power,
                    energy: energyVal,
                    type: details.type
                }
            }));
        }
    };

    const handleMoveChange = (type: 'fast' | 'charged1' | 'charged2', value: string) => {
        setSelectedMoves(prev => ({ ...prev, [type]: value }));
        updateMoveStats(value);
    };

    // Calculate CP on the fly
    const calculatedStats = useMemo(() => {
        if (!selectedForm?.stats) return { cp: 0, hp: 0 };
        const baseStats = calculateGoStats(selectedForm.stats);
        const cp = calculateCP(baseStats, calcLevel, calcIVs);
        const hp = calculateHP(baseStats.sta, calcLevel, calcIVs.sta);
        return { cp, hp };
    }, [selectedForm, calcLevel, calcIVs]);

    const speciesInfo = useMemo(() => {
        if (!speciesData) return { hasMega: false, hasGmax: false };
        const hasMega = speciesData.varieties?.some((v: any) => v.pokemon.name.includes('-mega'));
        const hasGmax = speciesData.varieties?.some((v: any) => v.pokemon.name.includes('-gmax'));
        return { hasMega, hasGmax };
    }, [speciesData]);

    if (!isOpen) return null;

    const varieties = speciesData?.varieties || [];
    const displayImage = isShiny ? selectedForm?.shinyImage : selectedForm?.image;
    
    const currentName = selectedForm?.name || '';
    const canBeMega = currentName.includes('-mega');
    const canBeGmax = currentName.includes('-gmax');
    const canBeDynamax = true; // Most can be dynamax, simplifed logic

    const toggleVariant = (id: string) => {
        onUpdate({ ...userProgress, [id]: !userProgress[id as keyof DexProgress] });
        if (id === 'shiny' && !isShiny) setIsShiny(true);
    };

    const handleWeatherToggle = () => {
        const newVal = !weatherBoost;
        setWeatherBoost(newVal);
        if (newVal) {
            if (calcLevel === 20) setCalcLevel(25);
            setCalcIVs(prev => ({
                atk: Math.max(4, prev.atk),
                def: Math.max(4, prev.def),
                sta: Math.max(4, prev.sta)
            }));
        } else {
            if (calcLevel === 25) setCalcLevel(20);
        }
    };

    // --- VISUAL SETUP ---
    const primaryType = selectedForm?.types?.[0]?.toLowerCase() || 'normal';
    const theme = TYPE_THEMES[primaryType] || TYPE_THEMES['normal'];

    const MoveSelect = ({ type, placeholder, options }: { type: 'fast' | 'charged1' | 'charged2', placeholder: string, options: any[] }) => {
        const selected = selectedMoves[type];
        const stats = moveStats[selected];
        const moveType = stats?.type || 'Normal';
        
        // Define specific gradients for the "Banner" look based on type
        const getBannerGradient = (t: string) => {
            const map: Record<string, string> = {
                'Normal': 'from-slate-600 to-slate-400 border-slate-400',
                'Fire': 'from-red-800 via-red-600 to-orange-500 border-red-500',
                'Water': 'from-blue-800 via-blue-600 to-cyan-500 border-blue-500',
                'Grass': 'from-green-800 via-green-600 to-emerald-500 border-green-500',
                'Electric': 'from-yellow-700 via-yellow-500 to-amber-400 border-yellow-400',
                'Ice': 'from-cyan-700 via-cyan-500 to-sky-400 border-cyan-400',
                'Fighting': 'from-orange-800 via-orange-600 to-amber-600 border-orange-500',
                'Poison': 'from-purple-800 via-purple-600 to-fuchsia-500 border-purple-500',
                'Ground': 'from-yellow-800 via-yellow-600 to-orange-600 border-yellow-600',
                'Flying': 'from-indigo-700 via-indigo-500 to-violet-400 border-indigo-400',
                'Psychic': 'from-pink-800 via-pink-600 to-rose-500 border-pink-500',
                'Bug': 'from-lime-800 via-lime-600 to-green-500 border-lime-500',
                'Rock': 'from-stone-700 via-stone-600 to-amber-700 border-stone-500',
                'Ghost': 'from-violet-900 via-violet-700 to-purple-600 border-violet-500',
                'Dragon': 'from-indigo-900 via-indigo-700 to-blue-600 border-indigo-500',
                'Steel': 'from-slate-600 via-slate-500 to-gray-400 border-slate-400',
                'Dark': 'from-slate-900 via-slate-800 to-gray-800 border-slate-600',
                'Fairy': 'from-pink-700 via-pink-500 to-rose-400 border-pink-400'
            };
            return map[t] || map['Normal'];
        };

        const bannerStyle = getBannerGradient(moveType);
        const barColor = stats?.type ? (typeColors[stats.type] || 'bg-slate-500') : 'bg-slate-500';

        return (
            <div className={`relative h-20 w-full rounded-xl overflow-hidden border-2 shadow-lg group transition-all duration-300 hover:scale-[1.01] ${bannerStyle.split(' ')[2]}`}>
                {/* Background Gradient & Texture */}
                <div className={`absolute inset-0 bg-gradient-to-r ${bannerStyle.split(' border')[0]} opacity-90`}></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/20 pointer-events-none"></div>

                {/* Content Layer */}
                <div className="relative z-10 flex items-center h-full px-3 gap-3">
                    
                    {/* Left: Icon Bubble */}
                    <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-md relative z-10">
                            {stats?.type ? (
                                <img src={getTypeIcon(stats.type)} className="w-9 h-9 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-white/20"></div>
                            )}
                        </div>
                    </div>

                    {/* Middle: Name Select */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 mr-2">
                        {stats?.type && (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5 ml-1 drop-shadow-sm font-rajdhani">
                                {stats.type}
                            </span>
                        )}
                        <div className="relative">
                            <select 
                                className="w-full bg-transparent text-white text-base font-black uppercase tracking-wide appearance-none outline-none cursor-pointer truncate drop-shadow-md pr-4 focus:text-white/90"
                                value={selected}
                                onChange={(e) => handleMoveChange(type, e.target.value)}
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                            >
                                <option value="" className="text-black">{placeholder}</option>
                                {options.map((m: any) => <option key={m.name} value={m.name} className="text-black">{m.name} {m.isElite ? '*' : ''}</option>)}
                            </select>
                            <i className="fa-solid fa-caret-down text-white/50 absolute right-0 top-1.5 pointer-events-none text-xs"></i>
                        </div>
                    </div>

                    {/* Right: Stats & Power */}
                    {selected && (
                        <div className="flex flex-col items-end justify-center gap-1 min-w-[70px]">
                            {/* PWR Value */}
                            <div className="flex items-baseline">
                                <span className="text-[9px] font-bold text-white/60 mr-1">PWR</span>
                                <span className="text-3xl font-black text-white italic leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] font-rajdhani">
                                    {stats?.power || '-'}
                                </span>
                            </div>
                            
                            {/* Bars */}
                            <div className="flex gap-1 h-2.5">
                                {stats?.energy && stats.energy !== 'fast' ? (
                                    Array.from({ length: parseInt(stats.energy) || 1 }).map((_, i) => (
                                        <div key={i} className={`w-8 h-full rounded-[2px] ${barColor} border border-white/30 shadow-[0_0_5px_rgba(255,255,255,0.4)] relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/30"></div>
                                        </div>
                                    ))
                                ) : (
                                    stats?.energy === 'fast' && <div className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/40 px-2 rounded border border-white/20">Ágil</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`#${baseData.id.toString().padStart(3,'0')} // ${baseData.name.toUpperCase()}`}
        >
            <div className="flex flex-col lg:flex-row gap-8 font-sans">
                
                {/* --- LEFT: VISUALS --- */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Main Image Card with Gradient Background (Moveset Style) */}
                    <div className={`
                        relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500
                        bg-gradient-to-br ${theme.from} ${theme.to}
                        border-2 border-white/20 aspect-square flex flex-col items-center justify-center group
                        shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]
                    `}>
                        {/* Overlay to darken and add depth (prevents flat look) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 mix-blend-multiply"></div>

                        {/* Background Textures */}
                        <div className="absolute inset-0 bg-dot-pattern opacity-20 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] opacity-30 mix-blend-overlay"></div>
                        
                        {/* Image - Moved up significantly with pb-24 and scaled up */}
                        <div className="relative z-10 flex items-center justify-center w-full h-full pb-24 pt-4 px-4">
                            <img 
                                src={displayImage || 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg'} 
                                className="w-[120%] h-[120%] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2" 
                            />
                        </div>

                        {/* Type Badges (Bottom) */}
                        <div className="absolute bottom-6 flex gap-2 z-20">
                            {selectedForm?.types?.map((t: string) => (
                                <div key={t} className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                                    <img src={getTypeIcon(t)} className="w-4 h-4 object-contain" />
                                    <span className="text-[10px] font-bold capitalize text-white font-rajdhani tracking-widest">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls & Forms */}
                    <div className="bg-[#151a25] p-5 rounded-2xl border border-white/5 space-y-5">
                        
                        {/* INTUITIVE TOGGLE SWITCH */}
                        <div 
                            className="relative bg-[#0f131a] rounded-full p-1.5 h-14 flex cursor-pointer border border-white/10 shadow-inner group/toggle select-none" 
                            onClick={() => setIsShiny(!isShiny)}
                        >
                            {/* Sliding Background Pill */}
                            <div className={`
                                absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-out shadow-lg flex items-center justify-center
                                ${isShiny 
                                    ? 'left-[50%] bg-gradient-to-r from-yellow-500 to-amber-500' 
                                    : 'left-1.5 bg-gradient-to-r from-slate-600 to-slate-500'
                                }
                            `}>
                                {/* Icon inside the slider */}
                                <i className={`text-xl text-white ${isShiny ? 'fa-solid fa-star animate-pulse' : 'fa-solid fa-circle-notch'}`}></i>
                            </div>

                            {/* Label: Normal */}
                            <div className={`flex-1 z-10 flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] transition-colors duration-300 ${!isShiny ? 'text-white/0' : 'text-slate-500 group-hover/toggle:text-slate-300'}`}>
                                Normal
                            </div>
                            
                            {/* Label: Shiny */}
                            <div className={`flex-1 z-10 flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isShiny ? 'text-white/0' : 'text-slate-500 group-hover/toggle:text-slate-300'}`}>
                                Shiny
                            </div>
                        </div>

                        {/* Forms Buttons */}
                        {varieties.length > 1 && (
                            <div className="flex flex-wrap gap-2 items-center justify-center pt-2 border-t border-white/5">
                                {varieties.map((v: any) => {
                                    const vName = v.pokemon.name.replace(baseData.name, '').replace(/-/g, ' ').trim() || 'Normal';
                                    const isSelected = selectedForm?.name === v.pokemon.name;
                                    return (
                                        <button 
                                            key={v.pokemon.name}
                                            onClick={() => loadFormDetails(v.pokemon.name)}
                                            className={`px-3 py-1.5 text-[10px] rounded-lg border font-bold transition-all uppercase tracking-wide ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-[#0b0e14] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
                                        >
                                            {vName}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* 3. CHECKLIST GRID */}
                    <div className="bg-[#151a25] rounded-2xl border border-white/5 p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase font-rajdhani tracking-widest mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-list-check text-blue-500"></i> Progresso de Coleção
                        </h3>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {VARIANTS.map(v => {
                                if (v.id === 'mega' && !speciesInfo?.hasMega) return null;
                                if (v.id === 'gigamax' && !speciesInfo?.hasGmax) return null;
                                if (v.id === 'dynamax' && !canBeDynamax) return null;

                                const isActive = userProgress[v.id as keyof DexProgress];
                                
                                return (
                                    <button 
                                        key={v.id}
                                        onClick={() => toggleVariant(v.id)}
                                        className={`
                                            aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 group relative overflow-hidden
                                            ${isActive 
                                                ? `${v.bg} ${v.border} shadow-[0_0_15px_rgba(0,0,0,0.2)] scale-105` 
                                                : 'bg-[#0b0e14] border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        {isActive && <div className={`absolute inset-0 opacity-20 bg-current ${v.color}`}></div>}
                                        <div className={`text-lg mb-0.5 transition-transform group-hover:scale-110 ${isActive ? v.color : 'text-slate-500 group-hover:text-slate-300'}`}>
                                            {v.icon ? <i className={v.icon}></i> : <span className="font-black font-rajdhani text-xs">{v.text}</span>}
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wide scale-[0.85] ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                            {v.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: DATA & TOOLS --- */}
                <div className="flex-1 space-y-6">
                    
                    {/* 1. CP CALCULATOR (Dashboard Style) */}
                    <div className="bg-[#151a25] rounded-xl border border-white/5 p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-blue-400 uppercase font-rajdhani tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-calculator"></i> Calculadora de Combate
                            </h3>
                            <button 
                                onClick={handleWeatherToggle}
                                className={`text-xs font-bold uppercase px-3 py-1 rounded border transition-colors ${weatherBoost ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-[#0b0e14] border-slate-700 text-slate-500'}`}
                            >
                                <i className="fa-solid fa-cloud-sun mr-1"></i> {weatherBoost ? 'Clima Ativo' : 'Sem Clima'}
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            {/* Result Display */}
                            <div className="flex flex-col items-center justify-center bg-[#0b0e14] rounded-2xl p-4 border border-slate-800 w-full md:w-auto min-w-[140px]">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Combat Power</span>
                                <div className="text-4xl font-black text-white font-rajdhani leading-none tracking-tighter text-glow">{calculatedStats.cp}</div>
                                <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{width: `${Math.min(100, (calculatedStats.cp / 5000) * 100)}%`}}></div>
                                </div>
                                <span className="text-xs text-slate-500 mt-1 font-mono">HP {calculatedStats.hp}</span>
                            </div>

                            {/* Controls */}
                            <div className="flex-1 w-full space-y-4">
                                {/* Level */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 mb-1 font-bold font-rajdhani">
                                        <span>NÍVEL</span>
                                        <span className="text-white">{calcLevel}</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="50" step="0.5" 
                                        value={calcLevel} 
                                        onChange={(e) => setCalcLevel(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-600 font-mono mt-1">
                                        <span className="cursor-pointer hover:text-white" onClick={() => setCalcLevel(15)}>15</span>
                                        <span className="cursor-pointer hover:text-white" onClick={() => setCalcLevel(20)}>20</span>
                                        <span className="cursor-pointer hover:text-white" onClick={() => setCalcLevel(40)}>40</span>
                                        <span className="cursor-pointer hover:text-white" onClick={() => setCalcLevel(50)}>50</span>
                                    </div>
                                </div>

                                {/* IVs */}
                                <div className="grid grid-cols-3 gap-3">
                                    {['atk', 'def', 'sta'].map((stat) => (
                                        <div key={stat}>
                                            <label className={`block text-xs font-bold uppercase text-center mb-1 ${stat === 'atk' ? 'text-red-400' : stat === 'def' ? 'text-blue-400' : 'text-green-400'}`}>{stat.toUpperCase()}</label>
                                            <select 
                                                value={calcIVs[stat as keyof typeof calcIVs]} 
                                                onChange={(e) => setCalcIVs({...calcIVs, [stat]: parseInt(e.target.value)})} 
                                                className="w-full bg-[#0b0e14] border border-slate-700 text-white text-xs rounded py-1.5 text-center font-mono focus:border-blue-500 outline-none appearance-none"
                                            >
                                                {[...Array(16)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. STATS & MOVES */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Moveset */}
                        <div className="bg-[#151a25] rounded-xl border border-white/5 p-5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-rajdhani flex items-center gap-2">
                                <i className="fa-solid fa-bolt"></i> Moveset
                            </h4>
                            <div className="space-y-4">
                                <MoveSelect type="fast" placeholder="Ataque Ágil" options={moves?.fast || []} />
                                <MoveSelect type="charged1" placeholder="Ataque Carregado 1" options={moves?.charged || []} />
                                <MoveSelect type="charged2" placeholder="Ataque Carregado 2" options={moves?.charged || []} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Modal>
    );
}

// --- SUB-COMPONENT: DEX CARD ---
const DexCard = memo(({ name, url, userProgress, onUpdate }: { name: string, url: string, userProgress: DexProgress, onUpdate: (p: DexProgress) => void }) => {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [speciesInfo, setSpeciesInfo] = useState<{hasMega: boolean, hasGmax: boolean} | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial Fetch on view
    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            const data = await fetchPokemon(name);
            if (active && data) {
                setDetails(data);
                // Also fetch species info for variants
                const sp = await fetchSpeciesDetails(data.id);
                setSpeciesInfo(sp);
            }
            if (active) setLoading(false);
        };
        
        load();
        return () => { active = false; };
    }, [name]);

    const isCaught = userProgress.normal || userProgress.shiny || userProgress.shadow || userProgress.lucky || userProgress.hundo;

    const toggleVariant = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); 
        onUpdate({ ...userProgress, [id]: !userProgress[id as keyof DexProgress] });
    };

    if (loading || !details) {
        return (
            <div className="bg-[#151a25] rounded-xl h-[260px] animate-pulse border border-white/5 shadow-sm"></div>
        );
    }

    return (
        <>
            <div 
                onClick={() => setIsModalOpen(true)}
                className={`
                    group relative bg-[#151a25] rounded-xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1
                    ${isCaught ? 'border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)] opacity-100' : 'border-white/5 opacity-80 hover:opacity-100 hover:border-slate-600'}
                `}
            >
                {/* Tech Bg */}
                <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]"></div>
                
                {/* ID Tag */}
                <div className="absolute top-2 left-3 text-xs font-mono text-slate-600 font-bold z-10">
                    #{details.id.toString().padStart(3,'0')}
                </div>

                {/* Image */}
                <div className="flex-1 flex items-center justify-center p-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#151a25]/50 rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img 
                        src={details.image} 
                        className={`w-24 h-24 object-contain drop-shadow-xl transition-all duration-500 group-hover:scale-110 ${!isCaught ? 'grayscale contrast-125' : ''}`}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>

                {/* Footer with Name and Toggles */}
                <div className="bg-[#0b0e14] border-t border-white/5 flex flex-col items-center">
                    <div className="px-3 py-1.5 w-full border-b border-white/5">
                        <h4 className={`text-xs font-bold uppercase font-rajdhani tracking-wider truncate w-full text-center ${isCaught ? 'text-white' : 'text-slate-500'}`}>
                            {name.replace(/-/g, ' ')}
                        </h4>
                    </div>
                    
                    {/* Compact Toggle Grid */}
                    <div className="w-full flex justify-center gap-1 p-1.5">
                        {VARIANTS.slice(0, 5).map(v => (
                            <button 
                                key={v.id}
                                onClick={(e) => toggleVariant(e, v.id)}
                                className={`
                                    w-6 h-6 rounded flex items-center justify-center text-xs border transition-all
                                    ${userProgress[v.id as keyof DexProgress]
                                        ? `${v.bg.replace('/10', '/30')} ${v.color} ${v.border}` 
                                        : 'bg-transparent border-transparent text-slate-600 hover:bg-white/5'
                                    }
                                `}
                                title={v.label}
                            >
                                {v.icon ? <i className={v.icon}></i> : <span className="font-black text-xs scale-[0.7]">{v.text}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <PokemonDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                baseName={name}
                baseData={details}
                userProgress={userProgress}
                onUpdate={onUpdate}
            />
        </>
    );
});

// --- POKEDEX COMPONENT ---
const Pokedex: React.FC<{ user: any }> = ({ user }) => {
    const [allPokemon, setAllPokemon] = useState<{name: string, url: string}[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dexProgress, setDexProgress] = useState<UserDex>({});
    const [visibleCount, setVisibleCount] = useState(60);
    const [selectedRegion, setSelectedRegion] = useState<Region['id']>('all');
    
    const [dbRecordId, setDbRecordId] = useState<string | null>(null);
    const [loadingSync, setLoadingSync] = useState(false);

    // --- SYNC LOGIC ---
    useEffect(() => {
        // 1. Always load List
        getAllPokemonNames().then(setAllPokemon);

        const syncData = async () => {
            const localDataRaw = localStorage.getItem('pogo_dex_progress');
            const localData = localDataRaw ? JSON.parse(localDataRaw) : {};

            // Use local immediately
            setDexProgress(localData);

            if (!user) return; // Guest mode done

            setLoadingSync(true);
            const client = generateClient();
            try {
                // Fetch from Cloud
                const result: any = await client.graphql({
                    query: listUserPokedexes,
                    authMode: 'userPool'
                });

                const cloudRecord = result.data.listUserPokedexes.items[0];

                if (cloudRecord) {
                    setDbRecordId(cloudRecord.id);
                    let cloudData = {};
                    try {
                        cloudData = cloudRecord.progressData ? JSON.parse(cloudRecord.progressData) : {};
                    } catch (e) { console.error("JSON Parse Error", e); }

                    // Conflict Res: If Cloud Empty & Local Has Data -> Push Local
                    if (Object.keys(cloudData).length === 0 && Object.keys(localData).length > 0) {
                        await updateCloud(cloudRecord.id, localData);
                    } else {
                        // Cloud Wins
                        setDexProgress(cloudData);
                        localStorage.setItem('pogo_dex_progress', JSON.stringify(cloudData));
                    }
                } else {
                    // Create Cloud Record
                    const newRecord: any = await client.graphql({
                        query: createUserPokedex,
                        variables: { input: { progressData: JSON.stringify(localData) } },
                        authMode: 'userPool'
                    });
                    setDbRecordId(newRecord.data.createUserPokedex.id);
                }
            } catch (err: any) {
                // Check for specific backend-missing error
                if (err.errors && err.errors[0]?.message?.includes("FieldUndefined")) {
                    console.warn("Backend schema missing (Pokedex). Using Local Storage only.");
                } else {
                    console.warn("Cloud Sync Failed", err);
                }
            } finally {
                setLoadingSync(false);
            }
        };

        syncData();
    }, [user]);

    const updateCloud = async (id: string, data: any) => {
        const client = generateClient();
        try {
            await client.graphql({
                query: updateUserPokedex,
                variables: { input: { id, progressData: JSON.stringify(data) } },
                authMode: 'userPool'
            });
        } catch (e) {
            console.debug("Save failed", e);
        }
    };

    const handleUpdateProgress = useCallback((pokemonName: string, progress: DexProgress) => {
        setDexProgress(prev => {
            const next = { ...prev, [pokemonName]: progress };
            localStorage.setItem('pogo_dex_progress', JSON.stringify(next));
            
            // Debounce or immediate cloud save? For simplicity, immediate but silent fail
            if (user && dbRecordId) {
                updateCloud(dbRecordId, next);
            }
            return next;
        });
    }, [user, dbRecordId]);

    const filteredPokemon = useMemo(() => {
        let filtered = allPokemon;

        // 1. Region Filter
        if (selectedRegion !== 'all') {
            const region = REGIONS.find(r => r.id === selectedRegion);
            if (region) {
                const [start, end] = region.range;
                filtered = filtered.filter(p => {
                    const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
                    return id >= start && id <= end;
                });
            }
        }

        // 2. Search Filter
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lower));
        }

        return filtered;
    }, [allPokemon, searchTerm, selectedRegion]);

    const visiblePokemon = filteredPokemon.slice(0, visibleCount);

    // Stats
    const stats = useMemo(() => {
        let totalCaught = 0;
        let shiny = 0;
        let hundo = 0;
        let mega = 0;
        
        // Only count stats for filtered region to match the progress bar context
        // or global if 'all' is selected? Usually Global Dex stats are preferred.
        // Let's do Global Stats for the top counters, but Region Progress bar below.
        
        Object.values(dexProgress).forEach((p: DexProgress) => {
            if (p.normal || p.shiny || p.shadow || p.lucky || p.hundo) totalCaught++;
            if (p.shiny) shiny++;
            if (p.hundo) hundo++;
            if (p.mega) mega++;
        });
        
        // Region Specific Progress
        let regionTotal = 0;
        let regionCaught = 0;
        
        const region = REGIONS.find(r => r.id === selectedRegion);
        if (region && allPokemon.length > 0) {
            const [start, end] = region.range;
            // We need to count valid pokemon in this range from the full list
            // Optimization: Iterate allPokemon once?
            // Actually, filteredPokemon already has the list for the region if no search term.
            // But to be accurate regardless of search:
            
            allPokemon.forEach(p => {
                const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
                if (selectedRegion === 'all' || (id >= start && id <= end)) {
                    regionTotal++;
                    const pData = dexProgress[p.name];
                    if (pData && (pData.normal || pData.shiny || pData.shadow || pData.lucky || pData.hundo)) {
                        regionCaught++;
                    }
                }
            });
        }

        return { totalCaught, shiny, hundo, mega, regionTotal, regionCaught };
    }, [dexProgress, allPokemon, selectedRegion]);

    const regionPercentage = stats.regionTotal > 0 ? Math.round((stats.regionCaught / stats.regionTotal) * 100) : 0;

    return (
        <div className="animate-fade-in pb-20">
             <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 font-rajdhani uppercase">Pokédex</h1>
                    <p className="text-slate-400">Rastreie sua coleção.</p>
                </div>
                {loadingSync && <span className="text-xs text-blue-400 animate-pulse font-mono bg-blue-900/20 px-2 py-1 rounded"><i className="fa-solid fa-cloud-arrow-up"></i> Sync</span>}
            </div>
            
            {/* STATS & FILTERS CONTAINER */}
            <div className="bg-[#151a25] p-6 rounded-xl border border-white/5 mb-8 space-y-6">
                
                {/* 1. Global Counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800">
                     <StatItem label="Total Capturado" value={stats.totalCaught} total={allPokemon.length} color="text-blue-400" />
                     <StatItem label="Shiny Dex" value={stats.shiny} color="text-yellow-400" />
                     <StatItem label="100% IV" value={stats.hundo} color="text-pink-400" />
                     <StatItem label="Megas" value={stats.mega} color="text-teal-400" />
                </div>

                {/* 2. Region Progress Bar */}
                <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        <span>Progresso: {REGIONS.find(r => r.id === selectedRegion)?.name}</span>
                        <span className="text-white">{regionPercentage}% ({stats.regionCaught}/{stats.regionTotal})</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out" 
                            style={{ width: `${regionPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* 3. Region Filters */}
                <div className="flex flex-wrap gap-2">
                    {REGIONS.map(r => (
                        <button
                            key={r.id}
                            onClick={() => { setSelectedRegion(r.id); setVisibleCount(60); }}
                            className={`
                                px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all border
                                ${selectedRegion === r.id 
                                    ? `bg-slate-700 border-slate-500 text-white shadow-lg scale-105` 
                                    : 'bg-[#0b0e14] border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }
                            `}
                        >
                            {r.name}
                        </button>
                    ))}
                </div>
                
                {/* 4. Search */}
                <Input 
                    placeholder="Pesquisar Pokémon..." 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setVisibleCount(60); }} 
                />
            </div>

            {/* CARD GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {visiblePokemon.map(p => (
                    <DexCard 
                        key={p.name} 
                        name={p.name} 
                        url={p.url} 
                        userProgress={dexProgress[p.name] || {}} 
                        onUpdate={(prog) => handleUpdateProgress(p.name, prog)} 
                    />
                ))}
            </div>
            
            {visiblePokemon.length < filteredPokemon.length && (
                <div className="mt-8 text-center">
                    <Button onClick={() => setVisibleCount(c => c + 60)}>Carregar Mais</Button>
                </div>
            )}
        </div>
    );
};

const StatItem = ({ label, value, total, color }: any) => (
    <div className="flex flex-col items-center">
        <span className={`text-2xl font-black ${color} font-rajdhani`}>
            {value}{total ? <span className="text-slate-600 text-sm">/{total}</span> : ''}
        </span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
);

export default Pokedex;

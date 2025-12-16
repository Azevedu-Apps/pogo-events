
import React, { useState, useEffect } from 'react';
import { SpawnCategory, EggGroup, Attack, Raid } from '../../types';
import { Input, Select, Button, TextArea } from '../ui/Shared';
import PokemonSearchInput from '../ui/PokemonSearchInput';
import { fetchPokemon } from '../../services/pokeapi';
import { typeColors } from '../../utils/visuals';
import { PokemonCard } from '../ui/PokemonCard';
import { getMovesForPokemon, getMoveDetails, calculateBars } from '../../services/gamemaster';

// --- SPAWNS ---
export const SpawnSection: React.FC<{ data: SpawnCategory, onChange: (c: SpawnCategory) => void }> = ({ data, onChange }) => {
  const [pokeInput, setPokeInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addSpawn = async () => {
    if (!pokeInput) return;
    setLoading(true);
    const p = await fetchPokemon(pokeInput);
    setLoading(false);
    
    if (p) {
      const newSpawns = [...data.spawns, { name: p.name, image: p.image, shiny: true }];
      onChange({ ...data, spawns: newSpawns });
      setPokeInput('');
    } else {
        alert("Pokemon não encontrado.");
    }
  };

  const removeSpawn = (idx: number) => {
    const newSpawns = [...data.spawns];
    newSpawns.splice(idx, 1);
    onChange({ ...data, spawns: newSpawns });
  };

  return (
    <div className="space-y-6">
        <Input label="Nome da Categoria de Spawns" value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} placeholder="Ex: Habitat Floresta" />
        
        <div className="p-5 bg-[#0b0e14] border border-slate-800 relative">
            <div className="flex gap-2 mb-6 items-end">
                <PokemonSearchInput 
                    className="flex-1"
                    label="Adicionar Pokémon"
                    value={pokeInput} 
                    onChange={setPokeInput} 
                    loading={loading}
                    placeholder={`Nome (Inglês)...`} 
                />
                <Button onClick={addSpawn} variant="primary" className="h-[42px]"><i className="fa-solid fa-plus"></i></Button>
            </div>
            
            {data.spawns.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm font-mono border-2 border-dashed border-slate-800">
                    NENHUM POKÉMON ADICIONADO
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {data.spawns.map((s, idx) => (
                        <PokemonCard 
                        key={idx}
                        name={s.name}
                        image={s.image}
                        shiny={s.shiny}
                        onDelete={() => removeSpawn(idx)}
                        className="bg-[#151a25] border-slate-700"
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

// --- EGGS ---
export const EggSection: React.FC<{ data: { title: string, desc: string, eggs: EggGroup[] }, onChange: (d: { title: string, desc: string, eggs: EggGroup[] }) => void }> = ({ data, onChange }) => {
    const [dist, setDist] = useState('2 km');
    const [poke, setPoke] = useState('');
    const [form, setForm] = useState('');
    const [shiny, setShiny] = useState(true);
    const [loading, setLoading] = useState(false);

    const addEgg = async () => {
        if (!poke) return;
        setLoading(true);
        const p = await fetchPokemon(poke);
        setLoading(false);
        if (p) {
            const newEggs = [...data.eggs];
            let group = newEggs.find(g => g.distance === dist);
            if (!group) {
                group = { distance: dist, spawns: [] };
                newEggs.push(group);
            }
            group.spawns.push({ name: p.name, image: p.image, shiny, shinyImage: p.shinyImage, form });
            onChange({ ...data, eggs: newEggs });
            setPoke(''); setForm('');
        } else {
            alert("Pokemon não encontrado!");
        }
    };

    const removeEgg = (d: string, idx: number) => {
        const newEggs = [...data.eggs];
        const gIdx = newEggs.findIndex(g => g.distance === d);
        if (gIdx > -1) {
            newEggs[gIdx].spawns.splice(idx, 1);
            if (newEggs[gIdx].spawns.length === 0) newEggs.splice(gIdx, 1);
            onChange({ ...data, eggs: newEggs });
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input label="Título da Seção" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} />
                <TextArea label="Descrição / Detalhes" value={data.desc} onChange={e => onChange({ ...data, desc: e.target.value })} className="h-16 text-sm" />
            </div>

            <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 mb-6 relative overflow-hidden group">
                {/* Decorative */}
                <div className="absolute top-0 right-0 p-2 opacity-10 text-emerald-500 text-6xl"><i className="fa-solid fa-egg"></i></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-end">
                    <Select className="w-full md:w-[15%]" label="Distância" value={dist} onChange={e => setDist(e.target.value)}>
                        <option>2 km</option><option>5 km</option><option>7 km</option><option>10 km</option><option>12 km</option>
                    </Select>
                    <PokemonSearchInput className="w-full md:w-[30%]" label="Pokémon" value={poke} onChange={setPoke} loading={loading} />
                    <Input className="w-full md:w-[30%]" label="Forma (Opcional)" value={form} onChange={e => setForm(e.target.value)} placeholder="Ex: Chapéu" />
                    <div className="w-full md:w-[10%] flex justify-center pb-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase text-emerald-400 hover:text-emerald-300">
                            <input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500" /> Shiny
                        </label>
                    </div>
                    <Button onClick={addEgg} variant="success" className="w-full md:w-[15%] h-[42px]"><i className="fa-solid fa-plus"></i></Button>
                </div>
            </div>

            <div className="space-y-4">
                {data.eggs.map(g => (
                    <div key={g.distance} className="bg-[#0b0e14] border border-slate-800 relative">
                        <div className="bg-[#151a25] px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                             <span className="font-bold text-slate-200 text-sm font-rajdhani uppercase tracking-widest">Ovos de {g.distance}</span>
                             <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold border border-slate-700">{g.spawns.length} Pokémon</span>
                        </div>
                        <div className="p-4 flex flex-wrap gap-3">
                            {g.spawns.map((s, idx) => (
                                <div key={idx} className="relative group bg-[#05060a] p-2 border border-slate-800 w-24 flex flex-col items-center hover:border-emerald-500 transition-colors">
                                    <img src={s.image} className="w-12 h-12 object-contain mb-1" />
                                    <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center uppercase">{s.name}</span>
                                    {s.form && <span className="text-[8px] text-slate-600 truncate w-full text-center">{s.form}</span>}
                                    <button onClick={() => removeEgg(g.distance, idx)} className="absolute -top-2 -right-2 bg-red-900 text-red-200 border border-red-700 w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow-lg"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- ATTACKS ---
export const AttackSection: React.FC<{ attacks: Attack[], onChange: (a: Attack[]) => void }> = ({ attacks, onChange }) => {
    const [temp, setTemp] = useState<Partial<Attack>>({ pokemon: '', move: '', type: 'Normal', energy: 'fast', method: '' });
    const [availableMoves, setAvailableMoves] = useState<string[]>([]);
    const [pokemonId, setPokemonId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // When Pokemon is selected, fetch ID and then Moves
    const handlePokemonSelect = async (name: string) => {
        setTemp(prev => ({ ...prev, pokemon: name, move: '', image: '' }));
        setAvailableMoves([]);
        setPokemonId(null);
        
        if (!name) return;
        
        setLoading(true);
        const p = await fetchPokemon(name);
        setLoading(false);

        if (p) {
            setTemp(prev => ({ ...prev, image: p.image }));
            setPokemonId(p.id);
            const moves = await getMovesForPokemon(p.id);
            setAvailableMoves(moves);
        }
    };

    // When Move is selected/typed
    const handleMoveChange = async (moveName: string) => {
        // Basic update
        setTemp(prev => ({ ...prev, move: moveName }));

        // Attempt to auto-fill details
        const details = await getMoveDetails(moveName);
        if (details) {
            let energyVal = 'fast';
            if (details.category === 'charged') {
                energyVal = calculateBars(details.energy_delta);
            }

            setTemp(prev => ({
                ...prev,
                move: details.name, // Use canonical name
                type: details.type,
                category: details.category,
                power: details.power?.toString() || '0',
                energy: energyVal
            }));
        }
    };

    const add = () => {
        if (!temp.pokemon || !temp.move) return;
        onChange([...attacks, temp as Attack]);
        // Reset form but keep last pokemon selected for ease of adding multiple moves
        setTemp({ ...temp, move: '', type: 'Normal', energy: 'fast', method: '', power: '', category: undefined });
    };

    return (
        <div>
             <div className="bg-purple-900/10 border border-purple-500/20 p-5 mb-6 relative">
                 <div className="absolute top-0 right-0 p-2 opacity-10 text-purple-500 text-6xl"><i className="fa-solid fa-bolt"></i></div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-12 gap-4 mb-3 relative z-10">
                     
                     {/* 1. Pokemon Selection */}
                     <div className="col-span-12 md:col-span-3">
                        <PokemonSearchInput 
                            label="1. Selecione o Pokémon" 
                            value={temp.pokemon || ''} 
                            onChange={(val) => handlePokemonSelect(val)} 
                            onSelect={(val) => handlePokemonSelect(val)}
                            loading={loading}
                        />
                     </div>

                     {/* 2. Move Selection (Disabled until Pokemon selected) */}
                     <div className="col-span-12 md:col-span-3 relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest font-rajdhani ml-1">2. Ataque</label>
                        <input 
                            list="available-moves"
                            className="neo-input w-full bg-[#05060a] border border-slate-800 text-slate-200 focus:border-purple-500"
                            value={temp.move}
                            onChange={e => handleMoveChange(e.target.value)}
                            disabled={!pokemonId}
                            placeholder={pokemonId ? "Digite ou selecione..." : "Aguardando Pokémon..."}
                        />
                        <datalist id="available-moves">
                            {availableMoves.map(m => <option key={m} value={m} />)}
                        </datalist>
                     </div>

                     {/* Auto-Filled Details */}
                     <div className="col-span-6 md:col-span-2">
                         <Select label="Tipo" value={temp.type} onChange={e => setTemp({ ...temp, type: e.target.value })}>
                             {Object.keys(typeColors).map(t => <option key={t}>{t}</option>)}
                         </Select>
                     </div>
                     
                     <div className="col-span-3 md:col-span-1">
                         <Input label="Dano" value={temp.power || ''} onChange={e => setTemp({...temp, power: e.target.value})} />
                     </div>

                     <div className="col-span-3 md:col-span-2">
                         <Select label="Energia" value={temp.energy} onChange={e => setTemp({ ...temp, energy: e.target.value })}>
                             <option value="fast">Ágil</option>
                             <option value="1">1 Barra</option>
                             <option value="2">2 Barras</option>
                             <option value="3">3 Barras</option>
                         </Select>
                     </div>

                     <div className="col-span-12 md:col-span-1 flex items-end">
                         <Button onClick={add} className="w-full bg-purple-600 hover:bg-purple-500 h-[42px] border border-purple-400/30" title="Adicionar"><i className="fa-solid fa-plus"></i></Button>
                     </div>
                 </div>
                 
                 {/* Method */}
                 <TextArea 
                    label="Método de Obtenção (Evolução, MT, etc)" 
                    placeholder="Ex: Evolua durante o evento ou use MT Elite..." 
                    value={temp.method} 
                    onChange={e => setTemp({ ...temp, method: e.target.value })} 
                    className="h-16 text-sm relative z-10"
                 />
             </div>

             {/* List of Added Attacks */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attacks.map((atk, i) => (
                    <div key={i} className="bg-[#0b0e14] p-3 border border-slate-800 flex items-center gap-4 relative group hover:border-purple-500/50 transition">
                        <img src={atk.image} className="w-12 h-12 bg-[#151a25] p-1 border border-slate-700 object-contain" />
                        <div className="flex-1 min-w-0">
                             <div className="font-bold text-white text-sm uppercase font-rajdhani">{atk.pokemon}</div>
                             <div className="flex gap-2 items-center flex-wrap mt-1">
                                 <span className={`${typeColors[atk.type] || 'bg-gray-500'} text-[9px] px-1.5 rounded text-white uppercase font-bold`}>{atk.type}</span>
                                 <span className="text-purple-300 text-sm font-bold truncate">{atk.move}</span>
                                 {atk.power && <span className="text-[9px] text-slate-400 bg-slate-900 px-1 border border-slate-700">PWR {atk.power}</span>}
                                 {atk.energy !== 'fast' && (
                                     <div className="flex gap-0.5">
                                         {Array.from({length: parseInt(atk.energy)}).map((_, idx) => (
                                             <div key={idx} className="w-3 h-1 bg-blue-500"></div>
                                         ))}
                                     </div>
                                 )}
                             </div>
                        </div>
                        <button onClick={() => onChange(attacks.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i className="fa-solid fa-times"></i></button>
                    </div>
                ))}
             </div>
        </div>
    );
};

// --- RAIDS ---
export const RaidSection: React.FC<{ raids: Raid[], onChange: (r: Raid[]) => void, type: 'standard' | 'max' }> = ({ raids, onChange, type }) => {
    const [tier, setTier] = useState(type === 'standard' ? '5' : 'Max-1');
    const [boss, setBoss] = useState('');
    
    const add = async () => {
        if(!boss.trim()) return;
        const p = await fetchPokemon(boss);
        if (!p) { alert("Pokémon não encontrado."); return; }
        onChange([...raids, { tier, boss: boss.trim() }]);
        setBoss('');
    };

    const remove = (idx: number) => {
        onChange(raids.filter((_, i) => i !== idx));
    };

    const isMax = type === 'max';
    const accentColor = isMax ? 'fuchsia' : 'red';
    const bgClass = isMax ? 'bg-fuchsia-900/10 border-fuchsia-500/20' : 'bg-red-900/10 border-red-500/20';

    return (
        <div>
            <div className={`border p-5 mb-6 relative overflow-hidden ${bgClass}`}>
                 <div className={`absolute top-0 right-0 p-2 opacity-10 text-${accentColor}-500 text-6xl`}><i className={`fa-solid ${isMax ? 'fa-cloud-bolt' : 'fa-dragon'}`}></i></div>

                 <div className="flex gap-4 items-end mb-6 relative z-10">
                     <Select label="Nível / Tier" value={tier} onChange={e => setTier(e.target.value)} className="w-40">
                        {type === 'standard' ? (
                            <>
                                <option value="1">Nvl 1</option><option value="3">Nvl 3</option><option value="5">Nvl 5</option><option value="Mega">Mega</option><option value="Shadow">Shadow</option>
                            </>
                        ) : (
                            <>
                                <option value="Max-1">Max-1</option><option value="Max-3">Max-3</option><option value="Max-6">Max-6</option><option value="Gigamax">Gigamax</option>
                            </>
                        )}
                     </Select>
                     <PokemonSearchInput 
                        label="Chefe da Reide"
                        className="flex-1" 
                        placeholder="Nome do Pokémon" 
                        value={boss} 
                        onChange={setBoss}
                     />
                     <Button onClick={add} className={`h-[42px] ${isMax ? 'bg-fuchsia-600 hover:bg-fuchsia-500' : 'bg-red-600 hover:bg-red-500'}`}>
                         <i className="fa-solid fa-plus"></i>
                     </Button>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
                     {raids.map((r, i) => (
                         <PokemonCard 
                            key={i} 
                            name={r.boss}
                            image={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${r.boss.toLowerCase().replace(/\s+/g, '-').replace(/[.'":]/g, '')}.png`}
                            tier={r.tier}
                            onDelete={() => remove(i)}
                            className="bg-[#151a25] border-slate-700"
                         />
                     ))}
                 </div>
            </div>
        </div>
    );
};

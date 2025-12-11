
import React, { useState, useEffect } from 'react';
import { PogoEvent, SpawnCategory, EggGroup, Attack, Raid } from '../../types';
import { Input, Select, Button, SectionTitle, TextArea } from '../ui/Shared';
import PokemonSearchInput from '../ui/PokemonSearchInput';
import { fetchPokemon } from '../../services/pokeapi';
import { typeColors } from '../../utils/visuals';

// --- SPAWNS ---
export const SpawnSection: React.FC<{ categories: SpawnCategory[], onChange: (c: SpawnCategory[]) => void }> = ({ categories, onChange }) => {
  const [newCatName, setNewCatName] = useState('');
  const [pokeInputs, setPokeInputs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const addCategory = () => {
    if (!newCatName) return;
    onChange([...categories, { id: Date.now(), name: newCatName, spawns: [] }]);
    setNewCatName('');
  };

  const removeCategory = (id: number) => onChange(categories.filter(c => c.id !== id));

  const addSpawn = async (catId: number) => {
    const query = pokeInputs[catId];
    if (!query) return;
    setLoading(prev => ({ ...prev, [catId]: true }));
    const p = await fetchPokemon(query);
    setLoading(prev => ({ ...prev, [catId]: false }));
    
    if (p) {
      const newCats = [...categories];
      const cat = newCats.find(c => c.id === catId);
      if (cat) cat.spawns.push({ name: p.name, image: p.image, shiny: true });
      onChange(newCats);
      setPokeInputs(prev => ({ ...prev, [catId]: '' }));
    } else {
        alert("Pokemon não encontrado. Verifique a digitação.");
    }
  };

  const removeSpawn = (catId: number, idx: number) => {
    const newCats = [...categories];
    const cat = newCats.find(c => c.id === catId);
    if (cat) cat.spawns.splice(idx, 1);
    onChange(newCats);
  };

  return (
    <section>
      <SectionTitle title="Spawns & Categorias" colorClass="text-green-400" />
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nova Categoria de Spawn</label>
        <div className="flex gap-2">
          <Input className="flex-1" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ex: Habitat Floresta" />
          <Button onClick={addCategory} variant="success"><i className="fa-solid fa-folder-plus mr-2"></i>Criar</Button>
        </div>
      </div>
      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-900/50 px-4 py-3 flex justify-between items-center border-b border-slate-700">
              <h4 className="font-bold text-blue-300 text-sm uppercase tracking-wide">{cat.name}</h4>
              <button onClick={() => removeCategory(cat.id)} className="text-slate-500 hover:text-red-400 transition text-xs"><i className="fa-solid fa-trash mr-1"></i> Remover</button>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <PokemonSearchInput 
                  className="flex-1"
                  value={pokeInputs[cat.id] || ''} 
                  onChange={val => setPokeInputs({ ...pokeInputs, [cat.id]: val })} 
                  loading={loading[cat.id]}
                  placeholder={`Pokémon para '${cat.name}'...`} 
                />
                <Button onClick={() => addSpawn(cat.id)} variant="primary"><i className="fa-solid fa-plus"></i></Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {cat.spawns.map((s, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center p-2 relative group hover:border-blue-500 transition">
                     <img src={s.image} className="w-16 h-16 object-contain drop-shadow-lg" />
                     <span className="text-xs md:text-sm text-slate-300 capitalize truncate w-full text-center font-bold mt-1 tracking-tight">{s.name}</span>
                     <button onClick={() => removeSpawn(cat.id, idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow-sm hover:scale-110 z-10">x</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- EGGS ---
export const EggSection: React.FC<{ eggs: EggGroup[], title?: string, desc?: string, onChange: (eggs: EggGroup[], t?: string, d?: string) => void }> = ({ eggs, title, desc, onChange }) => {
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
            const newEggs = [...eggs];
            let group = newEggs.find(g => g.distance === dist);
            if (!group) {
                group = { distance: dist, spawns: [] };
                newEggs.push(group);
            }
            group.spawns.push({ name: p.name, image: p.image, shiny, shinyImage: p.shinyImage, form });
            onChange(newEggs, title, desc);
            setPoke(''); setForm('');
        } else {
            alert("Pokemon não encontrado!");
        }
    };

    const removeEgg = (d: string, idx: number) => {
        const newEggs = [...eggs];
        const gIdx = newEggs.findIndex(g => g.distance === d);
        if (gIdx > -1) {
            newEggs[gIdx].spawns.splice(idx, 1);
            if (newEggs[gIdx].spawns.length === 0) newEggs.splice(gIdx, 1);
            onChange(newEggs, title, desc);
        }
    };

    return (
        <section>
            <SectionTitle title="Ovos e Eclosões" colorClass="text-emerald-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input label="Título da Secção" value={title || ''} onChange={e => onChange(eggs, e.target.value, desc)} placeholder="Ex: Ovos de Evento" />
                <TextArea label="Descrição" value={desc || ''} onChange={e => onChange(eggs, title, e.target.value)} className="h-16 text-sm" />
            </div>
            <div className="bg-emerald-900/10 border border-emerald-900/50 p-4 rounded-xl mb-4">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                    <Select className="w-full md:w-[15%]" label="Distância" value={dist} onChange={e => setDist(e.target.value)}>
                        <option>2 km</option><option>5 km</option><option>7 km</option><option>10 km</option><option>12 km</option>
                    </Select>
                    <PokemonSearchInput className="w-full md:w-[30%]" label="Pokémon" value={poke} onChange={setPoke} loading={loading} />
                    <Input className="w-full md:w-[30%]" label="Forma" value={form} onChange={e => setForm(e.target.value)} placeholder="Ex: Chapéu" />
                    <div className="w-full md:w-[10%] flex justify-center pb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase text-slate-400">
                            <input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} className="rounded bg-slate-700" /> Shiny?
                        </label>
                    </div>
                    <Button onClick={addEgg} className="w-full md:w-[15%] h-10 bg-emerald-600 hover:bg-emerald-500"><i className="fa-solid fa-plus"></i></Button>
                </div>
            </div>
            <div className="space-y-4">
                {eggs.map(g => (
                    <div key={g.distance} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                             <span className="font-bold text-slate-200 text-sm">Ovos de {g.distance}</span>
                             <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-bold">{g.spawns.length} Pokémon</span>
                        </div>
                        <div className="p-4 flex flex-wrap gap-3">
                            {g.spawns.map((s, idx) => (
                                <div key={idx} className="relative group bg-slate-900 rounded-xl p-2 border border-slate-700/50 w-24 flex flex-col items-center">
                                    <img src={s.image} className="w-12 h-12 object-contain" />
                                    <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">{s.name}</span>
                                    <button onClick={() => removeEgg(g.distance, idx)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] opacity-0 group-hover:opacity-100 shadow-md">x</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// --- ATTACKS ---
export const AttackSection: React.FC<{ attacks: Attack[], onChange: (a: Attack[]) => void }> = ({ attacks, onChange }) => {
    const [temp, setTemp] = useState<Partial<Attack>>({ pokemon: '', move: '', type: 'Normal', energy: 'fast', method: '' });
    
    const add = async () => {
        if (!temp.pokemon || !temp.move) return;
        const p = await fetchPokemon(temp.pokemon);
        const img = p ? p.image : 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg';
        onChange([...attacks, { ...temp, image: img } as Attack]);
        setTemp({ pokemon: '', move: '', type: 'Normal', energy: 'fast', method: '' });
    };

    return (
        <section>
             <SectionTitle title="Ataques em Destaque" colorClass="text-purple-400" />
             <div className="bg-purple-900/10 border border-purple-900/50 p-4 rounded-xl mb-4">
                 <div className="grid grid-cols-2 md:grid-cols-12 gap-2 mb-2">
                     <div className="col-span-3">
                        <PokemonSearchInput label="Pokémon" value={temp.pokemon || ''} onChange={val => setTemp({ ...temp, pokemon: val })} />
                     </div>
                     <div className="col-span-3"><Input label="Ataque" value={temp.move} onChange={e => setTemp({ ...temp, move: e.target.value })} /></div>
                     <div className="col-span-2"><Select label="Tipo" value={temp.type} onChange={e => setTemp({ ...temp, type: e.target.value })}>{Object.keys(typeColors).map(t => <option key={t}>{t}</option>)}</Select></div>
                     <div className="col-span-2"><Select label="Energia" value={temp.energy} onChange={e => setTemp({ ...temp, energy: e.target.value })}><option value="fast">Ágil</option><option value="1">1 Barra</option><option value="2">2 Barras</option><option value="3">3 Barras</option></Select></div>
                     <div className="col-span-2 flex items-end"><Button onClick={add} className="w-full bg-purple-600 hover:bg-purple-500 h-[42px]">Add</Button></div>
                 </div>
                 <Input label="Método" placeholder="Ex: Evolua Eevee..." value={temp.method} onChange={e => setTemp({ ...temp, method: e.target.value })} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attacks.map((atk, i) => (
                    <div key={i} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex items-center gap-3 relative group">
                        <img src={atk.image} className="w-12 h-12 bg-slate-800 rounded-full p-1 border border-slate-600" />
                        <div>
                             <div className="font-bold text-white text-sm">{atk.pokemon}</div>
                             <div className="flex gap-2 items-center">
                                 <span className={`${typeColors[atk.type] || 'bg-gray-500'} text-[9px] px-1.5 rounded text-white uppercase`}>{atk.type}</span>
                                 <span className="text-purple-300 text-sm font-medium">{atk.move}</span>
                             </div>
                        </div>
                        <button onClick={() => onChange(attacks.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><i className="fa-solid fa-times"></i></button>
                    </div>
                ))}
             </div>
        </section>
    );
};

// --- HELPER COMPONENT: Raid Preview Card ---
const RaidPreviewCard: React.FC<{ boss: string, tier: string, onDelete?: () => void }> = ({ boss, tier, onDelete }) => {
    const [img, setImg] = useState<string>('https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg');
    
    useEffect(() => {
        if (!boss) return;
        fetchPokemon(boss).then(p => { if(p) setImg(p.image); });
    }, [boss]);

    const isMax = tier.startsWith('Max') || tier === 'Gigamax';
    const isShadow = tier === 'Shadow';
    const isMega = tier === 'Mega';

    let bgClass = "bg-slate-800";
    if (isMax) bgClass = "bg-fuchsia-900/20 border-fuchsia-500/50";
    else if (isShadow) bgClass = "bg-purple-900/20 border-purple-600/50";
    else if (isMega) bgClass = "bg-pink-900/20 border-pink-500/50";

    return (
        <div className={`relative p-2 rounded-lg border border-slate-700 flex flex-col items-center ${bgClass} w-24`}>
            {onDelete && <button onClick={onDelete} className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white shadow-md z-10">x</button>}
            <div className="text-[9px] font-bold uppercase mb-1 bg-black/40 px-2 rounded">{tier.replace('Max-', 'Nvl ')}</div>
            <img src={img} className="w-12 h-12 object-contain drop-shadow-md mb-1" />
            <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{boss}</span>
        </div>
    );
};

// --- STANDARD RAIDS (1-5, Mega, Shadow) ---
export const StandardRaidForm: React.FC<{ raids: Raid[], onChange: (r: Raid[]) => void }> = ({ raids, onChange }) => {
    const [tier, setTier] = useState('5');
    const [boss, setBoss] = useState('');
    const [previewBoss, setPreviewBoss] = useState(''); // For validating before adding

    const standardRaids = raids.filter(r => !r.tier.startsWith('Max') && r.tier !== 'Gigamax' && r.tier !== 'Dinamax');

    const add = async () => {
        if(!boss.trim()) return;
        // Verify valid pokemon
        const p = await fetchPokemon(boss);
        if (!p) {
            alert("Pokémon não encontrado.");
            return;
        }
        
        // Add to main list (preserving Max battles)
        const otherRaids = raids.filter(r => r.tier.startsWith('Max') || r.tier === 'Gigamax' || r.tier === 'Dinamax');
        onChange([...otherRaids, ...standardRaids, { tier, boss: boss.trim() }]);
        setBoss(''); setPreviewBoss('');
    };

    const remove = (idx: number) => {
        const toRemove = standardRaids[idx];
        onChange(raids.filter(r => r !== toRemove));
    };

    // Update preview when boss input changes (debounce slightly or just on select)
    useEffect(() => { setPreviewBoss(boss); }, [boss]);

    return (
        <section>
             <SectionTitle title="Reides" colorClass="text-red-400" icon="fa-solid fa-dragon" />
             <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl mb-4">
                 <div className="flex gap-2 items-end mb-4">
                     <Select label="Nível" value={tier} onChange={e => setTier(e.target.value)} className="w-24">
                        <option value="1">Nvl 1</option><option value="3">Nvl 3</option><option value="5">Nvl 5</option><option value="Mega">Mega</option><option value="Shadow">Shadow</option>
                     </Select>
                     <PokemonSearchInput 
                        label="Chefe de Reide"
                        className="flex-1" 
                        placeholder="Nome do Pokémon" 
                        value={boss} 
                        onChange={setBoss}
                     />
                     <Button onClick={add} className="bg-red-600 hover:bg-red-500 h-[42px]"><i className="fa-solid fa-plus"></i></Button>
                 </div>
                 
                 {/* Preview current selection if valid */}
                 {previewBoss && <div className="mb-4 flex items-center gap-2"><span className="text-xs text-slate-400">Prévia:</span> <RaidPreviewCard boss={previewBoss} tier={tier} /></div>}

                 <div className="flex flex-wrap gap-3">
                     {standardRaids.map((r, i) => (
                         <RaidPreviewCard key={i} boss={r.boss} tier={r.tier} onDelete={() => remove(i)} />
                     ))}
                 </div>
             </div>
        </section>
    );
};

// --- MAX BATTLES (Max 1-6) ---
export const MaxBattleForm: React.FC<{ raids: Raid[], onChange: (r: Raid[]) => void }> = ({ raids, onChange }) => {
    const [tier, setTier] = useState('Max-1');
    const [boss, setBoss] = useState('');
    const [previewBoss, setPreviewBoss] = useState('');

    const maxBattles = raids.filter(r => r.tier.startsWith('Max') || r.tier === 'Gigamax' || r.tier === 'Dinamax');

    const add = async () => {
        if(!boss.trim()) return;
        const p = await fetchPokemon(boss);
        if (!p) {
            alert("Pokémon não encontrado.");
            return;
        }

        const otherRaids = raids.filter(r => !r.tier.startsWith('Max') && r.tier !== 'Gigamax' && r.tier !== 'Dinamax');
        onChange([...otherRaids, ...maxBattles, { tier, boss: boss.trim() }]);
        setBoss(''); setPreviewBoss('');
    };

    const remove = (idx: number) => {
        const toRemove = maxBattles[idx];
        onChange(raids.filter(r => r !== toRemove));
    };

    useEffect(() => { setPreviewBoss(boss); }, [boss]);

    return (
        <section>
             <SectionTitle title="Batalhas Max" colorClass="text-fuchsia-400" icon="fa-solid fa-cloud-bolt" />
             <div className="bg-fuchsia-900/10 border border-fuchsia-900/30 p-4 rounded-xl mb-4">
                 <div className="flex gap-2 items-end mb-4">
                     <Select label="Nível Max" value={tier} onChange={e => setTier(e.target.value)} className="w-32">
                        <option value="Max-1">Nvl 1</option>
                        <option value="Max-2">Nvl 2</option>
                        <option value="Max-3">Nvl 3</option>
                        <option value="Max-4">Nvl 4</option>
                        <option value="Max-5">Nvl 5</option>
                        <option value="Max-6">Nvl 6</option>
                        <option value="Gigamax">Gigamax</option>
                     </Select>
                     <PokemonSearchInput 
                        label="Chefe Max"
                        className="flex-1" 
                        placeholder="Nome do Pokémon" 
                        value={boss} 
                        onChange={setBoss}
                     />
                     <Button onClick={add} className="bg-fuchsia-600 hover:bg-fuchsia-500 h-[42px]"><i className="fa-solid fa-plus"></i></Button>
                 </div>

                 {previewBoss && <div className="mb-4 flex items-center gap-2"><span className="text-xs text-slate-400">Prévia:</span> <RaidPreviewCard boss={previewBoss} tier={tier} /></div>}

                 <div className="flex flex-wrap gap-3">
                     {maxBattles.map((r, i) => (
                         <RaidPreviewCard key={i} boss={r.boss} tier={r.tier} onDelete={() => remove(i)} />
                     ))}
                 </div>
             </div>
        </section>
    );
};

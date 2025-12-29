
import React, { useState } from 'react';
import { ITEM_MAP, ASSET_FOLDERS, getPokemonAsset, getItemIcon } from '../services/assets';
import PokemonSearchInput from './ui/PokemonSearchInput';
import { fetchPokemon } from '../services/pokeapi';
import { Button, SectionTitle } from './ui/Shared';
import { Lightbox } from './ui/Lightbox';

const Documentation: React.FC = () => {
    const [searchPoke, setSearchPoke] = useState('');
    const [pokeData, setPokeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lightbox, setLightbox] = useState<{ open: boolean, src: string, name: string } | null>(null);

    const executeSearch = async (name: string) => {
        if (!name) return;
        setLoading(true);
        const data = await fetchPokemon(name);
        setPokeData(data);
        setLoading(false);
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-20 relative">
            <Lightbox isOpen={!!lightbox?.open} onClose={() => setLightbox(null)} src={lightbox?.src || ''} title={lightbox?.name} />

            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Database & Assets</h1>
                <p className="text-slate-400 font-mono text-sm">PROJETO 2: GESTÃO E REFERÊNCIA</p>
            </div>

            <div className="space-y-10">
                {/* POKEMON SEARCH */}
                <div className="bg-slate-800 p-8 rounded-3xl border border-white/5 shadow-xl">
                    <SectionTitle title="Explorador de Sprites" icon="fa-solid fa-magnifying-glass" colorClass="text-blue-400" />
                    <div className="flex gap-2 max-w-md mb-8">
                        <PokemonSearchInput className="flex-1" value={searchPoke} onChange={setSearchPoke} loading={loading} />
                        <Button onClick={() => executeSearch(searchPoke)} className="h-[42px]"><i className="fa-solid fa-search"></i></Button>
                    </div>

                    {pokeData && (
                        <div className="grid grid-cols-2 gap-8 bg-black/40 p-6 rounded-2xl border border-white/5">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Forma Normal</p>
                                <img src={getPokemonAsset(pokeData.id, false)} className="w-32 h-32 mx-auto object-contain cursor-pointer" onClick={() => setLightbox({ open: true, src: getPokemonAsset(pokeData.id, false), name: pokeData.name })} />
                                <code className="text-[9px] text-slate-600 block mt-2 break-all">{getPokemonAsset(pokeData.id, false)}</code>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-yellow-500 uppercase mb-3">Forma Brilhante</p>
                                <img src={getPokemonAsset(pokeData.id, true)} className="w-32 h-32 mx-auto object-contain cursor-pointer" onClick={() => setLightbox({ open: true, src: getPokemonAsset(pokeData.id, true), name: pokeData.name + ' Shiny' })} />
                                <code className="text-[9px] text-slate-600 block mt-2 break-all">{getPokemonAsset(pokeData.id, true)}</code>
                            </div>
                        </div>
                    )}
                </div>

                {/* ASSET FOLDERS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(ASSET_FOLDERS).map(([name, url]) => (
                        <a key={name} href={url} target="_blank" className="bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-blue-500 transition-all flex flex-col items-center gap-2 group">
                            <i className="fa-solid fa-folder-open text-2xl text-slate-600 group-hover:text-blue-400"></i>
                            <span className="text-[10px] font-bold uppercase text-slate-400 text-center">{name}</span>
                        </a>
                    ))}
                </div>

                {/* QUICK ITEM REFERENCE */}
                <div className="bg-[#151a25] p-8 rounded-3xl border border-white/5">
                    <SectionTitle title="Atalhos de Itens" icon="fa-solid fa-toolbox" colorClass="text-emerald-400" />
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {['poke_ball', 'lure_module', 'incubator_super', 'raid_pass_remote', 'stardust', 'candy_rare', 'sinnoh_stone', 'lucky_egg'].map(key => (
                            <div key={key} className="flex flex-col items-center gap-1">
                                <img src={getItemIcon(key as any)} className="w-10 h-10 object-contain" />
                                <span className="text-[8px] font-mono text-slate-500 uppercase">{key.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentation;

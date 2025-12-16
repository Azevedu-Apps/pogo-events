
import React, { useState } from 'react';
import { ITEM_MAP, POGO_ASSETS_BASE, POKEMON_ASSETS_BASE, ITEMS_BASE_URL, ASSET_FOLDERS, getPokemonAsset, getItemIcon } from '../services/assets';
import PokemonSearchInput from './ui/PokemonSearchInput';
import { fetchPokemon } from '../services/pokeapi';
import { Button } from './ui/Shared';
import { Lightbox } from './ui/Lightbox';

const DocSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

// Helper to categorize items for display
const ITEM_CATEGORIES: Record<string, string[]> = {
    'Pokébolas': ['poke_ball', 'great_ball', 'ultra_ball', 'master_ball', 'premier_ball', 'safari_ball'],
    'Incensos & Lures': ['incense_green', 'incense_orange', 'incense_daily', 'incense_bundle', 'lure_module', 'lure_glacial', 'lure_magnetic', 'lure_mossy', 'lure_rainy', 'lure_golden'],
    'Evolução': ['dragon_scale', 'kings_rock', 'metal_coat', 'sun_stone', 'up_grade', 'sinnoh_stone', 'unova_stone', 'other_stone_a'],
    'Incubadoras & Ovos': ['incubator_basic', 'incubator_super', 'incubator_infinite', 'incubator_iap', 'incubator_timed', 'egg_2km', 'egg_5km', 'egg_7km', 'egg_10km', 'egg_12km'],
    'Passes & Batalha': ['raid_pass', 'raid_pass_premium', 'raid_pass_remote', 'tm_fast', 'tm_charged', 'tm_fast_elite', 'tm_charged_elite', 'star_piece', 'lucky_egg'],
    'Recursos & Tech': ['stardust', 'poke_coin', 'candy_rare', 'candy_xl_rare', 'zygarde_cell', 'zygarde_cube', 'meteorite', 'shadow_gem', 'shadow_fragment', 'giovanni_radar', 'leader_radar', 'bottle_cap', 'bottle_cap_gold'],
    'Upgrade & Armazenamento': ['gift_box', 'postcard_storage', 'item_storage', 'pokemon_storage', 'lucky_applicator', 'ar_camera', 'converter', 'mp_pack'],
    'Fusão & Outros': ['kyurem_black_fuse', 'kyurem_white_fuse', 'pass_point', 'item_0704', 'item_0706', 'item_0707', 'item_1600', 'item_1601', 'item_1602', 'item_1606', 'item_1607']
};

const Documentation: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'system' | 'assets'>('system');
    const [searchPoke, setSearchPoke] = useState('');
    const [pokeData, setPokeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Lightbox State
    const [lightbox, setLightbox] = useState<{ open: boolean, src: string, name: string, caption?: string } | null>(null);

    const executeSearch = async (name: string) => {
        if (!name) return;
        setLoading(true);
        setError('');
        setPokeData(null);
        
        try {
            const data = await fetchPokemon(name);
            if (data) {
                setPokeData(data);
            } else {
                setError('Pokémon não encontrado.');
            }
        } catch (e) {
            setError('Erro ao buscar Pokémon.');
        } finally {
            setLoading(false);
        }
    };

    const openAsset = (src: string, name: string, caption?: string) => {
        setLightbox({ open: true, src, name, caption });
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-20 relative">
            
            {/* Reusable Lightbox */}
            <Lightbox 
                isOpen={!!lightbox?.open}
                onClose={() => setLightbox(null)}
                src={lightbox?.src || ''}
                title={lightbox?.name}
                caption={lightbox?.caption}
            />

            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Documentação do Sistema</h1>
                <p className="text-slate-400">Referência técnica para administradores e desenvolvedores.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-700">
                <button 
                    onClick={() => setActiveTab('system')}
                    className={`pb-3 px-4 font-bold text-sm transition ${activeTab === 'system' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Arquitetura & Backend
                </button>
                <button 
                    onClick={() => setActiveTab('assets')}
                    className={`pb-3 px-4 font-bold text-sm transition ${activeTab === 'assets' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Assets & APIs Externas
                </button>
            </div>

            {activeTab === 'system' && (
                <div className="space-y-6">
                    <DocSection title="Visão Geral">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="font-bold text-blue-300 mb-2">Frontend</h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                    <li>Framework: <strong>React 19</strong> (Vite)</li>
                                    <li>Linguagem: <strong>TypeScript</strong></li>
                                    <li>Estilização: <strong>Tailwind CSS</strong></li>
                                    <li>Ícones: <strong>FontAwesome 6</strong></li>
                                    <li>PWA: Suporte Offline via vite-plugin-pwa</li>
                                </ul>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="font-bold text-orange-300 mb-2">Backend (AWS Amplify)</h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                    <li>Auth: <strong>Amazon Cognito</strong> (Usuários/Grupos)</li>
                                    <li>API: <strong>AWS AppSync</strong> (GraphQL)</li>
                                    <li>Database: <strong>Amazon DynamoDB</strong> (NoSQL)</li>
                                </ul>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection title="Estrutura de Dados (GraphQL Schema)">
                        <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-green-400 overflow-x-auto border border-slate-900">
{`type PogoEvent @model @auth(rules: [{ allow: public }]) {
  id: ID!
  name: String!
  type: String
  start: AWSDateTime
  end: AWSDateTime
  location: String
  
  # Campos complexos armazenados como JSON Stringificado
  spawnCategories: AWSJSON
  raidsList: AWSJSON
  attacks: AWSJSON
  payment: AWSJSON
  
  images: [String]
  cover: String
}`}
                        </pre>
                        <p className="mt-4 text-sm text-slate-400">
                            <strong>Nota:</strong> Para evitar múltiplas tabelas relacionais complexas no DynamoDB, optamos por armazenar estruturas aninhadas (como categorias de spawn e ataques) como strings JSON dentro do objeto principal do evento. O Frontend faz o <code>JSON.parse</code> ao ler e <code>JSON.stringify</code> ao salvar.
                        </p>
                    </DocSection>
                </div>
            )}

            {activeTab === 'assets' && (
                <div className="space-y-8">
                    {/* ASSETS INTRO */}
                    <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 p-6 rounded-xl border border-purple-500/30">
                        <h2 className="text-xl font-bold text-white mb-2">PokeMiners (Assets Oficiais)</h2>
                        <p className="text-sm text-slate-300 mb-4">
                            Utilizamos <strong>PokeMiners</strong> para a maioria dos ícones. Este repositório é a fonte mais confiável para assets extraídos diretamente do Game Master.
                        </p>
                        <div className="flex flex-col gap-2 text-xs font-mono bg-slate-950 p-3 rounded">
                            <div className="flex gap-2">
                                <span className="text-slate-500">BASE_POKEMON:</span>
                                <span className="text-purple-300 break-all">{POKEMON_ASSETS_BASE}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500">BASE_ITEMS:</span>
                                <span className="text-blue-300 break-all">{ITEMS_BASE_URL}</span>
                            </div>
                        </div>
                    </div>

                    {/* DIRECTORIES LIST */}
                    <DocSection title="Diretórios de Recursos">
                        <p className="text-sm text-slate-400 mb-4">Acesso direto às pastas organizadas do repositório de assets.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(ASSET_FOLDERS).map(([name, url]) => (
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    key={name}
                                    className="bg-slate-900 p-3 rounded flex items-center gap-3 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition group"
                                >
                                    <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition">
                                        <i className="fa-regular fa-folder-open"></i>
                                    </div>
                                    <span className="text-sm font-bold text-slate-300">{name}</span>
                                </a>
                            ))}
                        </div>
                    </DocSection>

                    {/* ITEMS GALLERY (Categorized) */}
                    <DocSection title="Galeria de Itens Mapeados">
                        <div className="space-y-8">
                            {Object.entries(ITEM_CATEGORIES).map(([catName, itemKeys]) => (
                                <div key={catName}>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-700/50 pb-1">{catName}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {itemKeys.map((key) => {
                                            const fullUrl = getItemIcon(key as keyof typeof ITEM_MAP);
                                            const filename = ITEM_MAP[key as keyof typeof ITEM_MAP];
                                            
                                            // Skip if item not mapped (shouldn't happen with correct CATEGORIES list)
                                            if (!filename) return null;

                                            return (
                                                <button 
                                                    key={key} 
                                                    onClick={() => openAsset(fullUrl, key, fullUrl)}
                                                    className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col items-center group hover:border-blue-500 transition cursor-zoom-in"
                                                >
                                                    <div className="w-16 h-16 mb-2 flex items-center justify-center relative">
                                                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-full transition-all duration-300 scale-0 group-hover:scale-100"></div>
                                                        <img src={fullUrl} className="max-w-full max-h-full object-contain drop-shadow-md z-10" />
                                                    </div>
                                                    <div className="w-full">
                                                        <div className="text-[10px] font-bold text-white mb-0.5 text-center bg-slate-800 rounded py-1 border border-slate-700 group-hover:border-blue-500/50 transition truncate px-1">{key}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DocSection>

                    {/* POKEMON VIEWER */}
                    <DocSection title="Sprites de Pokémon">
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Testar Asset de Pokémon</label>
                            <div className="max-w-md flex gap-2">
                                <PokemonSearchInput 
                                    className="flex-1"
                                    value={searchPoke} 
                                    onChange={setSearchPoke} 
                                    onSelect={(name) => executeSearch(name)}
                                    placeholder="Digite o nome (ex: pikachu, dialga-origin)..." 
                                    loading={loading}
                                />
                                <Button onClick={() => executeSearch(searchPoke)} className="bg-purple-600 hover:bg-purple-500">
                                    <i className="fa-solid fa-search"></i>
                                </Button>
                            </div>
                            {error && <p className="text-red-400 text-xs mt-2 font-bold">{error}</p>}
                        </div>

                        {pokeData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                                {/* Normal */}
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-2">Normal (ID: {pokeData.id})</span>
                                    <div 
                                        className="w-32 h-32 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center mb-2 cursor-zoom-in hover:border-blue-500 transition"
                                        onClick={() => openAsset(getPokemonAsset(pokeData.id, false), pokeData.name, getPokemonAsset(pokeData.id, false))}
                                    >
                                        <img src={getPokemonAsset(pokeData.id, false)} className="w-24 h-24 object-contain" />
                                    </div>
                                    <code className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400 break-all text-center">
                                        {getPokemonAsset(pokeData.id, false)}
                                    </code>
                                </div>

                                {/* Shiny */}
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-yellow-400 uppercase mb-2">Shiny (ID: {pokeData.id})</span>
                                    <div 
                                        className="w-32 h-32 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center mb-2 relative overflow-hidden cursor-zoom-in hover:border-yellow-500 transition"
                                        onClick={() => openAsset(getPokemonAsset(pokeData.id, true), `${pokeData.name} (Shiny)`, getPokemonAsset(pokeData.id, true))}
                                    >
                                        <div className="absolute inset-0 bg-yellow-500/10"></div>
                                        <img src={getPokemonAsset(pokeData.id, true)} className="w-24 h-24 object-contain z-10" />
                                    </div>
                                    <code className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400 break-all text-center">
                                        {getPokemonAsset(pokeData.id, true)}
                                    </code>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-8 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                                {!error && "Selecione um Pokémon acima para visualizar os paths das sprites."}
                            </div>
                        )}
                    </DocSection>
                </div>
            )}
        </div>
    );
};

export default Documentation;
